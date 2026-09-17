// src/data/userData.js — Pusat data portfolio
export const userData = {
    header: {
        logo: '/src/assets/images/nida.jpeg',
        name: 'Nida Affifah',
        nickname: 'Nida',
        navMenu: [
            { label: 'Beranda', href: '#hero' },
            { label: 'Tentang', href: '#about' },
            { label: 'Profesional', href: '#professional' },
            { label: 'Pendidikan', href: '#education' },
            { label: 'Pengalaman', href: '#experience' },
            { label: 'Keahlian', href: '#skills' },
            { label: 'Karya', href: '#projects' },
            { label: 'Sertifikat', href: '#certificates' },
            { label: 'Kegiatan', href: '#activities' },
            { label: 'Blog', href: '#blog' },
            { label: 'Kontak', href: '#contact' }
        ]
    },

    hero: {
        fullName: 'Nida Affifah',
        profession: 'Web Developer & Siswa RPL',
        tagline: 'Mengubah ide menjadi kode, dan mimpi menjadi karya nyata.',
        photo: '/src/assets/images/nida.jpeg',
        contactButton: {
            label: 'Hubungi Saya',
            href: '#contact'
        },
        secondaryButton: {
            label: 'Lihat Karya',
            href: '#projects'
        }
    },

    about: {
        shortBio: {
            title: 'Biodata Singkat',
            items: [
                { label: 'Nama Lengkap', value: 'Nida Affifah' },
                { label: 'Nama Panggilan', value: 'Nida' },
                { label: 'Tempat, Tanggal Lahir', value: 'Ponorogo, 5 Mei 2007' },
                { label: 'Jenis Kelamin', value: 'Perempuan' },
                { label: 'Agama', value: 'Islam' },
                { label: 'Alamat', value: 'Ngebel, Ponorogo, Jawa Timur' },
                { label: 'Status', value: 'Pelajar' },
                { label: 'Sekolah', value: 'SMKN 1 Jenangan Ponorogo' },
                { label: 'Kelas', value: 'XII RPL C' },
                { label: 'Jurusan', value: 'Rekayasa Perangkat Lunak (RPL)' },
                { label: 'Email', value: 'nidaffifah5@gmail.com' },
                { label: 'No. WhatsApp', value: '0857-3339-5626' },
                { label: 'Instagram', value: '@ndaffh_' },
                { label: 'Hobi', value: 'Coding, Menari, Membaca' },
                { label: 'Cita-cita', value: 'Menjadi Web Developer Profesional' }
            ]
        },
        expertise: {
            title: 'Bidang Keahlian',
            description: 'Beberapa bidang yang saya tekuni dan kuasai, baik di dunia teknologi maupun seni.',
            fields: [
                { name: 'Web Development', level: 80, description: 'Membangun website modern menggunakan HTML, CSS, JavaScript, dan framework seperti React JS.' },
                { name: 'Frontend Development', level: 78, description: 'Mendesain antarmuka pengguna yang responsif, interaktif, dan ramah pengguna.' },
                { name: 'Backend Development', level: 65, description: 'Membuat API dan logika server menggunakan Node.js, Express, dan database SQL/NoSQL.' },
                { name: 'Artificial Intelligence (AI)', level: 65, description: 'Mempelajari dasar kecerdasan artifisial dan penerapannya dalam proyek sederhana.' },
                { name: 'Database Management', level: 70, description: 'Merancang dan mengelola database menggunakan MySQL, PostgreSQL, dan MongoDB.' },
                { name: 'Matematika', level: 80, description: 'Menguasai konsep matematika yang mendukung logika pemrograman dan algoritma.' },
                { name: 'Seni Tari', level: 90, description: 'Aktif dalam ekstrakurikuler tari dan pernah tampil di Festival Reog Nasional.' },
                { name: 'Public Speaking', level: 75, description: 'Terlatih berbicara di depan umum melalui les public speaking dan presentasi proyek.' }
            ]
        },
        principles: {
            title: 'Prinsip & Visi Pribadi',
            motto: 'Belajar hari ini, berkarya untuk masa depan.',
            vision: 'Menjadi developer yang tidak hanya menulis kode, tetapi juga menciptakan solusi nyata yang bermanfaat bagi banyak orang. Terus belajar, terus berkarya, dan berbagi ilmu kepada sesama.',
            mission: [
                'Menguasai teknologi web modern secara mendalam.',
                'Membangun proyek nyata yang solutif dan bermanfaat.',
                'Aktif berbagi ilmu melalui blog dan komunitas.',
                'Menjaga keseimbangan antara teknologi, akademik, dan seni.',
                'Menjadi pribadi yang disiplin, jujur, dan bertanggung jawab.'
            ],
            values: [
                { name: 'Konsistensi', description: 'Belajar dan berkembang setiap hari, sekecil apa pun progresnya.' },
                { name: 'Integritas', description: 'Jujur dan bertanggung jawab dalam setiap pekerjaan.' },
                { name: 'Kolaborasi', description: 'Terbuka bekerja sama dan berbagi ilmu dengan orang lain.' },
                { name: 'Kreativitas', description: 'Selalu mencari cara baru dan inovatif dalam berkarya.' },
                { name: 'Pembelajar Seumur Hidup', description: 'Tidak pernah berhenti belajar dari mana pun dan kapan pun.' }
            ]
        }
    },

    professional: {
        position: 'Siswa XII RPL C',
        institution: 'SMKN 1 Jenangan Ponorogo',
        field: 'Rekayasa Perangkat Lunak (RPL)',
        focus: ['Web Development', 'JavaScript', 'Matematika', 'Seni Tari']
    },

    education: [
        { year: '2024 - Sekarang', school: 'SMKN 1 Jenangan Ponorogo', major: 'Rekayasa Perangkat Lunak (RPL)', description: 'Fokus pada pengembangan web dan aplikasi modern.' },
        { year: '2021 - 2024', school: 'SMPN 1 Ngebel', major: '-', description: 'Aktif dalam kegiatan akademik dan ekstrakurikuler.' },
        { year: '2016 - 2021', school: 'SDN 1 Ngebel', major: '-', description: 'Menempuh pendidikan dasar dengan prestasi baik.' },
        { year: '2014 - 2016', school: 'TK PGRI Ngebel', major: '-', description: 'Pendidikan anak usia dini.' }
    ],

    experience: {
        learning: {
            title: 'Pengalaman Belajar',
            items: [
                { year: '2025', title: 'Les Public Speaking', place: 'Ponorogo', description: 'Mengikuti les public speaking untuk melatih kemampuan berbicara di depan umum, presentasi, dan membangun kepercayaan diri.' },
                { year: '2026', title: 'Kunjungan Industri ke Game Lab Indonesia', place: 'Jawa Tengah', description: 'Mengikuti kunjungan industri ke Game Lab Indonesia di Jawa Tengah untuk mengenal langsung dunia industri game dan teknologi.' },
                { year: '2025/2026', title: 'RPL Connect (2 Kali)', place: 'SMKN 1 Jenangan Ponorogo', description: 'Mengikuti acara RPL Connect sebanyak 2 kali, kegiatan yang mendatangkan alumni RPL yang sudah sukses untuk berbagi pengalaman, ilmu, dan motivasi.' },
                { year: '2024 - Sekarang', title: 'Belajar Otodidak di Rumah', place: 'Rumah', description: 'Belajar mandiri melalui internet, tutorial online, dan dokumentasi untuk memperdalam JavaScript, React JS, dan pengembangan web.' },
                { year: '2024 - Sekarang', title: 'Belajar di Sekolah', place: 'SMKN 1 Jenangan Ponorogo', description: 'Menempuh pendidikan Rekayasa Perangkat Lunak (RPL) dengan fokus pada pemrograman, pengembangan web, dan dasar-dasar teknologi informasi.' }
            ]
        },
        working: {
            title: 'Pengalaman Bekerja',
            items: [
                { year: '2026', title: 'PKL di RSU Aisyiyah Ponorogo', place: 'RSU Aisyiyah Ponorogo', description: 'Melaksanakan Praktik Kerja Lapangan di rumah sakit, terlibat dalam pengelolaan data dan administrasi berbasis teknologi informasi.' },
                { year: '2014 - Sekarang', title: 'Wirausaha / Berdagang', place: 'Ngebel', description: 'Menekuni dunia wirausaha sejak kelas 2 SD hingga sekarang, melatih kemandirian, komunikasi, manajemen keuangan, dan jiwa entrepreneurship.' }
            ]
        },
        organization: {
            title: 'Pengalaman Organisasi',
            items: [
                { year: '2025 - 2026', title: 'Bendahara Ekstrakurikuler Seni Tari', place: 'SMKN 1 Jenangan Ponorogo', description: 'Menjabat sebagai bendahara, mengelola keuangan, dan membantu koordinasi kegiatan ekstrakurikuler tari.' },
                { year: '2024 - 2026', title: 'Anggota Ekstrakurikuler Seni Tari', place: 'SMKN 1 Jenangan Ponorogo', description: 'Aktif dalam latihan rutin dan tampil di berbagai acara sekolah serta Festival Reog Nasional.' }
            ]
        },
        projects: {
            title: 'Pengalaman Proyek',
            items: [
                { year: '2026', title: 'Profil Pribadi', place: 'SMKN 1 Jenangan Ponorogo', description: 'Membuat website portfolio pribadi menggunakan React JS.' },
                { year: '2026', title: 'Website Toko Rajut Indah', place: 'SMKN 1 Jenangan Ponorogo', description: 'Membangun e-commerce rajut dengan React + Express + PostgreSQL.' },
                { year: '2026', title: 'SIM Klinik', place: 'SMKN 1 Jenangan Ponorogo', description: 'Membangun sistem informasi manajemen klinik berbasis web.' },
                { year: '2026', title: 'Form KTP Digital', place: 'SMKN 1 Jenangan Ponorogo', description: 'Aplikasi formulir pendaftaran KTP online dengan validasi data.' },
                { year: '2026', title: 'Toko Elektronik', place: 'SMKN 1 Jenangan Ponorogo', description: 'Platform jual beli produk elektronik dengan fitur katalog dan keranjang.' }
            ]
        }
    },

    skills: [
        { name: 'JavaScript', level: 75, category: 'Coding' },
        { name: 'HTML & CSS', level: 85, category: 'Coding' },
        { name: 'React JS', level: 70, category: 'Coding' },
        { name: 'Node.js', level: 65, category: 'Coding' },
        { name: 'Python', level: 70, category: 'Coding' },
        { name: 'Database (SQL)', level: 70, category: 'Coding' },
        { name: 'AI (Artificial Intelligence)', level: 65, category: 'AI' },
        { name: 'KKA (Kecerdasan Artifisial)', level: 60, category: 'AI' },
        { name: 'Web Development', level: 80, category: 'Web' },
        { name: 'Matematika', level: 80, category: 'Akademik' },
        { name: 'Seni Tari', level: 90, category: 'Seni' }
    ],

    projects: {
        websites: {
            title: 'Website',
            items: [
                { title: 'Website Toko Rajut Indah', type: 'Web E-commerce', description: 'Toko online produk rajut dengan fitur cart, checkout, admin dashboard, dan manajemen stok.', tech: ['React', 'Express', 'PostgreSQL'], image: 'https://via.placeholder.com/400x250/8b5cf6/ffffff?text=Toko+Rajut', link: '#' },
                { title: 'Website Portfolio Pribadi', type: 'Web Portfolio', description: 'Website portfolio pribadi dengan 12 halaman dan desain modern, dibangun menggunakan React + Vite.', tech: ['React', 'Vite', 'CSS'], image: 'https://via.placeholder.com/400x250/6366f1/ffffff?text=Portfolio', link: '#' },
                { title: 'Toko Elektronik', type: 'Web E-commerce', description: 'Platform jual beli produk elektronik dengan fitur katalog, keranjang, dan pembayaran.', tech: ['React', 'Express', 'MongoDB'], image: 'https://via.placeholder.com/400x250/ec4899/ffffff?text=Toko+Elektronik', link: '#' }
            ]
        },
        applications: {
            title: 'Aplikasi',
            items: [
                { title: 'SIM Klinik', type: 'Sistem Informasi', description: 'Sistem Informasi Manajemen Klinik untuk pendaftaran pasien, rekam medis, dan jadwal dokter.', tech: ['React', 'Node.js', 'MySQL'], image: 'sim-klinik.png', link: '#' },
                { title: 'Form KTP Digital', type: 'Aplikasi Web', description: 'Aplikasi formulir pendaftaran KTP online dengan validasi data dan preview kartu.', tech: ['HTML', 'CSS', 'JavaScript'], image: 'form-ktp.png', link: '#' }
            ]
        },
        modules: {
            title: 'Modul',
            items: [
                { title: 'Modul Belajar JavaScript dari Nol', type: 'Modul Pembelajaran', description: 'Modul ringkas berisi materi dasar JavaScript: variabel, tipe data, kondisi, perulangan, function, hingga tips untuk pemula.', tech: ['Markdown', 'HTML'], image: 'https://via.placeholder.com/400x250/3b82f6/ffffff?text=Modul+JS', link: '#belajar-javascript-dari-nol' },
                { title: 'Modul Mengenal AI untuk Pemula', type: 'Modul Pembelajaran', description: 'Modul pengenalan Artificial Intelligence: apa itu AI, contoh penerapan, cara kerja, dan langkah belajar AI dari nol.', tech: ['Markdown', 'HTML'], image: 'https://via.placeholder.com/400x250/8b5cf6/ffffff?text=Modul+AI', link: '#mengenal-ai-untuk-pemula' },
                { title: 'Modul Tips Sukses PKL di Bidang IT', type: 'Modul Pengalaman', description: 'Modul berisi 5 tips sukses menjalani PKL di bidang IT: aktif bertanya, disiplin waktu, catat ilmu, bangun relasi, dan jaga attitude.', tech: ['Markdown', 'HTML'], image: 'https://via.placeholder.com/400x250/f97316/ffffff?text=Modul+PKL', link: '#tips-sukses-pkl-bidang-it' }
            ]
        },
        learningMedia: {
            title: 'Media Pembelajaran',
            items: [
                { title: 'Media Presentasi Public Speaking', type: 'Media Ajar', description: 'Materi dan slide presentasi dari les public speaking tentang teknik berbicara di depan umum dan presentasi.', tech: ['HTML', 'CSS', 'Slide'], image: 'https://via.placeholder.com/400x250/14b8a6/ffffff?text=Media+Speaking', link: '#' },
                { title: 'Media Belajar Berbasis Blog', type: 'Media Ajar', description: 'Kumpulan artikel dan tutorial di blog pribadi sebagai media belajar bersama untuk topik web development dan AI.', tech: ['React', 'Markdown'], image: 'https://via.placeholder.com/400x250/22c55e/ffffff?text=Media+Blog', link: '#' }
            ]
        },
        projects: {
            title: 'Proyek',
            items: [
                { title: 'Proyek Profil Pribadi', type: 'Proyek Web', description: 'Proyek pembuatan website portfolio pribadi sebagai media personal branding dan dokumentasi karya.', tech: ['React', 'Vite', 'CSS'], image: 'https://via.placeholder.com/400x250/ef4444/ffffff?text=Proyek+Portfolio', link: '#' },
                { title: 'Proyek Business Matching Vokasi PKPLK', type: 'Proyek Kompetisi', description: 'Proyek karya vokasi yang diikutsertakan dalam Business Matching Gelar Karya Vokasi PKPLK tingkat nasional (daring).', tech: ['Presentasi', 'Business Plan'], image: 'https://via.placeholder.com/400x250/6366f1/ffffff?text=Proyek+PKPLK', link: '#' },
                { title: 'Proyek Festika Arek AI Jatim', type: 'Proyek Kompetisi', description: 'Proyek eksperimen AI yang diikutsertakan dalam kompetisi Festika Arek AI tingkat Jawa Timur (daring).', tech: ['Python', 'AI'], image: 'https://via.placeholder.com/400x250/8b5cf6/ffffff?text=Proyek+AI', link: '#' }
            ]
        }
    },

    certificates: [
        {
            year: '2025',
            title: 'Sertifikat Les Public Speaking',
            issuer: 'Ponorogo',
            type: 'Sertifikasi'
        }
    ],

    activities: {
        learningDocs: {
            title: 'Dokumentasi Kegiatan Belajar',
            items: [
                { year: '2024 - Sekarang', title: 'Belajar Otodidak di Rumah', type: 'Belajar Mandiri', place: 'Rumah', description: 'Dokumentasi kegiatan belajar mandiri: JavaScript, React JS, dan pengembangan web melalui tutorial online.' },
                { year: '2024 - Sekarang', title: 'Belajar di Sekolah (RPL)', type: 'Belajar Formal', place: 'SMKN 1 Jenangan Ponorogo', description: 'Dokumentasi kegiatan belajar di jurusan RPL: pemrograman, pengembangan web, dan dasar teknologi informasi.' },
                { year: '2025', title: 'Les Public Speaking', type: 'Belajar Non-Formal', place: 'Ponorogo', description: 'Dokumentasi kegiatan les public speaking: latihan berbicara di depan umum dan presentasi.' },
                { year: '2025', title: 'Kunjungan Industri ke Game Lab Indonesia', type: 'Kunjungan Industri', place: 'Jawa Tengah', description: 'Dokumentasi kunjungan industri ke Game Lab Indonesia di Jawa Tengah, mengenal proses produksi game, budaya kerja industri, dan peluang karier di bidang game development.' },
                { year: '2025', title: 'RPL Connect (2 Kali)', type: 'Acara Sekolah', place: 'SMKN 1 Jenangan Ponorogo', description: 'Dokumentasi keikutsertaan dalam acara RPL Connect sebanyak 2 kali, kegiatan yang mendatangkan alumni RPL yang sudah sukses untuk berbagi pengalaman, ilmu, dan motivasi.' }
            ]
        },
        workshops: {
            title: 'Workshop',
            items: [
                { year: '2025', title: 'Workshop Pengembangan Web', type: 'Workshop', place: 'SMKN 1 Jenangan Ponorogo', description: 'Mengikuti workshop pengembangan web: dasar HTML, CSS, JavaScript, dan framework modern.' },
                { year: '2025', title: 'Workshop Game Development di Game Lab Indonesia', type: 'Workshop', place: 'Jawa Tengah', description: 'Mengikuti sesi workshop dan sharing langsung dari praktisi Game Lab Indonesia di Jawa Tengah tentang dasar-dasar pengembangan game dan industri kreatif digital.' }
            ]
        },
        seminars: {
            title: 'Seminar & Sharing',
            items: [
                { year: '2025', title: 'RPL Connect (2 Kali)', type: 'Sharing Alumni', place: 'SMKN 1 Jenangan Ponorogo', description: 'Mengikuti sesi sharing bersama alumni RPL yang sudah sukses, berbagi pengalaman, ilmu, dan motivasi kepada siswa RPL.' },
                { year: '2025', title: 'Sesi Sharing Kunjungan Industri Game Lab Indonesia', type: 'Sharing Praktisi', place: 'Jawa Tengah', description: 'Mengikuti sesi sharing dari praktisi Game Lab Indonesia tentang dunia industri game, teknologi, dan peluang karier.' }
            ]
        },
        projects: {
            title: 'Proyek',
            items: [
                { year: '2025', title: 'Lomba Festival Reog Nasional', type: 'Kompetisi', place: 'Ponorogo', description: 'Ikut serta dalam Festival Reog tingkat nasional di Ponorogo sebagai bagian dari dokumentasi proyek seni tari.' },
                { year: '2025', title: 'Lomba Festika Arek AI Jatim', type: 'Kompetisi', place: 'Daring', description: 'Kompetisi AI tingkat Jawa Timur yang diselenggarakan secara online sebagai dokumentasi proyek AI.' },
                { year: '2025', title: 'Business Matching Gelar Karya Vokasi PKPLK', type: 'Kompetisi', place: 'Daring', description: 'Ikut serta dalam business matching karya vokasi PKPLK secara online sebagai dokumentasi proyek vokasi.' }
            ]
        }
    },

    blog: {
        writings: {
            title: 'Tulisan',
            items: [
                {
                    id: 'mengenal-ai-untuk-pemula',
                    date: '2025-06-10',
                    title: 'Mengenal AI untuk Pemula',
                    excerpt: 'Pengenalan dasar tentang Artificial Intelligence dan penerapannya di kehidupan sehari-hari.',
                    category: 'Tulisan',
                    content: `
                        <p>AI (Artificial Intelligence) atau Kecerdasan Buatan adalah teknologi yang sedang naik daun. Yuk kita kenalan!</p>

                        <h2>Apa itu AI?</h2>
                        <p>AI adalah kemampuan komputer untuk meniru kecerdasan manusia, seperti belajar, berpikir, dan mengambil keputusan.</p>

                        <h2>Contoh AI di Sekitar Kita</h2>
                        <ul>
                            <li>ChatGPT untuk ngobrol dan bantu tugas</li>
                            <li>Google Translate sebagai penerjemah bahasa</li>
                            <li>Rekomendasi YouTube/TikTok yang mempelajari kesukaan kita</li>
                            <li>Face recognition di HP sebagai pengenal wajah</li>
                        </ul>

                        <h2>Bagaimana AI Bekerja?</h2>
                        <p>AI belajar dari data. Semakin banyak data, semakin pintar AI-nya. Prosesnya disebut machine learning.</p>

                        <h2>Mulai Belajar AI dari Mana?</h2>
                        <ul>
                            <li>Pelajari dasar Python</li>
                            <li>Ikut kursus online seperti Dicoding atau Coursera</li>
                            <li>Coba tools AI gratis seperti ChatGPT dan Gemini</li>
                            <li>Bikin proyek kecil pakai AI</li>
                        </ul>

                        <p>AI bukan hal menakutkan. Justru ini peluang besar buat generasi muda.</p>
                    `
                }
            ]
        },
        tutorials: {
            title: 'Tutorial',
            items: [
                {
                    id: 'belajar-javascript-dari-nol',
                    date: '2025-08-15',
                    title: 'Belajar JavaScript dari Nol: Pengalamanku',
                    excerpt: 'Cerita bagaimana saya memulai belajar JavaScript dari nol hingga bisa membuat proyek web.',
                    category: 'Tutorial',
                    content: `
                        <p>JavaScript adalah bahasa pemrograman yang pertama kali saya pelajari serius. Awalnya saya bingung, tapi setelah beberapa bulan, saya mulai paham.</p>

                        <h2>1. Kenapa JavaScript?</h2>
                        <p>JavaScript adalah bahasa yang wajib dikuasai kalau mau jadi web developer. Hampir semua website modern pakai JavaScript, mulai dari interaksi tombol, animasi, sampai aplikasi kompleks seperti React.</p>

                        <h2>2. Mulai dari Dasar</h2>
                        <p>Saya mulai dari variabel, tipe data, kondisi (if-else), perulangan (for, while), lalu function. Ini fondasi wajib.</p>

                        <h2>3. Praktek Bikin Proyek</h2>
                        <p>Setelah dasar, saya coba bikin proyek kecil seperti kalkulator sederhana, to-do list, dan form validasi. Dari situ saya mulai paham cara kerja JavaScript di browser.</p>

                        <h2>4. Belajar Framework</h2>
                        <p>Setelah nyaman dengan JavaScript dasar, saya mulai belajar React JS. Ini membuka dunia baru, bikin website jadi lebih interaktif dan modern.</p>

                        <h2>5. Tips untuk Pemula</h2>
                        <ul>
                            <li>Konsisten belajar setiap hari, minimal 1 jam.</li>
                            <li>Jangan takut error, error adalah guru terbaik.</li>
                            <li>Bikin proyek kecil untuk latihan.</li>
                            <li>Ikut komunitas atau grup belajar.</li>
                        </ul>

                        <p>Intinya, belajar JavaScript butuh kesabaran. Tapi kalau konsisten, pasti bisa.</p>
                    `
                }
            ]
        },
        experiences: {
            title: 'Pengalaman',
            items: [
                {
                    id: 'tips-sukses-pkl-bidang-it',
                    date: '2025-07-20',
                    title: '5 Tips Sukses PKL di Bidang IT',
                    excerpt: 'Tips dan trik yang saya pelajari selama PKL di bidang teknologi informasi.',
                    category: 'Pengalaman',
                    content: `
                        <p>PKL (Praktik Kerja Lapangan) adalah momen penting bagi siswa SMK. Berikut tips dari pengalaman saya.</p>

                        <h2>1. Aktif Bertanya</h2>
                        <p>Jangan malu bertanya kalau tidak paham. Pembimbing biasanya senang dengan anak yang aktif.</p>

                        <h2>2. Disiplin Waktu</h2>
                        <p>Datang tepat waktu, selesaikan tugas sesuai deadline. Ini yang paling dinilai.</p>

                        <h2>3. Catat Semua Ilmu</h2>
                        <p>Bawa buku catatan. Setiap ilmu yang didapat langsung dicatat.</p>

                        <h2>4. Bangun Relasi</h2>
                        <p>Kenalan dengan karyawan lain. Relasi bisa berguna untuk karier ke depan.</p>

                        <h2>5. Jaga Attitude</h2>
                        <p>Sopan, ramah, dan jangan malas. Attitude lebih penting dari skill.</p>

                        <p>Semoga tips ini bermanfaat untuk kamu yang akan PKL.</p>
                    `
                }
            ]
        }
    },

    contacts: {
        email: 'nidaffifah5@gmail.com',
        whatsapp: '0857-3339-5626',
        whatsappRaw: '6285733395626',
        address: 'SMKN 1 Jenangan Ponorogo, Jawa Timur',
        socialMedia: [
            { platform: 'Instagram', label: '@ndaffh_', url: 'https://instagram.com/ndaffh_' },
            { platform: 'GitHub', label: '', url: '' },
            { platform: 'LinkedIn', label: '', url: '' }
        ]
    },

    externalLinks: {
        tokoRajut: 'https://toko.rajutindah.my.id'
    },

    footer: {
        name: 'Nida Affifah',
        copyright: '© 2025 Nida Affifah. All rights reserved.',
        tagline: 'Dibuat menggunakan React JS',
        socialMedia: [
            { platform: 'Instagram', url: 'https://instagram.com/ndaffh_' },
            { platform: 'WhatsApp', url: 'https://wa.me/6285733395626' },
            { platform: 'Email', url: '/contact' }
        ],
        quickNav: [
            { label: 'Beranda', href: '#hero' },
            { label: 'Tentang', href: '#about' },
            { label: 'Karya', href: '#projects' },
            { label: 'Blog', href: '#blog' },
            { label: 'Kontak', href: '#contact' }
        ]
    }
};

export default userData;