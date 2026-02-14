"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/sidebar/sidebar";
import { useSession } from "@/components/session/SessionProvider";

type PlanRow = {
  id: string;
  tanggal: string;
  kota: string;
  klpd: string;
  institusi_kerja: string;
  satuan_kerja: string;
  status: string;
};

function uidTemp() {
  return `tmp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function emptyRow(): PlanRow {
  return {
    id: uidTemp(), // hanya untuk key UI, bukan id DB
    tanggal: "",
    kota: "",
    klpd: "",
    institusi_kerja: "",
    satuan_kerja: "",
    status: "",
  };
}

async function apiGetPlan(id: string): Promise<PlanRow | null> {
  const res = await fetch(`/api/visits/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const json = await res.json().catch(() => ({}));
  return (json?.data ?? null) as PlanRow | null;
}

async function apiCreatePlans(items: Omit<PlanRow, "id">[]) {
  const res = await fetch("/api/visits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error ?? "Gagal submit");
  return json;
}

async function apiUpdatePlan(id: string, patch: Partial<Omit<PlanRow, "id">>) {
  const res = await fetch(`/api/visits/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error ?? "Gagal update");
  return json?.data as PlanRow;
}

export default function AddPlansPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const editId = sp.get("edit");

  const { user, loading: sessionLoading } = useSession();

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
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // load edit from DB
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!editId) return;

      const found = await apiGetPlan(editId);
      if (!mounted) return;

      if (found) {
        setRows([{ ...found }]); // found.id adalah id DB
      } else {
        setErr("Data tidak ditemukan.");
      }
    })();

    return () => {
      mounted = false;
    };
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

  async function submit() {
    try {
      setErr("");
      setSaving(true);

      const cleaned = rows
        .map((r) => ({
          tanggal: r.tanggal,
          kota: r.kota,
          klpd: r.klpd,
          institusi_kerja: r.institusi_kerja,
          satuan_kerja: r.satuan_kerja,
          status: r.status,
        }))
        .filter(
          (r) =>
            r.tanggal ||
            r.kota ||
            r.klpd ||
            r.institusi_kerja ||
            r.satuan_kerja ||
            r.status,
        );

      if (cleaned.length === 0) {
        router.push("/plan-activity");
        return;
      }

      if (editId) {
        // hanya update 1 row (sesuai UI edit)
        await apiUpdatePlan(editId, cleaned[0]);
      } else {
        // bulk insert
        await apiCreatePlans(cleaned);
      }

      router.push("/plan-activity");
    } catch (e: any) {
      setErr(e?.message ?? "Gagal submit");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="flex">
        <Sidebar />

        <div className="flex-1 h-screen overflow-y-auto p-6">
          <main className="w-full max-w-none">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/plan-activity")}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white text-gray-700 shadow-sm ring-1 ring-black/10"
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
                className="rounded-full bg-white px-5 py-2 text-sm font-extrabold shadow ring-1 ring-black/10 hover:bg-white"
              >
                REGISTER COMPANY
              </button>
            </div>

            {err ? (
              <div className="mb-4 rounded bg-red-100 px-4 py-2 text-sm text-red-700">
                {err}
              </div>
            ) : null}

            <div className="space-y-6">
              {rows.map((r, idx) => (
                <div
                  key={r.id}
                  className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/10"
                >
                  <div className="absolute left-6 top-6 grid h-10 w-10 place-items-center rounded-full bg-white text-sm font-bold text-gray-700">
                    {idx + 1}
                  </div>

                  {!editId && rows.length > 1 && (
                    <button
                      onClick={() => removeCard(r.id)}
                      className="absolute right-6 top-6 text-xl font-black text-black/80 hover:text-black"
                      aria-label="Remove"
                    >
                      ×
                    </button>
                  )}

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
              ))}
            </div>

            {!editId && (
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={addCard}
                  disabled={saving}
                  className="h-12 w-64 rounded-full bg-white text-base font-extrabold shadow ring-1 ring-black/10 hover:bg-gray-50 disabled:opacity-60"
                >
                  TAMBAH VISIT
                </button>

                <button
                  onClick={submit}
                  disabled={saving}
                  className="h-12 w-64 rounded-full bg-white text-base font-extrabold shadow ring-1 ring-black/10 hover:bg-gray-50 disabled:opacity-60"
                >
                  {saving ? "SUBMIT..." : "SUBMIT"}
                </button>
              </div>
            )}

            {editId && (
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => router.push("/plan-activity")}
                  disabled={saving}
                  className="h-12 w-48 rounded-full bg-white text-base font-extrabold shadow ring-1 ring-black/10 hover:bg-gray-50 disabled:opacity-60"
                >
                  BATAL
                </button>
                <button
                  onClick={submit}
                  disabled={saving}
                  className="h-12 w-48 rounded-full bg-white text-base font-extrabold shadow ring-1 ring-black/10 hover:bg-gray-50 disabled:opacity-60"
                >
                  {saving ? "SIMPAN..." : "SIMPAN"}
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
