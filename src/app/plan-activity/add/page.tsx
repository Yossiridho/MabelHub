"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/sidebar";
import type { Role } from "@/lib/menu";

const role: Role = "USER";

type Company = {
  _id: string;
  institusi_kerja: string;
  satuan_kerja: string;
  kota_kab: string;
  klpd: string;
  status_ring: string;
  pic_default?: {
    nama?: string;
    no_telp?: string;
    jabatan?: string;
    role?: string;
  };
};

export default function AddPlanPage() {
  const router = useRouter();
  

  // form
  const [tanggal, setTanggal] = useState("");
  const [ring, setRing] = useState("");
  const [institusiQuery, setInstitusiQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // autofill fields
  const [kota, setKota] = useState("");
  const [klpd, setKlpd] = useState("");
  const [satuanKerja, setSatuanKerja] = useState("");
  const [picNama, setPicNama] = useState("");
  const [picTelp, setPicTelp] = useState("");
  const [picJabatan, setPicJabatan] = useState("");
  const [picRole, setPicRole] = useState("");

  // suggestion
  const [loadingSug, setLoadingSug] = useState(false);
  const [sugs, setSugs] = useState<Company[]>([]);
  const [showSug, setShowSug] = useState(false);

  async function fetchSuggestion(q: string) {
    if (!ring) return;
    setLoadingSug(true);
    try {
      const res = await fetch(
        `/api/companies?ring=${encodeURIComponent(ring)}&q=${encodeURIComponent(q)}`,
      );
      const data = await res.json();
      setSugs(Array.isArray(data) ? data : []);
    } finally {
      setLoadingSug(false);
    }
  }

  function pickCompany(c: Company) {
    setSelectedCompany(c);
    setInstitusiQuery(c.institusi_kerja);
    setShowSug(false);

    setKota(c.kota_kab || "");
    setKlpd(c.klpd || "");
    setSatuanKerja(c.satuan_kerja || "");
    setPicNama(c.pic_default?.nama || "");
    setPicTelp(c.pic_default?.no_telp || "");
    setPicJabatan(c.pic_default?.jabatan || "");
    setPicRole(c.pic_default?.role || "");
  }

  async function submitPlan() {
    if (!tanggal || !ring || !selectedCompany?._id) {
      alert("Tanggal, Ring, dan Institusi wajib diisi.");
      return;
    }

    const payload = {
      tanggal_plan: tanggal,
      status_ring: ring,
      company_id: selectedCompany._id,
      snapshot: {
        institusi_kerja: selectedCompany.institusi_kerja,
        satuan_kerja: satuanKerja,
        kota_kab: kota,
        klpd,
        status_ring: ring,
        pic: {
          nama: picNama,
          no_telp: picTelp,
          jabatan: picJabatan,
          role: picRole,
        },
      },
      created_by_user_id: null, // nanti isi dari session user
    };

    const res = await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("Gagal submit plan");
      return;
    }

    alert("Plan tersimpan.");
    router.push("/plan-activity");
  }

  return (
    <div className="min-h-screen bg-[#d9d9d9]">
      <div className="flex">
        <Sidebar role={role} />

        <div className="flex-1 p-6 h-screen overflow-y-auto">
          <main className="mx-auto max-w-5xl">
            {/* TOP BAR */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/70 text-gray-700 shadow-sm ring-1 ring-black/10 hover:bg-white"
                >
                  ←
                </button>
                <h1 className="text-2xl font-extrabold tracking-wide text-black">
                  ADD PLANS
                </h1>
              </div>

              {/* user bisa request company, super admin bisa register langsung */}
              {role === "USER" && (
                <button
                  type="button"
                  onClick={() => router.push("/register-company")}
                  className="rounded-full bg-white px-5 py-2 text-sm font-extrabold shadow ring-1 ring-black/10 hover:bg-gray-50"
                >
                  Register Company
                </button>
              )}
            </div>

            <div className="rounded-2xl bg-[#f5efef] p-6 ring-1 ring-black/10">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="text-sm">Tanggal</label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="mt-2 h-12 w-full rounded-xl bg-white px-4 text-sm ring-1 ring-black/10 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm">Status Ring (pilih dulu)</label>
                  <select
                    value={ring}
                    onChange={(e) => {
                      setRing(e.target.value);
                      setSelectedCompany(null);
                      setInstitusiQuery("");
                      setSugs([]);
                    }}
                    className="mt-2 h-12 w-full rounded-xl bg-gray-200 px-4 text-sm ring-1 ring-black/10 outline-none"
                  >
                    <option value="">Pilih...</option>
                    <option value="RING 1">RING 1</option>
                    <option value="RING 2">RING 2</option>
                    <option value="RING 3">RING 3</option>
                    <option value="RING 4">RING 4</option>
                  </select>
                </div>

                {/* INSTITUSI - AUTOCOMPLETE */}
                <div className="md:col-span-2">
                  <label className="text-sm">
                    Institusi (suggestion sesuai ring & approved)
                  </label>
                  <div className="relative mt-2">
                    <input
                      value={institusiQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInstitusiQuery(val);
                        setShowSug(true);
                        if (ring) fetchSuggestion(val);
                      }}
                      onFocus={() => {
                        if (ring) {
                          setShowSug(true);
                          fetchSuggestion(institusiQuery);
                        }
                      }}
                      disabled={!ring}
                      placeholder={
                        !ring
                          ? "Pilih Status Ring dulu"
                          : "Ketik nama institusi..."
                      }
                      className="h-12 w-full rounded-xl bg-white px-4 text-sm ring-1 ring-black/10 outline-none disabled:bg-gray-100"
                    />

                    {showSug && ring && (
                      <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl bg-white shadow ring-1 ring-black/10">
                        {loadingSug ? (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            Loading...
                          </div>
                        ) : sugs.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            Tidak ada instansi approved untuk ring ini.
                          </div>
                        ) : (
                          sugs.map((c) => (
                            <button
                              key={c._id}
                              onClick={() => pickCompany(c)}
                              className="block w-full px-4 py-3 text-left text-sm hover:bg-gray-50"
                            >
                              <div className="font-semibold">
                                {c.institusi_kerja}
                              </div>
                              <div className="text-xs text-gray-500">
                                {c.satuan_kerja} • {c.kota_kab} • {c.klpd}
                              </div>
                            </button>
                          ))
                        )}
                        <button
                          onClick={() => setShowSug(false)}
                          className="w-full border-t px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                        >
                          Tutup
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Autofill fields */}
                <div>
                  <label className="text-sm">Kota/Kabupaten</label>
                  <input
                    value={kota}
                    readOnly
                    className="mt-2 h-12 w-full rounded-xl bg-gray-200 px-4 text-sm ring-1 ring-black/10 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm">KLPD</label>
                  <input
                    value={klpd}
                    readOnly
                    className="mt-2 h-12 w-full rounded-xl bg-gray-200 px-4 text-sm ring-1 ring-black/10 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm">Satuan Kerja</label>
                  <input
                    value={satuanKerja}
                    readOnly
                    className="mt-2 h-12 w-full rounded-xl bg-gray-200 px-4 text-sm ring-1 ring-black/10 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm">Nama PIC</label>
                  <input
                    value={picNama}
                    readOnly
                    className="mt-2 h-12 w-full rounded-xl bg-gray-200 px-4 text-sm ring-1 ring-black/10 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm">No Telepon PIC</label>
                  <input
                    value={picTelp}
                    readOnly
                    className="mt-2 h-12 w-full rounded-xl bg-gray-200 px-4 text-sm ring-1 ring-black/10 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm">Jabatan PIC</label>
                  <input
                    value={picJabatan}
                    readOnly
                    className="mt-2 h-12 w-full rounded-xl bg-gray-200 px-4 text-sm ring-1 ring-black/10 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm">Role PIC</label>
                  <input
                    value={picRole}
                    readOnly
                    className="mt-2 h-12 w-full rounded-xl bg-gray-200 px-4 text-sm ring-1 ring-black/10 outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={submitPlan}
                  className="h-12 w-56 rounded-full bg-gray-300 text-base font-extrabold ring-1 ring-black/10 hover:bg-gray-200"
                >
                  SUBMIT
                </button>
              </div>
            </div>

            <div className="h-10" />
          </main>
        </div>
      </div>
    </div>
  );
}
