"use client";

import React, { useState, useEffect } from "react";
import { Search, RotateCcw, FileText, Link as LinkIcon, Eye } from "lucide-react";

type Report = {
  _id: string;
  tanggal: string;
  platform: string;
  akun: string;
  jenis: string;
  format: string;
  judul_konten: string;
  link: string;
  notif_report: string;
};

export default function MonitoringPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    platform: "Semua",
    akun: "Semua",
    jenis: "Semua",
    format: "Semua",
    notif_report: "Semua",
    kode_submit: ""
  });

  const fetchReports = async () => {
    setLoading(true);
    let url = "/api/marketing/digital/reports?";
    const params = new URLSearchParams();
    
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);
    if (filters.platform !== "Semua") params.append("platform", filters.platform);
    if (filters.akun !== "Semua") params.append("akun", filters.akun);
    if (filters.jenis !== "Semua") params.append("jenis", filters.jenis);
    if (filters.format !== "Semua") params.append("format", filters.format);

    try {
      const res = await fetch(url + params.toString());
      if (res.ok) {
        const json = await res.json();
        let data = json.data || [];
        
        // Filter by submission code and notif_report locally since it"s specific
        if (filters.kode_submit) {
           data = data.filter((item: Report) => item._id.includes(filters.kode_submit));
        }
        if (filters.notif_report !== "Semua") {
           data = data.filter((item: Report) => item.notif_report === filters.notif_report);
        }

        setReports(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      start_date: "",
      end_date: "",
      platform: "Semua",
      akun: "Semua",
      jenis: "Semua",
      format: "Semua",
      notif_report: "Semua",
      kode_submit: ""
    });
  };

  const totalKonten = reports.length;
  const sudahReport = reports.filter(r => r.notif_report === "Sudah Report" || r.notif_report === "Success").length;
  const belumReport = reports.length - sudahReport;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121420]">
      <div className="flex min-h-screen">
        <div className="flex-1 h-screen overflow-y-auto p-4 lg:p-8">
          <main className="mx-auto min-w-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
            Content Portal / <span className="text-gray-500">Monitoring</span>
          </h1>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors">
              Kembali
           </button>
           <button 
             onClick={fetchReports}
             className="px-4 py-2 bg-purple-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
           >
              <RotateCcw className="w-4 h-4" /> Refresh
           </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Konten</p>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalKonten}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ditampilkan</p>
          <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{totalKonten}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sudah Report</p>
          <div className="text-3xl font-bold text-green-500 dark:text-green-400">{sudahReport}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Belum Report</p>
          <div className="text-3xl font-bold text-yellow-500 dark:text-yellow-400">{belumReport}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-5 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-500" /> FILTER
          </h2>
          <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">DARI TGL</label>
            <input type="date" value={filters.start_date} onChange={e => handleFilterChange("start_date", e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-purple-500 focus:border-purple-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">SAMPAI</label>
            <input type="date" value={filters.end_date} onChange={e => handleFilterChange("end_date", e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-purple-500 focus:border-purple-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">PLATFORM</label>
            <select value={filters.platform} onChange={e => handleFilterChange("platform", e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:text-white">
              <option>Semua</option>
              <option>Instagram</option>
              <option>Tiktok</option>
              <option>Facebook</option>
              <option>Youtube</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">AKUN</label>
            <select value={filters.akun} onChange={e => handleFilterChange("akun", e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:text-white">
              <option>Semua</option>
              <option>Mabel Solusi Maju</option>
              <option>Nawi Advertising</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">JENIS</label>
            <select value={filters.jenis} onChange={e => handleFilterChange("jenis", e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:text-white">
              <option>Semua</option>
              <option>Feed / Post</option>
              <option>Video Pendek</option>
              <option>Story</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">FORMAT</label>
            <select value={filters.format} onChange={e => handleFilterChange("format", e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:text-white">
              <option>Semua</option>
              <option>Promosi</option>
              <option>Informasi</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">NOTIF REPORT</label>
            <select value={filters.notif_report} onChange={e => handleFilterChange("notif_report", e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:text-white">
              <option>Semua</option>
              <option>Failed Report</option>
              <option>Sudah Report</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">KODE SUBMIT</label>
            <input type="text" placeholder="Cari kode..." value={filters.kode_submit} onChange={e => handleFilterChange("kode_submit", e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-purple-500 focus:border-purple-500" />
          </div>
        </div>
      </div>

      {/* Data Table Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-purple-600"></div>
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Data Konten</h2>
          <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 font-medium">{reports.length} baris</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Platform</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Akun</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Jenis</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Format</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Judul Konten</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Notif Report</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500 text-sm">Loading data...</td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500 text-sm">Tidak ada data konten yang ditemukan.</td>
                </tr>
              ) : (
                reports.map((item, index) => (
                  <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300 font-medium">{item.tanggal}</td>
                    <td className="p-4 text-sm">
                       <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium text-xs">{item.platform}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-800 dark:text-gray-200 font-medium">{item.akun}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{item.jenis}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{item.format}</td>
                    <td className="p-4 text-sm text-gray-800 dark:text-gray-200 font-bold uppercase">{item.judul_konten}</td>
                    <td className="p-4 text-sm">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium 
                        ${item.notif_report === 'Failed Report' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.notif_report === 'Failed Report' ? 'bg-purple-600' : 'bg-green-600'}`}></span>
                        {item.notif_report}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition-colors" title="Lihat Dokumen">
                          <FileText className="w-4 h-4" />
                        </button>
                        {item.link && (
                          <a href={item.link} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition-colors" title="Buka Tautan">
                            <LinkIcon className="w-4 h-4" />
                          </a>
                        )}
                        <button className="p-1.5 text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-gray-700 rounded transition-colors" title="Detail">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
          </main>
        </div>
      </div>
    </div>
  );
}
