// src/App.jsx
import React, { useEffect } from 'react';
// import routing dari react-router
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
// import komponen Navbar dan Footer
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
// import semua halaman
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';
import EducationPage from './pages/EducationPage';
import ExperiencePage from './pages/ExperiencePage';
import SkillsPage from './pages/SkillsPage';
import ProjectsPage from './pages/ProjectsPage';
import CertificatesPage from './pages/CertificatesPage';
import ActivitiesPage from './pages/ActivitiesPage';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

// komponen buat scroll ke atas tiap ganti halaman
function ScrollToTop() {
    // ambil pathname sekarang
    const { pathname } = useLocation();

    // tiap pathname berubah, scroll ke atas
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [pathname]);

    return null;
}

function App() {
    return (
        <>
            {/* scroll ke atas otomatis */}
            <ScrollToTop />
            {/* navbar di atas */}
            <Navbar />
            <main className="main-content">
                {/* routing halaman */}
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/education" element={<EducationPage />} />
                    <Route path="/experience" element={<ExperiencePage />} />
                    <Route path="/skills" element={<SkillsPage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/certificates" element={<CertificatesPage />} />
                    <Route path="/activities" element={<ActivitiesPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    {/* route dinamis, :id dipakai buat detail blog */}
                    <Route path="/blog/:id" element={<BlogDetailPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    {/* catch-all, kalau path tidak ada tampilkan 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </main>
            {/* footer di bawah */}
            <Footer />
        </>
    );
}

export default App;