// File: script.js
// Framework Core UI Layout Router Engine: Bento Grid Viewport with Left Sidebar Control

const { useState, useEffect, useMemo, useRef } = React;

const App = () => {
    const [db, setDb] = useState(null);
    const [view, setView] = useState('dashboard'); // 'dashboard', 'modules', 'schedule', 'submission', 'admin'
    const [systemTime, setSystemTime] = useState(new Date());
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [timerScale, setTimerScale] = useState(1.0);
    const [darkMode, setDarkMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("name-asc");

    // Master React state hooks untuk modifikasi dinamis
    const [modules, setModules] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [pesertaList, setPesertaList] = useState([]);
    const [timeOffset, setTimeOffset] = useState(0);
    const [loading, setLoading] = useState(true);

    const timerRef = useRef(null);

    // Booting awal pemuatan database terpusat
    useEffect(() => {
        const loadedData = window.LKSStore.load();
        setDb(loadedData);
        setModules(loadedData.modules);
        setPesertaList(loadedData.peserta);
        
        const savedOffset = localStorage.getItem('gdt_time_offset_live');
        if (savedOffset) setTimeOffset(parseInt(savedOffset));

        const savedDarkMode = localStorage.getItem('gdt_dark_mode');
        if (savedDarkMode) setDarkMode(savedDarkMode === 'true');

        const processedSchedule = loadedData.schedule.map(item => ({
            ...item,
            start: new Date(item.start),
            end: new Date(item.end)
        })).sort((a, b) => a.start - b.start);
        setSchedule(processedSchedule);

        setLoading(false);
    }, []);

    // Jam Digital Detik Berjalan (WIB)
    useEffect(() => {
        const clk = setInterval(() => setSystemTime(new Date()), 1000);
        return () => clearInterval(clk);
    }, []);

    // Pasang Variable CSS Gradient secara dinamis ke Root Web HTML dari Panel Admin
    useEffect(() => {
        if (db && db.theme) {
            document.documentElement.style.setProperty('--g-start', db.theme.gradStart);
            document.documentElement.style.setProperty('--g-end', db.theme.gradEnd);
        }
    }, [db]);

    useEffect(() => {
        if (darkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        localStorage.setItem('gdt_dark_mode', darkMode);
    }, [darkMode]);

    // Pintu Masuk Rahasia Admin Area via Kolom Pencarian
    useEffect(() => {
        if (searchQuery.toLowerCase() === 'admin123') {
            setView('admin'); setSearchQuery('');
        }
    }, [searchQuery]);

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
            if (!document.fullscreenElement) setTimerScale(1.0);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            timerRef.current.requestFullscreen().catch(err => console.error(err));
        } else {
            document.exitFullscreen();
        }
    };

    const toggleDarkMode = () => setDarkMode(!darkMode);
    const zoomIn = () => setTimerScale(prev => Math.min(prev + 0.1, 2.0));
    const zoomOut = () => setTimerScale(prev => Math.max(prev - 0.1, 0.6));

    // Fungsi Klik Cepat Tombol Tambah/Kurang Menit Sesi Berjalan di Admin Room
    const adjustOffsetInstantly = (amount) => {
        const newOffset = timeOffset + amount;
        setTimeOffset(newOffset);
        localStorage.setItem('gdt_time_offset_live', newOffset);
    };

    // CORE LOGIKA TIMER INTERCEPTOR: Dinamis Menghitung Sisa Durasi Sesi yang Sedang Aktif
    const { activeEvent, nextEvent, countdownLeftMs } = useMemo(() => {
        let active = null; let next = null;
        for (let i = 0; i < schedule.length; i++) {
            const s = schedule[i];
            if (systemTime >= s.start && systemTime <= s.end) { active = s; break; }
            if (systemTime < s.start && !next) { next = s; }
        }
        let diff = 0;
        if (active) {
            const modifiedEnd = active.end.getTime() + (timeOffset * 60 * 1000);
            diff = modifiedEnd - systemTime.getTime();
        } else if (next) {
            diff = next.start.getTime() - systemTime.getTime();
        }
        return { activeEvent: active, nextEvent: next, countdownLeftMs: diff > 0 ? diff : 0 };
    }, [systemTime, schedule, timeOffset]);

    const { hr, min, sec } = useMemo(() => {
        const totalSeconds = Math.floor(countdownLeftMs / 1000);
        return {
            hr: Math.floor(totalSeconds / 3600),
            min: Math.floor((totalSeconds % 3600) / 60),
            sec: totalSeconds % 60
        };
    }, [countdownLeftMs]);

    const pad = (num) => String(num).padStart(2, '0');

    // Logic Urutan & Filter Pencarian Alfabetis Peserta LKS
    const processedPesertaTable = useMemo(() => {
        let res = pesertaList.filter(p => p.nama && p.nama.toLowerCase().includes(searchQuery.toLowerCase()));
        return res.sort((a, b) => sortBy === 'name-asc' ? a.nama.localeCompare(b.nama) : b.nama.localeCompare(a.nama));
    }, [pesertaList, searchQuery, sortBy]);

    if (loading || !db) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
                <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent dark:border-white rounded-full animate-spin"></div>
                <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-400">Inisialisasi Framework...</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
            
            {/* SIDEBAR COMPONENT NAVIGASI UTAMA KIRI */}
            <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800 flex flex-col justify-between p-5 shrink-0 z-40">
                <div className="space-y-8">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--g-start)] to-[var(--g-end)] flex items-center justify-center text-white font-black shadow-md">L</div>
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-wider leading-tight">Portal LKS</h2>
                            <span className="text-[10px] font-bold text-slate-400">Sustainable Engine</span>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${view === 'dashboard' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}>
                            <window.IconLayout /><span>Dashboard</span>
                        </button>
                        <button onClick={() => setView('modules')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${view === 'modules' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}>
                            <window.IconFileText /><span>Modul Soal</span>
                        </button>
                        <button onClick={() => setView('schedule')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${view === 'schedule' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}>
                            <window.IconCalendar /><span>Jadwal Lomba</span>
                        </button>
                        <button onClick={() => setView('submission')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${view === 'submission' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}>
                            <window.IconShare2 /><span>Folder Tugas</span>
                        </button>
                    </nav>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button onClick={toggleDarkMode} className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                        <span>{darkMode ? "Mode Terang" : "Mode Gelap"}</span>
                        {darkMode ? <window.IconSun /> : <window.IconMoon />}
                    </button>
                </div>
            </aside>

            {/* HALAMAN UTAMA KANAN VIEWPORT CONTAINER */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
                
                {/* TOP BAR BARIS HEADER UTAMA */}
                <header className="h-16 border-b border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 flex items-center justify-between shrink-0">
                    <h2 className="font-black text-sm uppercase tracking-widest text-slate-400">{db.theme.eventName}</h2>
                    <div className="font-mono text-xs font-bold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <window.IconClock /><span>{systemTime.toLocaleTimeString('id-ID')} WIB</span>
                    </div>
                </header>

                {/* AREA KONTEN (MAIN SCROLLABLE VIEW) */}
                <div className="flex-1 overflow-y-auto main-view-scrollbar p-8">
                    
                    {/* VIEW: BENTO GRID DASHBOARD */}
                    {view === 'dashboard' && (
                        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
                            {/* TOP LEVEL BENTO CARD: TIMER UTAMA & STATUS ACARA AKTIF */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                
                                {/* BENTO CARD 1: LIVE COUNTDOWN RAKSASA */}
                                <div ref={timerRef} className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center relative min-h-[220px]">
                                    <div className="absolute top-4 left-4 text-[10px] font-black text-[var(--g-start)] dark:text-[var(--g-end)] uppercase tracking-widest flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></span>Sisa Waktu Sesi Kompetisi
                                    </div>
                                    
                                    {/* Action Zoom Monitor Layar */}
                                    <div className="absolute top-3 right-4 hidden group-hover:flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 z-10">
                                        <button onClick={zoomOut} className="w-6 h-6 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md flex items-center justify-center">-</button>
                                        <button onClick={zoomIn} className="w-6 h-6 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md flex items-center justify-center">+</button>
                                        <button onClick={toggleFullScreen} className="w-6 h-6 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md flex items-center justify-center text-xs">FS</button>
                                    </div>

                                    <div style={{ transform: `scale(${timerScale})` }} className="flex items-center gap-4 sm:gap-5 font-mono text-5xl sm:text-6xl font-black text-slate-900 dark:text-white select-none transition-transform duration-200">
                                        <div>{pad(hr)}</div><div className="text-slate-300 dark:text-slate-700 animate-pulse">:</div>
                                        <div className="text-transparent bg-clip-text bg-gradient-to-br from-[var(--g-start)] to-[var(--g-end)]">{pad(min)}</div><div className="text-slate-300 dark:text-slate-700 animate-pulse">:</div>
                                        <div>{pad(sec)}</div>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Jam • Menit • Detik</p>
                                </div>

                                {/* BENTO CARD 2: RADAR AGENDA AKTIF */}
                                <div className="md:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[220px]">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Agenda Berjalan</span>
                                    <div className="my-auto space-y-1.5">
                                        <h3 className="text-lg font-black tracking-tight text-slate-800 dark:text-white leading-tight">
                                            {activeEvent ? activeEvent.title : "Masa Jeda Kompetisi"}
                                        </h3>
                                        {activeEvent?.pic && <span className="inline-block text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-md uppercase">PIC: {activeEvent.pic}</span>}
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                                        <span className="font-bold text-[10px] text-slate-400 uppercase block mb-0.5">Acara Berikutnya:</span>
                                        <p className="font-bold text-slate-600 dark:text-slate-300 truncate">{nextEvent ? nextEvent.title : "Seluruh Acara Selesai"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* MID LEVEL BENTO CARD: LINKS AKSES CEPAT */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div onClick={() => setView('modules')} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--g-start)] to-[var(--g-end)] text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform"><window.IconFileText /></div>
                                    <h3 className="font-black text-base text-slate-800 dark:text-white">Akses Berkas Modul Soal</h3>
                                    <p className="text-xs text-slate-400 mt-1">Unduh lembar berkas soal kompetisi LKS otomatis sesuai jam rilis.</p>
                                </div>
                                <div onClick={() => setView('submission')} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--g-start)] to-[var(--g-end)] text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform"><window.IconShare2 /></div>
                                    <h3 className="font-black text-base text-slate-800 dark:text-white">Folder Pengumpulan Tugas</h3>
                                    <p className="text-xs text-slate-400 mt-1">Akses tautan folder Drive pengumpulan tugas untuk seluruh peserta lomba.</p>
                                </div>
                                <div onClick={() => setView('submission')} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group sm:col-span-2 lg:col-span-1">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--g-start)] to-[var(--g-end)] text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform"><window.IconTable /></div>
                                    <h3 className="font-black text-base text-slate-800 dark:text-white">Live Monitoring Nilai</h3>
                                    <p className="text-xs text-slate-400 mt-1">Sinkronisasi data skor peninjauan rekap nilai pembimbing & publik.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VIEW: CONTROL PANEL RAHASIA ADMIN (CMS) */}
                    {view === 'admin' && (
                        <div className="space-y-6">
                            {/* FLOATING LIVE COUNTDOWN MODIFIER UNTUK ADMIN */}
                            <div className="max-w-5xl mx-auto bg-gray-900 text-white p-5 rounded-2xl border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-center sm:text-left">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Sisa Waktu Sesi Aktif</span>
                                    <div className="font-mono text-2xl font-black text-red-400">{pad(displayHours)}:{pad(displayMinutes)}:{pad(displaySeconds)}</div>
                                </div>
                                <div className="flex flex-col gap-1 w-full sm:w-auto">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center sm:text-left">Interseptor Tambah/Kurang Waktu (Menit):</span>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => adjustOffsetInstantly(-10)} className="px-3 py-1.5 bg-gray-800 hover:bg-red-900/40 text-red-400 font-mono font-bold rounded-xl text-xs border border-gray-700">-10m</button>
                                        <button type="button" onClick={() => adjustOffsetInstantly(-5)} className="px-3 py-1.5 bg-gray-800 hover:bg-red-900/40 text-red-400 font-mono font-bold rounded-xl text-xs border border-gray-700">-5m</button>
                                        <button type="button" onClick={() => adjustOffsetInstantly(5)} className="px-3 py-1.5 bg-gray-800 hover:bg-green-900/40 text-green-400 font-mono font-bold rounded-xl text-xs border border-gray-700">+5m</button>
                                        <button type="button" onClick={() => adjustOffsetInstantly(10)} className="px-3 py-1.5 bg-gray-800 hover:bg-green-900/40 text-green-400 font-mono font-bold rounded-xl text-xs border border-gray-700">+10m</button>
                                    </div>
                                </div>
                            </div>
                            <window.AdminPanelComponent db={db} setDb={setDb} setView={setView} modules={modules} setModules={setModules} pesertaList={pesertaList} setPesertaList={setPesertaList} schedule={schedule} setSchedule={setSchedule} />
                        </div>
                    )}

                    {/* VIEW: AKSER DAFTAR BERKAS MODUL */}
                    {view === 'modules' && (
                        <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
                            <h2 className="text-2xl font-black uppercase tracking-tight">Lembar Modul Soal</h2>
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                                {modules.map((m, i) => {
                                    const isUnlocked = systemTime >= m.releaseTime;
                                    return (
                                        <div key={i} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50">
                                            <div>
                                                <h3 className="font-bold text-base text-slate-800 dark:text-white">{m.title}</h3>
                                                <p className="text-xs text-slate-400 mt-1">Otomatis Terbuka: {m.releaseTime.toLocaleString('id-ID')}</p>
                                            </div>
                                            {isUnlocked ? (
                                                <a href={m.link} target="_blank" rel="noreferrer" className="px-4 py-2 bg-gradient-to-br from-[var(--g-start)] to-[var(--g-end)] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-sm"><window.IconUnlock /> Buka Soal</a>
                                            ) : (
                                                <button disabled className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 cursor-not-allowed"><window.IconLock /> Terkunci</button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* VIEW: TIMELINE JADWAL LENGKAP */}
                    {view === 'schedule' && (
                        <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
                            <h2 className="text-2xl font-black uppercase tracking-tight">Susunan Acara Kompetisi</h2>
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                                {schedule.map((item, i) => {
                                    const isPast = systemTime > item.end;
                                    const isNow = systemTime >= item.start && systemTime <= item.end;
                                    return (
                                        <div key={i} className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 transition-all ${isNow ? 'schedule-highlight border-l-[var(--g-start)]' : 'border-l-transparent hover:bg-slate-50/50'}`}>
                                            <div className="flex gap-4 sm:gap-6 items-start">
                                                <div className="font-mono font-bold text-xs text-transparent bg-clip-text bg-gradient-to-br from-[var(--g-start)] to-[var(--g-end)] min-w-[90px]">
                                                    {item.start.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})} - {item.end.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">{item.title}</h4>
                                                    {item.pic && <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">PIC: {item.pic} | Durasi: {item.duration}</p>}
                                                </div>
                                            </div>
                                            <div>
                                                {isNow ? <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-red-100 text-red-600 rounded-md animate-pulse">Aktif</span> : (isPast ? <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-md">Selesai</span> : <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-500 rounded-md">Akan Datang</span>)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* VIEW: TABEL AKSER FOLDER PENGUMPULAN & SPREADSHEET LIVE */}
                    {view === 'submission' && (
                        <div className="max-w-4xl mx-auto animate-fade-in space-y-10">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h2 className="text-2xl font-black uppercase tracking-tight">Folder Cloud Drive & Monitoring</h2>
                                <div className="flex items-center gap-2">
                                    <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-1.5 text-xs font-bold rounded-xl border bg-white dark:bg-slate-900 focus:outline-none cursor-pointer">
                                        <option value="name-asc">Nama (A-Z)</option>
                                        <option value="name-desc">Nama (Z-A)</option>
                                    </select>
                                    <input type="text" placeholder="Cari Nama Peserta..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="px-4 py-1.5 text-xs rounded-xl border bg-white dark:bg-slate-900 focus:outline-none w-full sm:w-44"/>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 font-bold text-slate-400 uppercase tracking-wider">
                                                <th className="px-6 py-3.5">Nama Lengkap Peserta</th>
                                                <th className="px-6 py-3.5 text-right">Aksi Gerbang Pengumpulan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {processedPesertaTable.length > 0 ? (
                                                processedPesertaTable.map((p, i) => (
                                                    <tr key={i} className="hover:bg-slate-50/40 text-slate-700 dark:text-slate-300">
                                                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-white text-sm">{p.nama}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <a href={p.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-bold text-xs text-transparent bg-clip-text bg-gradient-to-br from-[var(--g-start)] to-[var(--g-end)] hover:opacity-80 transition-all">
                                                                <span>{p.nama}_LKS_BABEL_2026</span><window.IconExternalLink />
                                                            </a>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="2" className="px-6 py-10 text-center text-slate-400 font-medium">Data pencarian nama tidak ditemukan.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* LIVE EMBED MONITORING GOOGLE SPREADSHEET */}
                            <div id="live-monitoring-sheet" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center"><window.IconTable /></div>
                                    <div>
                                        <h3 className="font-bold text-sm">Live Rekap Scoring Board</h3>
                                        <p className="text-[11px] text-slate-400">Sinkronisasi data otomatis rekapitulasi penilaian komite juri utama.</p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border overflow-hidden w-full h-[550px]">
                                    <iframe src={db.config.spreadsheetUrl} className="w-full h-full border-0 rounded-xl bg-white" allowFullScreen loading="lazy"></iframe>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
