"use client";

import React, { useState } from "react";

export default function TelemarketingInputPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [form, setForm] = useState({
    perusahaan: "",
    produk: "VIDEOTRON",
    provinsi: "",
    kota: "",
    alamat_lengkap: "",
    kontak_pic: {
      nama: "",
      jabatan: "",
      no_telp: ""
    },
    sumber_data: "Google Maps"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/marketing/telemarketing/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setMessage({ type: 'success', text: "Data telemarketing berhasil disimpan!" });
        setForm({
          ...form,
          perusahaan: "",
          alamat_lengkap: "",
          kontak_pic: { nama: "", jabatan: "", no_telp: "" }
        });
      } else {
         const data = await res.json();
         setMessage({ type: 'error', text: data.error || "Gagal menyimpan data" });
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
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Telemarketing / <span className="text-gray-500">Input Database</span>
        </h1>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-md shadow-sm border ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'}`}>
           {message.text}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 pb-3">Informasi Entitas & Lokasi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Perusahaan / Instansi</label>
              <input required type="text" placeholder="Misal: NAWI ADVERTISING" value={form.perusahaan} onChange={(e) => setForm({...form, perusahaan: e.target.value})} className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Produk Target</label>
              <select value={form.produk} onChange={(e) => setForm({...form, produk: e.target.value})} className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white">
                <option>VIDEOTRON</option>
                <option>INTERACTIVE FLAT PANEL</option>
                <option>KIOSK KIOSK</option>
                <option>DIGITAL SIGNAGE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Provinsi</label>
              <input required type="text" placeholder="Misal: Aceh" value={form.provinsi} onChange={(e) => setForm({...form, provinsi: e.target.value})} className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kota/Kabupaten</label>
              <input required type="text" placeholder="Misal: Kota Banda Aceh" value={form.kota} onChange={(e) => setForm({...form, kota: e.target.value})} className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sumber Data</label>
              <select value={form.sumber_data} onChange={(e) => setForm({...form, sumber_data: e.target.value})} className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white">
                <option>Google Maps</option>
                <option>Instagram</option>
                <option>Facebook</option>
                <option>Website/Directory</option>
                <option>Referral</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat Lengkap</label>
              <textarea rows={2} placeholder="Alamat lengkap operasional" value={form.alamat_lengkap} onChange={(e) => setForm({...form, alamat_lengkap: e.target.value})} className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-green-500 focus:border-green-500" />
            </div>
          </div>

          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 pb-3 pt-4">Informasi Kontak PIC</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama PIC</label>
              <input required type="text" placeholder="Nama Contact Person" value={form.kontak_pic.nama} onChange={(e) => setForm({...form, kontak_pic: {...form.kontak_pic, nama: e.target.value}})} className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jabatan PIC</label>
              <input type="text" placeholder="Misal: Owner, Manager" value={form.kontak_pic.jabatan} onChange={(e) => setForm({...form, kontak_pic: {...form.kontak_pic, jabatan: e.target.value}})} className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-green-500 focus:border-green-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No. WhatsApp / Telepon</label>
              <input required type="tel" placeholder="62812xxxxxx" value={form.kontak_pic.no_telp} onChange={(e) => setForm({...form, kontak_pic: {...form.kontak_pic, no_telp: e.target.value}})} className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-green-500 focus:border-green-500" />
            </div>
          </div>

          <div className="pt-6 flex justify-end">
             <button disabled={loading} type="submit" className="px-6 py-2.5 bg-green-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50">
               {loading ? "Menyimpan..." : "Simpan Database"}
             </button>
          </div>
        </form>
      </div>
          </main>
        </div>
      </div>
    </div>
  );
}
