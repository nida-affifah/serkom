// src/pages/AboutTokoPage.jsx
import React from 'react';
import './AboutTokoPage.css';

const AboutTokoPage = () => {
    return (
        <div className="about-toko-page">
            <div className="container">
                <div className="about-toko-header">
                    <h1 className="about-toko-title">Tentang <span>RajutIndah</span></h1>
                    <p className="about-toko-subtitle">Kerajinan Rajutan Tangan Berkualitas</p>
                </div>

                <div className="about-toko-content">
                    <div className="about-toko-section">
                        <h2>Apa Itu RajutIndah?</h2>
                        <p>
                            RajutIndah adalah toko online yang menjual berbagai produk rajutan tangan 
                            berkualitas tinggi. Setiap produk dibuat dengan teliti dan penuh cinta 
                            oleh pengrajin berpengalaman.
                        </p>
                    </div>

                    <div className="about-toko-section">
                        <h2>Visi Kami</h2>
                        <p>
                            Menjadi toko rajutan terpercaya yang menghadirkan kehangatan dan keindahan 
                            melalui setiap produk rajutan.
                        </p>
                    </div>

                    <div className="about-toko-section">
                        <h2>Misi Kami</h2>
                        <ul>
                            <li>Menyediakan produk rajutan berkualitas tinggi</li>
                            <li>Mendukung pengrajin lokal</li>
                            <li>Memberikan pengalaman berbelanja yang menyenangkan</li>
                            <li>Menjaga kelestarian kerajinan tangan</li>
                        </ul>
                    </div>

                    <div className="about-toko-values">
                        <div className="value-card">
                            <div className="value-icon">◆</div>
                            <h3>Kualitas</h3>
                            <p>Produk berkualitas tinggi dengan bahan terbaik</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">◆</div>
                            <h3>Keaslian</h3>
                            <p>Setiap produk adalah karya tangan asli</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">◆</div>
                            <h3>Kepuasan</h3>
                            <p>Kepuasan pelanggan adalah prioritas kami</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutTokoPage;