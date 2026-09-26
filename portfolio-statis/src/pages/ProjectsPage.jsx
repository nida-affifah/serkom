// src/pages/ProjectsPage.jsx
import React, { useState } from 'react';
// import icon
import {
    FiFolder, FiExternalLink, FiLayers,
    FiCode, FiStar, FiGlobe, FiSmartphone,
    FiTarget
} from 'react-icons/fi';
// ambil data user
import { userData } from '../data/userData';
import './ProjectsPage.css';

// import gambar-gambar proyek
import simKlinik from '../assets/images/projects/sim-klinik.png';
import formKtp from '../assets/images/projects/form-ktp.png';
import portofolioPribadi from '../assets/images/projects/portofolioPribadi.png';
import tokoElektronik from '../assets/images/projects/tokoElektronik.png';
import tokoRajut from '../assets/images/projects/tokoRajut.png';
import lombaKWU from '../assets/images/projects/lombaKWU.jpeg';
import lombaArekAI from '../assets/images/projects/lombaArekAI.jpeg';

// mapping nama file gambar ke gambar yang sudah diimport
const imageMap = {
    'sim-klinik.png': simKlinik,
    'form-ktp.png': formKtp,
    'portofolioPribadi.png': portofolioPribadi,
    'tokoElektronik.png': tokoElektronik,
    'tokoRajut.png': tokoRajut,
    'lombaKWU.jpeg': lombaKWU,
    'lombaArekAI.jpeg': lombaArekAI,
};

// mapping kategori ke icon
const iconMap = {
    websites: FiGlobe,
    applications: FiSmartphone,
    projects: FiTarget
};

// fungsi buat ambil gambar yang benar
const resolveImage = (image) => {
    if (!image) return '';
    if (imageMap[image]) return imageMap[image];
    return image;
};

const ProjectsPage = () => {
    // ambil data projects dari userData
    const { projects } = userData;
    // ubah object projects jadi array
    const categories = Object.entries(projects);
    // state tab aktif
    const [activeTab, setActiveTab] = useState(categories[0][0]);

    // data kategori aktif
    const activeCategory = projects[activeTab];
    // icon kategori aktif
    const ActiveIcon = iconMap[activeTab] || FiFolder;

    // hitung total semua proyek
    const totalProjects = categories.reduce(
        (total, [, cat]) => total + cat.items.length,
        0
    );

    // hitung total teknologi unik pakai Set
    const totalTech = new Set(
        categories.flatMap(([, cat]) => cat.items.flatMap((p) => p.tech))
    ).size;

    return (
        <div className="projects-page">
            <div className="container">
                {/* header halaman */}
                <div className="page-header">
                    <div className="page-badge">
                        <FiFolder className="badge-icon" />
                        Karya & Portofolio
                    </div>
                    <h1 className="page-title">
                        Karya <span className="highlight">Saya</span>
                    </h1>
                    <p className="page-subtitle">
                        Kumpulan proyek dan karya yang saya buat
                    </p>
                </div>

                {/* tab kategori */}
                <div className="projects-tabs">
                    {categories.map(([key, cat]) => {
                        const Icon = iconMap[key] || FiFolder;
                        return (
                            <button
                                key={key}
                                className={`tab-btn ${activeTab === key ? 'active' : ''}`}
                                onClick={() => setActiveTab(key)}
                            >
                                <Icon />
                                <span>{cat.title}</span>
                            </button>
                        );
                    })}
                </div>

                {/* panel isi proyek */}
                <div className="projects-panel">
                    <div className="panel-header">
                        <div className="panel-icon">
                            <ActiveIcon />
                        </div>
                        <h2 className="panel-title">{activeCategory.title}</h2>
                    </div>

                    <div className="projects-grid">
                        {/* loop semua proyek */}
                        {activeCategory.items.map((project, idx) => {
                            const imgSrc = resolveImage(project.image);

                            return (
                                <article key={idx} className="project-card">
                                    <div className="project-image-wrap">
                                        {/* tampilkan gambar kalau ada */}
                                        {imgSrc ? (
                                            <img
                                                src={imgSrc}
                                                alt={project.title}
                                                className="project-image"
                                            />
                                        ) : null}

                                        {/* overlay badge tipe proyek */}
                                        <div className="project-image-overlay">
                                            <span className="project-type-badge">
                                                {project.type}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="project-body">
                                        <h3 className="project-title">{project.title}</h3>
                                        <p className="project-desc">{project.description}</p>

                                        {/* tag teknologi */}
                                        <div className="project-tech">
                                            {project.tech.map((t, i) => (
                                                <span key={i} className="tech-tag">
                                                    <FiCode /> {t}
                                                </span>
                                            ))}
                                        </div>

                                        {/* link lihat proyek, tampil kalau ada link */}
                                        <div className="project-footer">
                                            {project.link ? (
                                                <a
                                                    href={project.link}
                                                    className="project-link"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <FiExternalLink /> Lihat Proyek
                                                </a>
                                            ) : null}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>

                {/* statistik proyek */}
                <div className="projects-stats">
                    <div className="stat-box">
                        <FiFolder className="stat-icon purple" />
                        <h3>{totalProjects}</h3>
                        <p>Total Karya</p>
                    </div>
                    <div className="stat-box">
                        <FiLayers className="stat-icon pink" />
                        <h3>{categories.length}</h3>
                        <p>Kategori</p>
                    </div>
                    <div className="stat-box">
                        <FiStar className="stat-icon blue" />
                        <h3>{totalTech}</h3>
                        <p>Teknologi</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectsPage;