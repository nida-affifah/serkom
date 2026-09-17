const pool = require('../config/database');

class Pengiriman {
    // Admin bikin pengiriman (kirim barang)
    static async create(pesananId, kurirId, noResi, alamatKirim) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Cek pesanan
            const [pesananRows] = await conn.query(
                `SELECT * FROM pesanan WHERE id = ?`,
                [pesananId]
            );
            if (pesananRows.length === 0) {
                throw new Error('Pesanan tidak ditemukan');
            }
            if (pesananRows[0].status !== 'diproses') {
                throw new Error('Pesanan harus berstatus diproses dulu sebelum dikirim');
            }

            // Cek sudah ada pengiriman belum
            const [existing] = await conn.query(
                `SELECT id FROM pengiriman WHERE pesanan_id = ?`,
                [pesananId]
            );
            if (existing.length > 0) {
                throw new Error('Pesanan ini sudah dikirim sebelumnya');
            }

            const [result] = await conn.query(
                `INSERT INTO pengiriman (pesanan_id, kurir_id, no_resi, alamat_kirim, status, tanggal_kirim)
                 VALUES (?, ?, ?, ?, 'dikirim', NOW())`,
                [pesananId, kurirId, noResi, alamatKirim || null]
            );

            // Update status pesanan jadi dikirim
            await conn.query(
                `UPDATE pesanan SET status = 'dikirim' WHERE id = ?`,
                [pesananId]
            );

            await conn.commit();
            return await this.findById(result.insertId);
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }

    // Admin tandai barang sudah sampai
    static async tandaiSampai(id) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [rows] = await conn.query(
                `SELECT * FROM pengiriman WHERE id = ?`,
                [id]
            );
            if (rows.length === 0) {
                throw new Error('Pengiriman tidak ditemukan');
            }
            if (rows[0].status === 'sampai') {
                throw new Error('Pengiriman sudah ditandai sampai');
            }

            await conn.query(
                `UPDATE pengiriman SET status = 'sampai', tanggal_sampai = NOW() WHERE id = ?`,
                [id]
            );

            // Update status pesanan jadi selesai
            await conn.query(
                `UPDATE pesanan SET status = 'selesai' WHERE id = ?`,
                [rows[0].pesanan_id]
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

    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT pg.*, k.nama_kurir, k.ongkir_per_kg,
                    ps.kode_pesanan, ps.total, ps.status AS status_pesanan,
                    u.nama_lengkap AS nama_pembeli
             FROM pengiriman pg
             LEFT JOIN kurir k ON pg.kurir_id = k.id
             LEFT JOIN pesanan ps ON pg.pesanan_id = ps.id
             LEFT JOIN users u ON ps.user_id = u.id
             WHERE pg.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async findByPesanan(pesananId) {
        const [rows] = await pool.query(
            `SELECT pg.*, k.nama_kurir
             FROM pengiriman pg
             LEFT JOIN kurir k ON pg.kurir_id = k.id
             WHERE pg.pesanan_id = ?`,
            [pesananId]
        );
        return rows[0];
    }

    static async findAll(status) {
        let sql = `
            SELECT pg.*, k.nama_kurir, ps.kode_pesanan, ps.total,
                   u.nama_lengkap AS nama_pembeli
            FROM pengiriman pg
            LEFT JOIN kurir k ON pg.kurir_id = k.id
            LEFT JOIN pesanan ps ON pg.pesanan_id = ps.id
            LEFT JOIN users u ON ps.user_id = u.id
        `;
        const params = [];

        if (status) {
            sql += ` WHERE pg.status = ?`;
            params.push(status);
        }

        sql += ` ORDER BY pg.id DESC`;

        const [rows] = await pool.query(sql, params);
        return rows;
    }
}

module.exports = Pengiriman;