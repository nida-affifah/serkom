// src/components/Navbar/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    FiHome, FiUser, FiBriefcase, FiBookOpen, FiFolder, FiMail,
    FiMenu, FiX, FiChevronDown, FiAward, FiCamera, FiBook,
    FiTrendingUp, FiCode
} from 'react-icons/fi';
import nida from '../../assets/images/nida.jpeg';
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const navRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 992;
            setIsMobile(mobile);
            if (!mobile) setMenuOpen(false);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
        setDropdownOpen(null);
    }, [location.pathname]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (navRef.current && !navRef.current.contains(e.target)) {
                setDropdownOpen(null);
            }
        };
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                setDropdownOpen(null);
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const menuItems = [
        { path: '/', label: 'Home', icon: FiHome },
        {
            label: 'Tentang',
            icon: FiUser,
            dropdown: [
                { path: '/about', label: 'Tentang Saya', icon: FiUser },
                { path: '/profile', label: 'Profil Profesional', icon: FiBriefcase },
                { path: '/education', label: 'Pendidikan', icon: FiBookOpen },
                { path: '/experience', label: 'Pengalaman', icon: FiTrendingUp }
            ]
        },
        { path: '/skills', label: 'Keahlian', icon: FiCode },
        {
            label: 'Portofolio',
            icon: FiFolder,
            dropdown: [
                { path: '/projects', label: 'Karya', icon: FiFolder },
                { path: '/certificates', label: 'Sertifikat', icon: FiAward },
                { path: '/activities', label: 'Kegiatan', icon: FiCamera }
            ]
        },
        { path: '/blog', label: 'Blog', icon: FiBook },
        { path: '/contact', label: 'Kontak', icon: FiMail }
    ];

    const handleNavigation = (path) => {
        navigate(path);
        setMenuOpen(false);
        setDropdownOpen(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleDropdown = (index, e) => {
        e.preventDefault();
        e.stopPropagation();
        setDropdownOpen(dropdownOpen === index ? null : index);
    };

    const isActive = (path) => location.pathname === path;
    const isDropdownActive = (dropdown) =>
        dropdown.some((item) => location.pathname === item.path);

    return (
        <nav ref={navRef} className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container">
                <div
                    className="logo"
                    onClick={() => handleNavigation('/')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleNavigation('/')}
                >
                    <div className="logo-icon-wrapper">
                        <div className="logo-icon">
                            <img
                                src={nida}
                                alt="Nida Affifah"
                                className="logo-icon-img"
                            />
                        </div>
                        <div className="logo-ring"></div>
                        <div className="logo-ring"></div>
                    </div>
                    <div className="logo-text">
                        <span className="name">Nida Affifah</span>
                        <span className="subtitle">Portfolio</span>
                    </div>
                </div>

                {isMobile && (
                    <button
                        className={`menu-toggle ${menuOpen ? 'open' : ''}`}
                        onClick={() => {
                            setMenuOpen(!menuOpen);
                            setDropdownOpen(null);
                        }}
                        aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
                        aria-expanded={menuOpen}
                    >
                        {menuOpen ? <FiX /> : <FiMenu />}
                    </button>
                )}

                <ul className={`nav-menu ${menuOpen ? 'open' : ''}`}>
                    {menuItems.map((item, index) => (
                        <li
                            key={index}
                            className={`nav-item ${item.dropdown ? 'has-dropdown' : ''} ${dropdownOpen === index ? 'open' : ''}`}
                        >
                            {item.dropdown ? (
                                <>
                                    <button
                                        type="button"
                                        className={`nav-link ${isDropdownActive(item.dropdown) ? 'active' : ''}`}
                                        onClick={(e) => toggleDropdown(index, e)}
                                        aria-expanded={dropdownOpen === index}
                                        aria-haspopup="true"
                                    >
                                        <item.icon className="nav-icon" />
                                        <span>{item.label}</span>
                                        <FiChevronDown
                                            className={`dropdown-arrow ${dropdownOpen === index ? 'open' : ''}`}
                                        />
                                    </button>
                                    <ul className={`dropdown-menu ${dropdownOpen === index ? 'show' : ''}`}>
                                        {item.dropdown.map((sub, i) => (
                                            <li key={i}>
                                                <button
                                                    type="button"
                                                    className={`dropdown-link ${isActive(sub.path) ? 'active' : ''}`}
                                                    onClick={() => handleNavigation(sub.path)}
                                                >
                                                    <sub.icon className="dropdown-icon" />
                                                    <span>{sub.label}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                                    onClick={() => handleNavigation(item.path)}
                                >
                                    <item.icon className="nav-icon" />
                                    <span>{item.label}</span>
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;