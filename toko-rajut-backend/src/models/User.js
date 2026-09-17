const pool = require('../config/database');
const { hashPassword, isHashed } = require('../utils/hash');

class User {
    static async findByUsername(username) {
        const [rows] = await pool.query(
            `SELECT * FROM users WHERE username = ? AND status = 'aktif'`,
            [username]
        );
        return rows[0];
    }

    static async findByEmail(email) {
        const [rows] = await pool.query(
            `SELECT * FROM users WHERE email = ? AND status = 'aktif'`,
            [email]
        );
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT id, username, email, nama_lengkap, no_hp, role, status, foto, created_at
             FROM users WHERE id = ? AND status = 'aktif'`,
            [id]
        );
        return rows[0];
    }

    static async create(data) {
        const { username, email, password, nama_lengkap, no_hp, role } = data;

        const finalPassword = isHashed(password)
            ? password
            : await hashPassword(password);

        const [result] = await pool.query(
            `INSERT INTO users (username, email, password, nama_lengkap, no_hp, role, status)
             VALUES (?, ?, ?, ?, ?, ?, 'aktif')`,
            [username, email, finalPassword, nama_lengkap, no_hp || null, role || 'pembeli']
        );
        return this.findById(result.insertId);
    }

    static async updatePassword(id, newPassword) {
        const finalPassword = isHashed(newPassword)
            ? newPassword
            : await hashPassword(newPassword);

        const [result] = await pool.query(
            `UPDATE users SET password = ? WHERE id = ?`,
            [finalPassword, id]
        );
        return result.affectedRows > 0;
    }

    // ═══════════════════════════════════════
    // METHOD BARU UNTUK ADMIN KELOLA USER
    // ═══════════════════════════════════════

    // Cari user berdasarkan role (untuk cek admin ganda)
    static async findByRole(role) {
        const [rows] = await pool.query(
            `SELECT id, username, email, nama_lengkap, role, status 
             FROM users WHERE role = ? AND status = 'aktif'`,
            [role]
        );
        return rows;
    }

    // Ambil semua user (untuk halaman admin)
    static async getAll() {
        const [rows] = await pool.query(
            `SELECT id, username, email, nama_lengkap, no_hp, role, status, foto, created_at
             FROM users 
             ORDER BY id ASC`
        );
        return rows;
    }

    // Update user (nama, email, no_hp, role, status)
    static async update(id, data) {
        const { nama_lengkap, email, no_hp, role, status } = data;
        await pool.query(
            `UPDATE users 
             SET nama_lengkap = ?, email = ?, no_hp = ?, role = ?, status = ?
             WHERE id = ?`,
            [
                nama_lengkap,
                email,
                no_hp || null,
                role || 'pembeli',
                status || 'aktif',
                id
            ]
        );
        return this.findById(id);
    }

    // Soft delete (set status = 'nonaktif')
    static async delete(id) {
        const [result] = await pool.query(
            `UPDATE users SET status = 'nonaktif' WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = User;