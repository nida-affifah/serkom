// backend/models/Voucher.js
const pool = require('../config/database');

class Voucher {
    static async findAll() {
        const [rows] = await pool.query(`SELECT * FROM voucher ORDER BY id DESC`);
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.query(`SELECT * FROM voucher WHERE id = ?`, [id]);
        return rows[0];
    }

    static async findByKode(kode) {
        const [rows] = await pool.query(
            `SELECT * FROM voucher WHERE kode = ? AND status = 'aktif'`,
            [kode]
        );
        return rows[0];
    }

    // ═══════════════════════════════════════
    // VOUCHER AKTIF (untuk halaman publik/pembeli)
    // Hanya yang: aktif, belum kadaluarsa, kuota > 0
    // ═══════════════════════════════════════
    static async findAktif() {
        const [rows] = await pool.query(
            `SELECT id, kode, diskon_persen, diskon_nominal, min_belanja,
                    tanggal_mulai, tanggal_selesai, kuota
             FROM voucher
             WHERE status = 'aktif'
               AND (tanggal_mulai IS NULL OR tanggal_mulai <= CURDATE())
               AND (tanggal_selesai IS NULL OR tanggal_selesai >= CURDATE())
               AND (kuota IS NULL OR kuota > 0)
             ORDER BY 
                CASE WHEN diskon_persen > 0 THEN diskon_persen ELSE 0 END DESC,
                CASE WHEN diskon_nominal > 0 THEN diskon_nominal ELSE 0 END DESC`
        );
        return rows;
    }

    static async create(data) {
        const {
            kode, diskon_persen, diskon_nominal,
            min_belanja, tanggal_mulai, tanggal_selesai, kuota
        } = data;

        const [result] = await pool.query(
            `INSERT INTO voucher (kode, diskon_persen, diskon_nominal, min_belanja,
                                  tanggal_mulai, tanggal_selesai, kuota, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'aktif')`,
            [
                kode.toUpperCase(),
                diskon_persen || 0,
                diskon_nominal || 0,
                min_belanja || 0,
                tanggal_mulai || null,
                tanggal_selesai || null,
                kuota || 0
            ]
        );
        return this.findById(result.insertId);
    }

    static async update(id, data) {
        const {
            kode, diskon_persen, diskon_nominal,
            min_belanja, tanggal_mulai, tanggal_selesai, kuota, status
        } = data;

        await pool.query(
            `UPDATE voucher 
             SET kode = ?, diskon_persen = ?, diskon_nominal = ?, min_belanja = ?,
                 tanggal_mulai = ?, tanggal_selesai = ?, kuota = ?, status = ?
             WHERE id = ?`,
            [
                kode.toUpperCase(), diskon_persen || 0, diskon_nominal || 0,
                min_belanja || 0, tanggal_mulai || null, tanggal_selesai || null,
                kuota || 0, status || 'aktif', id
            ]
        );
        return this.findById(id);
    }

    static async delete(id) {
        const [result] = await pool.query(`DELETE FROM voucher WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }

    static async cekValiditas(kode, totalBelanja) {
        const voucher = await this.findByKode(kode);

        if (!voucher) {
            throw new Error('Kode voucher tidak ditemukan');
        }

        const hariIni = new Date();
        hariIni.setHours(0, 0, 0, 0);

        const tanggalMulai = voucher.tanggal_mulai
            ? new Date(voucher.tanggal_mulai + 'T00:00:00')
            : null;
        const tanggalSelesai = voucher.tanggal_selesai
            ? new Date(voucher.tanggal_selesai + 'T23:59:59')
            : null;

        if (tanggalMulai && tanggalMulai > hariIni) {
            throw new Error('Voucher belum berlaku');
        }
        if (tanggalSelesai && tanggalSelesai < hariIni) {
            throw new Error('Voucher sudah kadaluarsa');
        }
        if (voucher.min_belanja > 0 && totalBelanja < voucher.min_belanja) {
            throw new Error(`Minimal belanja Rp ${voucher.min_belanja.toLocaleString('id-ID')}`);
        }

        let diskon = 0;
        if (voucher.diskon_persen > 0) {
            diskon = Math.floor((totalBelanja * voucher.diskon_persen) / 100);
        } else if (voucher.diskon_nominal > 0) {
            diskon = voucher.diskon_nominal;
        }
        if (diskon > totalBelanja) {
            diskon = totalBelanja;
        }

        return {
            voucher: {
                id: voucher.id,
                kode: voucher.kode,
                diskon_persen: voucher.diskon_persen,
                diskon_nominal: voucher.diskon_nominal,
                min_belanja: voucher.min_belanja
            },
            total_belanja: totalBelanja,
            diskon,
            total_setelah_diskon: totalBelanja - diskon
        };
    }
}

module.exports = Voucher;