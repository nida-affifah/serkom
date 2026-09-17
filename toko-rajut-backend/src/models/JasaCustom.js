const pool = require('../config/database');

class JasaCustom {
    static async findAll() {
        const [rows] = await pool.query(
            `SELECT * FROM jasa_custom WHERE status = 'aktif' ORDER BY id DESC`
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT * FROM jasa_custom WHERE id = ? AND status = 'aktif'`,
            [id]
        );
        return rows[0];
    }

    static async create(data) {
        const { nama_jasa, harga, deskripsi } = data;
        const [result] = await pool.query(
            `INSERT INTO jasa_custom (nama_jasa, harga, deskripsi, status)
             VALUES (?, ?, ?, 'aktif')`,
            [nama_jasa, harga, deskripsi || null]
        );
        return this.findById(result.insertId);
    }

    static async update(id, data) {
        const { nama_jasa, harga, deskripsi } = data;
        await pool.query(
            `UPDATE jasa_custom SET nama_jasa = ?, harga = ?, deskripsi = ? WHERE id = ?`,
            [nama_jasa, harga, deskripsi || null, id]
        );
        return this.findById(id);
    }

    static async delete(id) {
        const [result] = await pool.query(
            `UPDATE jasa_custom SET status = 'nonaktif' WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = JasaCustom;