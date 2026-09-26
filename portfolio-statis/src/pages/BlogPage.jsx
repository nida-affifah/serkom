// src/pages/BlogPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// import icon
import {
    FiBookOpen, FiCalendar, FiArrowRight,
    FiEdit3, FiBook, FiBriefcase
} from 'react-icons/fi';
// ambil data user
import { userData } from '../data/userData';
import './BlogPage.css';

// mapping kategori blog ke icon
const iconMap = {
    writings: FiEdit3,
    tutorials: FiBook,
    experiences: FiBriefcase
};

const BlogPage = () => {
    // ambil data blog dari userData
    const { blog } = userData;
    // ubah object blog jadi array
    const categories = Object.entries(blog);
    // state tab aktif
    const [activeTab, setActiveTab] = useState(categories[0][0]);

    // data kategori aktif
    const activeCategory = blog[activeTab];
    // icon kategori aktif
    const ActiveIcon = iconMap[activeTab] || FiBookOpen;

    // fungsi format tanggal jadi bahasa Indonesia
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="blog-page">
            <div className="container">
                {/* header halaman */}
                <div className="page-header">
                    <div className="page-badge">
                        <FiBookOpen className="badge-icon" />
                        Blog & Artikel
                    </div>
                    <h1 className="page-title">
                        Blog <span className="highlight">& Artikel</span>
                    </h1>
                    <p className="page-subtitle">
                        Tulisan, tutorial, dan pengalaman yang saya bagikan
                    </p>
                </div>

                {/* tab kategori */}
                <div className="blog-tabs">
                    {categories.map(([key, cat]) => {
                        const Icon = iconMap[key] || FiBookOpen;
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

                {/* panel isi blog */}
                <div className="blog-panel">
                    <div className="panel-header">
                        <div className="panel-icon">
                            <ActiveIcon />
                        </div>
                        <h2 className="panel-title">{activeCategory.title}</h2>
                    </div>

                    <div className="blog-grid">
                        {/* loop semua artikel */}
                        {activeCategory.items.map((post, idx) => (
                            <article key={idx} className="blog-card">
                                <div className="blog-date">
                                    <FiCalendar /> {formatDate(post.date)}
                                </div>
                                <h3 className="blog-title">{post.title}</h3>
                                <p className="blog-excerpt">{post.excerpt}</p>
                                {/* link ke halaman detail blog */}
                                <Link to={`/blog/${post.id}`} className="blog-link">
                                    Baca Selengkapnya <FiArrowRight />
                                </Link>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogPage;