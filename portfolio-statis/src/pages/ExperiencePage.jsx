// src/pages/ExperiencePage.jsx
import React, { useState } from 'react';
import {
    FiBriefcase, FiCalendar, FiMapPin,
    FiBookOpen, FiUsers, FiTarget
} from 'react-icons/fi';
import { userData } from '../data/userData';
import './ExperiencePage.css';

const iconMap = {
    learning: FiBookOpen,
    working: FiBriefcase,
    organization: FiUsers,
    projects: FiTarget
};

const ExperiencePage = () => {
    const { experience } = userData;
    const categories = Object.entries(experience);
    const [activeTab, setActiveTab] = useState(categories[0][0]);

    const activeCategory = experience[activeTab];
    const ActiveIcon = iconMap[activeTab] || FiBriefcase;

    return (
        <div className="experience-page">
            <div className="container">
                <div className="page-header">
                    <div className="page-badge">
                        <FiBriefcase className="badge-icon" />
                        Pengalaman
                    </div>
                    <h1 className="page-title">
                        Pengalaman <span className="highlight">Saya</span>
                    </h1>
                    <p className="page-subtitle">
                        Perjalanan belajar, berkarya, dan berkembang
                    </p>
                </div>

                <div className="exp-tabs">
                    {categories.map(([key, cat]) => {
                        const Icon = iconMap[key] || FiBriefcase;
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

                <div className="exp-panel">
                    <div className="panel-header">
                        <div className="panel-icon">
                            <ActiveIcon />
                        </div>
                        <h2 className="panel-title">{activeCategory.title}</h2>
                    </div>

                    <div className="timeline">
                        {activeCategory.items.map((exp, idx) => (
                            <div key={idx} className="timeline-item">
                                <div className="timeline-marker">
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-line"></div>
                                </div>
                                <div className="timeline-content">
                                    <div className="timeline-header">
                                        <span className="timeline-year">
                                            <FiCalendar /> {exp.year}
                                        </span>
                                    </div>
                                    <h3 className="timeline-title">{exp.title}</h3>
                                    <p className="timeline-place">
                                        <FiMapPin /> {exp.place}
                                    </p>
                                    <p className="timeline-desc">{exp.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExperiencePage;