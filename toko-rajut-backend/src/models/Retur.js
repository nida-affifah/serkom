const pool = require('../config/database');

class Retur {
    static async generateKode(conn) {
        const tahun = new Date().getFullYear();
        const [rows] = await conn.query(
            `SELECT COUNT(*) AS total FROM retur WHERE YEAR(tanggal) = ?`,
            [tahun]
        );
        const urut = (rows[0].total + 1).toString().padStart(3, '0');
        return `RT-${tahun}-${urut}`;
    }

    // Pembeli ajukan retur
    static async ajukan(userId, pesananId, alasanId, jenis, catatan, items) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Cek pesanan milik user dan statusnya selesai/dikirim
            const [pesananRows] = await conn.query(
                `SELECT * FROM pesanan WHERE id = ? AND user_id = ?`,
                [pesananId, userId]
            );

            if (pesananRows.length === 0) {
                throw new Error('Pesanan tidak ditemukan atau bukan milik Anda');
            }

            const pesanan = pesananRows[0];
            if (!['dikirim', 'selesai'].includes(pesanan.status)) {
                throw new Error('Pesanan belum bisa diretur. Status harus dikirim atau selesai');
            }

            const kodeRetur = await this.generateKode(conn);

            const [result] = await conn.query(
                `INSERT INTO retur (kode_retur, pesanan_id, user_id, alasan_id, jenis, status, catatan)
                 VALUES (?, ?, ?, ?, ?, 'diajukan', ?)`,
                [kodeRetur, pesananId, userId, alasanId, jenis, catatan || null]
            );
            const returId = result.insertId;

            for (const item of items) {
                await conn.query(
                    `INSERT INTO detail_retur (retur_id, produk_id, jumlah, kondisi, subtotal)
                     VALUES (?, ?, ?, ?, ?)`,
                    [returId, item.produk_id, item.jumlah, item.kondisi || 'rusak', item.subtotal || 0]
                );
            }

            await conn.commit();
            return await this.findById(returId);
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }

    // Admin setujui retur
    static async setujui(id, catatanAdmin) {
        const [result] = await pool.query(
            `UPDATE retur SET status = 'disetujui', catatan_admin = ? WHERE id = ? AND status = 'diajukan'`,
            [catatanAdmin || null, id]
        );
        if (result.affectedRows === 0) {
            throw new Error('Retur tidak ditemukan atau sudah diproses');
        }
        return await this.findById(id);
    }

    // Admin tolak retur
    static async tolak(id, catatanAdmin) {
        const [result] = await pool.query(
            `UPDATE retur SET status = 'ditolak', catatan_admin = ? WHERE id = ? AND status = 'diajukan'`,
            [catatanAdmin || null, id]
        );
        if (result.affectedRows === 0) {
            throw new Error('Retur tidak ditemukan atau sudah diproses');
        }
        return await this.findById(id);
    }

    // Barang retur diterima di toko: stok kembali kalau bagus, atau catat rusak
    static async terimaBarang(id, catatanAdmin) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [returRows] = await conn.query(
                `SELECT * FROM retur WHERE id = ?`,
                [id]
            );
            if (returRows.length === 0) {
                throw new Error('Retur tidak ditemukan');
            }
            if (returRows[0].status !== 'disetujui') {
                throw new Error('Retur belum disetujui');
            }

            const [detailRows] = await conn.query(
                `SELECT dr.*, p.stok AS stok_sebelum FROM detail_retur dr
                 LEFT JOIN produk p ON dr.produk_id = p.id
                 WHERE dr.retur_id = ?`,
                [id]
            );

            for (const d of detailRows) {
                if (d.kondisi === 'bagus') {
                    const stokBaru = d.stok_sebelum + d.jumlah;
                    await conn.query(
                        `UPDATE produk SET stok = ? WHERE id = ?`,
                        [stokBaru, d.produk_id]
                    );
                    await conn.query(
                        `INSERT INTO log_stok (produk_id, tipe, jumlah, stok_sebelum, stok_sesudah, keterangan, referensi_id)
                         VALUES (?, 'retur_masuk', ?, ?, ?, ?, ?)`,
                        [d.produk_id, d.jumlah, d.stok_sebelum, stokBaru, 'Retur barang bagus', id]
                    );
                } else {
                    // Barang rusak, tidak masuk stok, catat di log sebagai rusak
                    await conn.query(
                        `INSERT INTO log_stok (produk_id, tipe, jumlah, stok_sebelum, stok_sesudah, keterangan, referensi_id)
                         VALUES (?, 'rusak', ?, ?, ?, ?, ?)`,
                        [d.produk_id, d.jumlah, d.stok_sebelum, d.stok_sebelum, 'Retur barang rusak', id]
                    );
                }
            }

            await conn.query(
                `UPDATE retur SET status = 'barang_diterima', catatan_admin = ? WHERE id = ?`,
                [catatanAdmin || returRows[0].catatan_admin, id]
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

    // Admin proses refund
    static async prosesRefund(returId, jumlah, metode, bukti) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [returRows] = await conn.query(
                `SELECT * FROM retur WHERE id = ?`,
                [returId]
            );
            if (returRows.length === 0) {
                throw new Error('Retur tidak ditemukan');
            }
            if (returRows[0].status !== 'barang_diterima') {
                throw new Error('Barang retur belum diterima di toko');
            }

            const [result] = await conn.query(
                `INSERT INTO refund (retur_id, jumlah, metode, bukti, status)
                 VALUES (?, ?, ?, ?, 'selesai')`,
                [returId, jumlah, metode || 'Transfer', bukti || null]
            );

            await conn.query(
                `UPDATE retur SET status = 'selesai' WHERE id = ?`,
                [returId]
            );

            await conn.commit();
            return await this.findById(returId);
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }

    static async findAll() {
        const [rows] = await pool.query(
            `SELECT r.*, u.nama_lengkap AS nama_pembeli, p.kode_pesanan, a.nama_alasan
             FROM retur r
             LEFT JOIN users u ON r.user_id = u.id
             LEFT JOIN pesanan p ON r.pesanan_id = p.id
             LEFT JOIN alasan_retur a ON r.alasan_id = a.id
             ORDER BY r.id DESC`
        );
        return rows;
    }

    static async findByUser(userId) {
        const [rows] = await pool.query(
            `SELECT r.*, p.kode_pesanan, a.nama_alasan
             FROM retur r
             LEFT JOIN pesanan p ON r.pesanan_id = p.id
             LEFT JOIN alasan_retur a ON r.alasan_id = a.id
             WHERE r.user_id = ?
             ORDER BY r.id DESC`,
            [userId]
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT r.*, u.nama_lengkap AS nama_pembeli, p.kode_pesanan, a.nama_alasan
             FROM retur r
             LEFT JOIN users u ON r.user_id = u.id
             LEFT JOIN pesanan p ON r.pesanan_id = p.id
             LEFT JOIN alasan_retur a ON r.alasan_id = a.id
             WHERE r.id = ?`,
            [id]
        );
        if (rows.length === 0) return null;

        const retur = rows[0];

        const [detailRows] = await pool.query(
            `SELECT dr.*, pr.nama_produk FROM detail_retur dr
             LEFT JOIN produk pr ON dr.produk_id = pr.id
             WHERE dr.retur_id = ?`,
            [id]
        );
        retur.detail = detailRows;

        const [refundRows] = await pool.query(
            `SELECT * FROM refund WHERE retur_id = ?`,
            [id]
        );
        retur.refund = refundRows[0] || null;

        return retur;
    }
}

module.exports = Retur;