"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/sidebar/sidebar";
import type { Role } from "@/lib/menu";

type PlanRow = {
  id: string;
  tanggal: string;
  kota: string;
  klpd: string;
  institusi_kerja: string;
  satuan_kerja: string;
  status: string;
};

const LS_KEY = "mabelhub_plan_activity_v1";

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadPlans(): PlanRow[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePlans(plans: PlanRow[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(plans));
  } catch {}
}

function emptyRow(): PlanRow {
  return {
    id: uid(),
    tanggal: "",
    kota: "",
    klpd: "",
    institusi_kerja: "",
    satuan_kerja: "",
    status: "",
  };
}

export default function AddPlansPage() {
  const role: Role = "SUPERADMIN";
  const router = useRouter();
  const sp = useSearchParams();
  const editId = sp.get("edit");

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

  function patchRow(id: string, patch: Partial<PlanRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function submit() {
    const cleaned = rows.filter(
      (r) => r.tanggal || r.kota || r.klpd || r.institusi_kerja || r.satuan_kerja || r.status,
    );

    const existing = loadPlans();

    if (editId) {
      // update
      const next = existing.map((p) => (p.id === editId ? { ...cleaned[0], id: editId } : p));
      savePlans(next);
    } else {
      // insert (prepend)
      savePlans([...cleaned, ...existing]);
    }

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
                  onClick={() => router.push("/plan-activity")}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/70 text-gray-700 shadow-sm ring-1 ring-black/10 hover:bg-white"
                  aria-label="Back"
                >
                  ←
                </button>
                <h1 className="text-2xl font-extrabold tracking-wide text-black">
                  {editId ? "EDIT PLANS" : "ADD PLANS"}
                </h1>
              </div>

              <button
                type="button"
                className="rounded-full bg-white px-5 py-2 text-sm font-extrabold shadow ring-1 ring-black/10 hover:bg-gray-50"
              >
                REGISTER COMPANY
              </button>
            </div>

            {/* CARDS */}
            <div className="space-y-6">
              {rows.map((r, idx) => (
                <div
                  key={r.id}
                  className="relative rounded-2xl bg-[#f5efef] p-6 shadow-sm ring-1 ring-black/10"
                >
                  <div className="absolute left-6 top-6 grid h-10 w-10 place-items-center rounded-full bg-gray-200 text-sm font-bold text-gray-700">
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

                  {/* form layout mirip gambar */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="md:col-span-2 grid grid-cols-1 gap-6 md:grid-cols-2 md:items-end">
                      <div className="md:pl-16">
                        <label className="text-sm text-black">Tanggal</label>
                        <div className="relative mt-2">
                          <input
                            type="date"
                            value={r.tanggal}
                            onChange={(e) => patchRow(r.id, { tanggal: e.target.value })}
                            className="h-11 w-full rounded-xl bg-white px-4 pr-10 text-sm outline-none ring-1 ring-black/15 focus:ring-2 focus:ring-black/20"
                          />
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
                        <label className="text-sm text-black">Status Segmen</label>
                        <div className="relative mt-2">
                          <select
                            value={r.status}
                            onChange={(e) => patchRow(r.id, { status: e.target.value })}
                            className="h-11 w-full appearance-none rounded-xl bg-gray-200 px-4 pr-10 text-sm outline-none ring-1 ring-black/15 focus:ring-2 focus:ring-black/20"
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
                        onChange={(e) => patchRow(r.id, { satuan_kerja: e.target.value })}
                        className="mt-2 h-12 w-full rounded-xl bg-gray-200 px-4 text-sm outline-none ring-1 ring-black/15 focus:ring-2 focus:ring-black/20"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-black">K/L/PD</label>
                      <input
                        value={r.klpd}
                        onChange={(e) => patchRow(r.id, { klpd: e.target.value })}
                        className="mt-2 h-12 w-full rounded-xl bg-gray-200 px-4 text-sm outline-none ring-1 ring-black/15 focus:ring-2 focus:ring-black/20"
                      />
                    </div>

                    <div className="md:pl-16">
                      <label className="text-sm text-black">Institusi Kerja</label>
                      <input
                        value={r.institusi_kerja}
                        onChange={(e) => patchRow(r.id, { institusi_kerja: e.target.value })}
                        className="mt-2 h-12 w-full rounded-xl bg-gray-200 px-4 text-sm outline-none ring-1 ring-black/15 focus:ring-2 focus:ring-black/20"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-black">Kota</label>
                      <input
                        value={r.kota}
                        onChange={(e) => patchRow(r.id, { kota: e.target.value })}
                        className="mt-2 h-12 w-full rounded-xl bg-gray-200 px-4 text-sm outline-none ring-1 ring-black/15 focus:ring-2 focus:ring-black/20"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* FOOTER BUTTONS */}
            {!editId && (
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={addCard}
                  className="h-12 w-64 rounded-full bg-white text-base font-extrabold shadow ring-1 ring-black/10 hover:bg-gray-50"
                >
                  TAMBAH VISIT
                </button>

                <button
                  onClick={submit}
                  className="h-12 w-64 rounded-full bg-white text-base font-extrabold shadow ring-1 ring-black/10 hover:bg-gray-50"
                >
                  SUBMIT
                </button>
              </div>
            )}

            {editId && (
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => router.push("/plan-activity")}
                  className="h-12 w-48 rounded-full bg-white text-base font-extrabold shadow ring-1 ring-black/10 hover:bg-gray-50"
                >
                  BATAL
                </button>
                <button
                  onClick={submit}
                  className="h-12 w-48 rounded-full bg-white text-base font-extrabold shadow ring-1 ring-black/10 hover:bg-gray-50"
                >
                  SIMPAN
                </button>
              </div>
            )}

            <div className="h-10" />
          </main>
        </div>
      </div>
    </div>
  );
}
