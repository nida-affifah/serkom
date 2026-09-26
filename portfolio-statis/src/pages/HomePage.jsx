// src/pages/HomePage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// import icon
import {
    FiArrowRight, FiMail, FiCode, FiAward,
    FiBriefcase, FiStar, FiUser, FiTrendingUp,
    FiExternalLink, FiShoppingBag
} from 'react-icons/fi';
// ambil data user
import { userData } from '../data/userData';
// import foto Nida
import photoNida from '../assets/images/nida.jpeg';
import './HomePage.css';

const HomePage = () => {
    // ambil data yang dibutuhkan dari userData
    const { hero, about, skills, projects, certificates, externalLinks } = userData;

    // ambil 4 skill teratas
    const topSkills = skills.slice(0, 4);
    // hitung total semua proyek dari semua kategori
    const totalProjects = Object.values(projects).reduce(
        (total, category) => total + category.items.length,
        0
    );

    // state buat cek kalau foto gagal load
    const [imgError, setImgError] = useState(false);

    // link ke toko rajut
    const tokoRajutUrl = externalLinks?.tokoRajut || '#';

    return (
        <div className="home-page">

            {/* HERO */}
            <section className="hero-section">
                {/* dekorasi background */}
                <div className="hero-bg-decoration">
                    <div className="hero-blob hero-blob-1"></div>
                    <div className="hero-blob hero-blob-2"></div>
                    <div className="hero-blob hero-blob-3"></div>
                </div>

                <div className="container hero-container">
                    <div className="hero-text">
                        {/* badge sapaan */}
                        <div className="hero-badge">
                            <span className="badge-dot"></span>
                            Halo, Selamat Datang!
                        </div>

                        <h1 className="hero-title">
                            Saya <span className="hero-name">{hero.fullName}</span>
                        </h1>

                        <h2 className="hero-profession">{hero.profession}</h2>

                        <p className="hero-tagline">{hero.tagline}</p>

                        {/* tombol utama */}
                        <div className="hero-buttons">
                            <Link to="/contact" className="btn btn-primary">
                                <FiMail /> Hubungi Saya
                            </Link>
                            <Link to="/projects" className="btn btn-outline">
                                Lihat Karya <FiArrowRight />
                            </Link>
                        </div>

                        {/* statistik */}
                        <div className="hero-stats">
                            <div className="stat-item">
                                <div className="stat-icon-wrap purple">
                                    <FiCode />
                                </div>
                                <div>
                                    {/* jumlah skill */}
                                    <h3 className="stat-number">{skills.length}+</h3>
                                    <p className="stat-label">Keahlian</p>
                                </div>
                            </div>

                            <div className="stat-item">
                                <div className="stat-icon-wrap pink">
                                    <FiBriefcase />
                                </div>
                                <div>
                                    {/* total proyek */}
                                    <h3 className="stat-number">{totalProjects}+</h3>
                                    <p className="stat-label">Karya</p>
                                </div>
                            </div>

                            <div className="stat-item">
                                <div className="stat-icon-wrap blue">
                                    <FiAward />
                                </div>
                                <div>
                                    {/* jumlah sertifikat */}
                                    <h3 className="stat-number">{certificates.length}+</h3>
                                    <p className="stat-label">Sertifikat</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* foto hero */}
                    <div className="hero-image-wrapper">
                        <div className="hero-image-bg"></div>
                        <div className="hero-image-ring"></div>
                        {/* kalau foto gagal load, tampilkan icon */}
                        {imgError ? (
                            <div className="hero-image-fallback">
                                <FiUser />
                            </div>
                        ) : (
                            <img
                                src={photoNida}
                                alt={hero.fullName}
                                className="hero-image"
                                onError={() => setImgError(true)}
                            />
                        )}

                        {/* badge melayang */}
                        <div className="floating-badge badge-top">
                            <FiStar className="badge-icon" />
                            <span>Web Developer</span>
                        </div>
                        <div className="floating-badge badge-bottom">
                            <FiTrendingUp className="badge-icon" />
                            <span>Fast Learner</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* TENTANG SINGKAT */}
            <section className="about-preview">
                <div className="container">
                    <div className="section-header">
                        <div className="section-badge">
                            <FiUser /> Tentang Saya
                        </div>
                        <h2 className="section-title">
                            Kenalan <span className="highlight">Yuk!</span>
                        </h2>
                    </div>

                    {/* 3 kartu preview */}
                    <div className="about-preview-grid">
                        <div className="about-preview-card">
                            <div className="about-icon purple">
                                <FiCode />
                            </div>
                            <h3>Web Development</h3>
                            <p>Membangun website modern dengan React JS dan teknologi terkini.</p>
                        </div>

                        <div className="about-preview-card">
                            <div className="about-icon pink">
                                <FiStar />
                            </div>
                            <h3>Fast Learner</h3>
                            <p>Selalu antusias mempelajari teknologi dan skill baru.</p>
                        </div>

                        <div className="about-preview-card">
                            <div className="about-icon blue">
                                <FiAward />
                            </div>
                            <h3>Berkarya</h3>
                            <p>Menciptakan solusi digital yang bermanfaat bagi orang banyak.</p>
                        </div>
                    </div>

                    <div className="about-cta">
                        <Link to="/about" className="btn btn-outline">
                            Selengkapnya Tentang Saya <FiArrowRight />
                        </Link>
                    </div>
                </div>
            </section>

            {/* SKILLS PREVIEW */}
            <section className="skills-preview">
                <div className="container">
                    <div className="section-header">
                        <div className="section-badge">
                            <FiCode /> Keahlian Utama
                        </div>
                        <h2 className="section-title">
                            Skill <span className="highlight">Saya</span>
                        </h2>
                    </div>

                    {/* 4 skill teratas */}
                    <div className="skills-preview-grid">
                        {topSkills.map((skill, idx) => (
                            <div key={idx} className="skill-preview-item">
                                <div className="skill-preview-header">
                                    <span className="skill-preview-name">{skill.name}</span>
                                    <span className="skill-preview-level">{skill.level}%</span>
                                </div>
                                <div className="skill-bar">
                                    {/* progress bar, width dinamis */}
                                    <div
                                        className="skill-bar-fill"
                                        style={{ width: `${skill.level}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="about-cta">
                        <Link to="/skills" className="btn btn-outline">
                            Lihat Semua Keahlian <FiArrowRight />
                        </Link>
                    </div>
                </div>
            </section>

            {/* TOKO RAJUT */}
            <section className="shop-section">
                <div className="container">
                    <div className="shop-card">
                        <div className="shop-icon">
                            <FiShoppingBag />
                        </div>
                        <h2 className="shop-title">Kunjungi Toko Rajut Indah</h2>
                        <p className="shop-desc">
                            Website toko rajut online yang saya kembangkan dengan React + Express + PostgreSQL.
                            Temukan berbagai produk rajutan menarik di sana.
                        </p>
                        {/* link ke toko rajut */}
                        <a
                            href={tokoRajutUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shop-btn"
                        >
                            <FiExternalLink /> Buka Toko Rajut Indah
                        </a>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card">
                        <h2 className="cta-title">Punya Ide atau Proyek?</h2>
                        <p className="cta-desc">
                            Saya siap membantu mewujudkan ide digital kamu menjadi kenyataan.
                        </p>
                        <div className="cta-buttons">
                            <Link to="/contact" className="btn btn-primary">
                                <FiMail /> Hubungi Saya
                            </Link>
                            <Link to="/projects" className="btn btn-white">
                                Lihat Portofolio <FiArrowRight />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default HomePage;