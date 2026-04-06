"use client";

import React, { useState } from "react";

export default function InputPage() {
  const [activeTab, setActiveTab] = useState<"report" | "performance">("report");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form states
  const [reportForm, setReportForm] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    platform: "Instagram",
    akun: "Mabel Solusi Maju",
    jenis: "Feed / Post",
    format: "Informasi",
    judul_konten: "",
    link: "",
    pic: ""
  });

  const [perfForm, setPerfForm] = useState({
    periode: "Mingguan",
    tanggal_mulai: "",
    tanggal_selesai: "",
    platform: "Instagram",
    akun: "Mabel Solusi Maju",
    jumlah_follower: 0,
    dm_tanya_produk: 0,
    dm_tanya_harga: 0,
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    reach: 0
  });

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/marketing/digital/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportForm)
      });
      if (res.ok) {
        setMessage({ type: 'success', text: "Report konten berhasil disubmit!" });
        setReportForm({ ...reportForm, judul_konten: "", link: "", pic: "" }); // reset specific fields
      } else {
         const data = await res.json();
         setMessage({ type: 'error', text: data.error || "Gagal submit report" });
      }
    } catch (error: any) {
       setMessage({ type: 'error', text: error.message });
    }
    setLoading(false);
  };

  const handlePerfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/marketing/digital/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(perfForm)
      });
      if (res.ok) {
        setMessage({ type: 'success', text: "Performance berhasil disubmit!" });
        // Reset numerical fields
        setPerfForm({ ...perfForm, jumlah_follower: 0, dm_tanya_produk: 0, dm_tanya_harga: 0, views: 0, likes: 0, comments: 0, shares: 0, reach: 0 });
      } else {
         const data = await res.json();
         setMessage({ type: 'error', text: data.error || "Gagal submit performance" });
      }
    } catch (error: any) {
       setMessage({ type: 'error', text: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121420]">
      <div className="flex min-h-screen">
        <div className="flex-1 h-screen overflow-y-auto p-4 lg:p-8">
          <main className="mx-auto min-w-0">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-600"></span>
          Digital Marketing / <span className="text-gray-500">Input Data</span>
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => { setActiveTab("report"); setMessage(null); }}
          className={`py-3 px-4 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "report" 
              ? "border-purple-600 text-purple-600 dark:text-purple-400" 
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Input Report Konten
        </button>
        <button
          onClick={() => { setActiveTab("performance"); setMessage(null); }}
          className={`py-3 px-4 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "performance"
              ? "border-purple-600 text-purple-600 dark:text-purple-400" 
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Input Performance
        </button>
      </div>

      {/* Notification */}
      {message && (
        <div className={`p-4 mb-6 rounded-md shadow-sm border ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'}`}>
           {message.text}
        </div>
      )}

      {/* Form Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
        {activeTab === "report" && (
          <form onSubmit={handleReportSubmit} className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 pb-3">Data Konten Spesifik</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Upload</label>
                <input required type="date" value={reportForm.tanggal} onChange={(e) => setReportForm({...reportForm, tanggal: e.target.value})} className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-purple-500 focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform</label>
                <select value={reportForm.platform} onChange={(e) => setReportForm({...reportForm, platform: e.target.value})} className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white">
                  <option>Instagram</option>
                  <option>Tiktok</option>
                  <option>Facebook</option>
                  <option>Youtube</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Akun</label>
                <select value={reportForm.akun} onChange={(e) => setReportForm({...reportForm, akun: e.target.value})} className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white">
                  <option>Mabel Solusi Maju</option>
                  <option>Nawi Advertising</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Konten</label>
                <select value={reportForm.jenis} onChange={(e) => setReportForm({...reportForm, jenis: e.target.value})} className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white">
                  <option>Feed / Post</option>
                  <option>Video Pendek</option>
                  <option>Story</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Format Konten</label>
                <select value={reportForm.format} onChange={(e) => setReportForm({...reportForm, format: e.target.value})} className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white">
                  <option>Informasi</option>
                  <option>Promosi</option>
                  <option>Edukasi</option>
                  <option>Hiburan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PIC (Penanggung Jawab)</label>
                <input required type="text" placeholder="Nama PIC" value={reportForm.pic} onChange={(e) => setReportForm({...reportForm, pic: e.target.value})} className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-purple-500 focus:border-purple-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Konten</label>
                <input required type="text" placeholder="Misal: PROMO FLAT PANEL INTERAKTIF" value={reportForm.judul_konten} onChange={(e) => setReportForm({...reportForm, judul_konten: e.target.value})} className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-purple-500 focus:border-purple-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link URL (Tautan Konten)</label>
                <input required type="url" placeholder="https://instagram.com/..." value={reportForm.link} onChange={(e) => setReportForm({...reportForm, link: e.target.value})} className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-purple-500 focus:border-purple-500" />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button disabled={loading} type="submit" className="px-6 py-2.5 bg-purple-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50">
                {loading ? "Menyimpan..." : "Submit Report"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "performance" && (
          <form onSubmit={handlePerfSubmit} className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 pb-3">Data Kinerja Sosial Media</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Periode</label>
                <select value={perfForm.periode} onChange={(e) => setPerfForm({...perfForm, periode: e.target.value})} className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white">
                  <option>Mingguan</option>
                  <option>Bulanan</option>
                  <option>Harian</option>
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mulai</label>
                  <input required type="date" value={perfForm.tanggal_mulai} onChange={(e) => setPerfForm({...perfForm, tanggal_mulai: e.target.value})} className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-purple-500 focus:border-purple-500" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Selesai</label>
                  <input required type="date" value={perfForm.tanggal_selesai} onChange={(e) => setPerfForm({...perfForm, tanggal_selesai: e.target.value})} className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-purple-500 focus:border-purple-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform</label>
                <select value={perfForm.platform} onChange={(e) => setPerfForm({...perfForm, platform: e.target.value})} className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white">
                  <option>Instagram</option>
                  <option>Tiktok</option>
                  <option>Facebook</option>
                  <option>Youtube</option>
                </select>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Akun</label>
                <select value={perfForm.akun} onChange={(e) => setPerfForm({...perfForm, akun: e.target.value})} className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white">
                  <option>Mabel Solusi Maju</option>
                  <option>Nawi Advertising</option>
                </select>
              </div>

              {/* Stats Numerical */}
              <div className="md:col-span-2 pt-2 pb-1">
                 <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Metrics Utama</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jumlah Follower / Subscriber</label>
                <input required type="number" min="0" value={perfForm.jumlah_follower} onChange={(e) => setPerfForm({...perfForm, jumlah_follower: parseInt(e.target.value) || 0})} className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-purple-500 focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reach / Jangkauan</label>
                <input required type="number" min="0" value={perfForm.reach} onChange={(e) => setPerfForm({...perfForm, reach: parseInt(e.target.value) || 0})} className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-purple-500 focus:border-purple-500" />
              </div>

              <div className="md:col-span-2 pt-2 pb-1">
                 <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Engagement & Inquiries</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DM Tanya Produk</label>
                <input required type="number" min="0" value={perfForm.dm_tanya_produk} onChange={(e) => setPerfForm({...perfForm, dm_tanya_produk: parseInt(e.target.value) || 0})} className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-purple-500 focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DM Tanya Harga</label>
                <input required type="number" min="0" value={perfForm.dm_tanya_harga} onChange={(e) => setPerfForm({...perfForm, dm_tanya_harga: parseInt(e.target.value) || 0})} className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-purple-500 focus:border-purple-500" />
              </div>

            </div>

            <div className="pt-4 flex justify-end">
              <button disabled={loading} type="submit" className="px-6 py-2.5 bg-purple-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50">
                {loading ? "Menyimpan..." : "Submit Performance"}
              </button>
            </div>
          </form>
        )}
      </div>
          </main>
        </div>
      </div>
    </div>
  );
}
