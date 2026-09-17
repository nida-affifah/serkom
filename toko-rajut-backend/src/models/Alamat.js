const pool = require('../config/database');

class Alamat {
    static async findByUser(userId) {
        const [rows] = await pool.query(
            `SELECT * FROM alamat_user WHERE user_id = ? ORDER BY is_default DESC, id DESC`,
            [userId]
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT * FROM alamat_user WHERE id = ?`,
            [id]
        );
        return rows[0];
    }

    static async create(userId, data) {
        const {
            label, nama_penerima, no_hp, alamat_lengkap,
            provinsi, kota, kecamatan, kode_pos, is_default
        } = data;

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Kalau is_default = true, reset semua alamat user jadi non-default
            if (is_default) {
                await conn.query(
                    `UPDATE alamat_user SET is_default = FALSE WHERE user_id = ?`,
                    [userId]
                );
            }

            const [result] = await conn.query(
                `INSERT INTO alamat_user 
                 (user_id, label, nama_penerima, no_hp, alamat_lengkap,
                  provinsi, kota, kecamatan, kode_pos, is_default)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId, label || 'Rumah', nama_penerima, no_hp, alamat_lengkap,
                    provinsi, kota, kecamatan, kode_pos, is_default || false
                ]
            );

            await conn.commit();
            return this.findById(result.insertId);
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }

    static async update(id, userId, data) {
        const {
            label, nama_penerima, no_hp, alamat_lengkap,
            provinsi, kota, kecamatan, kode_pos, is_default
        } = data;

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Cek alamat milik user
            const [existing] = await conn.query(
                `SELECT id FROM alamat_user WHERE id = ? AND user_id = ?`,
                [id, userId]
            );
            if (existing.length === 0) {
                throw new Error('Alamat tidak ditemukan');
            }

            if (is_default) {
                await conn.query(
                    `UPDATE alamat_user SET is_default = FALSE WHERE user_id = ?`,
                    [userId]
                );
            }

            await conn.query(
                `UPDATE alamat_user 
                 SET label = ?, nama_penerima = ?, no_hp = ?, alamat_lengkap = ?,
                     provinsi = ?, kota = ?, kecamatan = ?, kode_pos = ?, is_default = ?
                 WHERE id = ? AND user_id = ?`,
                [
                    label || 'Rumah', nama_penerima, no_hp, alamat_lengkap,
                    provinsi, kota, kecamatan, kode_pos, is_default || false,
                    id, userId
                ]
            );

            await conn.commit();
            return this.findById(id);
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }

    static async delete(id, userId) {
        const [result] = await pool.query(
            `DELETE FROM alamat_user WHERE id = ? AND user_id = ?`,
            [id, userId]
        );
        return result.affectedRows > 0;
    }

    // Set alamat sebagai default
    static async setDefault(id, userId) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [existing] = await conn.query(
                `SELECT id FROM alamat_user WHERE id = ? AND user_id = ?`,
                [id, userId]
            );
            if (existing.length === 0) {
                throw new Error('Alamat tidak ditemukan');
            }

            await conn.query(
                `UPDATE alamat_user SET is_default = FALSE WHERE user_id = ?`,
                [userId]
            );
            await conn.query(
                `UPDATE alamat_user SET is_default = TRUE WHERE id = ? AND user_id = ?`,
                [id, userId]
            );

            await conn.commit();
            return this.findById(id);
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }
}

module.exports = Alamat;