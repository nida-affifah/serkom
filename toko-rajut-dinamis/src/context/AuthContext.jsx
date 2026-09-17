// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            fetchUserProfile();
        } else {
            setLoading(false);
        }
    }, [token]);

    // FETCH PROFILE
    const fetchUserProfile = async () => {
        try {
            const response = await authAPI.me();
            const userData = response.data.data;

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            console.error('Gagal fetch profile:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // LOGIN (pakai username)
    const login = async (username, password) => {
        try {
            const response = await authAPI.login({ username, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setToken(token);
            setUser(user);

            // Redirect berdasarkan role
            if (user.role === 'admin' || user.role === 'staff_gudang' || user.role === 'kasir' || user.role === 'perajin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/toko');
            }

            return { success: true, user };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: error.message || 'Terjadi kesalahan' };
        }
    };

    // REGISTER (tidak langsung login)
    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            return {
                success: true,
                message: response.data.pesan || 'Registrasi berhasil, silakan login',
                perluLogin: true
            };
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, message: error.message || 'Terjadi kesalahan' };
        }
    };

    // LOGOUT
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        navigate('/login');
    };

    // ═══════════════════════════════════════
    // ROLE CHECKS
    // ═══════════════════════════════════════
    const isAdmin = user?.role === 'admin';
    const isStaffGudang = user?.role === 'staff_gudang';
    const isKasir = user?.role === 'kasir';
    const isPerajin = user?.role === 'perajin';
    const isCustomer = user?.role === 'pembeli';

    // Gabungan (untuk kompatibilitas kode lama)
    const isStaff = isStaffGudang || isKasir;
    const isPegawai = isAdmin || isStaffGudang || isKasir || isPerajin;

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            token,
            login,
            register,
            logout,
            isAuthenticated: !!user,
            // Role individual
            isAdmin,
            isStaffGudang,
            isKasir,
            isPerajin,
            isCustomer,
            // Role gabungan
            isStaff,
            isPegawai,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};