// File: admin.js
// CMS Management View: Pengaturan Gradasi Warna, Tabel Jadwal Dinamis & Manajemen Berkas

window.AdminPanelComponent = ({ db, setDb, setView, modules, setModules, pesertaList, setPesertaList, schedule, setSchedule }) => {
    const [theme, setTheme] = React.useState(db.theme);
    const [config, setConfig] = React.useState(db.config);
    
    // State Form Tambah Peserta Baru
    const [newNama, setNewNama] = React.useState("");
    const [newLink, setNewLink] = React.useState("");

    // State Form Tambah Baris Jadwal Baru
    const [schedTitle, setSchedTitle] = React.useState("");
    const [schedStart, setSchedStart] = React.useState("");
    const [schedEnd, setSchedEnd] = React.useState("");
    const [schedDuration, setSchedDuration] = React.useState("");
    const [schedPic, setSchedPic] = React.useState("");

    // Aksi Sinkronisasi Global ke Database Web
    const handleSaveAdminCore = (e) => {
        if(e) e.preventDefault();
        
        const serializedSchedule = schedule.map(item => ({
            ...item,
            start: item.start instanceof Date ? item.start.toISOString() : new Date(item.start).toISOString(),
            end: item.end instanceof Date ? item.end.toISOString() : new Date(item.end).toISOString()
        }));

        const serializedModules = modules.map(m => ({
            ...m,
            releaseTime: m.releaseTime instanceof Date ? m.releaseTime.toISOString() : new Date(m.releaseTime).toISOString()
        }));

        const updatedDb = { 
            ...db, 
            theme, 
            config, 
            modules: serializedModules,
            schedule: serializedSchedule,
            peserta: pesertaList
        };

        setDb(updatedDb);
        window.LKSStore.save(updatedDb);
        alert("Seluruh konfigurasi visual, tabel jadwal & database peserta sukses dikunci terpusat!");
        setView('dashboard');
    };

    // Aksi Tambah Sesi Jadwal Baru Ke Tabel
    const handleAddSchedule = (e) => {
        e.preventDefault();
        if(!schedTitle || !schedStart || !schedEnd) {
            alert("Harap isi Nama Acara, Jam Mulai, dan Jam Selesai agenda!");
            return;
        }

        const newId = schedule.length > 0 ? Math.max(...schedule.map(s => s.id)) + 1 : 1;
        const newEvent = {
            id: newId,
            title: schedTitle,
            start: new Date(schedStart),
            end: new Date(schedEnd),
            duration: schedDuration || "Disesuaikan",
            pic: schedPic || "-"
        };

        const updatedSchedule = [...schedule, newEvent].sort((a, b) => a.start - b.start);
        setSchedule(updatedSchedule);

        // Reset Form
        setSchedTitle(""); setSchedStart(""); setSchedEnd(""); setSchedDuration(""); setSchedPic("");
    };

    const handleDeleteSchedule = (id) => {
        if(confirm("Hapus baris agenda acara ini dari timeline utama?")) {
            setSchedule(schedule.filter(s => s.id !== id));
        }
    };

    // Aksi Manajemen Peserta Baru
    const handleAddPesertaLocal = (e) => {
        e.preventDefault();
        if(!newNama || !newLink) return;
        const newList = [...pesertaList, { nama: newNama, link: newLink }];
        setPesertaList(newList);
        setNewNama(""); setNewLink("");
    };

    const handleDeletePesertaLocal = (nama) => {
        if(confirm(`Hapus database folder peserta atas nama "${nama}"?`)) {
            setPesertaList(pesertaList.filter(p => p.nama !== nama));
        }
    };

    // Fitur Keberlanjutan: Impor file JSON tahun kepengurusan berikutnya
    const handleImportFile = (e) => {
        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], "UTF-8");
        fileReader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                if(parsed.theme && parsed.schedule && parsed.peserta) {
                    setDb(parsed);
                    window.LKSStore.save(parsed);
                    alert("Impor konfigurasi sukses! Portal otomatis termigrasi.");
                    window.location.reload();
                } else {
                    alert("Gagal memuat: Struktur berkas JSON tidak sesuai standar framework!");
                }
            } catch(err) { alert("Format file JSON rusak atau corrupt!"); }
        };
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto main-view-scrollbar pb-12 text-slate-800 dark:text-slate-100">
            {/* ACTION HEADER BAR */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
                <div>
                    <h2 className="text-2xl font-black tracking-tight uppercase">CMS Control Room</h2>
                    <p className="text-xs text-slate-400">Atur palet gradasi warna web, tabel rentang waktu, dan berkas data secara visual tanpa sentuh kodingan.</p>
                </div>
                <div className="flex gap-2">
                    <button type="button" onClick={() => window.LKSStore.exportJSON({ ...db, schedule, peserta: pesertaList, modules })} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all">
                        Ekspor JSON Backup
                    </button>
                    <button type="button" onClick={handleSaveAdminCore} className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-green-500/10">
                        Simpan Publikasi Web
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LAJUR SETTING VISUAL & COLOR PICKER GRADASI */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4 h-fit">
                        <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">🎨 Identity & Color Swift</h3>
                        
                        <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-slate-400">Headline Nama Kompetisi:</span>
                            <input type="text" value={theme.eventName} onChange={e => setTheme({...theme, eventName: e.target.value})} className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none dark:border-slate-700" />
                        </div>
                        
                        {/* COLOR PICKER PALET SLIDER */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <span className="text-[11px] font-semibold text-slate-400">Gradient Start:</span>
                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border dark:border-slate-700">
                                    <input type="color" value={theme.gradStart} onChange={e => setTheme({...theme, gradStart: e.target.value})} className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent" />
                                    <span className="text-[10px] font-mono font-bold uppercase">{theme.gradStart}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[11px] font-semibold text-slate-400">Gradient End:</span>
                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border dark:border-slate-700">
                                    <input type="color" value={theme.gradEnd} onChange={e => setTheme({...theme, gradEnd: e.target.value})} className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent" />
                                    <span className="text-[10px] font-mono font-bold uppercase">{theme.gradEnd}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-[11px] font-semibold text-slate-400">URL Embed Live Spreadsheet Nilai:</span>
                            <input type="text" value={config.spreadsheetUrl} onChange={e => setConfig({...config, spreadsheetUrl: e.target.value})} className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none dark:border-slate-700" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-2">
                        <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">💾 Impor Framework Config</h3>
                        <p className="text-[10px] text-slate-400 leading-relaxed">Unggah file JSON backup dari kepengurusan LKS tahun lalu untuk migrasi instan otomatis.</p>
                        <input type="file" accept=".json" onChange={handleImportFile} className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300 hover:file:bg-slate-200 cursor-pointer" />
                    </div>
                </div>

                {/* TAUTAN MANAJEMEN TABEL JADWAL DINAMIS */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-6">
                    <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider border-b pb-2">📅 Tabel Pengontrol Jadwal & Timeline Acara</h3>
                    
                    {/* Form Input Baris Jadwal */}
                    <form onSubmit={handleAddSchedule} className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border dark:border-slate-800 text-xs">
                        <div className="col-span-2 space-y-1">
                            <span className="font-semibold text-slate-400">Nama Acara / Sesi Modul:</span>
                            <input type="text" placeholder="Contoh: Pengerjaan Soal Modul 3" value={schedTitle} onChange={e => setSchedTitle(e.target.value)} className="w-full px-3 py-1.5 rounded-lg border bg-white dark:bg-slate-900 dark:border-slate-700 focus:outline-none" />
                        </div>
                        <div className="col-span-1 space-y-1">
                            <span className="font-semibold text-slate-400">Durasi Sesi:</span>
                            <input type="text" placeholder="Contoh: 3 Jam" value={schedDuration} onChange={e => setSchedDuration(e.target.value)} className="w-full px-3 py-1.5 rounded-lg border bg-white dark:bg-slate-900 dark:border-slate-700 focus:outline-none" />
                        </div>
                        <div className="col-span-1 space-y-1">
                            <span className="font-semibold text-slate-400">PIC Penanggung Jawab:</span>
                            <input type="text" placeholder="Contoh: Tim Juri" value={schedPic} onChange={e => setSchedPic(e.target.value)} className="w-full px-3 py-1.5 rounded-lg border bg-white dark:bg-slate-900 dark:border-slate-700 focus:outline-none" />
                        </div>
                        <div className="col-span-1 space-y-1">
                            <span className="font-semibold text-slate-400">Waktu Mulai:</span>
                            <input type="datetime-local" value={schedStart} onChange={e => setSchedStart(e.target.value)} className="w-full px-2 py-1 rounded-lg border bg-white dark:bg-slate-900 dark:border-slate-700 focus:outline-none text-[11px]" />
                        </div>
                        <div className="col-span-1 space-y-1">
                            <span className="font-semibold text-slate-400">Waktu Selesai:</span>
                            <input type="datetime-local" value={schedEnd} onChange={e => setSchedEnd(e.target.value)} className="w-full px-2 py-1 rounded-lg border bg-white dark:bg-slate-900 dark:border-slate-700 focus:outline-none text-[11px]" />
                        </div>
                        <div className="col-span-2 pt-4">
                            <button type="submit" className="w-full py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors uppercase tracking-wider text-[11px]">Masukkan Baris Jadwal Baru</button>
                        </div>
                    </form>

                    {/* View Live Render Table Jadwal */}
                    <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 uppercase font-bold tracking-wider border-b dark:border-slate-700">
                                    <tr>
                                        <th className="px-4 py-2.5">Agenda Acara</th>
                                        <th className="px-4 py-2.5">Mulai</th>
                                        <th className="px-4 py-2.5">Selesai</th>
                                        <th className="px-4 py-2.5 text-center">Hapus</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {schedule.map((s) => (
                                        <tr key={s.id} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-slate-700 dark:text-slate-200">{s.title}</div>
                                                <div className="text-[10px] text-slate-400 font-medium">PIC: {s.pic} | {s.duration}</div>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-slate-500">
                                                {new Date(s.start).toLocaleDateString('id-ID', {month:'short', day:'numeric'})} {new Date(s.start).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-slate-500">
                                                {new Date(s.end).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button type="button" onClick={() => handleDeleteSchedule(s.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                                                    <window.IconTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* BARIS DATA: MANAJEMEN DATABASE FOLDER PESERTA (ALFABETIS TANPA NOMOR KAKU) */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-6">
                <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider border-b pb-2">👥 Manajemen Folder Awan Berkas Peserta</h3>
                <form onSubmit={handleAddPesertaLocal} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="space-y-1">
                        <span className="font-semibold text-slate-400">Nama Lengkap Peserta:</span>
                        <input type="text" value={newNama} onChange={e => setNewNama(e.target.value)} placeholder="Nama Lengkap" className="w-full px-3 py-1.5 rounded-lg border bg-slate-50 dark:bg-slate-800 dark:border-slate-700 focus:outline-none"/>
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                        <span className="font-semibold text-slate-400">Tautan Cloud Drive Folder Pengumpulan:</span>
                        <input type="text" value={newLink} onChange={e => setNewLink(e.target.value)} placeholder="https://drive.google.com/drive/folders/..." className="w-full px-3 py-1.5 rounded-lg border bg-slate-50 dark:bg-slate-800 dark:border-slate-700 focus:outline-none"/>
                    </div>
                    <button type="submit" className="w-full py-2 bg-slate-900 text-white font-bold rounded-lg uppercase tracking-wider text-[11px] sm:col-span-3">Masukkan Ke Daftar Database</button>
                </form>

                <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto main-view-scrollbar text-xs">
                        {pesertaList.map((p, i) => (
                            <div key={i} className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/50">
                                <div className="truncate">
                                    <h4 className="font-bold text-slate-700 dark:text-slate-300">{p.nama}</h4>
                                    <p className="text-[10px] text-slate-400 truncate max-w-xl">{p.link}</p>
                                </div>
                                <button type="button" onClick={() => handleDeletePesertaLocal(p.nama)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                                    <window.IconTrash />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
