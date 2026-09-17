// src/pages/ProfilePage.jsx
import React from 'react';
import {
    FiBriefcase, FiAward, FiTarget, FiUser,
    FiCode, FiHeart, FiExternalLink, FiShoppingBag
} from 'react-icons/fi';
import { userData } from '../data/userData';
import './ProfilePage.css';

const ProfilePage = () => {
    const { professional, bio, about, externalLinks } = userData;

    const tokoRajutUrl = externalLinks?.tokoRajut || '#';

    return (
        <div className="profile-page">
            <div className="container">
                <div className="page-header">
                    <div className="page-badge">
                        <FiUser className="badge-icon" />
                        Profil Profesional
                    </div>
                    <h1 className="page-title">
                        Profil <span className="highlight">Profesional</span>
                    </h1>
                    <p className="page-subtitle">
                        Informasi tentang jabatan, instansi, dan bidang yang saya tekuni
                    </p>
                </div>

                <div className="profile-grid">
                    <div className="profile-card">
                        <div className="card-icon-wrap purple">
                            <FiBriefcase />
                        </div>
                        <h3 className="card-label">Jabatan Saat Ini</h3>
                        <p className="card-value">{professional.position}</p>
                    </div>

                    <div className="profile-card">
                        <div className="card-icon-wrap pink">
                            <FiAward />
                        </div>
                        <h3 className="card-label">Instansi</h3>
                        <p className="card-value">{professional.institution}</p>
                    </div>

                    <div className="profile-card">
                        <div className="card-icon-wrap blue">
                            <FiTarget />
                        </div>
                        <h3 className="card-label">Bidang yang Ditekuni</h3>
                        <p className="card-value">{professional.field}</p>
                    </div>
                </div>

                <div className="profile-focus">
                    <h2 className="section-title">Fokus Utama</h2>
                    <div className="focus-tags">
                        {professional.focus.map((item, idx) => (
                            <span key={idx} className="focus-tag">{item}</span>
                        ))}
                    </div>
                </div>

                <div className="profile-about">
                    <div className="about-card">
                        <h3>
                            <FiUser /> Tentang Saya
                        </h3>
                        <p>{bio}</p>
                    </div>

                    <div className="about-card">
                        <h3>
                            <FiCode /> Bidang Keahlian
                        </h3>
                        <ul>
                            {about.expertise.fields.map((field, idx) => (
                                <li key={idx}>{field.name}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="about-card">
                        <h3>
                            <FiHeart /> Prinsip & Visi
                        </h3>
                        <p>{about.principles.vision}</p>
                    </div>
                </div>

                <div className="profile-cta">
                    <div className="cta-icon">
                        <FiShoppingBag />
                    </div>
                    <h2 className="cta-title">Kunjungi Toko Rajut Indah</h2>
                    <p className="cta-desc">
                        Website toko rajut online yang saya kembangkan dengan
                        React + Express + PostgreSQL. Temukan berbagai produk
                        rajutan menarik di sana.
                    </p>
                    <a
                        href={tokoRajutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cta-btn"
                    >
                        <FiExternalLink /> Buka Toko Rajut Indah
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;