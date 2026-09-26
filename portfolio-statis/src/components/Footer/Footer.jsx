// src/components/Footer/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
// import icon dari react-icons
import {
    FiMail, FiPhone, FiMapPin, FiSend,
    FiInstagram, FiGithub, FiLinkedin, FiHeart
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
// ambil data user
import { userData } from '../../data/userData';
import './Footer.css';

// mapping nama platform ke icon
const socialIconMap = {
    Instagram: FiInstagram,
    GitHub: FiGithub,
    LinkedIn: FiLinkedin,
    WhatsApp: FaWhatsapp,
    Email: FiMail
};

const Footer = () => {
    // ambil contacts dan footer dari userData
    const { contacts, footer } = userData;
    // tahun sekarang otomatis
    const currentYear = new Date().getFullYear();
    // fallback kalau quickNav kosong
    const quickNav = footer.quickNav || [];

    // URL Google Maps dari alamat
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contacts.address)}`;

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">

                    {/* bagian brand */}
                    <div className="footer-col footer-brand">
                        <h3 className="footer-logo">{footer.name}</h3>
                        <p className="footer-tagline">{footer.tagline}</p>

                        {/* bagian social media */}
                        <div className="footer-socials">
                            {footer.socialMedia && footer.socialMedia.map((social, i) => {
                                // ambil icon, default FiMail
                                const Icon = socialIconMap[social.platform] || FiMail;
                                // cek link internal atau eksternal
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

                    {/* bagian navigasi */}
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

                    {/* bagian kontak */}
                    <div className="footer-col footer-contact">
                        <h4 className="footer-title">Kontak</h4>
                        <ul className="footer-contact-list">
                            <li>
                                <FiMail className="contact-icon" />
                                {/* link ke halaman contact */}
                                <Link to="/contact" className="footer-contact-link">
                                    {contacts.email}
                                </Link>
                            </li>
                            <li>
                                <FiPhone className="contact-icon" />
                                {/* link ke WhatsApp */}
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
                                {/* link ke Google Maps */}
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
                                {/* link kirim pesan */}
                                <Link to="/contact" className="footer-contact-link">
                                    Kirim Pesan
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* bagian bawah footer */}
                <div className="footer-bottom">
                    <p className="footer-copyright">
                        {/* tahun otomatis */}
                        &copy; {currentYear} {footer.name}. All rights reserved.
                    </p>
                    <p className="footer-made">
                        {/* credit */}
                        Dibuat dengan <FiHeart className="heart-icon" /> menggunakan React JS
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;