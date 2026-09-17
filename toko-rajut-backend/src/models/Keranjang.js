// backend/models/Keranjang.js
const pool = require('../config/database');

class Keranjang {
    // ═══════════════════════════════════════
    // Lihat isi keranjang user + status stok
    // ═══════════════════════════════════════
    static async findByUser(userId) {
        const [rows] = await pool.query(
            `SELECT k.id, k.user_id, k.produk_id, k.jumlah,
                    p.nama_produk, p.harga_jual, p.stok, p.gambar_utama,
                    (p.harga_jual * k.jumlah) AS subtotal,
                    CASE 
                        WHEN p.stok IS NULL OR p.status != 'aktif' THEN 'tidak_tersedia'
                        WHEN p.stok = 0 THEN 'habis'
                        WHEN p.stok < k.jumlah THEN 'kurang'
                        ELSE 'tersedia'
                    END AS status_stok,
                    p.status AS status_produk
             FROM keranjang k
             LEFT JOIN produk p ON k.produk_id = p.id
             WHERE k.user_id = ?
             ORDER BY k.id DESC`,
            [userId]
        );
        return rows;
    }

    // ═══════════════════════════════════════
    // Tambah produk ke keranjang
    // ═══════════════════════════════════════
    static async tambah(userId, produkId, jumlah) {
        // Cek produk ada & status aktif
        const [produkRows] = await pool.query(
            `SELECT id, nama_produk, stok FROM produk 
             WHERE id = ? AND status = 'aktif'`,
            [produkId]
        );
        if (produkRows.length === 0) {
            throw new Error('Produk tidak ditemukan atau tidak aktif');
        }

        const produk = produkRows[0];

        // Cek stok habis
        if (produk.stok <= 0) {
            throw new Error('Stok habis');
        }

        // Cek stok cukup
        if (produk.stok < jumlah) {
            throw new Error(`Stok tidak cukup. Sisa: ${produk.stok}`);
        }

        // Cek sudah ada di keranjang?
        const [existing] = await pool.query(
            `SELECT id, jumlah FROM keranjang WHERE user_id = ? AND produk_id = ?`,
            [userId, produkId]
        );

        if (existing.length > 0) {
            const jumlahBaru = existing[0].jumlah + jumlah;
            if (jumlahBaru > produk.stok) {
                throw new Error(`Stok tidak cukup. Sisa: ${produk.stok}`);
            }
            await pool.query(
                `UPDATE keranjang SET jumlah = ? WHERE id = ?`,
                [jumlahBaru, existing[0].id]
            );
            return { id: existing[0].id, aksi: 'update' };
        } else {
            const [result] = await pool.query(
                `INSERT INTO keranjang (user_id, produk_id, jumlah) VALUES (?, ?, ?)`,
                [userId, produkId, jumlah]
            );
            return { id: result.insertId, aksi: 'tambah' };
        }
    }

    // ═══════════════════════════════════════
    // Update jumlah item
    // ═══════════════════════════════════════
    static async updateJumlah(id, userId, jumlah) {
        if (jumlah < 1) {
            throw new Error('Jumlah minimal 1');
        }

        const [rows] = await pool.query(
            `SELECT k.id, k.produk_id, p.stok, p.nama_produk
             FROM keranjang k
             LEFT JOIN produk p ON k.produk_id = p.id
             WHERE k.id = ? AND k.user_id = ?`,
            [id, userId]
        );

        if (rows.length === 0) {
            throw new Error('Item keranjang tidak ditemukan');
        }

        if (rows[0].stok <= 0) {
            throw new Error(`Stok ${rows[0].nama_produk} habis`);
        }

        if (jumlah > rows[0].stok) {
            throw new Error(`Stok tidak cukup. Sisa: ${rows[0].stok}`);
        }

        await pool.query(
            `UPDATE keranjang SET jumlah = ? WHERE id = ? AND user_id = ?`,
            [jumlah, id, userId]
        );
        return true;
    }

    // ═══════════════════════════════════════
    // Hapus item
    // ═══════════════════════════════════════
    static async hapus(id, userId) {
        const [result] = await pool.query(
            `DELETE FROM keranjang WHERE id = ? AND user_id = ?`,
            [id, userId]
        );
        return result.affectedRows > 0;
    }

    // ═══════════════════════════════════════
    // Kosongkan keranjang
    // ═══════════════════════════════════════
    static async kosongkan(userId) {
        const [result] = await pool.query(
            `DELETE FROM keranjang WHERE user_id = ?`,
            [userId]
        );
        return result.affectedRows;
    }

    // ═══════════════════════════════════════
    // Cek apakah keranjang user valid (semua stok cukup)
    // ═══════════════════════════════════════
    static async cekValid(userId) {
        const [rows] = await pool.query(
            `SELECT k.id, p.nama_produk, k.jumlah, p.stok
             FROM keranjang k
             LEFT JOIN produk p ON k.produk_id = p.id
             WHERE k.user_id = ?`,
            [userId]
        );

        const masalah = [];
        for (const r of rows) {
            if (!r.stok || r.stok <= 0) {
                masalah.push(`Stok ${r.nama_produk} habis`);
            } else if (r.stok < r.jumlah) {
                masalah.push(`Stok ${r.nama_produk} tersisa ${r.stok}, Anda punya ${r.jumlah}`);
            }
        }
        return { valid: masalah.length === 0, masalah };
    }
}

module.exports = Keranjang;