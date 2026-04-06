"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle, MapPin, Search, RotateCcw, Save, ExternalLink } from "lucide-react";

type TelemarketingData = {
  _id: string;
  perusahaan: string;
  produk: string;
  provinsi: string;
  kota: string;
  kontak_pic: {
    nama: string;
    no_telp: string;
    jabatan: string;
  };
  status_wa: string;
  to_sales: string;
};

export default function BroadcastTrackingPage() {
  const [data, setData] = useState<TelemarketingData[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Track modified rows for inline saving
  const [modifiedRows, setModifiedRows] = useState<Record<string, { status_wa: string, to_sales: string }>>({});

  // Filters
  const [filters, setFilters] = useState({
    perusahaan: "Semua Perusahaan",
    produk: "Semua Produk",
    provinsi: "Semua Provinsi",
    kota: "Semua Kota",
    status_wa: "Semua Status",
    to_sales: "Semua Sales",
  });

  const fetchData = async () => {
    setLoading(true);
    let url = "/api/marketing/telemarketing/database?";
    const params = new URLSearchParams();
    
    if (filters.perusahaan !== "Semua Perusahaan") params.append("perusahaan", filters.perusahaan);
    if (filters.produk !== "Semua Produk") params.append("produk", filters.produk);
    if (filters.provinsi !== "Semua Provinsi") params.append("provinsi", filters.provinsi);
    if (filters.kota !== "Semua Kota") params.append("kota", filters.kota);
    if (filters.status_wa !== "Semua Status") params.append("status_wa", filters.status_wa);
    if (filters.to_sales !== "Semua Sales") params.append("to_sales", filters.to_sales);

    try {
      const res = await fetch(url + params.toString());
      if (res.ok) {
        const json = await res.json();
        setData(json.data || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
    setModifiedRows({});
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleRowChange = (id: string, field: "status_wa" | "to_sales", value: string) => {
    setModifiedRows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        status_wa: field === "status_wa" ? value : (prev[id]?.status_wa || data.find(d => d._id === id)?.status_wa || ""),
        to_sales: field === "to_sales" ? value : (prev[id]?.to_sales || data.find(d => d._id === id)?.to_sales || ""),
      }
    }));
  };

  const saveRow = async (id: string) => {
    const modifications = modifiedRows[id];
    if (!modifications) return;

    try {
      const res = await fetch("/api/marketing/telemarketing/database", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, ...modifications })
      });
      if (res.ok) {
        // Update local state and remove from modified
        setData(prev => prev.map(d => d._id === id ? { ...d, ...modifications } : d));
        const newMods = { ...modifiedRows };
        delete newMods[id];
        setModifiedRows(newMods);
      }
    } catch (e) {
      console.error("Failed to save", e);
    }
  };

  const clearFilters = () => {
    setFilters({
      perusahaan: "Semua Perusahaan",
      produk: "Semua Produk",
      provinsi: "Semua Provinsi",
      kota: "Semua Kota",
      status_wa: "Semua Status",
      to_sales: "Semua Sales",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121420]">
      <div className="flex min-h-screen">
        <div className="flex-1 h-screen overflow-y-auto p-4 lg:p-8">
          <main className="mx-auto min-w-0">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
             <MessageCircle className="w-6 h-6" />
           </div>
           <div>
             <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Tracking Broadcast WA</h1>
             <p className="text-sm text-gray-500 dark:text-gray-400">Monitor status pengiriman pesan dari database telemarketing</p>
           </div>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md shadow-sm text-sm font-medium hover:bg-blue-200 transition-colors">
              Kembali
           </button>
           <button 
             onClick={fetchData}
             className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 transition-colors"
             title="Refresh Data"
           >
              <RotateCcw className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-gray-800 rounded-t-lg shadow-sm border border-gray-100 dark:border-gray-700 mb-0">
         <div className="bg-green-500 text-white px-5 py-3 rounded-t-lg font-medium text-sm flex items-center gap-2">
            <Search className="w-4 h-4" /> Filter Data Broadcast (Filter saling terkait secara dinamis)
         </div>
         <div className="p-5">
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
             <div>
                <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1"><span className="text-gray-400">🏢</span> Perusahaan</label>
                <select value={filters.perusahaan} onChange={e => handleFilterChange("perusahaan", e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-green-500 focus:border-green-500">
                  <option>Semua Perusahaan</option>
                  <option>NAWI ADVERTISING</option>
                  <option>PANCA MEDIA</option>
                  <option>DWI PERKASA</option>
                </select>
             </div>
             <div>
                <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1"><span className="text-gray-400">📦</span> Produk</label>
                <select value={filters.produk} onChange={e => handleFilterChange("produk", e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-green-500 focus:border-green-500">
                  <option>Semua Produk</option>
                  <option>VIDEOTRON</option>
                  <option>INTERACTIVE FLAT PANEL</option>
                  <option>KIOSK KIOSK</option>
                </select>
             </div>
             <div>
                <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1"><span className="text-gray-400">🗺️</span> Provinsi</label>
                <select value={filters.provinsi} onChange={e => handleFilterChange("provinsi", e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-green-500 focus:border-green-500">
                  <option>Semua Provinsi</option>
                  <option>Aceh</option>
                  <option>Bali</option>
                  <option>DKI Jakarta</option>
                </select>
             </div>
             <div>
                <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1"><span className="text-gray-400">📍</span> Kota</label>
                <select value={filters.kota} onChange={e => handleFilterChange("kota", e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-green-500 focus:border-green-500">
                  <option>Semua Kota</option>
                  <option>Kota Banda Aceh</option>
                  <option>Kabupaten Tabanan</option>
                  <option>Jakarta Selatan</option>
                </select>
             </div>
             <div>
                <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1"><span className="text-gray-400">💬</span> Status WA</label>
                <select value={filters.status_wa} onChange={e => handleFilterChange("status_wa", e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-green-500 focus:border-green-500">
                  <option>Semua Status</option>
                  <option>Terkirim</option>
                  <option>Dibaca</option>
                  <option>Dibalas</option>
                  <option>Gagal</option>
                  <option>- Pilih Status -</option>
                </select>
             </div>
             <div>
               <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1"><span className="text-gray-400">👤</span> Ke Sales</label>
               <select value={filters.to_sales} onChange={e => handleFilterChange("to_sales", e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-green-500 focus:border-green-500">
                 <option>Semua Sales</option>
                 <option>Sales A</option>
                 <option>Sales B</option>
                 <option>- Pilih Sales -</option>
               </select>
             </div>
           </div>
           <p className="text-xs text-gray-400 mt-4 italic">ⓘ Tips: Pilih filter dari mana saja, dropdown lain akan otomatis menyesuaikan berdasarkan data yang tersedia.</p>
         </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow-sm border border-t-0 border-gray-100 dark:border-gray-700 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
              <th className="p-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase w-16 text-center">NO</th>
              <th className="p-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase w-24 text-center">Lihat</th>
              <th className="p-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Perusahaan</th>
              <th className="p-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Produk</th>
              <th className="p-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Info Lokasi</th>
              <th className="p-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Kontak PIC</th>
              <th className="p-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Status WA</th>
              <th className="p-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Ke Sales</th>
              <th className="p-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase w-16 text-center border-l border-gray-200 dark:border-gray-700"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
             {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500 text-sm">Loading data...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500 text-sm">Tidak ada data broadcast yang ditemukan.</td>
                </tr>
              ) : (
                data.map((item, index) => {
                  const isModified = !!modifiedRows[item._id];
                  const currentStatus = modifiedRows[item._id]?.status_wa ?? item.status_wa;
                  const currentSales = modifiedRows[item._id]?.to_sales ?? item.to_sales;

                  return (
                    <tr key={item._id} className="hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-colors">
                      <td className="p-4 text-sm text-gray-500 text-center">{index + 1}</td>
                      <td className="p-4 text-sm text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button className="p-1.5 bg-cyan-400 hover:bg-cyan-500 text-white rounded text-xs transition-colors" title="Lihat Detail">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <a href={`https://wa.me/${item.kontak_pic.no_telp}?text=Halo%20${encodeURIComponent(item.kontak_pic.nama)}` } target="_blank" rel="noreferrer" className="p-1.5 bg-green-100 text-green-600 hover:bg-green-200 rounded text-xs transition-colors" title="Chat WA">
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-800 dark:text-gray-200 font-bold">{item.perusahaan}</td>
                      <td className="p-4 text-sm"><span className="text-blue-600 dark:text-blue-400 font-semibold">{item.produk}</span></td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-start gap-1">
                          <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <div>{item.kota}, {item.provinsi}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        <div className="text-gray-800 dark:text-gray-200 font-medium">- ({item.kontak_pic.jabatan || "-"})</div>
                        <div className="text-gray-500 flex items-center gap-1 mt-0.5"><MessageCircle className="w-3 h-3"/> {item.kontak_pic.no_telp}</div>
                      </td>
                      <td className="p-4 text-sm">
                        <select 
                          value={currentStatus} 
                          onChange={(e) => handleRowChange(item._id, "status_wa", e.target.value)}
                          className="w-full text-sm border-gray-200 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 dark:text-white"
                        >
                          <option>- Pilih Status -</option>
                          <option>Terkirim</option>
                          <option>Dibaca</option>
                          <option>Dibalas</option>
                          <option>Gagal</option>
                        </select>
                      </td>
                      <td className="p-4 text-sm">
                        <select 
                          value={currentSales} 
                          onChange={(e) => handleRowChange(item._id, "to_sales", e.target.value)}
                          className="w-full text-sm border-gray-200 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 dark:text-white"
                        >
                          <option>- Pilih Sales -</option>
                          <option>Sales A</option>
                          <option>Sales B</option>
                        </select>
                      </td>
                      <td className="p-4 text-sm text-center border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                         {isModified ? (
                           <button onClick={() => saveRow(item._id)} className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors" title="Simpan Perubahan">
                             <Save className="w-4 h-4" />
                           </button>
                         ) : (
                           <button className="p-2 bg-gray-300 dark:bg-gray-600 text-gray-50 cursor-not-allowed rounded" disabled>
                             <Save className="w-4 h-4" />
                           </button>
                         )}
                      </td>
                    </tr>
                  );
                })
              )}
          </tbody>
        </table>
      </div>
          </main>
        </div>
      </div>
    </div>
  );
}
