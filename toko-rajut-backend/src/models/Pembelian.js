// backend/models/Pembelian.js
const pool = require('../config/database');

class Pembelian {
    static async generateKode(conn) {
        const tahun = new Date().getFullYear();
        const [rows] = await conn.query(
            `SELECT COUNT(*) AS total FROM pembelian_bahan WHERE YEAR(tanggal) = ?`,
            [tahun]
        );
        const urut = (rows[0].total + 1).toString().padStart(3, '0');
        return `PO-${tahun}-${urut}`;
    }

    // ═══════════════════════════════════════
    // CARI ATAU BUAT BAHAN BARU
    // ═══════════════════════════════════════
    static async cariAtauBuatBahan(conn, { nama_bahan, kategori_id, satuan }) {
        const [rows] = await conn.query(
            `SELECT id FROM bahan 
             WHERE LOWER(nama_bahan) = LOWER(?) 
             AND status = 'aktif'
             LIMIT 1`,
            [nama_bahan.trim()]
        );

        if (rows.length > 0) {
            return rows[0].id;
        }

        const [kodeRows] = await conn.query(
            `SELECT kode_bahan FROM bahan 
             WHERE kode_bahan LIKE 'BHN%' 
             ORDER BY id DESC LIMIT 1`
        );

        let kodeBaru = 'BHN001';
        if (kodeRows.length > 0) {
            const lastNumber = parseInt(kodeRows[0].kode_bahan.replace('BHN', ''), 10);
            if (!isNaN(lastNumber)) {
                kodeBaru = `BHN${(lastNumber + 1).toString().padStart(3, '0')}`;
            }
        }

        const [result] = await conn.query(
            `INSERT INTO bahan 
             (kode_bahan, nama_bahan, kategori_id, satuan, stok, stok_minimal, harga_beli, status)
             VALUES (?, ?, ?, ?, 0, 0, 0, 'aktif')`,
            [
                kodeBaru,
                nama_bahan.trim(),
                kategori_id || null,
                satuan || 'pcs'
            ]
        );

        return result.insertId;
    }

    // ═══════════════════════════════════════
    // CREATE PO
    // ═══════════════════════════════════════
    static async create(supplierId, items, catatan) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const kodePembelian = await this.generateKode(conn);

            let total = 0;
            for (const item of items) {
                total += item.harga_beli * item.jumlah;
            }

            const [result] = await conn.query(
                `INSERT INTO pembelian_bahan (kode_pembelian, supplier_id, total, status, catatan)
                 VALUES (?, ?, ?, 'dipesan', ?)`,
                [kodePembelian, supplierId, total, catatan || null]
            );
            const pembelianId = result.insertId;

            for (const item of items) {
                const bahanId = await this.cariAtauBuatBahan(conn, {
                    nama_bahan: item.nama_bahan,
                    kategori_id: item.kategori_id,
                    satuan: item.satuan
                });

                const subtotal = item.harga_beli * item.jumlah;
                await conn.query(
                    `INSERT INTO detail_pembelian_bahan (pembelian_id, bahan_id, jumlah, harga_beli, subtotal)
                     VALUES (?, ?, ?, ?, ?)`,
                    [pembelianId, bahanId, item.jumlah, item.harga_beli, subtotal]
                );
            }

            await conn.commit();
            return await this.findById(pembelianId);
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }

    // ═══════════════════════════════════════
    // TERIMA PO → STOK BAHAN BERTAMBAH
    // ═══════════════════════════════════════
    static async terima(id) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [pembelianRows] = await conn.query(
                `SELECT * FROM pembelian_bahan WHERE id = ?`,
                [id]
            );
            if (pembelianRows.length === 0) {
                throw new Error('Pembelian tidak ditemukan');
            }
            if (pembelianRows[0].status === 'diterima') {
                throw new Error('Pembelian sudah diterima sebelumnya');
            }

            const [detailRows] = await conn.query(
                `SELECT dpb.*, b.stok AS stok_sebelum, b.nama_bahan
                 FROM detail_pembelian_bahan dpb
                 LEFT JOIN bahan b ON dpb.bahan_id = b.id
                 WHERE dpb.pembelian_id = ?`,
                [id]
            );

            for (const d of detailRows) {
                const stokBaru = Number(d.stok_sebelum) + Number(d.jumlah);
                const hargaBeliBaru = Number(d.harga_beli) || 0;

                await conn.query(
                    `UPDATE bahan 
                     SET stok = ?, harga_beli = ?
                     WHERE id = ?`,
                    [stokBaru, hargaBeliBaru, d.bahan_id]
                );

                // ═══ LOG STOK BAHAN MASUK ═══
                await conn.query(
                    `INSERT INTO log_stok 
                     (produk_id, bahan_id, tipe_entitas, tipe, jumlah, stok_sebelum, stok_sesudah, keterangan, referensi_id)
                     VALUES (NULL, ?, 'bahan', 'masuk', ?, ?, ?, ?, ?)`,
                    [
                        d.bahan_id,
                        d.jumlah,
                        d.stok_sebelum,
                        stokBaru,
                        `Pembelian bahan dari supplier`,
                        id
                    ]
                );
            }

            await conn.query(
                `UPDATE pembelian_bahan SET status = 'diterima' WHERE id = ?`,
                [id]
            );

            await conn.commit();
            return await this.findById(id);
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }

    static async findAll() {
        const [rows] = await pool.query(
            `SELECT pb.*, s.nama_supplier
             FROM pembelian_bahan pb
             LEFT JOIN supplier s ON pb.supplier_id = s.id
             ORDER BY pb.id DESC`
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT pb.*, s.nama_supplier
             FROM pembelian_bahan pb
             LEFT JOIN supplier s ON pb.supplier_id = s.id
             WHERE pb.id = ?`,
            [id]
        );
        if (rows.length === 0) return null;

        const pembelian = rows[0];

        const [detailRows] = await pool.query(
            `SELECT dpb.*, b.nama_bahan, b.kode_bahan, b.satuan, b.stok AS stok_bahan
             FROM detail_pembelian_bahan dpb
             LEFT JOIN bahan b ON dpb.bahan_id = b.id
             WHERE dpb.pembelian_id = ?`,
            [id]
        );

        pembelian.detail = detailRows;
        return pembelian;
    }
}

module.exports = Pembelian;