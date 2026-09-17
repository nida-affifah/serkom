const pool = require('../config/database');

class Pendaftaran {
    static async findAll() {
        const [rows] = await pool.query(
            `SELECT p.*, u.username, u.email AS email_user
             FROM pendaftaran p
             LEFT JOIN users u ON p.user_id = u.id
             ORDER BY p.id DESC`
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.query(`SELECT * FROM pendaftaran WHERE id = ?`, [id]);
        return rows[0];
    }

    static async create(userId, data) {
        const { nama_lengkap, email, no_hp, alamat } = data;
        const [result] = await pool.query(
            `INSERT INTO pendaftaran (user_id, nama_lengkap, email, no_hp, alamat, status)
             VALUES (?, ?, ?, ?, ?, 'baru')`,
            [userId, nama_lengkap, email, no_hp || null, alamat || null]
        );
        return this.findById(result.insertId);
    }

    static async verifikasi(id) {
        const [result] = await pool.query(
            `UPDATE pendaftaran SET status = 'terverifikasi' WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0 ? this.findById(id) : null;
    }
}

module.exports = Pendaftaran;