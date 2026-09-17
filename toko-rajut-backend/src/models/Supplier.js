const pool = require('../config/database');

class Supplier {
    static async findAll() {
        const [rows] = await pool.query(
            `SELECT * FROM supplier WHERE status = 'aktif' ORDER BY id DESC`
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT * FROM supplier WHERE id = ? AND status = 'aktif'`,
            [id]
        );
        return rows[0];
    }

    static async create(data) {
        const { nama_supplier, no_hp, alamat, bahan_dipasok } = data;
        const [result] = await pool.query(
            `INSERT INTO supplier (nama_supplier, no_hp, alamat, bahan_dipasok, status)
             VALUES (?, ?, ?, ?, 'aktif')`,
            [nama_supplier, no_hp || null, alamat || null, bahan_dipasok || null]
        );
        return this.findById(result.insertId);
    }

    static async update(id, data) {
        const { nama_supplier, no_hp, alamat, bahan_dipasok } = data;
        await pool.query(
            `UPDATE supplier SET nama_supplier = ?, no_hp = ?, alamat = ?, bahan_dipasok = ?
             WHERE id = ?`,
            [nama_supplier, no_hp || null, alamat || null, bahan_dipasok || null, id]
        );
        return this.findById(id);
    }

    static async delete(id) {
        const [result] = await pool.query(
            `UPDATE supplier SET status = 'nonaktif' WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Supplier;