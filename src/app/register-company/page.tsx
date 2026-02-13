"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/sidebar";
import { Role } from "@/lib/menu";



export default function RegisterCompanyPage() {
  const router = useRouter();
  const role: Role = "USER";

  const [form, setForm] = useState({
    institusi_kerja: "",
    kota_kab: "",
    klpd: "",
    satuan_kerja: "",
    status_ring: "",
    pic_nama: "",
    pic_telp: "",
    pic_jabatan: "",
    pic_role: "",
  });

  async function submit() {
    const payload = {
      institusi_kerja: form.institusi_kerja,
      kota_kab: form.kota_kab,
      klpd: form.klpd,
      satuan_kerja: form.satuan_kerja,
      status_ring: form.status_ring,
      pic_default: {
        nama: form.pic_nama,
        no_telp: form.pic_telp,
        jabatan: form.pic_jabatan,
        role: form.pic_role,
      },
    };

    // SUPER_ADMIN langsung approved -> companies
    const endpoint = role === "SUPERADMIN" ? "/api/companies" : "/api/company-requests";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("Gagal submit");
      return;
    }

    alert(role === "SUPERADMIN" ? "Company berhasil di-approve" : "Request berhasil dikirim (Pending)");
    router.back();
  }

  return (
    <div className="min-h-screen bg-[#d9d9d9]">
      <div className="flex">
        <Sidebar role={role} />

        <div className="flex-1 p-6 h-screen overflow-y-auto">
          <main className="mx-auto max-w-4xl rounded-2xl bg-[#f5efef] p-8 ring-1 ring-black/10">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-xl font-extrabold">REGISTER COMPANY</h1>
              <button onClick={() => router.back()} className="text-2xl font-black">
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm">Nama Institusi</label>
                <input
                  value={form.institusi_kerja}
                  onChange={(e) => setForm((p) => ({ ...p, institusi_kerja: e.target.value }))}
                  className="mt-2 h-12 w-full rounded-xl bg-gray-200 px-4 text-sm ring-1 ring-black/10 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="text-sm">Kota/Kabupaten</label>
                  <input
                    value={form.kota_kab}
                    onChange={(e) => setForm((p) => ({ ...p, kota_kab: e.target.value }))}
                    className="mt-2 h-12 w-full rounded-xl bg-gray-200 px-4 text-sm ring-1 ring-black/10 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm">KLPD</label>
                  <input
                    value={form.klpd}
                    onChange={(e) => setForm((p) => ({ ...p, klpd: e.target.value }))}
                    className="mt-2 h-12 w-full rounded-xl bg-gray-200 px-4 text-sm ring-1 ring-black/10 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm">Satuan Kerja</label>
                  <input
                    value={form.satuan_kerja}
                    onChange={(e) => setForm((p) => ({ ...p, satuan_kerja: e.target.value }))}
                    className="mt-2 h-12 w-full rounded-xl bg-gray-200 px-4 text-sm ring-1 ring-black/10 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm">Status Ring</label>
                  <select
                    value={form.status_ring}
                    onChange={(e) => setForm((p) => ({ ...p, status_ring: e.target.value }))}
                    className="mt-2 h-12 w-full rounded-xl bg-gray-200 px-4 text-sm ring-1 ring-black/10 outline-none"
                  >
                    <option value="">Pilih...</option>
                    <option value="RING 1">RING 1</option>
                    <option value="RING 2">RING 2</option>
                    <option value="RING 3">RING 3</option>
                    <option value="RING 4">RING 4</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm">Nama PIC</label>
                  <input
                    value={form.pic_nama}
                    onChange={(e) => setForm((p) => ({ ...p, pic_nama: e.target.value }))}
                    className="mt-2 h-12 w-full rounded-xl bg-gray-200 px-4 text-sm ring-1 ring-black/10 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm">No. Telepon PIC</label>
                  <input
                    value={form.pic_telp}
                    onChange={(e) => setForm((p) => ({ ...p, pic_telp: e.target.value }))}
                    className="mt-2 h-12 w-full rounded-xl bg-gray-200 px-4 text-sm ring-1 ring-black/10 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm">Jabatan PIC</label>
                  <input
                    value={form.pic_jabatan}
                    onChange={(e) => setForm((p) => ({ ...p, pic_jabatan: e.target.value }))}
                    className="mt-2 h-12 w-full rounded-xl bg-gray-200 px-4 text-sm ring-1 ring-black/10 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm">Role PIC</label>
                  <input
                    value={form.pic_role}
                    onChange={(e) => setForm((p) => ({ ...p, pic_role: e.target.value }))}
                    className="mt-2 h-12 w-full rounded-xl bg-gray-200 px-4 text-sm ring-1 ring-black/10 outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={submit}
                  className="h-12 w-56 rounded-full bg-gray-300 text-base font-extrabold ring-1 ring-black/10 hover:bg-gray-200"
                >
                  SUBMIT
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
