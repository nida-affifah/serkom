// src/pages/CertificatesPage.jsx
import React from 'react';
import { FiAward, FiCalendar, FiUser } from 'react-icons/fi';
import { userData } from '../data/userData';
import './CertificatesPage.css';

import publicSpeaking from '../assets/images/projects/publicSpeaking.jpeg';
import lombaFNRP from '../assets/images/projects/lombaFNRP.jpeg';
import lombaArekAI from '../assets/images/projects/lombaArekAI.jpeg';
import lombaKWU from '../assets/images/projects/lombaKWU.jpeg';

const imageMap = {
    'publicSpeaking.jpeg': publicSpeaking,
    'lombaFNRP.jpeg': lombaFNRP,
    'lombaArekAI.jpeg': lombaArekAI,
    'lombaKWU.jpeg': lombaKWU,
};

const resolveImage = (image) => {
    if (!image) return '';
    if (imageMap[image]) return imageMap[image];
    return image;
};

const CertificatesPage = () => {
    const { certificates } = userData;

    return (
        <div className="certificates-page">
            <div className="container">
                <div className="page-header">
                    <div className="page-badge">
                        <FiAward className="badge-icon" />
                        Sertifikat & Prestasi
                    </div>
                    <h1 className="page-title">
                        Sertifikat <span className="highlight">& Prestasi</span>
                    </h1>
                    <p className="page-subtitle">
                        Pencapaian, sertifikasi, dan penghargaan yang saya raih
                    </p>
                </div>

                <div className="cert-grid">
                    {certificates.map((cert, idx) => {
                        const imgSrc = resolveImage(cert.image);

                        return (
                            <div key={idx} className="cert-card">
                                <div className="cert-image">
                                    {imgSrc ? (
                                        <img
                                            src={imgSrc}
                                            alt={cert.title}
                                            className="cert-img"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                const placeholder = e.target.parentElement.querySelector('.cert-icon');
                                                if (placeholder) placeholder.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className="cert-icon"
                                        style={{ display: imgSrc ? 'none' : 'flex' }}
                                    >
                                        <FiAward />
                                    </div>
                                </div>

                                <div className="cert-body">
                                    <span className="cert-type">{cert.type}</span>
                                    <h3 className="cert-title">{cert.title}</h3>
                                    <p className="cert-issuer">
                                        <FiUser /> {cert.issuer}
                                    </p>
                                    <p className="cert-year">
                                        <FiCalendar /> {cert.year}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CertificatesPage;