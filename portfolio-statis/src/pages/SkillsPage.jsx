// src/pages/SkillsPage.jsx
import React, { useState } from 'react';
// import icon
import {
    FiCode, FiCpu, FiGlobe, FiBookOpen, FiMusic,
    FiStar, FiTrendingUp
} from 'react-icons/fi';
// ambil data user
import { userData } from '../data/userData';
import './SkillsPage.css';

// mapping kategori skill ke icon
const categoryIcons = {
    Coding: FiCode,
    AI: FiCpu,
    Web: FiGlobe,
    Akademik: FiBookOpen,
    Seni: FiMusic,
    Semua: FiStar
};

const SkillsPage = () => {
    // ambil data skills dari userData
    const { skills } = userData;
    // state filter aktif, default "Semua"
    const [filter, setFilter] = useState('Semua');

    // ambil semua kategori unik pakai Set, tambah "Semua" di depan
    const categories = ['Semua', ...new Set(skills.map((s) => s.category))];

    // filter skill sesuai tab aktif
    const filteredSkills = filter === 'Semua'
        ? skills
        : skills.filter((s) => s.category === filter);

    // hitung rata-rata level skill
    const averageLevel = Math.round(
        skills.reduce((sum, s) => sum + s.level, 0) / skills.length
    );

    return (
        <div className="skills-page">
            <div className="container">
                {/* header halaman */}
                <div className="page-header">
                    <div className="page-badge">
                        <FiCode className="badge-icon" />
                        Keahlian
                    </div>
                    <h1 className="page-title">
                        Keahlian <span className="highlight">Saya</span>
                    </h1>
                    <p className="page-subtitle">
                        Skill dan kemampuan yang saya kuasai di berbagai bidang
                    </p>
                </div>

                {/* tab filter kategori */}
                <div className="skills-tabs">
                    {categories.map((cat) => {
                        const Icon = categoryIcons[cat] || FiStar;
                        return (
                            <button
                                key={cat}
                                className={`tab-btn ${filter === cat ? 'active' : ''}`}
                                onClick={() => setFilter(cat)}
                            >
                                <Icon />
                                <span>{cat}</span>
                            </button>
                        );
                    })}
                </div>

                {/* panel skill */}
                <div className="skills-panel">
                    <div className="panel-header">
                        <div className="panel-icon">
                            <FiTrendingUp />
                        </div>
                        <h2 className="panel-title">
                            {filter === 'Semua' ? 'Semua Keahlian' : filter}
                        </h2>
                    </div>

                    <div className="skills-grid">
                        {/* loop skill yang sudah difilter */}
                        {filteredSkills.map((skill, idx) => {
                            const Icon = categoryIcons[skill.category] || FiStar;
                            return (
                                <div key={idx} className="skill-card">
                                    <div className="skill-card-header">
                                        <div className="skill-card-icon">
                                            <Icon />
                                        </div>
                                        <div className="skill-card-info">
                                            <h3 className="skill-card-name">{skill.name}</h3>
                                            <span className="skill-card-cat">{skill.category}</span>
                                        </div>
                                        <div className="skill-card-percent">
                                            {skill.level}%
                                        </div>
                                    </div>
                                    {/* progress bar, width dinamis */}
                                    <div className="skill-progress">
                                        <div
                                            className="skill-progress-fill"
                                            style={{ width: `${skill.level}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* statistik */}
                <div className="skills-stats">
                    <div className="stat-box">
                        <FiTrendingUp className="stat-box-icon purple" />
                        <h3>{skills.length}</h3>
                        <p>Total Keahlian</p>
                    </div>
                    <div className="stat-box">
                        <FiStar className="stat-box-icon pink" />
                        <h3>{categories.length - 1}</h3>
                        <p>Kategori</p>
                    </div>
                    <div className="stat-box">
                        <FiCpu className="stat-box-icon blue" />
                        <h3>{averageLevel}%</h3>
                        <p>Rata-rata Level</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkillsPage;