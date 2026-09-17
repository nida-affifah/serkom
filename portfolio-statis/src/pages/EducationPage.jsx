// src/pages/EducationPage.jsx
import React from 'react';
import { FiBookOpen, FiCalendar, FiAward } from 'react-icons/fi';
import { userData } from '../data/userData';
import './EducationPage.css';

const EducationPage = () => {
    const { education } = userData;

    return (
        <div className="education-page">
            <div className="container">
                <div className="page-header">
                    <div className="page-badge">
                        <FiBookOpen className="badge-icon" />
                        Pendidikan
                    </div>
                    <h1 className="page-title">
                        Riwayat <span className="highlight">Pendidikan</span>
                    </h1>
                    <p className="page-subtitle">
                        Perjalanan pendidikan dari terbaru ke terlama
                    </p>
                </div>

                <div className="edu-timeline">
                    {education.map((edu, idx) => (
                        <div key={idx} className="edu-item">
                            <div className="edu-marker">
                                <div className="edu-marker-dot"></div>
                                <div className="edu-marker-line"></div>
                            </div>
                            <div className="edu-content">
                                <div className="edu-icon-wrap">
                                    <FiBookOpen />
                                </div>
                                <div className="edu-body">
                                    <span className="edu-year">
                                        <FiCalendar /> {edu.year}
                                    </span>
                                    <h3 className="edu-school">{edu.school}</h3>
                                    {edu.major && edu.major !== '-' && (
                                        <p className="edu-major">
                                            <FiAward /> {edu.major}
                                        </p>
                                    )}
                                    <p className="edu-desc">{edu.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EducationPage;
