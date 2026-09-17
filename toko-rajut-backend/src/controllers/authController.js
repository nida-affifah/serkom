const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { comparePassword, hashPassword } = require('../utils/hash');
require('dotenv').config();

// ============================================
// REGISTER PUBLIK (selalu role 'pembeli')
// ============================================
exports.register = async (req, res) => {
    try {
        const { username, email, password, nama_lengkap, no_hp } = req.body;

        if (!username || !email || !password || !nama_lengkap) {
            return res.status(400).json({ sukses: false, pesan: 'Semua field wajib diisi' });
        }

        if (password.length < 6) {
            return res.status(400).json({ sukses: false, pesan: 'Password minimal 6 karakter' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ sukses: false, pesan: 'Format email tidak valid' });
        }

        if (await User.findByUsername(username)) {
            return res.status(400).json({ sukses: false, pesan: 'Username sudah dipakai' });
        }

        if (await User.findByEmail(email)) {
            return res.status(400).json({ sukses: false, pesan: 'Email sudah terdaftar' });
        }

        // Tolak kalau coba registrasi sebagai admin
        if (req.body.role === 'admin') {
            return res.status(403).json({
                sukses: false,
                pesan: 'Tidak bisa registrasi sebagai admin'
            });
        }

        // REGISTER PUBLIK → SELALU role 'pembeli'
        const user = await User.create({
            username,
            email,
            password,
            nama_lengkap,
            no_hp,
            role: 'pembeli'
        });

        res.status(201).json({
            sukses: true,
            pesan: 'Registrasi berhasil, silakan login',
            data: user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// ============================================
// LOGIN (semua role)
// ============================================
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ sukses: false, pesan: 'Username dan password wajib diisi' });
        }

        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(401).json({ sukses: false, pesan: 'Username atau password salah' });
        }

        const cocok = await comparePassword(password, user.password);
        if (!cocok) {
            return res.status(401).json({ sukses: false, pesan: 'Username atau password salah' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            sukses: true,
            pesan: 'Login berhasil',
            token,
            user: {
                id: user.id,
                username: user.username,
                nama_lengkap: user.nama_lengkap,
                email: user.email,
                no_hp: user.no_hp,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// ============================================
// ME (profil user yang login)
// ============================================
exports.me = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ sukses: false, pesan: 'User tidak ditemukan' });
        }
        res.json({ sukses: true, data: user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// ============================================
// ADMIN: TAMBAH USER (role apa saja)
// ============================================
exports.tambahUser = async (req, res) => {
    try {
        const { username, email, password, nama_lengkap, no_hp, role } = req.body;

        if (!username || !email || !password || !nama_lengkap) {
            return res.status(400).json({ sukses: false, pesan: 'Semua field wajib diisi' });
        }

        if (password.length < 6) {
            return res.status(400).json({ sukses: false, pesan: 'Password minimal 6 karakter' });
        }

        const roleValid = ['admin', 'perajin', 'staff_gudang', 'kasir', 'pembeli'];
        if (!role || !roleValid.includes(role)) {
            return res.status(400).json({ sukses: false, pesan: 'Role tidak valid' });
        }

        // Cegah admin ganda
        if (role === 'admin') {
            const cekAdmin = await User.findByRole('admin');
            if (cekAdmin.length > 0) {
                return res.status(400).json({
                    sukses: false,
                    pesan: 'Admin sudah ada. Hanya boleh 1 akun admin.'
                });
            }
        }

        if (await User.findByUsername(username)) {
            return res.status(400).json({ sukses: false, pesan: 'Username sudah dipakai' });
        }

        if (await User.findByEmail(email)) {
            return res.status(400).json({ sukses: false, pesan: 'Email sudah terdaftar' });
        }

        const user = await User.create({
            username,
            email,
            password,
            nama_lengkap,
            no_hp,
            role
        });

        res.status(201).json({
            sukses: true,
            pesan: `User dengan role "${role}" berhasil dibuat`,
            data: user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// ============================================
// ADMIN: LIHAT SEMUA USER
// ============================================
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.getAll();
        res.json({ sukses: true, jumlah: users.length, data: users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// ============================================
// ADMIN: UPDATE USER
// ============================================
exports.updateUser = async (req, res) => {
    try {
        const { nama_lengkap, email, no_hp, role, status } = req.body;

        if (!nama_lengkap || !email) {
            return res.status(400).json({ sukses: false, pesan: 'Nama dan email wajib diisi' });
        }

        const target = await User.findById(req.params.id);
        if (!target) {
            return res.status(404).json({ sukses: false, pesan: 'User tidak ditemukan' });
        }

        // Cegah ubah role admin jadi selain admin
        if (target.role === 'admin' && role && role !== 'admin') {
            return res.status(400).json({
                sukses: false,
                pesan: 'Tidak bisa mengubah role admin'
            });
        }

        // Cegah ubah role user jadi admin (kecuali dirinya sendiri yang sudah admin)
        if (role === 'admin' && target.role !== 'admin') {
            return res.status(400).json({
                sukses: false,
                pesan: 'Tidak bisa mengubah role user menjadi admin'
            });
        }

        const data = await User.update(req.params.id, {
            nama_lengkap,
            email,
            no_hp: no_hp || null,
            role: role || target.role,
            status: status || 'aktif'
        });

        res.json({ sukses: true, pesan: 'User diupdate', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// ============================================
// ADMIN: HAPUS USER (soft delete)
// ============================================
exports.deleteUser = async (req, res) => {
    try {
        const target = await User.findById(req.params.id);

        if (!target) {
            return res.status(404).json({ sukses: false, pesan: 'User tidak ditemukan' });
        }

        // Cegah hapus admin
        if (target.role === 'admin') {
            return res.status(400).json({
                sukses: false,
                pesan: 'Tidak bisa menghapus akun admin'
            });
        }

        // Cegah hapus diri sendiri
        if (target.id === req.user.id) {
            return res.status(400).json({
                sukses: false,
                pesan: 'Tidak bisa menghapus akun sendiri'
            });
        }

        await User.delete(req.params.id);
        res.json({ sukses: true, pesan: 'User dihapus' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};