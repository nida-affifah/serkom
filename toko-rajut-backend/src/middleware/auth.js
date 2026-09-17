const jwt = require('jsonwebtoken');
require('dotenv').config();

// ═══════════════════════════════════════
// VERIFY TOKEN (wajib login)
// ═══════════════════════════════════════
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ sukses: false, pesan: 'Akses ditolak, token tidak ada' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ sukses: false, pesan: 'Token tidak valid atau expired' });
    }
};

// ═══════════════════════════════════════
// OPTIONAL AUTH (token opsional)
// Kalau ada token & valid → req.user diisi
// Kalau tidak ada / invalid → tetap lanjut sebagai publik
// ═══════════════════════════════════════
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch (err) {
            // Token tidak valid → abaikan, anggap publik
        }
    }
    next();
};

// ═══════════════════════════════════════
// CEK ROLE
// ═══════════════════════════════════════
const cekRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                sukses: false,
                pesan: `Akses ditolak. Fitur ini hanya untuk: ${roles.join(', ')}`
            });
        }
        next();
    };
};

// ═══════════════════════════════════════
// MIDDLEWARE BANTU
// ═══════════════════════════════════════
const adminAtauStaff = cekRole('admin', 'staff_gudang');
const adminAtauKasir = cekRole('admin', 'kasir');
const adminAtauPerajin = cekRole('admin', 'perajin');
const semuaPegawai = cekRole('admin', 'staff_gudang', 'kasir', 'perajin');

module.exports = {
    verifyToken,
    optionalAuth,
    cekRole,
    adminAtauStaff,
    adminAtauKasir,
    adminAtauPerajin,
    semuaPegawai
};