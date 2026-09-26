// src/pages/BlogDetailPage.jsx
import React from 'react';
// useParams buat ambil id dari URL, useNavigate buat pindah halaman
import { useParams, Link, useNavigate } from 'react-router-dom';
// import icon
import { FiArrowLeft, FiCalendar, FiTag, FiClock } from 'react-icons/fi';
// ambil data user
import { userData } from '../data/userData';
import './BlogDetailPage.css';

const BlogDetailPage = () => {
    // ambil id dari URL, misalnya /blog/mengenal-ai-untuk-pemula
    const { id } = useParams();
    const navigate = useNavigate();
    const { blog } = userData;

    // gabungkan semua artikel dari semua kategori jadi satu array
    const allPosts = Object.values(blog).flatMap((category) => category.items);
    // cari artikel yang id-nya sama dengan id di URL
    const post = allPosts.find((p) => p.id === id);

    // fungsi buat format tanggal jadi bahasa Indonesia
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // fungsi buat hitung estimasi waktu baca
    // 200 kata dianggap 1 menit
    const estimateReadTime = (content) => {
        if (!content) return 1;
        // hapus tag HTML dulu, baru hitung jumlah katanya
        const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        return Math.max(1, Math.ceil(words / 200));
    };

    // kalau artikel tidak ditemukan, tampilkan pesan
    if (!post) {
        return (
            <div className="blog-detail-page">
                <div className="container">
                    <div className="not-found">
                        <h1>Artikel tidak ditemukan</h1>
                        <p>Maaf, artikel yang kamu cari tidak tersedia.</p>
                        <button
                            onClick={() => navigate('/blog')}
                            className="btn btn-primary"
                        >
                            <FiArrowLeft /> Kembali ke Blog
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ambil 2 artikel lain buat rekomendasi
    const relatedPosts = allPosts.filter((p) => p.id !== id).slice(0, 2);

    return (
        <div className="blog-detail-page">
            <div className="container">
                {/* tombol kembali ke blog */}
                <Link to="/blog" className="back-link">
                    <FiArrowLeft /> Kembali ke Blog
                </Link>

                {/* header artikel */}
                <header className="article-header">
                    {/* tampilkan kategori kalau ada */}
                    {post.category && (
                        <span className="article-category">
                            <FiTag /> {post.category}
                        </span>
                    )}
                    <h1 className="article-title">{post.title}</h1>
                    <div className="article-meta">
                        <span className="meta-item">
                            <FiCalendar /> {formatDate(post.date)}
                        </span>
                        <span className="meta-item">
                            <FiClock /> {estimateReadTime(post.content)} menit baca
                        </span>
                    </div>
                </header>

                {/* isi artikel */}
                {/* pakai dangerouslySetInnerHTML karena content-nya HTML string */}
                <article
                    className="article-content"
                    dangerouslySetInnerHTML={{
                        __html: post.content || '<p>Isi artikel belum tersedia.</p>'
                    }}
                />

                {/* artikel lainnya */}
                {relatedPosts.length > 0 && (
                    <section className="related-section">
                        <h2 className="related-title">Artikel Lainnya</h2>
                        <div className="related-grid">
                            {relatedPosts.map((rp) => (
                                <Link
                                    key={rp.id}
                                    to={`/blog/${rp.id}`}
                                    className="related-card"
                                >
                                    <div className="related-date">
                                        <FiCalendar /> {formatDate(rp.date)}
                                    </div>
                                    <h3 className="related-post-title">{rp.title}</h3>
                                    <p className="related-excerpt">{rp.excerpt}</p>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default BlogDetailPage;