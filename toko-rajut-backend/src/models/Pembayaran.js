const pool = require('../config/database');

class Pembayaran {
    // Bikin pembayaran baru (dari pembeli)
    static async create(pesananId, metodeId, jumlahBayar, buktiTransfer) {
        // Cek pesanan ada & status masih pending
        const [pesananRows] = await pool.query(
            `SELECT id, user_id, total, status FROM pesanan WHERE id = ?`,
            [pesananId]
        );
        if (pesananRows.length === 0) {
            throw new Error('Pesanan tidak ditemukan');
        }
        if (pesananRows[0].status !== 'pending') {
            throw new Error('Pesanan tidak dalam status pending');
        }

        // Cek sudah ada pembayaran belum
        const [existing] = await pool.query(
            `SELECT id FROM pembayaran WHERE pesanan_id = ?`,
            [pesananId]
        );
        if (existing.length > 0) {
            throw new Error('Pembayaran untuk pesanan ini sudah ada');
        }

        const [result] = await pool.query(
            `INSERT INTO pembayaran (pesanan_id, metode_id, jumlah_bayar, bukti_transfer, status)
             VALUES (?, ?, ?, ?, 'menunggu_verifikasi')`,
            [pesananId, metodeId || null, jumlahBayar, buktiTransfer || null]
        );

        return this.findById(result.insertId);
    }

    // Admin verifikasi: lunas / gagal
    static async verifikasi(id, status) {
        const validStatus = ['lunas', 'gagal'];
        if (!validStatus.includes(status)) {
            throw new Error('Status harus lunas atau gagal');
        }

        const [rows] = await pool.query(
            `SELECT * FROM pembayaran WHERE id = ?`,
            [id]
        );
        if (rows.length === 0) {
            throw new Error('Pembayaran tidak ditemukan');
        }

        await pool.query(
            `UPDATE pembayaran SET status = ? WHERE id = ?`,
            [status, id]
        );

        // Kalau lunas, otomatis ubah status pesanan jadi "diproses"
        if (status === 'lunas') {
            await pool.query(
                `UPDATE pesanan SET status = 'diproses' WHERE id = ? AND status = 'pending'`,
                [rows[0].pesanan_id]
            );
        }

        return this.findById(id);
    }

    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT pb.*, mb.nama_metode, mb.tipe AS tipe_metode,
                    ps.kode_pesanan, ps.total AS total_pesanan, ps.status AS status_pesanan
             FROM pembayaran pb
             LEFT JOIN metode_bayar mb ON pb.metode_id = mb.id
             LEFT JOIN pesanan ps ON pb.pesanan_id = ps.id
             WHERE pb.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async findByPesanan(pesananId) {
        const [rows] = await pool.query(
            `SELECT pb.*, mb.nama_metode
             FROM pembayaran pb
             LEFT JOIN metode_bayar mb ON pb.metode_id = mb.id
             WHERE pb.pesanan_id = ?`,
            [pesananId]
        );
        return rows[0];
    }

    static async findAll(status) {
        let sql = `
            SELECT pb.*, mb.nama_metode,
                   ps.kode_pesanan, ps.total AS total_pesanan,
                   u.nama_lengkap AS nama_pembeli
            FROM pembayaran pb
            LEFT JOIN metode_bayar mb ON pb.metode_id = mb.id
            LEFT JOIN pesanan ps ON pb.pesanan_id = ps.id
            LEFT JOIN users u ON ps.user_id = u.id
        `;
        const params = [];

        if (status) {
            sql += ` WHERE pb.status = ?`;
            params.push(status);
        }

        sql += ` ORDER BY pb.id DESC`;

        const [rows] = await pool.query(sql, params);
        return rows;
    }
}

module.exports = Pembayaran;