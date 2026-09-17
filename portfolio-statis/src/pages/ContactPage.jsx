// src/pages/ContactPage.jsx
import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import {
    FiMail, FiMapPin, FiSend, FiCheckCircle,
    FiAlertCircle, FiMessageCircle, FiExternalLink, FiHeart, FiLoader
} from 'react-icons/fi';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { userData } from '../data/userData';
import './ContactPage.css';

const ContactPage = () => {
    const user = userData;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const contactInfo = {
        phone: user.contacts?.whatsapp || '0857-3339-5626',
        phoneRaw: user.contacts?.whatsappRaw || '6285733395626',
        instagram: user.contacts?.instagram || '@ndaffh_',
        instagramRaw: user.contacts?.instagramRaw || 'ndaffh_',
        email: user.contacts?.email || 'nidaffifah5@gmail.com',
        location: user.professional?.institution || 'SMKN 1 Jenangan Ponorogo'
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const serviceId = 'service_jb6nthm';
            const templateId = 'template_0agq3cr';
            const publicKey = '0F_ccWGp4S4mb42ui';

            const templateParams = {
                from_name: formData.name,
                from_email: formData.email,
                subject: formData.subject || 'Pesan dari Website Portfolio',
                message: formData.message,
                to_email: contactInfo.email,
                reply_to: formData.email
            };

            await emailjs.send(serviceId, templateId, templateParams, publicKey);

            setIsSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });

            setTimeout(() => setIsSubmitted(false), 5000);
        } catch (err) {
            setError('Gagal mengirim pesan. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleWhatsAppClick = () => {
        const message = `Halo Nida,\n\nSaya melihat portfolio Anda dan ingin bertanya.\n\nTerima kasih.`;
        const waUrl = `https://wa.me/${contactInfo.phoneRaw}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
    };

    const handleInstagramClick = () => {
        const igUrl = `https://instagram.com/${contactInfo.instagramRaw}`;
        window.open(igUrl, '_blank', 'noopener,noreferrer');
    };

    const handleEmailClick = () => {
        const subject = 'Pertanyaan dari Portfolio';
        const body = `Halo Nida,\n\nSaya melihat portfolio Anda dan ingin bertanya.\n\nTerima kasih.`;
        const mailtoUrl = `mailto:${contactInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoUrl;
    };

    const handleLocationClick = () => {
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactInfo.location)}`;
        window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="contact-page">
            <div className="contact-bg-decoration">
                <div className="contact-bg-circle contact-bg-circle-1"></div>
                <div className="contact-bg-circle contact-bg-circle-2"></div>
                <div className="contact-bg-circle contact-bg-circle-3"></div>
            </div>

            <div className="contact-container">
                <div className="contact-header">
                    <div className="contact-header-badge">
                        <span className="badge-icon">◆</span>
                        Kontak
                    </div>
                    <h1 className="contact-title">
                        Hubungi <span className="contact-title-highlight">Saya</span>
                    </h1>
                    <p className="contact-subtitle">
                        Jangan ragu untuk menghubungi saya melalui form di bawah ini
                    </p>
                    <div className="contact-divider">
                        <span className="divider-line"></span>
                        <span className="divider-dot"></span>
                        <span className="divider-line"></span>
                    </div>
                </div>

                <div className="contact-content">
                    <div className="contact-info">
                        <button
                            type="button"
                            className="contact-info-card clickable wa-card"
                            onClick={handleWhatsAppClick}
                            title="Klik untuk chat via WhatsApp"
                        >
                            <div className="contact-info-icon">
                                <FaWhatsapp />
                            </div>
                            <div className="contact-info-text">
                                <h4>WhatsApp</h4>
                                <p>{contactInfo.phone}</p>
                                <span className="click-hint">
                                    <FiMessageCircle /> Chat Sekarang
                                </span>
                            </div>
                        </button>

                        <button
                            type="button"
                            className="contact-info-card clickable ig-card"
                            onClick={handleInstagramClick}
                            title="Klik untuk buka Instagram"
                        >
                            <div className="contact-info-icon">
                                <FaInstagram />
                            </div>
                            <div className="contact-info-text">
                                <h4>Instagram</h4>
                                <p>{contactInfo.instagram}</p>
                                <span className="click-hint">
                                    <FiExternalLink /> Buka Profile
                                </span>
                            </div>
                        </button>

                        <button
                            type="button"
                            className="contact-info-card clickable email-card"
                            onClick={handleEmailClick}
                            title="Klik untuk kirim email"
                        >
                            <div className="contact-info-icon">
                                <FiMail />
                            </div>
                            <div className="contact-info-text">
                                <h4>Email</h4>
                                <p>{contactInfo.email}</p>
                                <span className="click-hint">
                                    <FiSend /> Kirim Email
                                </span>
                            </div>
                        </button>

                        <button
                            type="button"
                            className="contact-info-card clickable map-card"
                            onClick={handleLocationClick}
                            title="Klik untuk buka Google Maps"
                        >
                            <div className="contact-info-icon">
                                <FiMapPin />
                            </div>
                            <div className="contact-info-text">
                                <h4>Lokasi</h4>
                                <p>{contactInfo.location}</p>
                                <span className="click-hint">
                                    <FiMapPin /> Buka Maps
                                </span>
                            </div>
                        </button>

                        <div className="contact-thanks-text">
                            <FiHeart />
                            <span>Terima kasih sudah berkunjung!</span>
                        </div>
                    </div>

                    <div className="contact-form-wrapper">
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Nama Lengkap</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Masukkan nama Anda"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Masukkan email Anda"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="subject">Subjek</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="Masukkan subjek pesan"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="message">Pesan</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Tulis pesan Anda di sini..."
                                    rows="5"
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="contact-submit-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <FiLoader className="spin-icon" /> Mengirim...
                                    </>
                                ) : (
                                    <>
                                        <FiSend /> Kirim Pesan
                                    </>
                                )}
                            </button>
                            {isSubmitted && (
                                <div className="contact-success">
                                    <FiCheckCircle />
                                    Pesan berhasil dikirim! Saya akan menghubungi Anda segera.
                                </div>
                            )}
                            {error && (
                                <div className="contact-error">
                                    <FiAlertCircle />
                                    {error}
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                <div className="contact-footer-decoration">
                    <span className="deco-text">◆</span>
                    <span className="deco-text">◇</span>
                    <span className="deco-text">◆</span>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;