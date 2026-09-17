const pool = require('../config/database');

class Notifikasi {
    static async findByUser(userId) {
        const [rows] = await pool.query(
            `SELECT * FROM notifikasi WHERE user_id = ? ORDER BY id DESC`,
            [userId]
        );
        return rows;
    }

    static async countBelumDibaca(userId) {
        const [rows] = await pool.query(
            `SELECT COUNT(*) AS total FROM notifikasi 
             WHERE user_id = ? AND sudah_dibaca = FALSE`,
            [userId]
        );
        return rows[0].total;
    }

    static async create(userId, judul, pesan, tipe) {
        const [result] = await pool.query(
            `INSERT INTO notifikasi (user_id, judul, pesan, tipe, sudah_dibaca)
             VALUES (?, ?, ?, ?, FALSE)`,
            [userId, judul, pesan, tipe || 'sistem']
        );
        return this.findById(result.insertId);
    }

    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT * FROM notifikasi WHERE id = ?`,
            [id]
        );
        return rows[0];
    }

    static async tandaiBaca(id, userId) {
        const [result] = await pool.query(
            `UPDATE notifikasi SET sudah_dibaca = TRUE 
             WHERE id = ? AND user_id = ?`,
            [id, userId]
        );
        return result.affectedRows > 0;
    }

    static async tandaiSemuaBaca(userId) {
        const [result] = await pool.query(
            `UPDATE notifikasi SET sudah_dibaca = TRUE WHERE user_id = ?`,
            [userId]
        );
        return result.affectedRows;
    }

    static async hapus(id, userId) {
        const [result] = await pool.query(
            `DELETE FROM notifikasi WHERE id = ? AND user_id = ?`,
            [id, userId]
        );
        return result.affectedRows > 0;
    }

    static async hapusSemua(userId) {
        const [result] = await pool.query(
            `DELETE FROM notifikasi WHERE user_id = ?`,
            [userId]
        );
        return result.affectedRows;
    }
}

module.exports = Notifikasi;