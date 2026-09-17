const pool = require('../config/database');

class Kategori {
    static async findAll() {
        const [rows] = await pool.query(
            `SELECT k.id, k.nama_kategori, k.deskripsi, k.gambar, k.status,
                    COUNT(p.id) AS jumlah_produk
             FROM kategori k
             LEFT JOIN produk p ON p.kategori_id = k.id AND p.status = 'aktif'
             WHERE k.status = 'aktif'
             GROUP BY k.id
             ORDER BY k.nama_kategori ASC`
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT * FROM kategori WHERE id = ? AND status = 'aktif'`,
            [id]
        );
        return rows[0];
    }

    static async create(data) {
        const { nama_kategori, deskripsi, gambar } = data;
        const [result] = await pool.query(
            `INSERT INTO kategori (nama_kategori, deskripsi, gambar, status)
             VALUES (?, ?, ?, 'aktif')`,
            [nama_kategori, deskripsi || null, gambar || null]
        );
        return this.findById(result.insertId);
    }

    static async update(id, data) {
        const { nama_kategori, deskripsi, gambar } = data;
        await pool.query(
            `UPDATE kategori SET nama_kategori = ?, deskripsi = ?, gambar = ?
             WHERE id = ?`,
            [nama_kategori, deskripsi || null, gambar || null, id]
        );
        return this.findById(id);
    }

    static async delete(id) {
        const [result] = await pool.query(
            `UPDATE kategori SET status = 'nonaktif' WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Kategori;