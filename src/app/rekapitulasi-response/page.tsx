"use client";

import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/sidebar/sidebar";
import { useSession } from "@/components/session/SessionProvider";
import { useRouter } from "next/navigation";

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
    <div className="min-h-screen bg-blue-50">
      <div className="flex">
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
            <div className="mt-6 rounded-xl bg-white p-4 shadow-md">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari requestId / pemohon / lokasi / segmen..."
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                />

                {isSuperAdmin ? (
                  <input
                    value={adminFilter}
                    onChange={(e) => setAdminFilter(e.target.value)}
                    placeholder="Filter Admin (nama)..."
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                  />
                ) : null}
              </div>
            </div>

            {/* Table */}
            <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-md">
              <div className="border-b border-neutral-200 px-4 py-3 text-sm font-semibold">
                Data Rekap({filtered.length})
              </div>

              {sessionLoading || loading ? (
                <div className="p-6 text-sm text-neutral-700">Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="p-10 text-center text-sm text-neutral-700">
                  Belum ada request yang diambil (atau filter tidak cocok).
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="min-w-275 w-full text-sm">
                    <thead className="bg-neutral-50 text-neutral-600">
                      <tr className="border-b border-neutral-200">
                        <th className="px-4 py-3 text-left">Request ID</th>
                        <th className="px-4 py-3 text-left">Requestor</th>
                        <th className="px-4 py-3 text-left">Pemohon</th>
                        <th className="px-4 py-3 text-left">Lokasi</th>
                        <th className="px-4 py-3 text-left">Segmen</th>
                        <th className="px-4 py-3 text-left">Deadline</th>
                        <th className="px-4 py-3 text-left">Taken By</th>
                        <th className="px-4 py-3 text-left">Taken At</th>
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

  const [form, setForm] = useState({
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
    let countHoldCancel = 0;
    let countProgress = 0;
    for (const it of form.items) {
      const st = (it.statusBarangAdmin || "").toLowerCase();
      if (st === "done") countDone++;
      else if (st === "progress") countProgress++;
      else if (st === "hold" || st === "cancel") countHoldCancel++;
    }

    if (countProgress > 0) return "Proses";
    if (countDone === total) return "Done";
    if (countDone > 0 && countDone + countHoldCancel === total) return "Done";
    if (countHoldCancel === total) return "Batal";
    if (countDone > 0 || countHoldCancel > 0) return "Proses";
    return "Masuk";
  }, [form.items]);

  const isDone = computedStatusUsulan === "Done";

  useEffect(() => {
    if (!isDone && form.statusAkhir !== "") {
      setForm((prev) => ({ ...prev, statusAkhir: "" }));
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
          body: JSON.stringify(form),
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
        className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer"
        onClick={onToggle}
        title="Klik untuk lihat detail"
      >
        <td className="px-4 py-3">{r.requestId}</td>
        <td className="px-4 py-3">{r.requestor}</td>
        <td className="px-4 py-3">{r.pemohon}</td>
        <td className="px-4 py-3">{r.lokasi}</td>
        <td className="px-4 py-3">{r.segmen}</td>
        <td className="px-4 py-3">{fmtDate(r.deadlineUsulan)}</td>
        <td className="px-4 py-3">{r.takenByAdminName ?? "-"}</td>
        <td className="px-4 py-3">
          {r.takenAt ? fmtDateTime(r.takenAt) : "-"}
        </td>
      </tr>

      {isOpen && (
        <tr className="border-b border-neutral-100 bg-neutral-50">
          <td colSpan={8} className="px-4 py-4 text-sm">
            {/* Rincian Barang */}
            <div className="mb-4">
              <h4 className="font-semibold text-neutral-800 mb-2">
                Rincian Items ({r.items?.length || 0})
              </h4>
              {r.items && r.items.length > 0 ? (
                <div className="overflow-x-auto border border-neutral-200 rounded-md">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-neutral-100">
                      <tr>
                        <th className="px-2 py-2">Merek</th>
                        <th className="px-2 py-2">Sub Kategori</th>
                        <th className="px-2 py-2">Spesifikasi</th>
                        <th className="px-2 py-2">Qty</th>
                        <th className="px-2 py-2">Pagu</th>
                        <th className="px-2 py-2">Harga Tayang</th>
                        <th className="px-2 py-2">Link Inaproc</th>
                        <th className="px-2 py-2">Link ECom</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.items.map((it, idx) => (
                        <React.Fragment key={it.id || idx}>
                          <tr className="border-t border-neutral-200">
                            <td className="px-2 py-2">{it.merek || "-"}</td>
                            <td className="px-2 py-2">
                              {it.subKategori || "-"}
                            </td>
                            <td className="px-2 py-2">
                              {it.spesifikasi || "-"}
                            </td>
                            <td className="px-2 py-2">{it.qty ?? "-"}</td>
                            <td className="px-2 py-2">
                              {it.paguPerItem || "-"}
                            </td>
                            <td className="px-2 py-2">
                              {it.hargaTayang || "-"}
                            </td>
                            <td className="px-2 py-2">
                              {it.linkInaproc ? (
                                <a
                                  href={it.linkInaproc}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  Link
                                </a>
                              ) : (
                                <span className="text-black">-</span>
                              )}
                            </td>
                            <td className="px-2 py-2">
                              {it.linkEcom ? (
                                <a
                                  href={it.linkEcom}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  Link
                                </a>
                              ) : (
                                <span className="text-black">-</span>
                              )}
                            </td>
                          </tr>
                          {/* Baris khusus untuk input admin per-item */}
                          <tr className="border-t border-neutral-100 bg-blue-50/50">
                            <td
                              colSpan={4}
                              className="px-2 py-2 text-right text-neutral-600 font-medium align-middle border-r border-white"
                            >
                              Status Admin ({it.merek}):
                            </td>
                            <td
                              colSpan={2}
                              className="px-2 py-2 border-r border-white"
                            >
                              <select
                                className="w-full border rounded-md px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-neutral-100"
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
                            <td colSpan={2} className="px-2 py-2">
                              <div className="flex items-center gap-2">
                                <span className="text-neutral-500 text-xs text-nowrap">
                                  Tayang Inaproc:
                                </span>
                                <select
                                  className="flex-1 border rounded-md px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-neutral-100"
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
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-neutral-500 text-xs">
                  Tidak ada item rincian
                </div>
              )}
            </div>

            {/* Form Admin Response */}
            <div className="border border-neutral-200 rounded-md p-4 bg-white">
              <h4 className="font-semibold text-neutral-800 mb-3">
                Update Status Admin
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Perusahaan (Penyedia)
                  </label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-neutral-100"
                    value={form.perusahaan}
                    onChange={(e) =>
                      setForm({ ...form, perusahaan: e.target.value })
                    }
                    disabled={!canEdit || loading}
                  >
                    <option value="">Pilih Perusahaan...</option>
                    {companies.map((c, i) => (
                      <option key={i} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Status Usulan (Otomatis)
                  </label>
                  <input
                    className="w-full border rounded-md px-3 py-2 text-sm outline-none bg-neutral-100 text-neutral-600 font-semibold cursor-not-allowed"
                    value={computedStatusUsulan}
                    disabled
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Status Akhir (Manual)
                  </label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-neutral-100"
                    value={form.statusAkhir}
                    onChange={(e) =>
                      setForm({ ...form, statusAkhir: e.target.value })
                    }
                    disabled={!canEdit || loading || !isDone}
                  >
                    <option value="">
                      {!isDone
                        ? "Status Usulan belum Done"
                        : "Pilih Status Akhir..."}
                    </option>
                    {statusAkhirOptions.map((s, i) => (
                      <option key={i} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Catatan Admin
                  </label>
                  <textarea
                    className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-neutral-100 h-20"
                    value={form.catatanAdmin}
                    onChange={(e) =>
                      setForm({ ...form, catatanAdmin: e.target.value })
                    }
                    disabled={!canEdit || loading}
                    placeholder="Catatan tambahan..."
                  />
                </div>
              </div>

              {canEdit && (
                <div className="mt-4 flex items-center justify-end space-x-3">
                  {error && (
                    <span className="text-red-500 text-xs font-medium">
                      {error}
                    </span>
                  )}
                  {success && (
                    <span className="text-green-600 text-xs font-medium">
                      {success}
                    </span>
                  )}

                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:bg-blue-400"
                  >
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
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
