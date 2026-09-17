// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000
});

// Interceptor token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
// Interceptor response
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            const message = error.response.data?.pesan || 'Terjadi kesalahan';
            const token = localStorage.getItem('token');

            // Hanya redirect ke login kalau sebelumnya sudah login (ada token)
            // dan token-nya expired/invalid.
            // Kalau belum login (tidak ada token), 401 cukup di-reject tanpa redirect.
            if (error.response.status === 401 && token) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
            return Promise.reject(new Error(message));
        }
        return Promise.reject(new Error('Server tidak merespon'));
    }
);

// ============================================
// AUTH API
// ============================================
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    me: () => api.get('/auth/me'),
    // Admin: kelola user
    tambahUser: (data) => api.post('/auth/tambah-user', data),
    getAllUsers: () => api.get('/auth/users'),
    updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
    deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

// ============================================
// PRODUK API
// ============================================
export const produkAPI = {
    getAll: () => api.get('/produk'),
    getById: (id) => api.get(`/produk/${id}`),
    getByKategori: (kategoriId) => api.get(`/produk/kategori/${kategoriId}`),
    create: (data) => api.post('/produk', data),
    update: (id, data) => api.put(`/produk/${id}`, data),
    delete: (id) => api.delete(`/produk/${id}`),
    upload: (formData) => api.post('/produk/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    produksiUlang: (id, data) => api.post(`/produk/${id}/produksi`, data),
};

// ============================================
// BAHAN API
// ============================================
export const bahanAPI = {
    getAll: () => api.get('/bahan'),
    getById: (id) => api.get(`/bahan/${id}`),
    create: (data) => api.post('/bahan', data),
    update: (id, data) => api.put(`/bahan/${id}`, data),
    delete: (id) => api.delete(`/bahan/${id}`),
};

// ============================================
// KATEGORI API
// ============================================
export const kategoriAPI = {
    getAll: () => api.get('/kategori'),
    getById: (id) => api.get(`/kategori/${id}`),
    create: (data) => api.post('/kategori', data),
    update: (id, data) => api.put(`/kategori/${id}`, data),
    delete: (id) => api.delete(`/kategori/${id}`),
};

// ============================================
// KERANJANG API
// ============================================
export const keranjangAPI = {
    getAll: () => api.get('/keranjang'),
    tambah: (data) => api.post('/keranjang', data),
    updateJumlah: (id, data) => api.put(`/keranjang/${id}`, data),
    hapus: (id) => api.delete(`/keranjang/${id}`),
    kosongkan: () => api.delete('/keranjang'),
};

// ============================================
// PESANAN API
// ============================================
export const pesananAPI = {
    create: (data) => api.post('/pesanan', data),
    checkoutKeranjang: (data) => api.post('/pesanan/dari-keranjang', data),
    getAll: () => api.get('/pesanan'),
    getSaya: () => api.get('/pesanan/saya'),
    getById: (id) => api.get(`/pesanan/${id}`),
    updateStatus: (id, data) => api.put(`/pesanan/${id}/status`, data),
};

// ============================================
// PEMBAYARAN API
// ============================================
export const pembayaranAPI = {
    create: (data) => api.post('/pembayaran', data),
    getAll: (status) => api.get('/pembayaran', { params: { status } }),
    getById: (id) => api.get(`/pembayaran/${id}`),
    getByPesanan: (pesananId) => api.get(`/pembayaran/pesanan/${pesananId}`),
    verifikasi: (id, data) => api.put(`/pembayaran/${id}/verifikasi`, data),
};

// ============================================
// PENGIRIMAN API
// ============================================
export const pengirimanAPI = {
    create: (data) => api.post('/pengiriman', data),
    getAll: (status) => api.get('/pengiriman', { params: { status } }),
    getById: (id) => api.get(`/pengiriman/${id}`),
    getByPesanan: (pesananId) => api.get(`/pengiriman/pesanan/${pesananId}`),
    tandaiSampai: (id) => api.put(`/pengiriman/${id}/sampai`),
};

// ============================================
// ULASAN API
// ============================================
export const ulasanAPI = {
    create: (data) => api.post('/ulasan', data),
    getByProduk: (produkId) => api.get(`/ulasan/produk/${produkId}`),
    getSaya: () => api.get('/ulasan/saya'),
    getAll: () => api.get('/ulasan'),
    delete: (id) => api.delete(`/ulasan/${id}`),
};

// ============================================
// VOUCHER API
// ============================================
export const voucherAPI = {
    getAll: () => api.get('/voucher'),
    getById: (id) => api.get(`/voucher/${id}`),
    create: (data) => api.post('/voucher', data),
    update: (id, data) => api.put(`/voucher/${id}`, data),
    delete: (id) => api.delete(`/voucher/${id}`),
    cek: (data) => api.post('/voucher/cek', data),
    getAktif: () => api.get('/voucher/aktif'),   // ← TAMBAHKAN INI
};

// ============================================
// ALAMAT API
// ============================================
export const alamatAPI = {
    getAll: () => api.get('/alamat'),
    getById: (id) => api.get(`/alamat/${id}`),
    create: (data) => api.post('/alamat', data),
    update: (id, data) => api.put(`/alamat/${id}`, data),
    delete: (id) => api.delete(`/alamat/${id}`),
    setDefault: (id) => api.put(`/alamat/${id}/default`),
};

// ============================================
// RETUR API
// ============================================
export const returAPI = {
    create: (data) => api.post('/retur', data),
    getAll: () => api.get('/retur'),
    getSaya: () => api.get('/retur/saya'),
    getById: (id) => api.get(`/retur/${id}`),
    setujui: (id, data) => api.put(`/retur/${id}/setujui`, data),
    tolak: (id, data) => api.put(`/retur/${id}/tolak`, data),
    terimaBarang: (id, data) => api.put(`/retur/${id}/terima-barang`, data),
    prosesRefund: (id, data) => api.post(`/retur/${id}/refund`, data),
};

// ============================================
// SUPPLIER API
// ============================================
export const supplierAPI = {
    getAll: () => api.get('/supplier'),
    getById: (id) => api.get(`/supplier/${id}`),
    create: (data) => api.post('/supplier', data),
    update: (id, data) => api.put(`/supplier/${id}`, data),
    delete: (id) => api.delete(`/supplier/${id}`),
};

// ============================================
// PEMBELIAN API
// ============================================
export const pembelianAPI = {
    getAll: () => api.get('/pembelian'),
    getById: (id) => api.get(`/pembelian/${id}`),
    create: (data) => api.post('/pembelian', data),
    terima: (id) => api.put(`/pembelian/${id}/terima`),
};

// ============================================
// LAPORAN API
// ============================================
export const laporanAPI = {
    ringkasan: () => api.get('/laporan/ringkasan'),
    harian: () => api.get('/laporan/harian'),
    bulanan: () => api.get('/laporan/bulanan'),
    produkTerlaris: (limit) => api.get('/laporan/produk-terlaris', { params: { limit } }),
    perKategori: () => api.get('/laporan/per-kategori'),
    stokMenipis: () => api.get('/laporan/stok-menipis'),
    periode: (dari, sampai) => api.get('/laporan/periode', { params: { dari, sampai } }),
};

// ============================================
// MASTER API
// ============================================
export const masterAPI = {
    alasanRetur: () => api.get('/master/alasan-retur'),
    metodeBayar: () => api.get('/master/metode-bayar'),
    kurir: () => api.get('/master/kurir'),
    pengaturan: () => api.get('/master/pengaturan'),
};

// ============================================
// PEGAWAI API
// ============================================
export const pegawaiAPI = {
    // Perajin
    perajin: {
        getAll: () => api.get('/pegawai/perajin'),
        getById: (id) => api.get(`/pegawai/perajin/${id}`),
        create: (data) => api.post('/pegawai/perajin', data),
        update: (id, data) => api.put(`/pegawai/perajin/${id}`, data),
        delete: (id) => api.delete(`/pegawai/perajin/${id}`)
    },
    // Kasir
    kasir: {
        getAll: () => api.get('/pegawai/kasir'),
        getById: (id) => api.get(`/pegawai/kasir/${id}`),
        create: (data) => api.post('/pegawai/kasir', data),
        update: (id, data) => api.put(`/pegawai/kasir/${id}`, data),
        delete: (id) => api.delete(`/pegawai/kasir/${id}`)
    },
    // Staff Gudang
    staff: {
        getAll: () => api.get('/pegawai/staff-gudang'),
        getById: (id) => api.get(`/pegawai/staff-gudang/${id}`),
        create: (data) => api.post('/pegawai/staff-gudang', data),
        update: (id, data) => api.put(`/pegawai/staff-gudang/${id}`, data),
        delete: (id) => api.delete(`/pegawai/staff-gudang/${id}`)
    }
};

// ============================================
// NOTIFIKASI API
// ============================================
export const notifikasiAPI = {
    getAll: () => api.get('/notifikasi'),
    belumDibaca: () => api.get('/notifikasi/belum-dibaca'),
    tandaiBaca: (id) => api.put(`/notifikasi/${id}/baca`),
    tandaiSemuaBaca: () => api.put('/notifikasi/baca-semua'),
    hapus: (id) => api.delete(`/notifikasi/${id}`),
    hapusSemua: () => api.delete('/notifikasi/semua'),
};

// Alias untuk kompatibilitas kode lama
export const productAPI = produkAPI;
export const categoryAPI = kategoriAPI;
export const orderAPI = pesananAPI;
export const userAPI = authAPI;

export default api;