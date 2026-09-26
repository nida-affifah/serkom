// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
// import icon
import { FiArrowLeft, FiHome } from 'react-icons/fi';
import './NotFoundPage.css';

const NotFoundPage = () => {
    return (
        <div className="notfound-page">
            <div className="container">
                <div className="notfound-card">
                    {/* angka 404 besar */}
                    <div className="notfound-code">404</div>
                    <h1 className="notfound-title">Halaman Tidak Ditemukan</h1>
                    <p className="notfound-desc">
                        Maaf, halaman yang Anda cari tidak tersedia.
                        Mungkin sudah dipindah atau URL-nya salah.
                    </p>
                    {/* tombol navigasi */}
                    <div className="notfound-buttons">
                        <Link to="/" className="btn btn-primary">
                            <FiHome /> Kembali ke Beranda
                        </Link>
                        <Link to="/contact" className="btn btn-outline">
                            <FiArrowLeft /> Hubungi Saya
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;