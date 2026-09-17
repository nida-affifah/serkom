const pool = require('../config/database');

class LogAktivitas {
    static async findAll(limit = 100) {
        const [rows] = await pool.query(
            `SELECT la.*, u.username, u.nama_lengkap
             FROM log_aktivitas la
             LEFT JOIN users u ON la.user_id = u.id
             ORDER BY la.id DESC
             LIMIT ?`,
            [limit]
        );
        return rows;
    }

    static async catat(userId, aksi, tabel, recordId, keterangan, ip) {
        await pool.query(
            `INSERT INTO log_aktivitas (user_id, aksi, tabel, record_id, keterangan, ip_address)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, aksi, tabel || null, recordId || null, keterangan || null, ip || null]
        );
    }

    static async hapusSemua() {
        const [result] = await pool.query(`DELETE FROM log_aktivitas`);
        return result.affectedRows;
    }
}

module.exports = LogAktivitas;