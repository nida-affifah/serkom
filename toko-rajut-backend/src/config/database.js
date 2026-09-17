const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'db_toko_rajut',
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    dateStrings: true
});

(async () => {
    try {
        const conn = await pool.getConnection();
        console.log('Database terhubung:', process.env.DB_NAME);
        conn.release();
    } catch (err) {
        console.error('Gagal koneksi database:', err.message);
        process.exit(-1);
    }
})();

module.exports = pool;