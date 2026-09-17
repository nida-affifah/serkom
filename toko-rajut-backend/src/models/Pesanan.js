// backend/models/Pesanan.js
const pool = require('../config/database');

class Pesanan {
    static async generateKode(conn) {
        const tahun = new Date().getFullYear();
        const [rows] = await conn.query(
            `SELECT COUNT(*) AS total FROM pesanan WHERE YEAR(tanggal) = ?`,
            [tahun]
        );
        const urut = (rows[0].total + 1).toString().padStart(3, '0');
        return `INV-${tahun}-${urut}`;
    }

    // ═══════════════════════════════════════
    // CHECKOUT LANGSUNG (dengan LOCK)
    // ═══════════════════════════════════════
    static async create(userId, items) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const kodePesanan = await this.generateKode(conn);

            let total = 0;
            const detail = [];

            for (const item of items) {
                const [produkRows] = await conn.query(
                    `SELECT id, nama_produk, harga_jual, stok 
                     FROM produk 
                     WHERE id = ? AND status = 'aktif'
                     FOR UPDATE`,
                    [item.produk_id]
                );

                if (produkRows.length === 0) {
                    throw new Error(`Produk ID ${item.produk_id} tidak ditemukan`);
                }

                const produk = produkRows[0];

                if (produk.stok < item.jumlah) {
                    throw new Error(`Stok ${produk.nama_produk} tidak cukup. Sisa: ${produk.stok}`);
                }

                const subtotal = produk.harga_jual * item.jumlah;
                total += subtotal;

                detail.push({
                    produk_id: produk.id,
                    nama_produk: produk.nama_produk,
                    jumlah: item.jumlah,
                    harga_satuan: produk.harga_jual,
                    subtotal,
                    stok_lama: produk.stok
                });
            }

            const [pesananResult] = await conn.query(
                `INSERT INTO pesanan (kode_pesanan, user_id, voucher_id, total, diskon, status, tipe_pesanan, catatan)
                 VALUES (?, ?, NULL, ?, 0, 'pending', 'reguler', ?)`,
                [kodePesanan, userId, total, null]
            );
            const pesananId = pesananResult.insertId;

            for (const d of detail) {
                await conn.query(
                    `INSERT INTO detail_pesanan (pesanan_id, produk_id, jumlah, harga_satuan, subtotal)
                     VALUES (?, ?, ?, ?, ?)`,
                    [pesananId, d.produk_id, d.jumlah, d.harga_satuan, d.subtotal]
                );

                const stokBaru = d.stok_lama - d.jumlah;
                await conn.query(
                    `UPDATE produk SET stok = ? WHERE id = ?`,
                    [stokBaru, d.produk_id]
                );

                // ═══ LOG STOK PRODUK KELUAR ═══
                await conn.query(
                    `INSERT INTO log_stok 
                     (produk_id, bahan_id, tipe_entitas, tipe, jumlah, stok_sebelum, stok_sesudah, keterangan, referensi_id)
                     VALUES (?, NULL, 'produk', 'keluar', ?, ?, ?, ?, ?)`,
                    [d.produk_id, d.jumlah, d.stok_lama, stokBaru, `Penjualan ${kodePesanan}`, pesananId]
                );
            }

            await conn.commit();
            return await this.findById(pesananId);
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }

    // ═══════════════════════════════════════
    // CHECKOUT DARI KERANJANG (dengan LOCK + VOUCHER)
    // ═══════════════════════════════════════
    static async createFromKeranjang(userId, catatan, voucherKode = null) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [itemsKeranjang] = await conn.query(
                `SELECT k.produk_id, k.jumlah, p.nama_produk, p.harga_jual, p.stok, p.status
                 FROM keranjang k
                 LEFT JOIN produk p ON k.produk_id = p.id
                 WHERE k.user_id = ?`,
                [userId]
            );

            if (itemsKeranjang.length === 0) {
                throw new Error('Keranjang kosong');
            }

            const produkIds = itemsKeranjang.map(i => i.produk_id).sort((a, b) => a - b);

            const [produkLocked] = await conn.query(
                `SELECT id, nama_produk, harga_jual, stok 
                 FROM produk 
                 WHERE id IN (?) AND status = 'aktif'
                 ORDER BY id
                 FOR UPDATE`,
                [produkIds]
            );

            const produkMap = {};
            for (const p of produkLocked) {
                produkMap[p.id] = p;
            }

            const detail = [];
            let total = 0;

            for (const item of itemsKeranjang) {
                const produk = produkMap[item.produk_id];

                if (!produk) {
                    throw new Error(`Produk ${item.nama_produk} tidak tersedia`);
                }
                if (produk.stok <= 0) {
                    throw new Error(`Stok ${produk.nama_produk} habis`);
                }
                if (produk.stok < item.jumlah) {
                    throw new Error(
                        `Stok ${produk.nama_produk} tidak cukup. Sisa: ${produk.stok}, Anda minta: ${item.jumlah}`
                    );
                }

                const subtotal = produk.harga_jual * item.jumlah;
                total += subtotal;

                detail.push({
                    produk_id: produk.id,
                    nama_produk: produk.nama_produk,
                    jumlah: item.jumlah,
                    harga_satuan: produk.harga_jual,
                    subtotal,
                    stok_lama: produk.stok
                });
            }

            // ═══ VOUCHER ═══
            let voucherId = null;
            let diskon = 0;
            let totalAkhir = total;

            if (voucherKode) {
                const Voucher = require('./Voucher');
                const hasil = await Voucher.cekValiditas(voucherKode, total);

                voucherId = hasil.voucher.id;
                diskon = hasil.diskon;
                totalAkhir = hasil.total_setelah_diskon;

                const [voucherRows] = await conn.query(
                    `SELECT id, kuota FROM voucher WHERE id = ? FOR UPDATE`,
                    [voucherId]
                );

                if (voucherRows.length === 0) {
                    throw new Error('Voucher tidak ditemukan');
                }

                const voucher = voucherRows[0];
                if (voucher.kuota !== null && voucher.kuota <= 0) {
                    throw new Error('Kuota voucher sudah habis');
                }

                if (voucher.kuota && voucher.kuota > 0) {
                    await conn.query(
                        `UPDATE voucher SET kuota = kuota - 1 WHERE id = ?`,
                        [voucherId]
                    );
                }
            }

            const kodePesanan = await this.generateKode(conn);

            const [pesananResult] = await conn.query(
                `INSERT INTO pesanan (kode_pesanan, user_id, voucher_id, total, diskon, status, tipe_pesanan, catatan)
                 VALUES (?, ?, ?, ?, ?, 'pending', 'reguler', ?)`,
                [kodePesanan, userId, voucherId, totalAkhir, diskon, catatan || null]
            );
            const pesananId = pesananResult.insertId;

            for (const d of detail) {
                await conn.query(
                    `INSERT INTO detail_pesanan (pesanan_id, produk_id, jumlah, harga_satuan, subtotal)
                     VALUES (?, ?, ?, ?, ?)`,
                    [pesananId, d.produk_id, d.jumlah, d.harga_satuan, d.subtotal]
                );

                const stokBaru = d.stok_lama - d.jumlah;
                await conn.query(
                    `UPDATE produk SET stok = ? WHERE id = ?`,
                    [stokBaru, d.produk_id]
                );

                // ═══ LOG STOK PRODUK KELUAR ═══
                await conn.query(
                    `INSERT INTO log_stok 
                     (produk_id, bahan_id, tipe_entitas, tipe, jumlah, stok_sebelum, stok_sesudah, keterangan, referensi_id)
                     VALUES (?, NULL, 'produk', 'keluar', ?, ?, ?, ?, ?)`,
                    [d.produk_id, d.jumlah, d.stok_lama, stokBaru, `Penjualan ${kodePesanan}`, pesananId]
                );
            }

            await conn.query(`DELETE FROM keranjang WHERE user_id = ?`, [userId]);

            await conn.commit();
            return await this.findById(pesananId);
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }

    // ═══ FIND ALL ═══
    static async findAll() {
        const [rows] = await pool.query(
            `SELECT p.*, u.nama_lengkap AS nama_pembeli, v.kode AS kode_voucher
             FROM pesanan p
             LEFT JOIN users u ON p.user_id = u.id
             LEFT JOIN voucher v ON p.voucher_id = v.id
             ORDER BY p.id DESC`
        );
        return rows;
    }

    // ═══ FIND BY USER ═══
    static async findByUser(userId) {
        const [rows] = await pool.query(
            `SELECT p.*, v.kode AS kode_voucher
             FROM pesanan p
             LEFT JOIN voucher v ON p.voucher_id = v.id
             WHERE p.user_id = ? 
             ORDER BY p.id DESC`,
            [userId]
        );
        return rows;
    }

    // ═══ FIND BY ID ═══
    static async findById(id) {
        const [pesananRows] = await pool.query(
            `SELECT p.*, u.nama_lengkap AS nama_pembeli, u.email AS email_pembeli,
                    v.kode AS kode_voucher, v.diskon_persen, v.diskon_nominal
             FROM pesanan p
             LEFT JOIN users u ON p.user_id = u.id
             LEFT JOIN voucher v ON p.voucher_id = v.id
             WHERE p.id = ?`,
            [id]
        );
        if (pesananRows.length === 0) return null;

        const pesanan = pesananRows[0];

        const [detailRows] = await pool.query(
            `SELECT dp.*, pr.nama_produk, pr.kode_produk
             FROM detail_pesanan dp
             LEFT JOIN produk pr ON dp.produk_id = pr.id
             WHERE dp.pesanan_id = ?`,
            [id]
        );

        pesanan.detail = detailRows;
        return pesanan;
    }

    static async updateStatus(id, status) {
        const validStatus = ['pending', 'diproses', 'dikirim', 'selesai', 'batal'];
        if (!validStatus.includes(status)) {
            throw new Error('Status tidak valid');
        }
        const [result] = await pool.query(
            `UPDATE pesanan SET status = ? WHERE id = ?`,
            [status, id]
        );
        return result.affectedRows > 0 ? await this.findById(id) : null;
    }
}

module.exports = Pesanan;