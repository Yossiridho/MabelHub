"use client";

import { useEffect, useState, useMemo, Fragment } from "react";
import { useSession } from "@/components/session/SessionProvider";
import { useRouter } from "next/navigation";

import SearchableSelect from "@/components/ui/SearchableSelect";

// Tipe Data sesuai E-Procurement
type ProductItem = {
  id: string;
  merek?: string;
  subKategori?: string;
  qty?: number | string;
  tanggalProses?: string;
  tanggalDone?: string;
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
  catatanAdmin?: string;

  takenByAdminId?: string | null;
  takenByAdminName?: string | null;
  takenAt?: string | Date | null;

  perusahaan?: string;
  statusUsulan?: string;
  statusAkhir?: string;

  tanggalKontrak?: string;
  nominalKontrak?: number | string;
  tanggalPembayaran?: string;
  nominalPembayaran?: number | string;

  items: ProductItem[];
};

function formatDateTime(str: string | Date | undefined | null) {
  if (!str) return "-";
  const d = new Date(str);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSegmen(s: string) {
  return s.replace(/_/g, " ").toUpperCase();
}

function FinanceFormRow({
  row,
  statusAkhirOptions,
  onUpdated,
  onCancel,
}: {
  row: EProcRow;
  statusAkhirOptions: string[];
  onUpdated: (updated: EProcRow) => void;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    tanggalKontrak: row.tanggalKontrak || "",
    nominalKontrak:
      typeof row.nominalKontrak === "number" ? row.nominalKontrak : "",
    tanggalPembayaran: row.tanggalPembayaran || "",
    nominalPembayaran:
      typeof row.nominalPembayaran === "number" ? row.nominalPembayaran : "",
    statusAkhir: row.statusAkhir || "",
  });

  // Calculate editable zones
  const currentOverallStatus = String(form.statusAkhir || "").toUpperCase();
  const canEditKontrak =
    currentOverallStatus === "RILIS KONTRAK" ||
    currentOverallStatus === "TERBIT BAST" ||
    currentOverallStatus === "PENAGIHAN" ||
    currentOverallStatus === "LUNAS" ||
    currentOverallStatus === "PENGUMPULAN DOKUMEN" ||
    currentOverallStatus === "DONE PROJECT";

  const canEditPembayaran =
    currentOverallStatus === "TERBIT BAST" ||
    currentOverallStatus === "PENAGIHAN" ||
    currentOverallStatus === "LUNAS" ||
    currentOverallStatus === "PENGUMPULAN DOKUMEN" ||
    currentOverallStatus === "DONE PROJECT";

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await fetch(
        `/api/e-procurement/requests/${encodeURIComponent(
          row.requestId,
        )}/admin-response`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            perusahaan: row.perusahaan,
            catatanAdmin: row.catatanAdmin,
            statusAkhir: form.statusAkhir,
            items: row.items,

            // New finance data payload
            tanggalKontrak: form.tanggalKontrak,
            nominalKontrak: Number(form.nominalKontrak),
            tanggalPembayaran: form.tanggalPembayaran,
            nominalPembayaran: Number(form.nominalPembayaran),
          }),
        },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Gagal menyimpan data");

      setSuccess("Berhasil disimpan!");
      if (json.data) {
        onUpdated(json.data);
      }
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err?.message ?? "Terjadi kesalahan komputasi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 md:p-8 bg-slate-50 border-b border-indigo-100">
      <div className="max-w-4xl space-y-8">
        <div>
          <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <svg
              className="w-5 h-5 text-indigo-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Data Keuangan Perusahaan
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Akhir List Dropdown */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Pembaruan Status Keuangan
              </label>
              <SearchableSelect
                className="mt-1 max-w-sm"
                value={form.statusAkhir}
                onChange={(val: string) =>
                  setForm({ ...form, statusAkhir: val })
                }
                isDisabled={
                  loading ||
                  String(row.statusAkhir || "").toUpperCase() !== "TERBIT BAST"
                }
                options={statusAkhirOptions
                  .filter((s) => {
                    const low = s.toLowerCase();
                    return (
                      low.includes("penagihan") ||
                      low.includes("lunas") ||
                      low.includes("pengumpulan dokumen") ||
                      low.includes("done project")
                    );
                  })
                  .map((s) => ({
                    value: s,
                    label: s,
                  }))}
                placeholder={
                  String(row.statusAkhir || "").toUpperCase() !== "TERBIT BAST"
                    ? "Terkunci (Belum Terbit BAST)"
                    : "Pilih Status Keuangan..."
                }
              />
              <p className="text-[10px] items-center text-slate-500 font-medium ml-1 mt-1.5 inline-flex gap-1.5 leading-tight">
                Hanya menampilkan status tingkat ke-2 (Penagihan, Lunas,
                Pengumpulan Dokumen, Done Project). Terkunci sebelum Terbit
                BAST.
              </p>
            </div>

            {/* Tanggal Kontrak */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Tanggal Kontrak
              </label>
              <input
                type="date"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
                value={form.tanggalKontrak}
                onChange={(e) =>
                  setForm({ ...form, tanggalKontrak: e.target.value })
                }
                disabled={!canEditKontrak || loading}
              />
            </div>
            {/* Nominal Kontrak */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Nominal Kontrak
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-bold text-sm pointer-events-none">
                  Rp
                </span>
                <input
                  type="number"
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
                  placeholder="0"
                  value={form.nominalKontrak}
                  onChange={(e) =>
                    setForm({ ...form, nominalKontrak: e.target.value })
                  }
                  disabled={!canEditKontrak || loading}
                />
              </div>
              {!canEditKontrak && (
                <p className="text-[10px] items-center text-amber-600/90 font-medium ml-1 mt-1.5 inline-flex gap-1.5 leading-tight">
                  Terkunci: Status Akhir harus "Rilis Kontrak" / "Terbit BAST".
                </p>
              )}
            </div>

            {/* Tanggal Terbayar (SP2D) */}
            <div className="pt-2 md:pt-4 border-t border-slate-200 md:border-none">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Tanggal Terbayar (SP2D)
              </label>
              <input
                type="date"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
                value={form.tanggalPembayaran}
                onChange={(e) =>
                  setForm({ ...form, tanggalPembayaran: e.target.value })
                }
                disabled={!canEditPembayaran || loading}
              />
            </div>
            {/* Nominal Terbayar */}
            <div className="pt-2 md:pt-4 border-t border-slate-200 md:border-none">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Nominal Terbayar
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-bold text-sm pointer-events-none">
                  Rp
                </span>
                <input
                  type="number"
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
                  placeholder="0"
                  value={form.nominalPembayaran}
                  onChange={(e) =>
                    setForm({ ...form, nominalPembayaran: e.target.value })
                  }
                  disabled={!canEditPembayaran || loading}
                />
              </div>
              {!canEditPembayaran && (
                <p className="text-[10px] items-center text-amber-600/90 font-medium ml-1 mt-1.5 inline-flex gap-1.5 leading-tight">
                  Terkunci: Status Akhir harus "Terbit BAST".
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 sm:pt-6 border-t border-slate-200/60 mt-4">
          {error && (
            <span className="text-rose-500 text-xs font-bold mr-auto">
              {error}
            </span>
          )}
          {success && (
            <span className="text-emerald-600 text-xs font-bold mr-auto flex items-center gap-1.5">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {success}
            </span>
          )}
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700 hover:shadow-md disabled:bg-indigo-400 transition-all active:scale-[0.98]"
          >
            {loading && (
              <svg
                className="w-4 h-4 animate-spin text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="opacity-25"
                />
                <path
                  fill="currentColor"
                  className="opacity-75"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FinancePage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();

  const [data, setData] = useState<EProcRow[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [errorConfig, setErrorConfig] = useState("");

  const [openRequestId, setOpenRequestId] = useState<string | null>(null);
  const [statusAkhirOpts, setStatusAkhirOpts] = useState<string[]>([]);

  // Akses eksklusif SUPERADMIN
  useEffect(() => {
    if (!sessionLoading) {
      if (!user) {
        router.replace("/");
      } else if (user.role !== "SUPERADMIN") {
        router.replace("/dashboard-response");
      } else {
        fetchData();
      }
    }
  }, [user, sessionLoading, router]);

  async function fetchData() {
    try {
      setLoadingConfig(true);
      setErrorConfig("");
      // Menggunakan API yang sama, karena SUPERADMIN mendapat "all"
      const [reqRes, paramsRes] = await Promise.all([
        fetch("/api/e-procurement/requests?mode=all"),
        fetch("/api/parameters"),
      ]);

      const reqJson = await reqRes.json();
      const paramsJson = await paramsRes.json();

      if (!reqRes.ok) throw new Error(reqJson.error || "Gagal mengambil data");

      setData(reqJson.data || []);
      if (paramsJson?.data?.status_akhir) {
        setStatusAkhirOpts(paramsJson.data.status_akhir);
      }
    } catch (e: any) {
      setErrorConfig(e.message);
    } finally {
      setLoadingConfig(false);
    }
  }

  const renderContent = () => {
    if (sessionLoading || loadingConfig) {
      return (
        <div className="flex w-full mt-12 items-center justify-center p-8 text-slate-500 font-medium animate-pulse">
          <svg
            className="mr-3 h-6 w-6 animate-spin text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
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
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Memuat data finansial...
        </div>
      );
    }

    if (errorConfig) {
      return (
        <div className="m-4 lg:m-8 mt-12 rounded-2xl bg-rose-50 p-6 text-rose-600 shadow-sm border border-rose-100 flex items-center gap-3">
          <svg
            className="w-6 h-6 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-semibold">{errorConfig}</span>
        </div>
      );
    }

    return (
      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 backdrop-blur-sm">
              <tr>
                <th className="px-5 py-4 text-left font-bold text-slate-700 uppercase tracking-widest text-[11px]">
                  Information
                </th>
                <th className="px-5 py-4 text-left font-bold text-slate-700 uppercase tracking-widest text-[11px]">
                  Status
                </th>
                <th className="px-5 py-4 text-left font-bold text-slate-700 uppercase tracking-widest text-[11px]">
                  Finansial
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <svg
                        className="w-12 h-12 text-slate-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="font-medium text-slate-400">
                        Tidak ada data ditemukan.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <Fragment key={row.requestId}>
                    {/* TABLE ROW PLACEHOLDER (Will expand later) */}
                    <tr
                      className={`cursor-pointer transition-colors hover:bg-slate-50 ${openRequestId === row.requestId ? "bg-indigo-50/30" : ""}`}
                      onClick={() =>
                        setOpenRequestId(
                          openRequestId === row.requestId
                            ? null
                            : row.requestId,
                        )
                      }
                    >
                      <td className="px-5 py-4 align-top">
                        <div className="font-bold text-slate-900 mb-1">
                          {row.perusahaan || "Tanpa Perusahaan"}
                        </div>
                        <div className="text-xs text-slate-500">
                          ID: {row.requestId}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Pemohon: {row.pemohon} ({formatSegmen(row.segmen)})
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="flex flex-col gap-2 items-start">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-500/10">
                            {row.statusAkhir || "Belum Ada Status"}
                          </span>
                          <span className="text-xs text-slate-500 whitespace-nowrap">
                            Progress: {row.statusUsulan || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="flex flex-col gap-2">
                          <div className="text-xs">
                            <span className="font-semibold text-slate-700">
                              Kontrak:
                            </span>{" "}
                            <span className="text-slate-600">
                              {typeof row.nominalKontrak === "number" &&
                              row.nominalKontrak > 0
                                ? `Rp ${row.nominalKontrak.toLocaleString("id-ID")}`
                                : "-"}
                            </span>
                          </div>
                          <div className="text-xs">
                            <span className="font-semibold text-slate-700">
                              SP2D:
                            </span>{" "}
                            <span className="text-slate-600">
                              {typeof row.nominalPembayaran === "number" &&
                              row.nominalPembayaran > 0
                                ? `Rp ${row.nominalPembayaran.toLocaleString("id-ID")}`
                                : "-"}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* EXPANDED ROW (The Form) */}
                    {openRequestId === row.requestId && (
                      <tr>
                        <td colSpan={3} className="p-0">
                          <FinanceFormRow
                            row={row}
                            statusAkhirOptions={statusAkhirOpts}
                            onCancel={() => setOpenRequestId(null)}
                            onUpdated={(updatedRow) => {
                              // Update row in local state
                              setData((prev) =>
                                prev.map((r) =>
                                  r.requestId === updatedRow.requestId
                                    ? updatedRow
                                    : r,
                                ),
                              );
                            }}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  return (
    <div className="flex h-screen bg-slate-50">
      
      <main className="flex-1 overflow-y-auto relative p-4 lg:p-8 font-sans">
        <div className="mx-auto max-w-7xl">
          {/* Header Section */}
          <div className="mb-8 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-900/5 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-50 rounded-full blur-2xl -ml-10 -mb-10 opacity-50 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3 mb-2">
                  <span className="bg-gradient-to-br from-indigo-500 to-indigo-700 bg-clip-text text-transparent">
                    Manajemen Keuangan & Kontrak
                  </span>
                </h1>
                <p className="text-slate-500 font-medium text-sm md:text-base max-w-2xl">
                  Pantau, kelola, dan validasi data kontrak serta realisasi
                  permohonan SP2D.
                </p>
              </div>
            </div>
          </div>

          {/* Content Table */}
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
