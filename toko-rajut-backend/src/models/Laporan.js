// backend/models/Laporan.js
const pool = require('../config/database');

class Laporan {
    // ═══════════════════════════════════════
    // RINGKASAN
    // ═══════════════════════════════════════
    static async ringkasan() {
        const [rows] = await pool.query(
            `SELECT 
                (SELECT COUNT(*) FROM pesanan WHERE status != 'batal') AS total_pesanan,
                (SELECT COALESCE(SUM(total), 0) FROM pesanan WHERE status != 'batal') AS total_pendapatan,
                (SELECT COUNT(*) FROM pesanan WHERE status = 'pending') AS pesanan_pending,
                (SELECT COUNT(*) FROM pesanan WHERE status = 'diproses') AS pesanan_diproses,
                (SELECT COUNT(*) FROM pesanan WHERE status = 'dikirim') AS pesanan_dikirim,
                (SELECT COUNT(*) FROM pesanan WHERE status = 'selesai') AS pesanan_selesai,
                (SELECT COUNT(*) FROM produk WHERE stok <= stok_minimal AND status = 'aktif') AS produk_stok_kritis,
                (SELECT COUNT(*) FROM users WHERE role = 'pembeli') AS total_pembeli`
        );
        return rows[0];
    }

    // ═══════════════════════════════════════
    // PEMASUKAN
    // ═══════════════════════════════════════
    static async pemasukanHarian() {
        const [rows] = await pool.query(
            `SELECT 
                DATE(tanggal) AS tanggal,
                COUNT(*) AS jumlah_pesanan,
                COALESCE(SUM(total), 0) AS total_penjualan
             FROM pesanan
             WHERE status != 'batal'
               AND tanggal >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
             GROUP BY DATE(tanggal)
             ORDER BY tanggal ASC`
        );
        return rows;
    }

    static async pemasukanBulanan() {
        const [rows] = await pool.query(
            `SELECT 
                DATE_FORMAT(tanggal, '%Y-%m') AS bulan,
                COUNT(*) AS jumlah_pesanan,
                COALESCE(SUM(total), 0) AS total_penjualan
             FROM pesanan
             WHERE status != 'batal'
               AND tanggal >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
             GROUP BY DATE_FORMAT(tanggal, '%Y-%m')
             ORDER BY bulan ASC`
        );
        return rows;
    }

    static async pemasukanPeriode(dari, sampai) {
        const [detail] = await pool.query(
            `SELECT 
                p.id, p.kode_pesanan, p.tanggal, p.total, p.diskon, p.status,
                u.nama_lengkap AS nama_pembeli,
                v.kode AS kode_voucher
             FROM pesanan p
             LEFT JOIN users u ON p.user_id = u.id
             LEFT JOIN voucher v ON p.voucher_id = v.id
             WHERE p.status != 'batal'
               AND DATE(p.tanggal) BETWEEN ? AND ?
             ORDER BY p.tanggal DESC`,
            [dari, sampai]
        );

        const [summary] = await pool.query(
            `SELECT 
                COUNT(*) AS jumlah_pesanan,
                COALESCE(SUM(total), 0) AS total_penjualan
             FROM pesanan
             WHERE status != 'batal'
               AND DATE(tanggal) BETWEEN ? AND ?`,
            [dari, sampai]
        );

        return {
            periode: { dari, sampai },
            ringkasan: summary[0],
            detail
        };
    }

    static async pemasukanPerKategori(dari = null, sampai = null) {
        let whereClause = `p.status != 'batal'`;
        const params = [];

        if (dari && sampai) {
            whereClause += ` AND DATE(p.tanggal) BETWEEN ? AND ?`;
            params.push(dari, sampai);
        }

        const [rows] = await pool.query(
            `SELECT 
                COALESCE(k.id, 0) AS id,
                COALESCE(k.nama_kategori, 'Tanpa Kategori') AS nama_kategori,
                COUNT(DISTINCT p.id) AS jumlah_pesanan,
                COALESCE(SUM(dp.jumlah), 0) AS total_item_terjual,
                COALESCE(SUM(dp.subtotal), 0) AS total_pendapatan
             FROM detail_pesanan dp
             LEFT JOIN produk pr ON dp.produk_id = pr.id
             LEFT JOIN kategori k ON pr.kategori_id = k.id
             LEFT JOIN pesanan p ON dp.pesanan_id = p.id
             WHERE ${whereClause}
             GROUP BY k.id, k.nama_kategori
             ORDER BY total_pendapatan DESC`,
            params
        );
        return rows;
    }

    static async produkTerlaris(limit = 5, dari = null, sampai = null) {
        let whereClause = `p.status != 'batal'`;
        const params = [];

        if (dari && sampai) {
            whereClause += ` AND DATE(p.tanggal) BETWEEN ? AND ?`;
            params.push(dari, sampai);
        }

        params.push(limit);

        const [rows] = await pool.query(
            `SELECT 
                pr.id, pr.nama_produk, pr.kode_produk, pr.harga_jual,
                COALESCE(SUM(dp.jumlah), 0) AS total_terjual,
                COALESCE(SUM(dp.subtotal), 0) AS total_pendapatan
             FROM detail_pesanan dp
             LEFT JOIN produk pr ON dp.produk_id = pr.id
             LEFT JOIN pesanan p ON dp.pesanan_id = p.id
             WHERE ${whereClause}
             GROUP BY pr.id, pr.nama_produk, pr.kode_produk, pr.harga_jual
             ORDER BY total_terjual DESC
             LIMIT ?`,
            params
        );
        return rows;
    }

    // ═══════════════════════════════════════
    // PENGELUARAN
    // ═══════════════════════════════════════
    static async pengeluaranHarian() {
        const [rows] = await pool.query(
            `SELECT 
                DATE(tanggal) AS tanggal,
                COUNT(*) AS jumlah_pembelian,
                COALESCE(SUM(total), 0) AS total_pengeluaran
             FROM pembelian_bahan
             WHERE status = 'diterima'
               AND tanggal >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
             GROUP BY DATE(tanggal)
             ORDER BY tanggal ASC`
        );
        return rows;
    }

    static async pengeluaranBulanan() {
        const [rows] = await pool.query(
            `SELECT 
                DATE_FORMAT(tanggal, '%Y-%m') AS bulan,
                COUNT(*) AS jumlah_pembelian,
                COALESCE(SUM(total), 0) AS total_pengeluaran
             FROM pembelian_bahan
             WHERE status = 'diterima'
               AND tanggal >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
             GROUP BY DATE_FORMAT(tanggal, '%Y-%m')
             ORDER BY bulan ASC`
        );
        return rows;
    }

    static async pengeluaranPeriode(dari, sampai) {
        const [detail] = await pool.query(
            `SELECT 
                pb.id, pb.kode_pembelian, pb.tanggal, pb.total, pb.status, pb.catatan,
                s.nama_supplier
             FROM pembelian_bahan pb
             LEFT JOIN supplier s ON pb.supplier_id = s.id
             WHERE pb.status = 'diterima'
               AND DATE(pb.tanggal) BETWEEN ? AND ?
             ORDER BY pb.tanggal DESC`,
            [dari, sampai]
        );

        const [summary] = await pool.query(
            `SELECT 
                COUNT(*) AS jumlah_pembelian,
                COALESCE(SUM(total), 0) AS total_pengeluaran
             FROM pembelian_bahan
             WHERE status = 'diterima'
               AND DATE(tanggal) BETWEEN ? AND ?`,
            [dari, sampai]
        );

        return {
            periode: { dari, sampai },
            ringkasan: summary[0],
            detail
        };
    }

    static async pengeluaranPerSupplier(dari = null, sampai = null) {
        let whereClause = `pb.status = 'diterima'`;
        const params = [];

        if (dari && sampai) {
            whereClause += ` AND DATE(pb.tanggal) BETWEEN ? AND ?`;
            params.push(dari, sampai);
        }

        const [rows] = await pool.query(
            `SELECT 
                s.id, s.nama_supplier,
                COUNT(pb.id) AS jumlah_pembelian,
                COALESCE(SUM(pb.total), 0) AS total_pengeluaran
             FROM pembelian_bahan pb
             LEFT JOIN supplier s ON pb.supplier_id = s.id
             WHERE ${whereClause}
             GROUP BY s.id, s.nama_supplier
             ORDER BY total_pengeluaran DESC`,
            params
        );
        return rows;
    }

    static async bahanTerbanyakDibeli(limit = 10) {
        const [rows] = await pool.query(
            `SELECT 
                b.id, b.kode_bahan, b.nama_bahan, b.satuan,
                COALESCE(SUM(dpb.jumlah), 0) AS total_dibeli,
                COALESCE(SUM(dpb.subtotal), 0) AS total_pengeluaran
             FROM detail_pembelian_bahan dpb
             LEFT JOIN bahan b ON dpb.bahan_id = b.id
             LEFT JOIN pembelian_bahan pb ON dpb.pembelian_id = pb.id
             WHERE pb.status = 'diterima'
             GROUP BY b.id, b.kode_bahan, b.nama_bahan, b.satuan
             ORDER BY total_pengeluaran DESC
             LIMIT ?`,
            [limit]
        );
        return rows;
    }

    // ═══════════════════════════════════════
    // LABA / RUGI
    // ═══════════════════════════════════════
    static async labaRugi(dari, sampai) {
        const [pemasukan] = await pool.query(
            `SELECT 
                COUNT(*) AS jumlah_pesanan,
                COALESCE(SUM(total), 0) AS total
             FROM pesanan
             WHERE status != 'batal'
               AND DATE(tanggal) BETWEEN ? AND ?`,
            [dari, sampai]
        );

        const [pengeluaran] = await pool.query(
            `SELECT 
                COUNT(*) AS jumlah_pembelian,
                COALESCE(SUM(total), 0) AS total
             FROM pembelian_bahan
             WHERE status = 'diterima'
               AND DATE(tanggal) BETWEEN ? AND ?`,
            [dari, sampai]
        );

        const totalPemasukan = Number(pemasukan[0].total) || 0;
        const totalPengeluaran = Number(pengeluaran[0].total) || 0;
        const labaRugi = totalPemasukan - totalPengeluaran;

        return {
            periode: { dari, sampai },
            pemasukan: {
                jumlah_transaksi: pemasukan[0].jumlah_pesanan,
                total: totalPemasukan
            },
            pengeluaran: {
                jumlah_transaksi: pengeluaran[0].jumlah_pembelian,
                total: totalPengeluaran
            },
            laba_rugi: labaRugi,
            status: labaRugi >= 0 ? 'laba' : 'rugi'
        };
    }

    // ═══════════════════════════════════════
    // STOK
    // ═══════════════════════════════════════
    static async stokProduk() {
        const [rows] = await pool.query(
            `SELECT 
                p.id, p.kode_produk, p.nama_produk, p.stok, p.stok_minimal,
                p.harga_beli, p.harga_jual,
                k.nama_kategori
             FROM produk p
             LEFT JOIN kategori k ON p.kategori_id = k.id
             WHERE p.status = 'aktif'
             ORDER BY p.stok ASC`
        );
        return rows;
    }

    static async stokBahan() {
        const [rows] = await pool.query(
            `SELECT 
                b.id, b.kode_bahan, b.nama_bahan, b.stok, b.stok_minimal,
                b.satuan, b.harga_beli,
                k.nama_kategori
             FROM bahan b
             LEFT JOIN kategori k ON b.kategori_id = k.id
             WHERE b.status = 'aktif'
             ORDER BY b.stok ASC`
        );
        return rows;
    }

    // Untuk frontend lama — hanya produk
    static async stokMenipis() {
        const [rows] = await pool.query(
            `SELECT id, kode_produk, nama_produk, stok, stok_minimal
             FROM produk
             WHERE stok <= stok_minimal AND status = 'aktif'
             ORDER BY stok ASC`
        );
        return rows;
    }

    // ═══════════════════════════════════════
    // LOG STOK
    // ═══════════════════════════════════════
    static async logStok(filters = {}) {
        const {
            dari,
            sampai,
            tipe_entitas,
            tipe,
            entitas_id,
            limit = 100
        } = filters;

        let where = 'WHERE 1=1';
        const params = [];

        if (dari && sampai) {
            where += ' AND DATE(ls.tanggal) BETWEEN ? AND ?';
            params.push(dari, sampai);
        }

        if (tipe_entitas) {
            where += ' AND ls.tipe_entitas = ?';
            params.push(tipe_entitas);
        }

        if (tipe) {
            where += ' AND ls.tipe = ?';
            params.push(tipe);
        }

        if (entitas_id) {
            if (tipe_entitas === 'produk') {
                where += ' AND ls.produk_id = ?';
            } else if (tipe_entitas === 'bahan') {
                where += ' AND ls.bahan_id = ?';
            }
            params.push(entitas_id);
        }

        params.push(limit);

        const [rows] = await pool.query(
            `SELECT 
                ls.id, ls.produk_id, ls.bahan_id, ls.tipe_entitas, ls.tipe,
                ls.jumlah, ls.stok_sebelum, ls.stok_sesudah,
                ls.keterangan, ls.referensi_id, ls.tanggal,
                p.nama_produk, p.kode_produk,
                b.nama_bahan, b.kode_bahan
             FROM log_stok ls
             LEFT JOIN produk p ON ls.produk_id = p.id
             LEFT JOIN bahan b ON ls.bahan_id = b.id
             ${where}
             ORDER BY ls.tanggal DESC
             LIMIT ?`,
            params
        );
        return rows;
    }

    // ═══════════════════════════════════════
    // AUDIT
    // ═══════════════════════════════════════
    static async pesananDenganPemesan(filters = {}) {
        const { dari, sampai, status } = filters;

        let where = 'WHERE 1=1';
        const params = [];

        if (dari && sampai) {
            where += ' AND DATE(p.tanggal) BETWEEN ? AND ?';
            params.push(dari, sampai);
        }

        if (status) {
            where += ' AND p.status = ?';
            params.push(status);
        }

        const [rows] = await pool.query(
            `SELECT 
                p.id, p.kode_pesanan, p.tanggal, p.total, p.diskon, p.status,
                u.id AS user_id, u.nama_lengkap AS nama_pembeli, u.email,
                v.kode AS kode_voucher
             FROM pesanan p
             LEFT JOIN users u ON p.user_id = u.id
             LEFT JOIN voucher v ON p.voucher_id = v.id
             ${where}
             ORDER BY p.tanggal DESC
             LIMIT 200`,
            params
        );
        return rows;
    }

    static async aktivitasUser(filters = {}) {
        const { dari, sampai, user_id, aksi, entitas, limit = 100 } = filters;

        let where = 'WHERE 1=1';
        const params = [];

        if (dari && sampai) {
            where += ' AND DATE(la.tanggal) BETWEEN ? AND ?';
            params.push(dari, sampai);
        }

        if (user_id) {
            where += ' AND la.user_id = ?';
            params.push(user_id);
        }

        if (aksi) {
            where += ' AND la.aksi = ?';
            params.push(aksi);
        }

        if (entitas) {
            where += ' AND la.entitas = ?';
            params.push(entitas);
        }

        params.push(limit);

        try {
            const [rows] = await pool.query(
                `SELECT 
                    la.id, la.user_id, la.user_nama, la.aksi, la.entitas,
                    la.entitas_id, la.detail, la.ip_address, la.tanggal
                 FROM log_aktivitas la
                 ${where}
                 ORDER BY la.tanggal DESC
                 LIMIT ?`,
                params
            );
            return rows;
        } catch (err) {
            console.warn('Tabel log_aktivitas belum ada:', err.message);
            return [];
        }
    }
}

module.exports = Laporan;