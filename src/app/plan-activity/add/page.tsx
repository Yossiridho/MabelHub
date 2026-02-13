"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/sidebar";
import { useSession } from "@/components/session/SessionProvider";

type PlanRow = {
  id: string;
  tanggal: string;
  kota: string;
  klpd: string;
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

export default function AddPlansPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const editId = sp.get("edit");

  const { user, loading: sessionLoading } = useSession();

  // ✅ Guard role (opsional)
  useEffect(() => {
    if (!sessionLoading && user) {
      const ok =
        user.role === "SALES" ||
        user.role === "LEADER" ||
        user.role === "ADMIN" ||
        user.role === "SUPERADMIN";
      if (!ok) router.replace("/");
    }
  }, [sessionLoading, user, router]);

  const [rows, setRows] = useState<PlanRow[]>([emptyRow()]);

  useEffect(() => {
    if (!editId) return;
    const plans = loadPlans();
    const found = plans.find((p) => p.id === editId);
    if (found) setRows([{ ...found }]);
  }, [editId]);

  function addCard() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeCard(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
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

  function submit() {
    const cleaned = rows.filter(
      (r) =>
        r.tanggal ||
        r.kota ||
        r.klpd ||
        r.institusi_kerja ||
        r.satuan_kerja ||
        r.status,
    );

    // ✅ amanin kalau user klik submit tapi semua kosong
    if (cleaned.length === 0) {
      router.push("/plan-activity");
      return;
    }

    const existing = loadPlans();

    if (editId) {
      const next = existing.map((p) =>
        p.id === editId ? { ...cleaned[0], id: editId } : p,
      );
      savePlans(next);
    } else {
      savePlans([...cleaned, ...existing]);
    }

    router.push("/plan-activity");
  }

  return (
    <div className="min-h-screen bg-[#d9d9d9]">
      <div className="flex">
        {/* ✅ sidebar dari session */}
        <Sidebar />

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

            {/* CARDS */}
            <div className="space-y-6">
              {rows.map((r, idx) => (
                <div
                  key={r.id}
                  className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/10"
                >
                  <div className="absolute left-6 top-6 grid h-10 w-10 place-items-center rounded-full bg-white text-sm font-bold text-gray-700">
                    {idx + 1}
                  </div>

                  {rows.length > 1 && (
                    <button
                      onClick={() => removeCard(r.id)}
                      className="absolute right-6 top-6 text-xl font-black text-black/80 hover:text-black"
                      aria-label="Remove"
                    >
                      ×
                    </button>
                  )}

                  {/* form layout */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="md:col-span-2 grid grid-cols-1 gap-6 md:grid-cols-2 md:items-end">
                      <div className="md:pl-16">
                        <label className="text-sm text-black">Tanggal</label>
                        <div className="relative mt-2">
                          <input
                            type="date"
                            value={r.tanggal}
                            onChange={(e) =>
                              patchRow(r.id, { tanggal: e.target.value })
                            }
                            className="h-11 w-full rounded-xl bg-white px-4 pr-10 text-sm outline-none ring-1 ring-black/15 focus:ring-2 focus:ring-black/20"
                          />
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M7 3v2M17 3v2M4 9h16M6 5h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm text-black">
                          Status Segmen
                        </label>
                        <div className="relative mt-2">
                          <select
                            value={r.status}
                            onChange={(e) =>
                              patchRow(r.id, { status: e.target.value })
                            }
                            className="h-11 w-full appearance-none rounded-xl bg-white px-4 pr-10 text-sm outline-none ring-1 ring-black/15 focus:ring-2 focus:ring-black/20"
                          >
                            <option value="">Pilih...</option>
                            <option value="VISITED">VISITED</option>
                            <option value="VISIT">VISIT</option>
                            <option value="NOT VISITED">NOT VISITED</option>
                          </select>
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-700">
                            ▾
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="md:pl-16">
                      <label className="text-sm text-black">Satuan Kerja</label>
                      <input
                        value={r.satuan_kerja}
                        onChange={(e) =>
                          patchRow(r.id, { satuan_kerja: e.target.value })
                        }
                        className="mt-2 h-12 w-full rounded-xl bg-white px-4 text-sm outline-none ring-1 ring-black/15 focus:ring-2 focus:ring-black/20"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-black">K/L/PD</label>
                      <input
                        value={r.klpd}
                        onChange={(e) =>
                          patchRow(r.id, { klpd: e.target.value })
                        }
                        className="mt-2 h-12 w-full rounded-xl bg-white px-4 text-sm outline-none ring-1 ring-black/15 focus:ring-2 focus:ring-black/20"
                      />
                    </div>

                    <div className="md:pl-16">
                      <label className="text-sm text-black">
                        Institusi Kerja
                      </label>
                      <input
                        value={r.institusi_kerja}
                        onChange={(e) =>
                          patchRow(r.id, { institusi_kerja: e.target.value })
                        }
                        className="mt-2 h-12 w-full rounded-xl bg-white px-4 text-sm outline-none ring-1 ring-black/15 focus:ring-2 focus:ring-black/20"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-black">Kota</label>
                      <input
                        value={r.kota}
                        onChange={(e) =>
                          patchRow(r.id, { kota: e.target.value })
                        }
                        className="mt-2 h-12 w-full rounded-xl bg-white px-4 text-sm outline-none ring-1 ring-black/15 focus:ring-2 focus:ring-black/20"
                      />
                    </div>
                  </div>
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
