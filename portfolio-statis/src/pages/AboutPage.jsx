// src/pages/AboutPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FiUser, FiTarget, FiMapPin, FiMail,
    FiAward, FiCode, FiBookOpen, FiArrowRight
} from 'react-icons/fi';
import { userData } from '../data/userData';
import photoNida from '../assets/images/nida.jpeg';
import './AboutPage.css';

const AboutPage = () => {
    const { hero, about, professional, contacts } = userData;
    const { shortBio, expertise, principles } = about;

    const [imgError, setImgError] = useState(false);

    return (
        <div className="about-page">
            <div className="container">

                <div className="page-header">
                    <div className="page-badge">
                        <FiUser className="badge-icon" />
                        Tentang Saya
                    </div>
                    <h1 className="page-title">
                        Tentang <span className="highlight">Saya</span>
                    </h1>
                    <p className="page-subtitle">
                        Kenalan lebih dekat dengan saya
                    </p>
                </div>

                <div className="about-profile">
                    <div className="about-photo-wrap">
                        <div className="about-photo-pattern"></div>
                        <div className="about-photo-ring"></div>
                        <div className="about-photo-bg-2"></div>
                        <div className="about-photo-bg"></div>

                        {imgError ? (
                            <div className="about-photo-fallback">
                                <FiUser />
                            </div>
                        ) : (
                            <img
                                src={photoNida}
                                alt={hero.fullName}
                                className="about-photo"
                                onError={() => setImgError(true)}
                            />
                        )}

                        <span className="about-photo-badge badge-1">Web Dev</span>
                        <span className="about-photo-badge badge-2">RPL</span>
                        <span className="about-photo-badge badge-3">UI/UX</span>

                        <span className="deco-star star-1">✦</span>
                        <span className="deco-star star-2">✦</span>
                        <span className="deco-dot dot-1"></span>
                        <span className="deco-dot dot-2"></span>
                        <span className="deco-dot dot-3"></span>
                    </div>

                    <div className="about-info">
                        <h2 className="about-name">{hero.fullName}</h2>
                        <p className="about-profession">{hero.profession}</p>

                        <div className="about-quick-info">
                            <div className="quick-item">
                                <FiMapPin className="quick-icon" />
                                <span>{contacts.address}</span>
                            </div>
                            <div className="quick-item">
                                <FiMail className="quick-icon" />
                                <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
                            </div>
                        </div>

                        <p className="about-bio">{hero.tagline}</p>

                        <div className="about-buttons">
                            <Link to="/contact" className="btn btn-primary">
                                <FiMail /> Hubungi Saya
                            </Link>
                            <Link to="/projects" className="btn btn-outline">
                                Lihat Karya <FiArrowRight />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="about-biodata">
                    <div className="section-title-wrap">
                        <h2 className="section-title">{shortBio.title}</h2>
                    </div>
                    <div className="biodata-grid">
                        {shortBio.items.map((item, i) => (
                            <div key={i} className="biodata-item">
                                <span className="biodata-label">{item.label}</span>
                                <span className="biodata-value">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="about-expertise">
                    <div className="section-title-wrap">
                        <h2 className="section-title">{expertise.title}</h2>
                    </div>
                    <p className="section-desc">{expertise.description}</p>
                    <div className="expertise-grid">
                        {expertise.fields.map((field, i) => (
                            <div key={i} className="expertise-card">
                                <h3>{field.name}</h3>
                                <p>{field.description}</p>
                                <div className="expertise-bar">
                                    <div
                                        className="expertise-fill"
                                        style={{ width: `${field.level}%` }}
                                    ></div>
                                </div>
                                <span className="expertise-level">{field.level}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="about-principles">
                    <div className="section-title-wrap">
                        <h2 className="section-title">{principles.title}</h2>
                    </div>

                    <div className="principles-motto">
                        <p>{principles.motto}</p>
                    </div>

                    <div className="principles-vision">
                        <div className="visi-card">
                            <div className="visi-icon">
                                <FiTarget />
                            </div>
                            <h3>Visi</h3>
                            <p>{principles.vision}</p>
                        </div>
                    </div>

                    <div className="principles-mission">
                        <h3>Misi</h3>
                        <ul>
                            {principles.mission.map((m, i) => (
                                <li key={i}>{m}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="principles-values">
                        <h3>Nilai yang Saya Pegang</h3>
                        <div className="values-grid">
                            {principles.values.map((v, i) => (
                                <div key={i} className="value-card">
                                    <h4>{v.name}</h4>
                                    <p>{v.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="about-highlights">
                    <div className="highlight-card">
                        <div className="highlight-icon purple">
                            <FiCode />
                        </div>
                        <h3>Web Development</h3>
                        <p>Membangun website modern dengan React JS dan teknologi terkini.</p>
                    </div>

                    <div className="highlight-card">
                        <div className="highlight-icon pink">
                            <FiBookOpen />
                        </div>
                        <h3>Pembelajar Aktif</h3>
                        <p>Selalu antusias mempelajari skill baru dan mengikuti perkembangan teknologi.</p>
                    </div>

                    <div className="highlight-card">
                        <div className="highlight-icon blue">
                            <FiAward />
                        </div>
                        <h3>Berkarya Nyata</h3>
                        <p>Menciptakan karya yang bermanfaat, bukan hanya teori di atas kertas.</p>
                    </div>
                </div>

                <div className="about-professional">
                    <div className="section-title-wrap">
                        <h2 className="section-title">Info Profesional</h2>
                    </div>
                    <div className="prof-grid">
                        <div className="prof-item">
                            <span className="prof-label">Jabatan</span>
                            <span className="prof-value">{professional.position}</span>
                        </div>
                        <div className="prof-item">
                            <span className="prof-label">Instansi</span>
                            <span className="prof-value">{professional.institution}</span>
                        </div>
                        <div className="prof-item">
                            <span className="prof-label">Bidang</span>
                            <span className="prof-value">{professional.field}</span>
                        </div>
                        <div className="prof-item">
                            <span className="prof-label">Fokus</span>
                            <div className="prof-tags">
                                {professional.focus.map((f, i) => (
                                    <span key={i} className="prof-tag">{f}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AboutPage;