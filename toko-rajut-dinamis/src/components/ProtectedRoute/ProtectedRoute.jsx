// src/components/ProtectedRoute/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allow }) => {
    const { user, loading, isAuthenticated } = useAuth();

    // Kalau masih loading, tampilkan loading
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: '#f5f3ff',
                fontFamily: 'Inter, sans-serif'
            }}>
                <p style={{ fontWeight: 800, color: '#6b7280' }}>Memuat...</p>
            </div>
        );
    }

    // Kalau belum login → redirect ke login (TANPA alert)
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Kalau role tidak diizinkan → redirect ke beranda (TANPA alert)
    if (allow && !allow.includes(user?.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;