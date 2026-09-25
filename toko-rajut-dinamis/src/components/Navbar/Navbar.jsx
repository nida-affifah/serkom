// src/components/Navbar/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    FiHome, FiGrid, FiTag, FiInfo, FiShoppingCart,
    FiSearch, FiClock, FiLogOut, FiLogIn, FiUser,
    FiBarChart2, FiPackage, FiMenu, FiX, FiMapPin,
    FiBell, FiTrendingUp, FiAlertCircle, FiTruck, FiStar
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
    produkAPI,
    kategoriAPI,
    pesananAPI,
    supplierAPI,
    authAPI
} from '../../services/api';
import logoToko from '../../assets/images/logoToko.jpeg';
import './Navbar.css';

const ICON_MAP = {
    home: FiHome,
    grid: FiGrid,
    tag: FiTag,
    info: FiInfo,
    cart: FiShoppingCart,
    clock: FiClock,
    user: FiUser,
    chart: FiBarChart2,
    package: FiPackage,
    pin: FiMapPin,
    bell: FiBell,
    trending: FiTrendingUp,
    alert: FiAlertCircle,
    truck: FiTruck,
    star: FiStar
};

const Navbar = ({ onCartClick, onSearch }) => {
    const [scrolled, setScrolled] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const [searchData, setSearchData] = useState({
        produk: [],
        kategori: [],
        pesanan: [],
        user: [],
        supplier: []
    });

    const searchRef = useRef(null);

    const { cartCount } = useCart();
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const role = user?.role;

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        const handleResize = () => setIsMobile(window.innerWidth <= 992);
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        setMenuOpen(false);
        setShowSuggestions(false);
        setSearchQuery('');
    }, [location.pathname]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchAll = async () => {
            const fetchSafe = async (promise) => {
                try {
                    return await promise;
                } catch {
                    return null;
                }
            };

            const newData = {
                produk: [],
                kategori: [],
                pesanan: [],
                user: [],
                supplier: []
            };

            const resProduk = await fetchSafe(produkAPI.getAll());
            newData.produk = resProduk?.data?.data || [];

            const resKategori = await fetchSafe(kategoriAPI.getAll());
            newData.kategori = resKategori?.data?.data || [];

            if (isAuthenticated) {
                if (role === 'admin' || role === 'kasir') {
                    const resPesanan = await fetchSafe(pesananAPI.getAll());
                    newData.pesanan = resPesanan?.data?.data || [];
                }

                if (role === 'admin') {
                    const resUser = await fetchSafe(authAPI.getAllUsers());
                    newData.user = resUser?.data?.data || [];
                }

                if (role === 'admin' || role === 'staff_gudang') {
                    const resSupplier = await fetchSafe(supplierAPI.getAll());
                    newData.supplier = resSupplier?.data?.data || [];
                }
            }

            setSearchData(newData);
        };

        fetchAll();
    }, [isAuthenticated, role]);

    const handleNavigation = (path) => {
        navigate(path);
        setMenuOpen(false);
        setShowSuggestions(false);
        setSearchQuery('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        const suggestions = getSuggestions();
        if (suggestions.length > 0) {
            handleNavigation(suggestions[0].path);
        } else {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setShowSuggestions(false);
            setSearchQuery('');
        }
    };

    const openLogoutModal = () => {
        setShowLogoutModal(true);
    };

    const closeLogoutModal = () => {
        setShowLogoutModal(false);
    };

    const confirmLogout = () => {
        setShowLogoutModal(false);
        setMenuOpen(false);
        logout();
        navigate('/');
    };

    const menuPublik = [
        { path: '/', label: 'Beranda', icon: FiHome, iconKey: 'home' },
        { path: '/products', label: 'Produk', icon: FiGrid, iconKey: 'grid' },
        { path: '/categories', label: 'Kategori', icon: FiTag, iconKey: 'tag' },
        { path: '/about-toko', label: 'Tentang Kami', icon: FiInfo, iconKey: 'info' }
    ];

    const menuAdmin = [
        { path: '/', label: 'Beranda', icon: FiHome, iconKey: 'home' },
        { path: '/admin/dashboard', label: 'Dashboard', icon: FiBarChart2, iconKey: 'chart' },
        { path: '/admin/supplier', label: 'Supplier', icon: FiTruck, iconKey: 'truck' },
        { path: '/admin/pembelian', label: 'Pembelian', icon: FiPackage, iconKey: 'package' },
        { path: '/admin/bahan', label: 'Bahan', icon: FiPackage, iconKey: 'package' },
        { path: '/admin/products', label: 'Produk', icon: FiGrid, iconKey: 'grid' },
        { path: '/admin/kategori', label: 'Kategori', icon: FiTag, iconKey: 'tag' },
        { path: '/admin/pesanan', label: 'Pesanan', icon: FiShoppingCart, iconKey: 'cart' },
        { path: '/admin/retur', label: 'Retur', icon: FiAlertCircle, iconKey: 'alert' },
        { path: '/admin/voucher', label: 'Voucher', icon: FiTag, iconKey: 'tag' },
        { path: '/admin/laporan', label: 'Laporan', icon: FiTrendingUp, iconKey: 'trending' },
        { path: '/admin/pegawai', label: 'Pegawai', icon: FiUser, iconKey: 'user' },
        { path: '/admin/users', label: 'Kelola User', icon: FiUser, iconKey: 'user' }
    ];

    const menuStaff = [
        { path: '/', label: 'Beranda', icon: FiHome, iconKey: 'home' },
        { path: '/admin/dashboard', label: 'Dashboard', icon: FiBarChart2, iconKey: 'chart' },
        { path: '/admin/supplier', label: 'Supplier', icon: FiTruck, iconKey: 'truck' },
        { path: '/admin/pembelian', label: 'Pembelian', icon: FiPackage, iconKey: 'package' },
        { path: '/admin/bahan', label: 'Bahan', icon: FiPackage, iconKey: 'package' },
        { path: '/admin/products', label: 'Produk', icon: FiGrid, iconKey: 'grid' },
        { path: '/admin/laporan', label: 'Laporan', icon: FiTrendingUp, iconKey: 'trending' }
    ];

    const menuKasir = [
        { path: '/', label: 'Beranda', icon: FiHome, iconKey: 'home' },
        { path: '/admin/dashboard', label: 'Dashboard', icon: FiBarChart2, iconKey: 'chart' },
        { path: '/admin/pesanan', label: 'Pesanan', icon: FiShoppingCart, iconKey: 'cart' },
        { path: '/admin/retur', label: 'Retur', icon: FiAlertCircle, iconKey: 'alert' },
        { path: '/admin/laporan', label: 'Laporan', icon: FiTrendingUp, iconKey: 'trending' }
    ];

    const menuPerajin = [
        { path: '/', label: 'Beranda', icon: FiHome, iconKey: 'home' },
        { path: '/admin/dashboard', label: 'Dashboard', icon: FiBarChart2, iconKey: 'chart' },
        { path: '/products', label: 'Produk', icon: FiGrid, iconKey: 'grid' },
        { path: '/admin/laporan', label: 'Laporan', icon: FiTrendingUp, iconKey: 'trending' }
    ];

    const menuPembeli = [
        { path: '/', label: 'Beranda', icon: FiHome, iconKey: 'home' },
        { path: '/products', label: 'Produk', icon: FiGrid, iconKey: 'grid' },
        { path: '/categories', label: 'Kategori', icon: FiTag, iconKey: 'tag' },
        { path: '/keranjang', label: 'Keranjang', icon: FiShoppingCart, iconKey: 'cart' },
        { path: '/purchase-history', label: 'Riwayat', icon: FiClock, iconKey: 'clock' }
    ];

    const getMenu = () => {
        if (!isAuthenticated) return menuPublik;

        switch (role) {
            case 'admin':        return menuAdmin;
            case 'staff_gudang': return menuStaff;
            case 'kasir':        return menuKasir;
            case 'perajin':      return menuPerajin;
            case 'pembeli':      return menuPembeli;
            default:             return menuPublik;
        }
    };

    const menuItems = getMenu();
    const isActive = (path) => location.pathname === path;

    const getSuggestions = () => {
        if (!searchQuery.trim()) return [];

        const q = searchQuery.toLowerCase().trim();
        const hasil = [];

        menuItems.forEach(item => {
            if (item.label.toLowerCase().includes(q)) {
                hasil.push({
                    kategori: 'Menu',
                    label: item.label,
                    sublabel: item.path,
                    path: item.path,
                    iconKey: item.iconKey
                });
            }
        });

        searchData.produk.forEach(p => {
            if (
                p.nama_produk?.toLowerCase().includes(q) ||
                p.kode_produk?.toLowerCase().includes(q)
            ) {
                const path = (role === 'admin' || role === 'staff_gudang')
                    ? '/admin/products'
                    : `/product/${p.id}`;

                hasil.push({
                    kategori: 'Produk',
                    label: p.nama_produk,
                    sublabel: p.kode_produk,
                    path,
                    iconKey: 'package'
                });
            }
        });

        searchData.kategori.forEach(k => {
            if (k.nama_kategori?.toLowerCase().includes(q)) {
                const path = role === 'admin'
                    ? '/admin/kategori'
                    : `/products?category=${encodeURIComponent(k.nama_kategori)}`;

                hasil.push({
                    kategori: 'Kategori',
                    label: k.nama_kategori,
                    sublabel: `${k.jumlah_produk || 0} produk`,
                    path,
                    iconKey: 'tag'
                });
            }
        });

        searchData.pesanan.forEach(p => {
            if (
                p.kode_pesanan?.toLowerCase().includes(q) ||
                p.nama_pembeli?.toLowerCase().includes(q)
            ) {
                hasil.push({
                    kategori: 'Pesanan',
                    label: p.kode_pesanan,
                    sublabel: p.nama_pembeli,
                    path: '/admin/pesanan',
                    iconKey: 'cart'
                });
            }
        });

        searchData.user.forEach(u => {
            if (
                u.nama_lengkap?.toLowerCase().includes(q) ||
                u.username?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q)
            ) {
                hasil.push({
                    kategori: 'User',
                    label: u.nama_lengkap,
                    sublabel: `@${u.username} · ${u.role}`,
                    path: '/admin/users',
                    iconKey: 'user'
                });
            }
        });

        searchData.supplier.forEach(s => {
            if (
                s.nama_supplier?.toLowerCase().includes(q) ||
                s.bahan_dipasok?.toLowerCase().includes(q)
            ) {
                hasil.push({
                    kategori: 'Supplier',
                    label: s.nama_supplier,
                    sublabel: s.bahan_dipasok,
                    path: '/admin/supplier',
                    iconKey: 'truck'
                });
            }
        });

        return hasil.slice(0, 20);
    };

    const suggestions = getSuggestions();

    const grouped = suggestions.reduce((acc, item) => {
        if (!acc[item.kategori]) acc[item.kategori] = [];
        acc[item.kategori].push(item);
        return acc;
    }, {});

    const getPlaceholder = () => {
        if (!isAuthenticated) return 'Cari menu, produk, kategori...';

        switch (role) {
            case 'admin':
                return 'Cari menu, produk, pesanan, user, supplier...';
            case 'staff_gudang':
                return 'Cari menu, produk, supplier...';
            case 'kasir':
                return 'Cari menu, produk, pesanan...';
            case 'perajin':
                return 'Cari menu, produk, kategori...';
            case 'pembeli':
                return 'Cari menu, produk, kategori...';
            default:
                return 'Cari menu, produk, kategori...';
        }
    };

    const renderSearchBar = () => (
        <div className="search-container" ref={searchRef}>
            <form onSubmit={handleSearch} className="search-form">
                <FiSearch className="search-icon" />
                <input
                    type="text"
                    placeholder={getPlaceholder()}
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="search-input"
                />
                <button type="submit" className="search-btn">Cari</button>
            </form>

            {showSuggestions && searchQuery.trim() && (
                <div className="search-suggestions">
                    {suggestions.length === 0 ? (
                        <div className="suggestion-empty">
                            Tidak ada hasil untuk "{searchQuery}"
                        </div>
                    ) : (
                        Object.entries(grouped).map(([kategori, items]) => (
                            <div key={kategori} className="suggestion-group">
                                <div className="suggestion-group-label">
                                    {kategori}
                                </div>
                                {items.map((item, idx) => {
                                    const Icon = ICON_MAP[item.iconKey] || FiSearch;
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            className="suggestion-item"
                                            onClick={() => handleNavigation(item.path)}
                                        >
                                            <Icon className="suggestion-icon" />
                                            <div className="suggestion-text">
                                                <span className="suggestion-label">
                                                    {item.label}
                                                </span>
                                                {item.sublabel && (
                                                    <span className="suggestion-sublabel">
                                                        {item.sublabel}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );

    const renderUserActions = () => {
        if (!isAuthenticated) {
            return (
                <div className="user-actions">
                    <button
                        className="nav-auth-btn login"
                        onClick={() => navigate('/login')}
                    >
                        <FiLogIn /> Login
                    </button>
                    <button
                        className="nav-auth-btn register"
                        onClick={() => navigate('/register')}
                    >
                        <FiUser /> Register
                    </button>
                </div>
            );
        }

        const roleLabels = {
            admin: 'Admin',
            staff_gudang: 'Staff',
            kasir: 'Kasir',
            perajin: 'Perajin',
            pembeli: 'Pembeli'
        };

        return (
            <div className="user-actions">
                <div className="user-info-badge">
                    {user?.foto ? (
                        <img
                            src={user.foto}
                            alt={user.nama_lengkap}
                            className="user-avatar-img"
                        />
                    ) : (
                        <div className="user-avatar">
                            {user?.nama_lengkap?.charAt(0) || 'U'}
                        </div>
                    )}
                    <div className="user-info-text">
                        <span className="user-name">
                            {user?.nama_lengkap}
                        </span>
                        <span className={`role-badge role-${role}`}>
                            {roleLabels[role] || role}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    className="nav-logout-btn"
                    onClick={openLogoutModal}
                    title="Logout"
                    aria-label="Logout"
                >
                    <FiLogOut />
                </button>
            </div>
        );
    };

    return (
        <>
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="navbar-top">
                    <div className="logo" onClick={() => handleNavigation('/')}>
                        <div className="logo-icon-wrapper">
                            <div className="logo-icon">
                                <img
                                    src={logoToko}
                                    alt="RajutIndah"
                                    className="logo-icon-img"
                                />
                            </div>
                            <div className="logo-ring"></div>
                            <div className="logo-ring"></div>
                        </div>
                        <div className="logo-text">
                            <span className="name">RajutIndah</span>
                            <span className="subtitle">Toko Online</span>
                        </div>
                    </div>

                    {!isMobile && renderSearchBar()}

                    {!isMobile && (
                        <div className="user-actions-wrapper">
                            {renderUserActions()}
                        </div>
                    )}

                    {isMobile && (
                        <button
                            className={`menu-toggle ${menuOpen ? 'open' : ''}`}
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Toggle menu"
                        >
                            {menuOpen ? <FiX /> : <FiMenu />}
                        </button>
                    )}
                </div>

                <div className={`navbar-bottom ${menuOpen ? 'open' : ''}`}>
                    <ul className="nav-menu">
                        {isMobile && (
                            <li className="mobile-search">
                                <form onSubmit={handleSearch} className="search-form-mobile">
                                    <input
                                        type="text"
                                        placeholder={getPlaceholder()}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="search-input-mobile"
                                    />
                                    <button type="submit" className="search-btn-mobile">
                                        <FiSearch />
                                    </button>
                                </form>
                            </li>
                        )}

                        {menuItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <li key={index}>
                                    <button
                                        className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                                        onClick={() => handleNavigation(item.path)}
                                    >
                                        <Icon className="nav-icon" />
                                        {item.label}
                                    </button>
                                </li>
                            );
                        })}

                        {isMobile && (
                            <li className="user-actions-item">
                                {renderUserActions()}
                            </li>
                        )}
                    </ul>
                </div>
            </nav>

            {showLogoutModal && (
                <div className="logout-modal-overlay" onClick={closeLogoutModal}>
                    <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="logout-modal-icon">
                            <FiLogOut />
                        </div>
                        <h3 className="logout-modal-title">Konfirmasi Logout</h3>
                        <p className="logout-modal-message">
                            Yakin mau logout dari akun <strong>{user?.nama_lengkap}</strong>?
                        </p>
                        <div className="logout-modal-actions">
                            <button
                                type="button"
                                className="logout-modal-btn cancel"
                                onClick={closeLogoutModal}
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                className="logout-modal-btn confirm"
                                onClick={confirmLogout}
                            >
                                <FiLogOut /> Ya, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;