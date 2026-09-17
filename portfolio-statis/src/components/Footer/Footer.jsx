// src/components/Footer/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
    FiMail, FiPhone, FiMapPin, FiSend,
    FiInstagram, FiGithub, FiLinkedin, FiHeart
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { userData } from '../../data/userData';
import './Footer.css';

const socialIconMap = {
    Instagram: FiInstagram,
    GitHub: FiGithub,
    LinkedIn: FiLinkedin,
    WhatsApp: FaWhatsapp,
    Email: FiMail
};

const Footer = () => {
    const { contacts, footer } = userData;
    const currentYear = new Date().getFullYear();
    const quickNav = footer.quickNav || [];

    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contacts.address)}`;

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">

                    <div className="footer-col footer-brand">
                        <h3 className="footer-logo">{footer.name}</h3>
                        <p className="footer-tagline">{footer.tagline}</p>

                        <div className="footer-socials">
                            {footer.socialMedia && footer.socialMedia.map((social, i) => {
                                const Icon = socialIconMap[social.platform] || FiMail;
                                const isInternal = social.url && social.url.startsWith('/');

                                return isInternal ? (
                                    <Link
                                        key={i}
                                        to={social.url}
                                        className="social-btn"
                                        title={social.platform}
                                        aria-label={social.platform}
                                    >
                                        <Icon />
                                    </Link>
                                ) : (
                                    <a
                                        key={i}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="social-btn"
                                        title={social.platform}
                                        aria-label={social.platform}
                                    >
                                        <Icon />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    <div className="footer-col footer-nav">
                        <h4 className="footer-title">Navigasi</h4>
                        <ul className="footer-links">
                            {quickNav.map((link, i) => (
                                <li key={i}>
                                    <Link to={link.href}>{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer-col footer-contact">
                        <h4 className="footer-title">Kontak</h4>
                        <ul className="footer-contact-list">
                            <li>
                                <FiMail className="contact-icon" />
                                <Link to="/contact" className="footer-contact-link">
                                    {contacts.email}
                                </Link>
                            </li>
                            <li>
                                <FiPhone className="contact-icon" />
                                <a
                                    href={`https://wa.me/${contacts.whatsappRaw}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer-contact-link"
                                >
                                    {contacts.whatsapp}
                                </a>
                            </li>
                            <li>
                                <FiMapPin className="contact-icon" />
                                <a
                                    href={mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer-contact-link"
                                >
                                    {contacts.address}
                                </a>
                            </li>
                            <li>
                                <FiSend className="contact-icon" />
                                <Link to="/contact" className="footer-contact-link">
                                    Kirim Pesan
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p className="footer-copyright">
                        &copy; {currentYear} {footer.name}. All rights reserved.
                    </p>
                    <p className="footer-made">
                        Dibuat dengan <FiHeart className="heart-icon" /> menggunakan React JS
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;