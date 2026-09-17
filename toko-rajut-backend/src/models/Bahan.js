// backend/models/Bahan.js
const pool = require('../config/database');

class Bahan {
    // ═══════════════════════════════════════
    // GENERATE KODE BAHAN OTOMATIS
    // ═══════════════════════════════════════
    static async generateKode() {
        const [rows] = await pool.query(
            `SELECT kode_bahan FROM bahan 
             WHERE kode_bahan LIKE 'BHN%' 
             ORDER BY id DESC LIMIT 1`
        );

        if (rows.length === 0) return 'BHN001';

        const lastKode = rows[0].kode_bahan;
        const lastNumber = parseInt(lastKode.replace('BHN', ''), 10);
        if (isNaN(lastNumber)) return 'BHN001';

        const newNumber = lastNumber + 1;
        return `BHN${newNumber.toString().padStart(3, '0')}`;
    }

    // ═══════════════════════════════════════
    // GET ALL
    // ═══════════════════════════════════════
    static async findAll() {
        const [rows] = await pool.query(
            `SELECT b.*, k.nama_kategori
             FROM bahan b
             LEFT JOIN kategori k ON b.kategori_id = k.id
             WHERE b.status = 'aktif'
             ORDER BY b.id DESC`
        );
        return rows;
    }

    // ═══════════════════════════════════════
    // GET BY ID
    // ═══════════════════════════════════════
    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT b.*, k.nama_kategori
             FROM bahan b
             LEFT JOIN kategori k ON b.kategori_id = k.id
             WHERE b.id = ? AND b.status = 'aktif'`,
            [id]
        );
        return rows[0];
    }

    // ═══════════════════════════════════════
    // CREATE
    // ═══════════════════════════════════════
    static async create(data) {
        const {
            nama_bahan, kategori_id, satuan,
            stok_minimal, deskripsi, gambar
        } = data;

        const kode_bahan = data.kode_bahan || await this.generateKode();

        const [result] = await pool.query(
            `INSERT INTO bahan 
             (kode_bahan, nama_bahan, kategori_id, satuan, 
              stok, stok_minimal, harga_beli, deskripsi, gambar, status)
             VALUES (?, ?, ?, ?, 0, ?, 0, ?, ?, 'aktif')`,
            [
                kode_bahan,
                nama_bahan,
                kategori_id || null,
                satuan || 'pcs',
                stok_minimal || 0,
                deskripsi || null,
                gambar || null
            ]
        );
        return this.findById(result.insertId);
    }

    // ═══════════════════════════════════════
    // UPDATE
    // ═══════════════════════════════════════
    static async update(id, data) {
        const {
            nama_bahan, kategori_id, satuan,
            stok_minimal, deskripsi, gambar
        } = data;

        await pool.query(
            `UPDATE bahan 
             SET nama_bahan = ?, kategori_id = ?, satuan = ?,
                 stok_minimal = ?, deskripsi = ?, gambar = ?
             WHERE id = ?`,
            [
                nama_bahan,
                kategori_id || null,
                satuan || 'pcs',
                stok_minimal || 0,
                deskripsi || null,
                gambar || null,
                id
            ]
        );
        return this.findById(id);
    }

    // ═══════════════════════════════════════
    // DELETE (soft delete)
    // ═══════════════════════════════════════
    static async delete(id) {
        const [result] = await pool.query(
            `UPDATE bahan SET status = 'nonaktif' WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }

    // ═══════════════════════════════════════
    // UPDATE STOK & HARGA (dipakai dari Pembelian)
    // ═══════════════════════════════════════
    static async updateStokHarga(conn, id, hargaBeliBaru, stokBaru) {
        await conn.query(
            `UPDATE bahan 
             SET harga_beli = ?, stok = ?
             WHERE id = ?`,
            [hargaBeliBaru, stokBaru, id]
        );
    }

    // ═══════════════════════════════════════
    // AMBIL STOK (untuk cek kecukupan produksi)
    // ═══════════════════════════════════════
    static async getStok(id) {
        const [rows] = await pool.query(
            `SELECT id, nama_bahan, stok, satuan FROM bahan WHERE id = ?`,
            [id]
        );
        return rows[0];
    }
}

module.exports = Bahan;