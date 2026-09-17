// src/pages/BlogDetailPage.jsx
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiTag, FiClock } from 'react-icons/fi';
import { userData } from '../data/userData';
import './BlogDetailPage.css';

const BlogDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { blog } = userData;

    const allPosts = Object.values(blog).flatMap((category) => category.items);
    const post = allPosts.find((p) => p.id === id);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const estimateReadTime = (content) => {
        if (!content) return 1;
        const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        return Math.max(1, Math.ceil(words / 200));
    };

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

    const relatedPosts = allPosts.filter((p) => p.id !== id).slice(0, 2);

    return (
        <div className="blog-detail-page">
            <div className="container">
                <Link to="/blog" className="back-link">
                    <FiArrowLeft /> Kembali ke Blog
                </Link>

                <header className="article-header">
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

                <article
                    className="article-content"
                    dangerouslySetInnerHTML={{
                        __html: post.content || '<p>Isi artikel belum tersedia.</p>'
                    }}
                />

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