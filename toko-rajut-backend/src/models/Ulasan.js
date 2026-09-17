const pool = require('../config/database');

class Ulasan {
    // Bikin ulasan baru
    static async create(userId, produkId, rating, komentar) {
        // Cek user pernah beli produk ini (status pesanan = selesai)
        const [beliRows] = await pool.query(
            `SELECT dp.id FROM detail_pesanan dp
             LEFT JOIN pesanan p ON dp.pesanan_id = p.id
             WHERE p.user_id = ? AND dp.produk_id = ? AND p.status = 'selesai'
             LIMIT 1`,
            [userId, produkId]
        );
        if (beliRows.length === 0) {
            throw new Error('Anda belum pernah membeli produk ini atau pesanan belum selesai');
        }

        // Cek sudah pernah review belum
        const [existing] = await pool.query(
            `SELECT id FROM ulasan WHERE user_id = ? AND produk_id = ?`,
            [userId, produkId]
        );
        if (existing.length > 0) {
            throw new Error('Anda sudah pernah memberi ulasan untuk produk ini');
        }

        const [result] = await pool.query(
            `INSERT INTO ulasan (produk_id, user_id, rating, komentar)
             VALUES (?, ?, ?, ?)`,
            [produkId, userId, rating, komentar || null]
        );

        return this.findById(result.insertId);
    }

    // Ambil ulasan per produk (untuk halaman detail produk)
    static async findByProduk(produkId) {
        const [rows] = await pool.query(
            `SELECT u.id, u.rating, u.komentar, u.tanggal,
                    us.nama_lengkap AS nama_pemberi
             FROM ulasan u
             LEFT JOIN users us ON u.user_id = us.id
             WHERE u.produk_id = ?
             ORDER BY u.id DESC`,
            [produkId]
        );
        return rows;
    }

    // Ringkasan rating produk
    static async ringkasanProduk(produkId) {
        const [rows] = await pool.query(
            `SELECT 
                COUNT(*) AS total_ulasan,
                COALESCE(AVG(rating), 0) AS rating_rata
             FROM ulasan WHERE produk_id = ?`,
            [produkId]
        );
        return {
            total_ulasan: rows[0].total_ulasan,
            rating_rata: parseFloat(Number(rows[0].rating_rata).toFixed(1))
        };
    }

    // Ambil ulasan milik user
    static async findByUser(userId) {
        const [rows] = await pool.query(
            `SELECT u.*, p.nama_produk, p.kode_produk
             FROM ulasan u
             LEFT JOIN produk p ON u.produk_id = p.id
             WHERE u.user_id = ?
             ORDER BY u.id DESC`,
            [userId]
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT u.*, us.nama_lengkap AS nama_pemberi, p.nama_produk
             FROM ulasan u
             LEFT JOIN users us ON u.user_id = us.id
             LEFT JOIN produk p ON u.produk_id = p.id
             WHERE u.id = ?`,
            [id]
        );
        return rows[0];
    }

    // Admin lihat semua ulasan
    static async findAll() {
        const [rows] = await pool.query(
            `SELECT u.*, us.nama_lengkap AS nama_pemberi, p.nama_produk
             FROM ulasan u
             LEFT JOIN users us ON u.user_id = us.id
             LEFT JOIN produk p ON u.produk_id = p.id
             ORDER BY u.id DESC`
        );
        return rows;
    }

    // Admin hapus ulasan
    static async delete(id) {
        const [result] = await pool.query(`DELETE FROM ulasan WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Ulasan;