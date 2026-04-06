"use client";

import React, { useState, useEffect } from "react";
import { Database, Search, RotateCcw, MapPin, Phone } from "lucide-react";

type TelemarketingData = {
  _id: string;
  perusahaan: string;
  produk: string;
  provinsi: string;
  kota: string;
  alamat_lengkap: string;
  kontak_pic: {
    nama: string;
    no_telp: string;
    jabatan: string;
  };
  sumber_data: string;
  created_at: string;
};

export default function DatabasePage() {
  const [data, setData] = useState<TelemarketingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    let url = "/api/marketing/telemarketing/database";
    try {
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setData(json.data || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter(item => 
    item.perusahaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.provinsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kota.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kontak_pic.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121420]">
      <div className="flex min-h-screen">
        <div className="flex-1 h-screen overflow-y-auto p-4 lg:p-8">
          <main className="mx-auto min-w-0">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
             <Database className="w-6 h-6" />
           </div>
           <div>
             <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Database Telemarketing</h1>
             <p className="text-sm text-gray-500 dark:text-gray-400">Total {data.length} entri data tersimpan</p>
           </div>
        </div>
        <div className="flex gap-2">
           <div className="relative">
             <input 
               type="text" 
               placeholder="Cari perusahaan, kontak, kota..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-md py-2 pl-9 pr-4 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 min-w-[300px]" 
             />
             <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
           </div>
           <button 
             onClick={fetchData}
             className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
           >
              <RotateCcw className="w-4 h-4" /> Refresh
           </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
              <th className="p-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase w-16 text-center">NO</th>
              <th className="p-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Perusahaan / Instansi</th>
              <th className="p-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Produk</th>
              <th className="p-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Domisili</th>
              <th className="p-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Kontak PIC</th>
              <th className="p-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Sumber Data</th>
              <th className="p-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Tgl Input</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
             {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 text-sm">Loading database...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 text-sm">Tidak ada database yang ditemukan.</td>
                </tr>
              ) : (
                filteredData.map((item, index) => {
                  return (
                    <tr key={item._id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                      <td className="p-4 text-sm text-gray-500 text-center">{index + 1}</td>
                      <td className="p-4 text-sm">
                         <div className="font-bold text-gray-800 dark:text-gray-200">{item.perusahaan}</div>
                         <div className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-xs">{item.alamat_lengkap || "-"}</div>
                      </td>
                      <td className="p-4 text-sm"><span className="text-blue-600 dark:text-blue-400 font-semibold">{item.produk}</span></td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-start gap-1">
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-medium text-gray-700 dark:text-gray-300">{item.kota}</div>
                            <div className="text-xs text-gray-500">{item.provinsi}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        <div className="text-gray-800 dark:text-gray-200 font-medium">{item.kontak_pic.nama} <span className="text-gray-500 font-normal">({item.kontak_pic.jabatan || "-"})</span></div>
                        <div className="text-gray-500 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3"/> {item.kontak_pic.no_telp}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                         <span className="inline-flex py-1 px-2 rounded bg-gray-100 dark:bg-gray-700 text-xs font-medium">{item.sumber_data || "-"}</span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                         {item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-"}
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
