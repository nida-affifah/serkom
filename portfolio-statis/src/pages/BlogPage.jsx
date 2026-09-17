// src/pages/BlogPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FiBookOpen, FiCalendar, FiArrowRight,
    FiEdit3, FiBook, FiBriefcase
} from 'react-icons/fi';
import { userData } from '../data/userData';
import './BlogPage.css';

const iconMap = {
    writings: FiEdit3,
    tutorials: FiBook,
    experiences: FiBriefcase
};

const BlogPage = () => {
    const { blog } = userData;
    const categories = Object.entries(blog);
    const [activeTab, setActiveTab] = useState(categories[0][0]);

    const activeCategory = blog[activeTab];
    const ActiveIcon = iconMap[activeTab] || FiBookOpen;

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

                <div className="blog-panel">
                    <div className="panel-header">
                        <div className="panel-icon">
                            <ActiveIcon />
                        </div>
                        <h2 className="panel-title">{activeCategory.title}</h2>
                    </div>

                    <div className="blog-grid">
                        {activeCategory.items.map((post, idx) => (
                            <article key={idx} className="blog-card">
                                <div className="blog-date">
                                    <FiCalendar /> {formatDate(post.date)}
                                </div>
                                <h3 className="blog-title">{post.title}</h3>
                                <p className="blog-excerpt">{post.excerpt}</p>
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