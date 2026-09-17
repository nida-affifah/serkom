const pool = require('../config/database');

class Pegawai {
    // ============ PERAJIN ============
    static async getAllPerajin() {
        const [rows] = await pool.query(`SELECT * FROM perajin WHERE status = 'aktif' ORDER BY id DESC`);
        return rows;
    }

    static async getPerajinById(id) {
        const [rows] = await pool.query(`SELECT * FROM perajin WHERE id = ?`, [id]);
        return rows[0];
    }

    static async createPerajin(data) {
        const { nama_perajin, no_hp, alamat, keahlian, upah_per_pcs } = data;
        const [result] = await pool.query(
            `INSERT INTO perajin (nama_perajin, no_hp, alamat, keahlian, upah_per_pcs, status)
             VALUES (?, ?, ?, ?, ?, 'aktif')`,
            [nama_perajin, no_hp || null, alamat || null, keahlian || null, upah_per_pcs || 0]
        );
        return this.getPerajinById(result.insertId);
    }

    static async updatePerajin(id, data) {
        const { nama_perajin, no_hp, alamat, keahlian, upah_per_pcs } = data;
        await pool.query(
            `UPDATE perajin SET nama_perajin = ?, no_hp = ?, alamat = ?, keahlian = ?, upah_per_pcs = ?
             WHERE id = ?`,
            [nama_perajin, no_hp || null, alamat || null, keahlian || null, upah_per_pcs || 0, id]
        );
        return this.getPerajinById(id);
    }

    static async deletePerajin(id) {
        const [result] = await pool.query(`UPDATE perajin SET status = 'nonaktif' WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }

    // ============ KASIR ============
    static async getAllKasir() {
        const [rows] = await pool.query(`SELECT * FROM kasir WHERE status = 'aktif' ORDER BY id DESC`);
        return rows;
    }

    static async getKasirById(id) {
        const [rows] = await pool.query(`SELECT * FROM kasir WHERE id = ?`, [id]);
        return rows[0];
    }

    static async createKasir(data) {
        const { nama, no_hp, shift } = data;
        const [result] = await pool.query(
            `INSERT INTO kasir (nama, no_hp, shift, status) VALUES (?, ?, ?, 'aktif')`,
            [nama, no_hp || null, shift || 'pagi']
        );
        return this.getKasirById(result.insertId);
    }

    static async updateKasir(id, data) {
        const { nama, no_hp, shift } = data;
        await pool.query(
            `UPDATE kasir SET nama = ?, no_hp = ?, shift = ? WHERE id = ?`,
            [nama, no_hp || null, shift || 'pagi', id]
        );
        return this.getKasirById(id);
    }

    static async deleteKasir(id) {
        const [result] = await pool.query(`UPDATE kasir SET status = 'nonaktif' WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }

    // ============ STAFF GUDANG ============
    static async getAllStaff() {
        const [rows] = await pool.query(`SELECT * FROM staff_gudang WHERE status = 'aktif' ORDER BY id DESC`);
        return rows;
    }

    static async getStaffById(id) {
        const [rows] = await pool.query(`SELECT * FROM staff_gudang WHERE id = ?`, [id]);
        return rows[0];
    }

    static async createStaff(data) {
        const { nama, no_hp, alamat } = data;
        const [result] = await pool.query(
            `INSERT INTO staff_gudang (nama, no_hp, alamat, status) VALUES (?, ?, ?, 'aktif')`,
            [nama, no_hp || null, alamat || null]
        );
        return this.getStaffById(result.insertId);
    }

    static async updateStaff(id, data) {
        const { nama, no_hp, alamat } = data;
        await pool.query(
            `UPDATE staff_gudang SET nama = ?, no_hp = ?, alamat = ? WHERE id = ?`,
            [nama, no_hp || null, alamat || null, id]
        );
        return this.getStaffById(id);
    }

    static async deleteStaff(id) {
        const [result] = await pool.query(`UPDATE staff_gudang SET status = 'nonaktif' WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Pegawai;