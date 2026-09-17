// backend/models/Produk.js
const pool = require('../config/database');

class Produk {
    // ═══════════════════════════════════════
    // GENERATE KODE PRODUK
    // ═══════════════════════════════════════
    static async generateKode() {
        const [rows] = await pool.query(
            `SELECT kode_produk FROM produk 
             WHERE kode_produk LIKE 'PRD%' 
             ORDER BY id DESC LIMIT 1`
        );

        if (rows.length === 0) return 'PRD001';

        const lastKode = rows[0].kode_produk;
        const lastNumber = parseInt(lastKode.replace('PRD', ''), 10);
        if (isNaN(lastNumber)) return 'PRD001';

        return `PRD${(lastNumber + 1).toString().padStart(3, '0')}`;
    }

    // ═══════════════════════════════════════
    // ADMIN: LIHAT SEMUA PRODUK
    // ═══════════════════════════════════════
    static async findAll() {
        const [rows] = await pool.query(
            `SELECT p.id, p.kode_produk, p.nama_produk, p.kategori_id, p.perajin_id,
                    p.harga_beli, p.margin, p.harga_jual, p.stok, p.stok_minimal,
                    p.deskripsi, p.gambar_utama, p.status,
                    k.nama_kategori
             FROM produk p
             LEFT JOIN kategori k ON p.kategori_id = k.id
             WHERE p.status = 'aktif'
             ORDER BY p.id DESC`
        );
        return rows;
    }

    // ═══════════════════════════════════════
    // PEMBELI: LIHAT PRODUK SIAP JUAL
    // ═══════════════════════════════════════
    static async findAllSiapJual() {
        const [rows] = await pool.query(
            `SELECT p.id, p.kode_produk, p.nama_produk, p.kategori_id,
                    p.harga_jual, p.stok, p.deskripsi, p.gambar_utama,
                    k.nama_kategori
             FROM produk p
             LEFT JOIN kategori k ON p.kategori_id = k.id
             WHERE p.status = 'aktif'
               AND p.stok > 0
               AND p.harga_jual > 0
             ORDER BY p.id DESC`
        );
        return rows;
    }

    // ═══════════════════════════════════════
    // DETAIL PRODUK (admin — include resep)
    // ═══════════════════════════════════════
    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT p.*, k.nama_kategori
             FROM produk p
             LEFT JOIN kategori k ON p.kategori_id = k.id
             WHERE p.id = ? AND p.status = 'aktif'`,
            [id]
        );
        if (rows.length === 0) return null;

        const produk = rows[0];

        const [resepRows] = await pool.query(
            `SELECT rp.id, rp.bahan_id, rp.jumlah,
                    b.nama_bahan, b.kode_bahan, b.satuan, b.harga_beli AS harga_bahan,
                    b.stok AS stok_bahan
             FROM resep_produk rp
             LEFT JOIN bahan b ON rp.bahan_id = b.id
             WHERE rp.produk_id = ?`,
            [id]
        );

        produk.resep = resepRows;
        return produk;
    }

    // ═══════════════════════════════════════
    // DETAIL PRODUK (pembeli — TANPA resep)
    // ═══════════════════════════════════════
    static async findByIdSiapJual(id) {
        const [rows] = await pool.query(
            `SELECT p.id, p.kode_produk, p.nama_produk, p.kategori_id,
                    p.harga_jual, p.stok, p.deskripsi, p.gambar_utama,
                    k.nama_kategori
             FROM produk p
             LEFT JOIN kategori k ON p.kategori_id = k.id
             WHERE p.id = ? 
               AND p.status = 'aktif'
               AND p.stok > 0
               AND p.harga_jual > 0`,
            [id]
        );
        return rows[0];
    }

    static async findByKategori(kategoriId) {
        const [rows] = await pool.query(
            `SELECT p.*, k.nama_kategori
             FROM produk p
             LEFT JOIN kategori k ON p.kategori_id = k.id
             WHERE p.kategori_id = ? AND p.status = 'aktif'
             ORDER BY p.id DESC`,
            [kategoriId]
        );
        return rows;
    }

    static async findByKategoriSiapJual(kategoriId) {
        const [rows] = await pool.query(
            `SELECT p.id, p.kode_produk, p.nama_produk, p.kategori_id,
                    p.harga_jual, p.stok, p.deskripsi, p.gambar_utama,
                    k.nama_kategori
             FROM produk p
             LEFT JOIN kategori k ON p.kategori_id = k.id
             WHERE p.kategori_id = ? 
               AND p.status = 'aktif'
               AND p.stok > 0
               AND p.harga_jual > 0
             ORDER BY p.id DESC`,
            [kategoriId]
        );
        return rows;
    }

    // ═══════════════════════════════════════
    // CREATE PRODUK + RESEP + POTONG STOK BAHAN
    // ═══════════════════════════════════════
    static async create(data) {
        const {
            nama_produk, kategori_id, perajin_id,
            margin, stok_minimal, deskripsi, gambar_utama,
            jumlah_produksi, resep
        } = data;

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Validasi: resep wajib
            if (!resep || !Array.isArray(resep) || resep.length === 0) {
                throw new Error('Resep wajib diisi minimal 1 bahan');
            }

            const jumlahHasil = Number(jumlah_produksi) || 0;
            if (jumlahHasil < 1) {
                throw new Error('Jumlah produksi minimal 1');
            }

            // ═══ VALIDASI STOK BAHAN ═══
            for (const r of resep) {
                const [bahanRows] = await conn.query(
                    `SELECT id, nama_bahan, stok, satuan FROM bahan WHERE id = ?`,
                    [r.bahan_id]
                );
                if (bahanRows.length === 0) {
                    throw new Error(`Bahan id ${r.bahan_id} tidak ditemukan`);
                }
                const bahan = bahanRows[0];
                const butuh = Number(r.jumlah) * jumlahHasil;
                const stok = Number(bahan.stok) || 0;

                if (stok < butuh) {
                    throw new Error(
                        `Stok ${bahan.nama_bahan} tidak cukup. ` +
                        `Butuh ${butuh} ${bahan.satuan || ''}, ` +
                        `stok tersedia ${stok} ${bahan.satuan || ''}`
                    );
                }
            }

            // Hitung total harga bahan & update stok bahan
            let totalHargaBahan = 0;
            for (const r of resep) {
                const [bahanRows] = await conn.query(
                    `SELECT id, nama_bahan, stok, harga_beli FROM bahan WHERE id = ?`,
                    [r.bahan_id]
                );
                const bahan = bahanRows[0];
                const jumlahPakai = Number(r.jumlah);
                const hargaBahan = Number(bahan.harga_beli) || 0;

                totalHargaBahan += hargaBahan * jumlahPakai;

                const stokBaru = Number(bahan.stok) - (jumlahPakai * jumlahHasil);
                await conn.query(
                    `UPDATE bahan SET stok = ? WHERE id = ?`,
                    [stokBaru, r.bahan_id]
                );

                // ═══ LOG STOK BAHAN KELUAR ═══
                await conn.query(
                    `INSERT INTO log_stok 
                     (produk_id, bahan_id, tipe_entitas, tipe, jumlah, stok_sebelum, stok_sesudah, keterangan, referensi_id)
                     VALUES (NULL, ?, 'bahan', 'keluar', ?, ?, ?, ?, NULL)`,
                    [
                        r.bahan_id,
                        jumlahPakai * jumlahHasil,
                        bahan.stok,
                        stokBaru,
                        `Dipakai untuk produksi ${nama_produk}`
                    ]
                );
            }

            const hargaBeli = Math.round(totalHargaBahan);
            const marginVal = Number(margin) || 30;
            const hargaJual = Math.round(hargaBeli * (1 + marginVal / 100));

            const kode_produk = data.kode_produk || await this.generateKode();

            const [result] = await conn.query(
                `INSERT INTO produk 
                 (kode_produk, nama_produk, kategori_id, perajin_id, 
                  harga_beli, margin, harga_jual, stok, stok_minimal, 
                  deskripsi, gambar_utama, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aktif')`,
                [
                    kode_produk,
                    nama_produk,
                    kategori_id || null,
                    perajin_id || null,
                    hargaBeli,
                    marginVal,
                    hargaJual,
                    jumlahHasil,
                    stok_minimal || 5,
                    deskripsi || null,
                    gambar_utama || null
                ]
            );
            const produkId = result.insertId;

            // Insert resep
            for (const r of resep) {
                await conn.query(
                    `INSERT INTO resep_produk (produk_id, bahan_id, jumlah)
                     VALUES (?, ?, ?)`,
                    [produkId, r.bahan_id, r.jumlah]
                );
            }

            // ═══ LOG STOK PRODUK MASUK ═══
            await conn.query(
                `INSERT INTO log_stok 
                 (produk_id, bahan_id, tipe_entitas, tipe, jumlah, stok_sebelum, stok_sesudah, keterangan, referensi_id)
                 VALUES (?, NULL, 'produk', 'masuk', ?, 0, ?, ?, NULL)`,
                [produkId, jumlahHasil, jumlahHasil, `Produksi awal produk ${nama_produk}`]
            );

            await conn.commit();
            return await this.findById(produkId);
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }

    // ═══════════════════════════════════════
    // UPDATE PRODUK
    // ═══════════════════════════════════════
    static async update(id, data) {
        const {
            nama_produk, kategori_id, perajin_id,
            margin, stok_minimal, deskripsi, gambar_utama
        } = data;

        const [rows] = await pool.query(
            `SELECT harga_beli FROM produk WHERE id = ?`,
            [id]
        );
        if (rows.length === 0) return null;

        const hargaBeli = Number(rows[0].harga_beli) || 0;
        const marginVal = Number(margin) || 30;
        const hargaJual = Math.round(hargaBeli * (1 + marginVal / 100));

        await pool.query(
            `UPDATE produk 
             SET nama_produk = ?, kategori_id = ?, perajin_id = ?,
                 margin = ?, harga_jual = ?, stok_minimal = ?, 
                 deskripsi = ?, gambar_utama = ?
             WHERE id = ?`,
            [
                nama_produk,
                kategori_id || null,
                perajin_id || null,
                marginVal,
                hargaJual,
                stok_minimal || 5,
                deskripsi || null,
                gambar_utama || null,
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
            `UPDATE produk SET status = 'nonaktif' WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }

    // ═══════════════════════════════════════
    // PRODUKSI ULANG
    // ═══════════════════════════════════════
    static async produksiUlang(produkId, jumlah) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [produkRows] = await conn.query(
                `SELECT * FROM produk WHERE id = ? AND status = 'aktif'`,
                [produkId]
            );
            if (produkRows.length === 0) {
                throw new Error('Produk tidak ditemukan');
            }

            const [resepRows] = await conn.query(
                `SELECT rp.bahan_id, rp.jumlah, b.nama_bahan, b.stok, b.satuan, b.harga_beli
                 FROM resep_produk rp
                 LEFT JOIN bahan b ON rp.bahan_id = b.id
                 WHERE rp.produk_id = ?`,
                [produkId]
            );
            if (resepRows.length === 0) {
                throw new Error('Resep produk tidak ditemukan');
            }

            const jumlahProduksi = Number(jumlah);
            if (jumlahProduksi < 1) {
                throw new Error('Jumlah produksi minimal 1');
            }

            // Cek stok bahan
            for (const r of resepRows) {
                const butuh = Number(r.jumlah) * jumlahProduksi;
                const stok = Number(r.stok) || 0;
                if (stok < butuh) {
                    throw new Error(
                        `Stok ${r.nama_bahan} tidak cukup. ` +
                        `Butuh ${butuh} ${r.satuan || ''}, ` +
                        `stok tersedia ${stok} ${r.satuan || ''}`
                    );
                }
            }

            // Update stok bahan
            let totalHargaBahan = 0;
            for (const r of resepRows) {
                const butuh = Number(r.jumlah) * jumlahProduksi;
                const stokBaru = Number(r.stok) - butuh;

                await conn.query(
                    `UPDATE bahan SET stok = ? WHERE id = ?`,
                    [stokBaru, r.bahan_id]
                );

                // ═══ LOG STOK BAHAN KELUAR ═══
                await conn.query(
                    `INSERT INTO log_stok 
                     (produk_id, bahan_id, tipe_entitas, tipe, jumlah, stok_sebelum, stok_sesudah, keterangan, referensi_id)
                     VALUES (NULL, ?, 'bahan', 'keluar', ?, ?, ?, ?, NULL)`,
                    [
                        r.bahan_id,
                        butuh,
                        r.stok,
                        stokBaru,
                        `Produksi ulang ${produkRows[0].nama_produk}`
                    ]
                );

                totalHargaBahan += Number(r.harga_beli) * Number(r.jumlah);
            }

            // Update stok produk
            const stokProdukBaru = Number(produkRows[0].stok) + jumlahProduksi;
            const hargaBeliBaru = Math.round(totalHargaBahan);
            const margin = Number(produkRows[0].margin) || 30;
            const hargaJualBaru = Math.round(hargaBeliBaru * (1 + margin / 100));

            await conn.query(
                `UPDATE produk 
                 SET stok = ?, harga_beli = ?, harga_jual = ?
                 WHERE id = ?`,
                [stokProdukBaru, hargaBeliBaru, hargaJualBaru, produkId]
            );

            // ═══ LOG STOK PRODUK MASUK ═══
            await conn.query(
                `INSERT INTO log_stok 
                 (produk_id, bahan_id, tipe_entitas, tipe, jumlah, stok_sebelum, stok_sesudah, keterangan, referensi_id)
                 VALUES (?, NULL, 'produk', 'masuk', ?, ?, ?, ?, NULL)`,
                [
                    produkId,
                    jumlahProduksi,
                    produkRows[0].stok,
                    stokProdukBaru,
                    `Produksi ulang ${jumlahProduksi} unit`
                ]
            );

            await conn.commit();
            return await this.findById(produkId);
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }
}

module.exports = Produk;