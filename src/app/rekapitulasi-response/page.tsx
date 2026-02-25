"use client";

import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/sidebar/sidebar";
import { useSession } from "@/components/session/SessionProvider";
import { useRouter } from "next/navigation";
import SearchableSelect from "@/components/ui/SearchableSelect";

type ProductItem = {
  id: string;
  merek: string;
  subKategori: string;
  qty: number;
  spesifikasi: string;
  paguPerItem: number | "";
  hargaTayang: number | "";
  linkInaproc: string;
  linkEcom: string;

  statusBarangAdmin?: string;
  tayangInaprocAdmin?: string;
  catatanAdminItem?: string;
};

type EProcRow = {
  requestId: string;
  requestor: string;
  pemohon: string;
  lokasi: string;
  segmen: string;
  deadlineUsulan: string | Date;
  tanggalSubmit: string | Date;
  catatan?: string;

  items?: ProductItem[]; // ✅ newly added

  takenByAdminId?: string | null;
  takenByAdminName?: string | null;
  takenAt?: string | Date | null;

  // ✅ admin response fields
  perusahaan?: string;
  statusBarang?: string;
  catatanAdmin?: string;
  tayangInaproc?: string;
  statusAkhir?: string;
  statusUsulan?: string;

  tanggalKontrak?: string;
  nominalKontrak?: number;

  tanggalPembayaran?: string;
  nominalPembayaran?: number;
};

function fmtDate(d: string | Date) {
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "-";
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function fmtDateTime(d: string | Date) {
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "-";
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  const hh = String(dt.getHours()).padStart(2, "0");
  const mi = String(dt.getMinutes()).padStart(2, "0");
  const ss = String(dt.getSeconds()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy} ${hh}:${mi}:${ss}`;
}

/** ✅ Server harus tentukan akses berdasarkan session */
async function apiListTaken(): Promise<EProcRow[]> {
  const res = await fetch(`/api/e-procurement/requests?mode=taken`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) return [];
  const json = await res.json().catch(() => ({}));
  return (json?.data ?? []) as EProcRow[];
}

export default function RekapitulasiResponsePage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();

  const isSuperAdmin = user?.role === "SUPERADMIN";
  const isAdmin = user?.role === "ADMIN";

  const [rows, setRows] = useState<EProcRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [adminFilter, setAdminFilter] = useState("");
  const [q, setQ] = useState("");

  const [openDetail, setOpenDetail] = useState<Record<string, boolean>>({});

  // ✅ Guard: halaman ini hanya untuk SUPERADMIN/ADMIN
  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      router.replace("/");
      return;
    }
    if (!isSuperAdmin && !isAdmin) {
      router.replace("/dashboard-request");
      return;
    }
  }, [sessionLoading, user, isSuperAdmin, isAdmin, router]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (sessionLoading) return; // tunggu session dulu
      if (!user) return;

      setLoading(true);
      const data = await apiListTaken();
      if (mounted) setRows(data);
      if (mounted) setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [sessionLoading, user]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const af = adminFilter.trim().toLowerCase();

    return rows.filter((r) => {
      const matchAdmin =
        !isSuperAdmin ||
        !af ||
        (r.takenByAdminName ?? "").toLowerCase().includes(af);

      const matchQ =
        !qq ||
        [
          r.requestId,
          r.requestor,
          r.pemohon,
          r.lokasi,
          r.segmen,
          r.takenByAdminName ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(qq);

      return matchAdmin && matchQ;
    });
  }, [rows, adminFilter, q, isSuperAdmin]);

  return (
    <div className="min-h-screen bg-slate-50 relative selection:bg-indigo-100 selection:text-indigo-900">
      <div className="flex relative z-10">
        <Sidebar />

        <div className="flex-1 p-6 h-screen overflow-y-auto">
          <div className="px-3 pt-2 pb-2">
            <h1 className="text-2xl font-extrabold pl-4 text-black">
              REKAPITULASI RESPONSE
            </h1>
            <div className="mt-1 text-sm text-neutral-600">
              Menampilkan request e-procurement yang sudah diambil admin.
            </div>

            {/* Filter bar */}
            <div className="mt-6 rounded-2xl bg-white/70 backdrop-blur-xl p-5 shadow-sm border border-slate-200/60 transition-shadow hover:shadow-md">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari requestId / pemohon / lokasi / segmen..."
                  className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm outline-none transition-all focus:ring-4 focus:border-indigo-400 focus:ring-indigo-400/20"
                />

                {isSuperAdmin ? (
                  <input
                    value={adminFilter}
                    onChange={(e) => setAdminFilter(e.target.value)}
                    placeholder="Filter Admin (nama)..."
                    className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm outline-none transition-all focus:ring-4 focus:border-indigo-400 focus:ring-indigo-400/20"
                  />
                ) : null}
              </div>
            </div>

            {/* Table */}
            <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200">
              <div className="border-b border-slate-100 bg-slate-50/50 flex items-center justify-between px-6 py-4">
                <h3 className="text-sm font-semibold text-slate-800">
                  Data Rekapitulasi
                </h3>
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 border border-indigo-100">
                  {filtered.length} requests
                </span>
              </div>

              {sessionLoading || loading ? (
                <div className="p-6 text-sm text-slate-700">Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="p-10 text-center text-sm text-slate-700">
                  Belum ada request yang diambil (atau filter tidak cocok).
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="min-w-fit w-full text-sm border-collapse">
                    <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                      <tr className="border-b border-slate-100">
                        <th className="px-5 py-4 text-left whitespace-nowrap">
                          Request ID
                        </th>
                        <th className="px-5 py-4 text-left whitespace-nowrap">
                          Requestor
                        </th>
                        <th className="px-5 py-4 text-left whitespace-nowrap">
                          Pemohon
                        </th>
                        <th className="px-5 py-4 text-left whitespace-nowrap">
                          Lokasi
                        </th>
                        <th className="px-5 py-4 text-left whitespace-nowrap">
                          Segmen
                        </th>
                        <th className="px-5 py-4 text-left whitespace-nowrap">
                          Deadline
                        </th>
                        <th className="px-5 py-4 text-left whitespace-nowrap">
                          Status
                        </th>
                        <th className="px-5 py-4 text-left whitespace-nowrap">
                          Taken By
                        </th>
                        <th className="px-5 py-4 text-left whitespace-nowrap">
                          Taken At
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((r) => {
                        const isOpen = !!openDetail[r.requestId];
                        return (
                          <FragmentRow
                            key={r.requestId}
                            r={r}
                            isOpen={isOpen}
                            onToggle={() =>
                              setOpenDetail((prev) => ({
                                ...prev,
                                [r.requestId]: !prev[r.requestId],
                              }))
                            }
                            isAdmin={isAdmin}
                            isSuperAdmin={isSuperAdmin}
                            currentUserId={user?.userId ?? ""}
                            onUpdated={(updatedRow) => {
                              // update lokal di tabel
                              setRows((prev) =>
                                prev.map((x) =>
                                  x.requestId === updatedRow.requestId
                                    ? { ...x, ...updatedRow }
                                    : x,
                                ),
                              );
                            }}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="h-10" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FragmentRow({
  r,
  isOpen,
  onToggle,
  isAdmin,
  isSuperAdmin,
  currentUserId,
  onUpdated,
}: {
  r: EProcRow;
  isOpen: boolean;
  onToggle: () => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  currentUserId: string;
  onUpdated: (r: EProcRow) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState<{
    perusahaan: string;
    catatanAdmin: string;
    statusAkhir: string;
    items: ProductItem[];
  }>({
    perusahaan: r.perusahaan ?? "",
    catatanAdmin: r.catatanAdmin ?? "",
    statusAkhir: r.statusAkhir ?? "",
    items: r.items ? JSON.parse(JSON.stringify(r.items)) : [], // deep copy items
  });

  const [companies, setCompanies] = useState<string[]>([]);
  const [statusAkhirOptions, setStatusAkhirOptions] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/parameters")
        .then((res) => res.json())
        .then((json) => {
          if (json?.data?.perusahaan) {
            setCompanies(json.data.perusahaan);
          }
          if (json?.data?.status_akhir) {
            setStatusAkhirOptions(json.data.status_akhir);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const computedStatusUsulan = useMemo(() => {
    const total = form.items.length;
    if (total === 0) return "Masuk";
    let countDone = 0;
    let countHold = 0;
    let countCancel = 0;
    let countProgress = 0;
    for (const it of form.items) {
      const st = (it.statusBarangAdmin || "").toLowerCase();
      if (st === "done") countDone++;
      else if (st === "progress") countProgress++;
      else if (st === "hold") countHold++;
      else if (st === "cancel") countCancel++;
    }

    if (countProgress > 0) return "Proses";
    if (countDone === total) return "Done";
    if (countDone > 0 && countDone + countHold + countCancel === total)
      return "Done";
    if (countCancel === total) return "Cancel";
    if (countHold === total) return "Hold";
    if (countDone > 0 || countHold > 0 || countCancel > 0) return "Proses";
    return "Masuk";
  }, [form.items]);

  const isDone = computedStatusUsulan === "Done";

  useEffect(() => {
    if (!isDone && form.statusAkhir !== "") {
      setForm((prev) => ({
        ...prev,
        statusAkhir: "",
      }));
    }
  }, [isDone, form.statusAkhir]);

  // check if editable
  // only simple ADMIN who acts as the taker can edit, or SUPERADMIN can edit
  const canEdit =
    isSuperAdmin || (isAdmin && r.takenByAdminId === currentUserId);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await fetch(
        `/api/e-procurement/requests/${encodeURIComponent(
          r.requestId,
        )}/admin-response`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            perusahaan: form.perusahaan,
            catatanAdmin: form.catatanAdmin,
            statusAkhir: isDone ? form.statusAkhir : "",
            items: form.items,
          }),
        },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Gagal menyimpan data");

      setSuccess("Tersimpan");
      if (json.data) {
        onUpdated(json.data);
      }
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err?.message ?? "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <tr
        className={`border-b border-slate-100/80 hover:bg-slate-50 cursor-pointer transition-colors ${isOpen ? "bg-indigo-50/20" : ""}`}
        onClick={onToggle}
        title="Klik untuk lihat detail"
      >
        <td className="px-5 py-4 font-semibold text-slate-800">
          {r.requestId}
        </td>
        <td className="px-5 py-4 text-slate-600">{r.requestor}</td>
        <td className="px-5 py-4 text-slate-800 font-medium">{r.pemohon}</td>
        <td className="px-5 py-4 text-slate-600">{r.lokasi}</td>
        <td className="px-5 py-4">
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
            {r.segmen}
          </span>
        </td>
        <td className="px-5 py-4 text-slate-600">
          {fmtDate(r.deadlineUsulan)}
        </td>
        <td className="px-5 py-4">
          {(() => {
            const st = computedStatusUsulan;
            if (st === "Done")
              return (
                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                  Done
                </span>
              );
            if (st === "Cancel")
              return (
                <span className="inline-flex items-center rounded-md bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 ring-1 ring-inset ring-rose-600/20">
                  Cancel
                </span>
              );
            if (st === "Hold")
              return (
                <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                  Hold
                </span>
              );
            if (st === "Proses")
              return (
                <span className="inline-flex items-center rounded-md bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700 ring-1 ring-inset ring-sky-600/20">
                  Proses
                </span>
              );
            return (
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-inset ring-slate-500/20">
                Masuk
              </span>
            );
          })()}
        </td>
        <td className="px-5 py-4 text-slate-800 font-medium">
          {r.takenByAdminName ?? "-"}
        </td>
        <td className="px-5 py-4 text-slate-500 text-xs">
          {r.takenAt ? fmtDateTime(r.takenAt) : "-"}
        </td>
      </tr>

      {isOpen && (
        <tr className="border-b border-neutral-100 bg-slate-50/50">
          <td colSpan={9} className="px-5 py-5 text-sm">
            {/* Rincian Barang */}
            <div className="mb-6">
              <h4 className="font-semibold text-slate-800 mb-3 text-sm flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                Rincian Items ({r.items?.length || 0})
              </h4>
              {r.items && r.items.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 shadow-sm rounded-xl bg-white">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr className="text-slate-500 uppercase tracking-wider font-semibold">
                        <th className="px-3 py-3">Merek</th>
                        <th className="px-3 py-3">Sub Kategori</th>
                        <th className="px-3 py-3">Spesifikasi</th>
                        <th className="px-3 py-3">Qty</th>
                        <th className="px-3 py-3">Pagu</th>
                        <th className="px-3 py-3">Harga Tayang</th>
                        <th className="px-3 py-3">Link Inaproc</th>
                        <th className="px-3 py-3">Link ECom</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {r.items.map((it, idx) => (
                        <React.Fragment key={it.id || idx}>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-3 py-3 font-medium text-slate-800">
                              {it.merek || "-"}
                            </td>
                            <td className="px-3 py-3 text-slate-600">
                              {it.subKategori || "-"}
                            </td>
                            <td
                              className="px-3 py-3 text-slate-600 line-clamp-2"
                              title={it.spesifikasi}
                            >
                              {it.spesifikasi || "-"}
                            </td>
                            <td className="px-3 py-3 font-semibold text-slate-700">
                              {it.qty ?? "-"}
                            </td>
                            <td className="px-3 py-3 text-slate-600">
                              {it.paguPerItem || "-"}
                            </td>
                            <td className="px-3 py-3 text-slate-600">
                              {it.hargaTayang || "-"}
                            </td>
                            <td className="px-3 py-3">
                              {it.linkInaproc ? (
                                <a
                                  href={it.linkInaproc}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-indigo-500 hover:text-indigo-600 font-medium hover:underline flex items-center gap-1"
                                >
                                  Link{" "}
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                </a>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="px-3 py-3">
                              {it.linkEcom ? (
                                <a
                                  href={it.linkEcom}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-indigo-500 hover:text-indigo-600 font-medium hover:underline flex items-center gap-1"
                                >
                                  Link{" "}
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                </a>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                          </tr>
                          {/* Baris khusus untuk input admin per-item */}
                          <tr className="bg-indigo-50/40">
                            <td
                              colSpan={4}
                              className="px-3 py-2 text-right text-slate-600 text-xs font-semibold align-middle border-r border-indigo-100"
                            >
                              Status Keputusan ({it.merek}):
                            </td>
                            <td
                              colSpan={2}
                              className="px-3 py-2 border-r border-indigo-100"
                            >
                              <select
                                className="w-full border border-indigo-200 rounded-md px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 font-medium text-slate-700 bg-white"
                                value={form.items[idx]?.statusBarangAdmin || ""}
                                onChange={(e) => {
                                  const newItems = [...form.items];
                                  newItems[idx] = {
                                    ...newItems[idx],
                                    statusBarangAdmin: e.target.value,
                                  };
                                  setForm({ ...form, items: newItems });
                                }}
                                disabled={!canEdit || loading}
                              >
                                <option value="">Todo</option>
                                <option value="Progress">Progress</option>
                                <option value="Done">Done</option>
                                <option value="Hold">Hold</option>
                                <option value="Cancel">Cancel</option>
                              </select>
                            </td>
                            <td colSpan={2} className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500 text-xs font-semibold whitespace-nowrap">
                                  Tayang Inaproc:
                                </span>
                                <select
                                  className="flex-1 border border-indigo-200 rounded-md px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 font-medium text-slate-700 bg-white"
                                  value={
                                    form.items[idx]?.tayangInaprocAdmin || ""
                                  }
                                  onChange={(e) => {
                                    const newItems = [...form.items];
                                    newItems[idx] = {
                                      ...newItems[idx],
                                      tayangInaprocAdmin: e.target.value,
                                    };
                                    setForm({ ...form, items: newItems });
                                  }}
                                  disabled={!canEdit || loading}
                                >
                                  <option value="">Pilih</option>
                                  <option value="Ya">Ya</option>
                                  <option value="Tidak">Tidak</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                          <tr className="bg-indigo-50/20">
                            <td
                              colSpan={4}
                              className="px-3 py-2 text-right text-slate-600 text-xs font-semibold align-middle border-r border-indigo-100"
                            >
                              Catatan Admin ({it.merek}):
                            </td>
                            <td colSpan={4} className="px-3 py-2">
                              <textarea
                                className="w-full border border-indigo-200 rounded-md px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 font-medium text-slate-700 bg-white min-h-[40px] max-h-[120px]"
                                value={form.items[idx]?.catatanAdminItem || ""}
                                onChange={(e) => {
                                  const newItems = [...form.items];
                                  newItems[idx] = {
                                    ...newItems[idx],
                                    catatanAdminItem: e.target.value,
                                  };
                                  setForm({ ...form, items: newItems });
                                }}
                                disabled={!canEdit || loading}
                                placeholder="Tambahkan catatan khusus item ini (opsional)..."
                              />
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-slate-500 text-xs flex items-center gap-2 p-4 border border-dashed border-slate-200 rounded-lg bg-white">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Tidak ada item rincian
                </div>
              )}
            </div>

            {/* Form Admin Response */}
            <div className="border border-slate-200 shadow-sm rounded-xl p-6 bg-white w-full">
              <h4 className="font-semibold text-slate-800 mb-4 inline-flex items-center gap-1.5 border-b border-indigo-100 pb-2">
                <svg
                  className="w-4 h-4 text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Keputusan Status Akhir (Approval)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Perusahaan (Penyedia)
                  </label>
                  <SearchableSelect
                    className="mt-1"
                    value={form.perusahaan}
                    onChange={(val: string) =>
                      setForm({ ...form, perusahaan: val })
                    }
                    isDisabled={!canEdit || loading}
                    options={companies.map((c) => ({
                      value: c,
                      label: c,
                    }))}
                    placeholder="Pilih Perusahaan..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Status Usulan (Otomatis)
                  </label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none bg-slate-50 text-slate-600 font-bold cursor-not-allowed text-center md:text-left"
                    value={computedStatusUsulan}
                    disabled
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Status Akhir (Manual)
                  </label>
                  <SearchableSelect
                    className="mt-1"
                    value={form.statusAkhir}
                    onChange={(val: string) =>
                      setForm({ ...form, statusAkhir: val })
                    }
                    isDisabled={!canEdit || loading || !isDone}
                    options={statusAkhirOptions.map((s) => ({
                      value: s,
                      label: s,
                    }))}
                    placeholder={
                      !isDone
                        ? "Terkunci (Belum Done)"
                        : "Pilih Status Akhir..."
                    }
                  />
                  {!isDone && (
                    <span className="text-[10px] items-center text-amber-600/90 font-medium ml-1 mt-1 inline-flex gap-1.5 leading-tight max-w-[90%]">
                      <svg
                        className="w-3.5 h-3.5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Status Usulan harus &quot;Done&quot; untuk diedit.
                    </span>
                  )}
                </div>
              </div>

              {canEdit && (
                <div className="mt-5 flex items-center justify-end space-x-4 border-t border-slate-100 pt-4">
                  {error && (
                    <span className="text-rose-500 text-xs font-bold flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {error}
                    </span>
                  )}
                  {success && (
                    <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {success}
                    </span>
                  )}

                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 px-5 py-2.5 rounded-lg text-sm font-bold transition-all disabled:bg-indigo-400 disabled:shadow-none active:scale-95 min-w-[150px] flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Perubahan"
                    )}
                  </button>
                </div>
              )}
              {!canEdit && (
                <div className="mt-3 text-xs text-orange-600 font-medium">
                  Anda tidak berhak mengubah response ini (Hanya taker /
                  Superadmin).
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
