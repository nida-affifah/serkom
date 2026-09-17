const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

require('./config/database');

const { notFound, errorHandler } = require('./middleware/errorHandler');

const produkRoutes = require('./routes/produkRoutes');
const kategoriRoutes = require('./routes/kategoriRoutes');
const authRoutes = require('./routes/authRoutes');
const pesananRoutes = require('./routes/pesananRoutes');
const keranjangRoutes = require('./routes/keranjangRoutes');
const laporanRoutes = require('./routes/laporanRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const pembelianRoutes = require('./routes/pembelianRoutes');
const returRoutes = require('./routes/returRoutes');
const masterRoutes = require('./routes/masterRoutes');
const pembayaranRoutes = require('./routes/pembayaranRoutes');
const pengirimanRoutes = require('./routes/pengirimanRoutes');
const ulasanRoutes = require('./routes/ulasanRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const alamatRoutes = require('./routes/alamatRoutes');
const notifikasiRoutes = require('./routes/notifikasiRoutes');
const jasaCustomRoutes = require('./routes/jasaCustomRoutes');
const pegawaiRoutes = require('./routes/pegawaiRoutes');
const pendaftaranRoutes = require('./routes/pendaftaranRoutes');
const logAktivitasRoutes = require('./routes/logAktivitasRoutes');
const bahanRoutes = require('./routes/bahan');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        /\.up\.railway\.app$/,
        /\.rajutindah\.my\.id$/,
        'https://toko.rajutindah.my.id',
        'https://portfolio.rajutindah.my.id'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/', (req, res) => {
    res.json({
        message: 'API Toko Rajut Online',
        status: 'aktif',
        versi: '1.0.0',
        waktu: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    res.json({ sukses: true, pesan: 'Server sehat', waktu: new Date().toISOString() });
});

app.use('/api/produk', produkRoutes);
app.use('/api/kategori', kategoriRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/pesanan', pesananRoutes);
app.use('/api/keranjang', keranjangRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/pembelian', pembelianRoutes);
app.use('/api/retur', returRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/pembayaran', pembayaranRoutes);
app.use('/api/pengiriman', pengirimanRoutes);
app.use('/api/ulasan', ulasanRoutes);
app.use('/api/voucher', voucherRoutes);
app.use('/api/alamat', alamatRoutes);
app.use('/api/notifikasi', notifikasiRoutes);
app.use('/api/jasa-custom', jasaCustomRoutes);
app.use('/api/pegawai', pegawaiRoutes);
app.use('/api/pendaftaran', pendaftaranRoutes);
app.use('/api/log-aktivitas', logAktivitasRoutes);
app.use('/api/bahan', bahanRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server jalan di port ${PORT}`);
});