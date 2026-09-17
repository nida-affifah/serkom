// src/context/CartContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { keranjangAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [cartTotal, setCartTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    // Hitung ulang cartCount & cartTotal dari cart
    const hitungUlang = (items) => {
        const count = items.reduce((sum, item) => sum + Number(item.jumlah || 0), 0);
        const total = items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
        setCartCount(count);
        setCartTotal(total);
    };

    // Fetch keranjang dari backend
    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) {
            setCart([]);
            setCartCount(0);
            setCartTotal(0);
            return;
        }

        try {
            setLoading(true);
            const response = await keranjangAPI.getAll();
            const items = response.data.data || [];
            setCart(items);
            hitungUlang(items);
        } catch (error) {
            console.error('Gagal memuat keranjang:', error);
            setCart([]);
            setCartCount(0);
            setCartTotal(0);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Auto-fetch saat login/logout
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // ═══════════════════════════════════════
    // Tambah produk ke keranjang
    // Return { success, message }
    // ═══════════════════════════════════════
    const tambahKeKeranjang = async (produkId, jumlah = 1) => {
        if (!isAuthenticated) {
            return { success: false, message: 'Anda harus login terlebih dahulu' };
        }

        try {
            setLoading(true);
            const response = await keranjangAPI.tambah({
                produk_id: produkId,
                jumlah
            });
            const items = response.data.data || [];
            setCart(items);
            hitungUlang(items);
            return { success: true, message: response.data.pesan };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    };

    // Update jumlah item di keranjang
    const updateJumlah = async (itemId, jumlah) => {
        try {
            setLoading(true);
            const response = await keranjangAPI.updateJumlah(itemId, { jumlah });
            const items = response.data.data || [];
            setCart(items);
            hitungUlang(items);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    };

    // Hapus item dari keranjang
    const hapusItem = async (itemId) => {
        try {
            setLoading(true);
            const response = await keranjangAPI.hapus(itemId);
            const items = response.data.data || [];
            setCart(items);
            hitungUlang(items);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    };

    // Kosongkan keranjang
    const kosongkanKeranjang = async () => {
        try {
            setLoading(true);
            await keranjangAPI.kosongkan();
            setCart([]);
            setCartCount(0);
            setCartTotal(0);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    };

    return (
        <CartContext.Provider value={{
            cart,
            cartCount,
            cartTotal,
            loading,
            fetchCart,
            tambahKeKeranjang,
            updateJumlah,
            hapusItem,
            kosongkanKeranjang,
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart harus dipakai di dalam CartProvider');
    }
    return context;
};