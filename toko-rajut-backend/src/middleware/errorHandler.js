// Middleware untuk route yang tidak ditemukan
const notFound = (req, res, next) => {
    res.status(404).json({
        sukses: false,
        pesan: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`
    });
};

// Middleware untuk error umum
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);

    // Error MySQL umum
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ sukses: false, pesan: 'Data sudah ada (duplikat)' });
    }
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ sukses: false, pesan: 'Data referensi tidak ditemukan' });
    }
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ sukses: false, pesan: 'Data sedang dipakai, tidak bisa dihapus' });
    }

    res.status(err.status || 500).json({
        sukses: false,
        pesan: err.message || 'Terjadi kesalahan di server'
    });
};

module.exports = { notFound, errorHandler };