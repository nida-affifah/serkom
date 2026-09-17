// src/pages/ActivitiesPage.jsx
import React, { useState } from 'react';
import { FiCamera, FiCalendar, FiMapPin, FiBookOpen, FiTool, FiMic, FiTarget } from 'react-icons/fi';
import { userData } from '../data/userData';
import './ActivitiesPage.css';

const iconMap = {
    learningDocs: FiBookOpen,
    workshops: FiTool,
    seminars: FiMic,
    projects: FiTarget
};

const ActivitiesPage = () => {
    const { activities } = userData;
    const categories = Object.entries(activities);
    const [activeTab, setActiveTab] = useState(categories[0][0]);

    const activeCategory = activities[activeTab];
    const ActiveIcon = iconMap[activeTab] || FiCamera;

    return (
        <div className="activities-page">
            <div className="container">
                <div className="page-header">
                    <div className="page-badge">
                        <FiCamera className="badge-icon" />
                        Kegiatan
                    </div>
                    <h1 className="page-title">
                        Kegiatan <span className="highlight">Saya</span>
                    </h1>
                    <p className="page-subtitle">
                        Dokumentasi kegiatan belajar, workshop, seminar, dan proyek
                    </p>
                </div>

                <div className="activities-tabs">
                    {categories.map(([key, cat]) => {
                        const Icon = iconMap[key] || FiCamera;
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

                <div className="activities-panel">
                    <div className="panel-header">
                        <div className="panel-icon">
                            <ActiveIcon />
                        </div>
                        <h2 className="panel-title">{activeCategory.title}</h2>
                    </div>

                    <div className="activities-grid">
                        {activeCategory.items.map((act, idx) => (
                            <div key={idx} className="activity-card">
                                <div className="activity-image">
                                    <div className="activity-placeholder">
                                        <FiCamera />
                                    </div>
                                    <span className="activity-type-badge">{act.type}</span>
                                </div>
                                <div className="activity-body">
                                    <span className="activity-year">
                                        <FiCalendar /> {act.year}
                                    </span>
                                    <h3 className="activity-title">{act.title}</h3>
                                    <p className="activity-place">
                                        <FiMapPin /> {act.place}
                                    </p>
                                    <p className="activity-desc">{act.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivitiesPage;