// File: store.js
// Sustainable State Engine: Pengatur muat, simpan, ekspor, dan impor data terpusat

window.LKSStore = {
    // Template struktur data awal LKS Wilayah Bangka Belitung (Bisa dicustom penuh kemudian)
    getInitialData: () => ({
        theme: {
            eventName: "LKS GDT Bangka Belitung 2026",
            gradStart: "#EE414B",
            gradEnd: "#FA2E93",
            logoUrl: ""
        },
        config: {
            docLink: "https://drive.google.com",
            spreadsheetUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRFr1dH2Y34-ZSSxN-Ycasseqx4a_kU8Pja9dQeShIA6la4X5BVQo-JiSCcdZ3k7X8SXxJ8OhVr48d0/pubhtml?gid=0&single=true"
        },
        modules: [
            { id: 1, title: "Modul 1 - Product Design Sketch", releaseTime: "2026-06-10T08:30:00", link: "https://drive.google.com", pic: "Tim Juri" },
            { id: 2, title: "Modul 2 - 3D 360 Rendering Concept", releaseTime: "2026-06-10T13:15:00", link: "https://drive.google.com", pic: "Tim Juri" },
            { id: 3, title: "Modul 3 - Packaging & Technical Draw", releaseTime: "2026-06-11T08:15:00", link: "https://drive.google.com", pic: "Tim Juri" },
            { id: 4, title: "Modul 4 - Digital Imaging Mastery", releaseTime: "2026-06-11T12:35:00", link: "https://drive.google.com", pic: "Tim Juri" }
        ],
        schedule: [
            { id: 1, title: "Registrasi, Persiapan & Pembukaan Sesi Lomba", start: "2026-06-10T07:15:00", end: "2026-06-10T08:00:00", duration: "45 Menit", pic: "Panitia" },
            { id: 2, title: "Briefing & Tanya Jawab Teknis Modul 1", start: "2026-06-10T08:00:00", end: "2026-06-10T08:30:00", duration: "30 Menit", pic: "Tim Juri" },
            { id: 3, title: "Pelaksanaan Pengerjaan Kompetisi Modul 1", start: "2026-06-10T08:30:00", end: "2026-06-10T11:30:00", duration: "3 Jam", pic: "Peserta" },
            { id: 4, title: "Pengumpulan Berkas Modul 1", start: "2026-06-10T11:30:00", end: "2026-06-10T11:45:00", duration: "15 Menit", pic: "Peserta Lomba" },
            { id: 5, title: "ISHOMA (Istirahat, Sholat, Makan)", start: "2026-06-10T11:45:00", end: "2026-06-10T12:45:00", duration: "1 Jam", pic: "-" },
            { id: 6, title: "Briefing & Tanya Jawab Teknis Modul 2", start: "2026-06-10T12:45:00", end: "2026-06-10T13:15:00", duration: "30 Menit", pic: "Tim Juri" },
            { id: 7, title: "Pelaksanaan Pengerjaan Kompetisi Modul 2", start: "2026-06-10T13:15:00", end: "2026-06-10T16:15:00", duration: "3 Jam", pic: "Peserta" },
            { id: 8, title: "Pengumpulan Berkas Modul 2", start: "2026-06-10T16:15:00", end: "2026-06-10T16:30:00", duration: "15 Menit", pic: "Peserta Lomba" }
        ],
        peserta: [
            { nama: "Ahmad Khadavi", link: "https://drive.google.com" },
            { nama: "Cika Aulia Sari", link: "https://drive.google.com" },
            { nama: "Davin Apriliano", link: "https://drive.google.com" },
            { nama: "Delly Nandita", link: "https://drive.google.com" },
            { nama: "Diana Setiawati", link: "https://drive.google.com" }
        ]
    }),

    load: () => {
        const localData = localStorage.getItem('lks_sustainable_bento_core_db');
        if (localData) {
            try { return JSON.parse(localData); } catch(e) { console.error("Error parsing local database:", e); }
        }
        return window.LKSStore.getInitialData();
    },

    save: (data) => {
        localStorage.setItem('lks_sustainable_bento_core_db', JSON.stringify(data));
    },

    exportJSON: (data) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `PORTAL_LKS_CONFIG_${data.theme.eventName.replace(/\s+/g, '_')}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }
};
