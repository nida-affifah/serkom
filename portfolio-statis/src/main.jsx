// src/main.jsx

// import StrictMode dari react
import { StrictMode } from 'react'
// import createRoot dari react-dom
import { createRoot } from 'react-dom/client'
// import BrowserRouter dari react-router-dom
import { BrowserRouter } from 'react-router-dom'
// import css global
import './index.css'
// import komponen App
import App from './App.jsx'

// render aplikasi ke elemen dengan id "root"
createRoot(document.getElementById('root')).render(
  // StrictMode buat deteksi masalah di kode
  <StrictMode>
    {/* BrowserRouter buat routing halaman */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)