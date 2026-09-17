// src/pages/CertificatesPage.jsx
import React from 'react';
import { FiAward, FiCalendar, FiUser } from 'react-icons/fi';
import { userData } from '../data/userData';
import './CertificatesPage.css';

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
                    {certificates.map((cert, idx) => (
                        <div key={idx} className="cert-card">
                            <div className="cert-icon">
                                <FiAward />
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
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CertificatesPage;
