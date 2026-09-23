// src/pages/ActivitiesPage.jsx
import React, { useState } from 'react';
import { FiCamera, FiCalendar, FiMapPin, FiBookOpen, FiTool, FiMic, FiTarget } from 'react-icons/fi';
import { userData } from '../data/userData';
import './ActivitiesPage.css';

import belajarRumah from '../assets/images/projects/belajarRumah.jpeg';
import belajarSekolah from '../assets/images/projects/belajarSekolah.jpeg';
import gameLab from '../assets/images/projects/gameLab.jpeg';
import portofolioPribadi from '../assets/images/projects/portofolioPribadi.png';
import publicSpeaking from '../assets/images/projects/publicSpeaking.jpeg';
import rplConnect from '../assets/images/projects/RPLConnect.jpeg';
import tokoElektronik from '../assets/images/projects/tokoElektronik.png';
import lombaArekAI from '../assets/images/projects/lombaArekAI.jpeg';
import lombaFNRP from '../assets/images/projects/lombaFNRP.jpeg';
import lombaKWU from '../assets/images/projects/lombaKWU.jpeg';

const imageMap = {
    'belajarRumah.jpeg': belajarRumah,
    'belajarSekolah.jpeg': belajarSekolah,
    'gameLab.jpeg': gameLab,
    'portofolioPribadi.png': portofolioPribadi,
    'publicSpeaking.jpeg': publicSpeaking,
    'RPLConnect.jpeg': rplConnect,
    'tokoElektronik.png': tokoElektronik,
    'lombaArekAI.jpeg': lombaArekAI,
    'lombaFNRP.jpeg': lombaFNRP,
    'lombaKWU.jpeg': lombaKWU,
};

const iconMap = {
    learningDocs: FiBookOpen,
    workshops: FiTool,
    seminars: FiMic,
    projects: FiTarget
};

const resolveImage = (image) => {
    if (!image) return '';
    if (imageMap[image]) return imageMap[image];
    return image;
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
                        {activeCategory.items.map((act, idx) => {
                            const imgSrc = resolveImage(act.image);

                            return (
                                <div key={idx} className="activity-card">
                                    <div className="activity-image">
                                        {imgSrc ? (
                                            <img
                                                src={imgSrc}
                                                alt={act.title}
                                                className="activity-img"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    const placeholder = e.target.parentElement.querySelector('.activity-placeholder');
                                                    if (placeholder) placeholder.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="activity-placeholder"
                                            style={{ display: imgSrc ? 'none' : 'flex' }}
                                        >
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
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivitiesPage;