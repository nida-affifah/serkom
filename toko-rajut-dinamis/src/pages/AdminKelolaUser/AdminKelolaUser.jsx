// src/pages/AdminKelolaUser/AdminKelolaUser.jsx
import React, { useEffect, useState } from 'react';
import {
    FiPlus, FiEdit2, FiTrash2, FiSearch, FiRefreshCw, FiX,
    FiUser, FiLock, FiCheck
} from 'react-icons/fi';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './AdminKelolaUser.css';

const ROLE_OPTIONS = [
    { value: 'pembeli',      label: 'Pembeli',      color: 'blue' },
    { value: 'perajin',      label: 'Perajin',      color: 'pink' },
    { value: 'staff_gudang', label: 'Staff Gudang', color: 'orange' },
    { value: 'kasir',        label: 'Kasir',        color: 'green' },
    { value: 'admin',        label: 'Admin',        color: 'purple' }
];

const FORM_KOSONG = {
    username: '',
    nama_lengkap: '',
    email: '',
    no_hp: '',
    role: 'pembeli',
    password: '',
    status: 'aktif'
};

const AdminKelolaUser = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('semua');
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(FORM_KOSONG);
    const [submitting, setSubmitting] = useState(false);
    const [adminExists, setAdminExists] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await authAPI.getAllUsers();
            const data = res.data.data || [];
            setUsers(data);
            setAdminExists(data.some(u => u.role === 'admin' && u.status === 'aktif'));
        } catch (err) {
            console.error(err);
            alert('Gagal memuat user: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTambah = () => {
        setEditId(null);
        setForm(FORM_KOSONG);
        setModalOpen(true);
    };

    const handleEdit = (u) => {
        setEditId(u.id);
        setForm({
            username: u.username || '',
            nama_lengkap: u.nama_lengkap || '',
            email: u.email || '',
            no_hp: u.no_hp || '',
            role: u.role || 'pembeli',
            password: '',
            status: u.status || 'aktif'
        });
        setModalOpen(true);
    };

    const handleHapus = async (u) => {
        if (u.role === 'admin') {
            alert('Tidak bisa menghapus akun admin');
            return;
        }
        if (u.id === currentUser?.id) {
            alert('Tidak bisa menghapus akun sendiri');
            return;
        }
        if (!window.confirm(`Hapus user "${u.nama_lengkap}" (${u.username})?`)) return;

        try {
            await authAPI.deleteUser(u.id);
            alert('User dihapus');
            fetchUsers();
        } catch (err) {
            alert('Gagal hapus: ' + err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasi
        if (!form.username || !form.nama_lengkap || !form.email) {
            alert('Username, nama, dan email wajib diisi');
            return;
        }
        if (!editId && !form.password) {
            alert('Password wajib diisi untuk user baru');
            return;
        }
        if (form.password && form.password.length < 6) {
            alert('Password minimal 6 karakter');
            return;
        }

        setSubmitting(true);
        try {
            if (editId) {
                // Update user
                await authAPI.updateUser(editId, {
                    nama_lengkap: form.nama_lengkap,
                    email: form.email,
                    no_hp: form.no_hp,
                    role: form.role,
                    status: form.status
                });
                alert('User diupdate');
            } else {
                // Tambah user baru
                await authAPI.tambahUser({
                    username: form.username,
                    nama_lengkap: form.nama_lengkap,
                    email: form.email,
                    no_hp: form.no_hp,
                    role: form.role,
                    password: form.password
                });
                alert(`User dengan role "${form.role}" berhasil dibuat`);
            }
            setModalOpen(false);
            fetchUsers();
        } catch (err) {
            alert('Gagal simpan: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const usersFiltered = users.filter(u => {
        const matchSearch = !search ||
            u.username?.toLowerCase().includes(search.toLowerCase()) ||
            u.nama_lengkap?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase());

        const matchRole = filterRole === 'semua' || u.role === filterRole;

        return matchSearch && matchRole;
    });

    const getRoleLabel = (role) => {
        const opt = ROLE_OPTIONS.find(o => o.value === role);
        return opt?.label || role;
    };

    const getRoleColor = (role) => {
        const opt = ROLE_OPTIONS.find(o => o.value === role);
        return opt?.color || 'blue';
    };

    const countByRole = (role) => {
        if (role === 'semua') return users.length;
        return users.filter(u => u.role === role).length;
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-container">
                    <div className="admin-loading">Memuat user...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-container">
                {/* HEADER */}
                <div className="admin-header">
                    <div className="admin-badge">Admin</div>
                    <div className="admin-header-row">
                        <div>
                            <h1 className="admin-title">Kelola User</h1>
                            <p className="admin-subtitle">Daftar semua user di toko RajutIndah</p>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="admin-refresh" onClick={fetchUsers}>
                                <FiRefreshCw /> Refresh
                            </button>
                            <button className="admin-btn-primary" onClick={handleTambah}>
                                <FiPlus /> Tambah User
                            </button>
                        </div>
                    </div>
                </div>

                {/* INFO ADMIN */}
                <div className="info-box">
                    <FiLock />
                    <span>
                        <strong>Info:</strong> Hanya boleh ada <strong>1 akun admin</strong>.
                        Untuk membuat user baru (perajin, kasir, staff, pembeli), gunakan tombol "Tambah User".
                    </span>
                </div>

                {/* SEARCH */}
                <div className="admin-search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Cari user (username / nama / email)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* FILTER ROLE */}
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filterRole === 'semua' ? 'active' : ''}`}
                        onClick={() => setFilterRole('semua')}
                    >
                        Semua ({countByRole('semua')})
                    </button>
                    {ROLE_OPTIONS.map(r => (
                        <button
                            key={r.value}
                            className={`filter-tab ${filterRole === r.value ? 'active' : ''}`}
                            onClick={() => setFilterRole(r.value)}
                        >
                            {r.label} ({countByRole(r.value)})
                        </button>
                    ))}
                </div>

                {/* TABEL */}
                <div className="admin-card">
                    {usersFiltered.length === 0 ? (
                        <p className="admin-empty">Tidak ada user.</p>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Nama Lengkap</th>
                                    <th>Email</th>
                                    <th>No HP</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersFiltered.map(u => (
                                    <tr key={u.id}>
                                        <td><strong>#{u.id}</strong></td>
                                        <td>{u.username}</td>
                                        <td>{u.nama_lengkap}</td>
                                        <td>{u.email}</td>
                                        <td>{u.no_hp || '-'}</td>
                                        <td>
                                            <span className={`role-badge role-${getRoleColor(u.role)}`}>
                                                {getRoleLabel(u.role)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${u.status === 'aktif' ? 'badge-selesai' : 'badge-batal'}`}>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            {u.role === 'admin' ? (
                                                <span className="text-muted">—</span>
                                            ) : (
                                                <>
                                                    <button
                                                        className="admin-icon-btn edit"
                                                        onClick={() => handleEdit(u)}
                                                        title="Edit"
                                                    >
                                                        <FiEdit2 />
                                                    </button>
                                                    <button
                                                        className="admin-icon-btn delete"
                                                        onClick={() => handleHapus(u)}
                                                        title="Hapus"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* MODAL FORM */}
            {modalOpen && (
                <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>{editId ? 'Edit User' : 'Tambah User Baru'}</h2>
                            <button className="admin-modal-close" onClick={() => setModalOpen(false)}>
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="admin-modal-body">
                            <div className="admin-form-group">
                                <label>Username *</label>
                                <input
                                    type="text"
                                    value={form.username}
                                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                                    placeholder="Contoh: perajin3"
                                    required
                                    disabled={!!editId}
                                />
                                {editId && (
                                    <small className="form-hint">Username tidak bisa diubah</small>
                                )}
                            </div>

                            <div className="admin-form-group">
                                <label>Nama Lengkap *</label>
                                <input
                                    type="text"
                                    value={form.nama_lengkap}
                                    onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })}
                                    placeholder="Contoh: Bu Ani"
                                    required
                                />
                            </div>

                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        placeholder="user@mail.com"
                                        required
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label>No HP</label>
                                    <input
                                        type="text"
                                        value={form.no_hp}
                                        onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
                                        placeholder="08123456789"
                                    />
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label>Role *</label>
                                <select
                                    value={form.role}
                                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                                    required
                                >
                                    {ROLE_OPTIONS.map(r => (
                                        <option
                                            key={r.value}
                                            value={r.value}
                                            disabled={r.value === 'admin' && adminExists && form.role !== 'admin'}
                                        >
                                            {r.label}
                                            {r.value === 'admin' && adminExists ? ' (sudah ada)' : ''}
                                        </option>
                                    ))}
                                </select>
                                {form.role === 'admin' && adminExists && (
                                    <small className="form-hint error">
                                        Admin sudah ada, tidak bisa tambah admin baru
                                    </small>
                                )}
                            </div>

                            {!editId && (
                                <div className="admin-form-group">
                                    <label>Password *</label>
                                    <input
                                        type="password"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        placeholder="Minimal 6 karakter"
                                        required
                                    />
                                </div>
                            )}

                            {editId && (
                                <div className="admin-form-group">
                                    <label>Status</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    >
                                        <option value="aktif">Aktif</option>
                                        <option value="nonaktif">Nonaktif</option>
                                    </select>
                                </div>
                            )}

                            <div className="admin-modal-actions">
                                <button
                                    type="button"
                                    className="admin-btn-cancel"
                                    onClick={() => setModalOpen(false)}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="admin-btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Menyimpan...' : (editId ? 'Update' : 'Simpan')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminKelolaUser;