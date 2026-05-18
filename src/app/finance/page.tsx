"use client";

import { useEffect, useState, Fragment, Suspense } from "react";
import { useSession } from "@/components/session/SessionProvider";
import { useSearchParams, useRouter } from "next/navigation";

type Penagihan = {
  tanggalMulai: string;
  tanggalBerakhir: string;
  nominalPenagihan: number;
};

type Contract = {
  nomorKontrak: string;
  perusahaan: string;
  requestIds: string[];
  instansi: string;
  tanggalKontrak: string;
  namaPengadaan: string;
  nominalKontrak: number;
  bendera: string;
  marketing: string;
  pic: string;
  tanggalBerakhirKontrak: string;
  penagihan: Penagihan;
  [key: string]: any;
};

function fmtDate(d: string) {
  if (!d) return "-";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtCurrency(n: number) {
  if (!n) return "-";
  return `Rp ${n.toLocaleString("id-ID")}`;
}

/* ─── Penagihan Form (inline) ─── */
function PenagihanForm({
  contract,
  onUpdated,
}: {
  contract: Contract;
  onUpdated: (c: Contract) => void;
}) {
  const p = contract.penagihan || { tanggalMulai: "", tanggalBerakhir: "", nominalPenagihan: 0 };
  const [form, setForm] = useState({
    tanggalMulai: p.tanggalMulai || "",
    tanggalBerakhir: p.tanggalBerakhir || "",
    nominalPenagihan: p.nominalPenagihan || 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/contracts/${encodeURIComponent(contract.nomorKontrak)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ penagihan: form }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan");
      setSuccess("Tersimpan!");
      if (json.data) onUpdated(json.data);
      setTimeout(() => setSuccess(""), 3000);
    } catch (e: any) {
      setError(e?.message ?? "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all";
  const labelCls = "block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2";

  return (
    <div className="p-5 md:p-8 bg-slate-50 border-b border-indigo-100">
      <div className="max-w-4xl">
        <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Data Penagihan — {contract.nomorKontrak}
        </h4>

        {/* Read-only contract info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 text-xs">
          <div><span className="font-semibold text-slate-700">Instansi:</span> <span className="text-slate-600">{contract.instansi || "-"}</span></div>
          <div><span className="font-semibold text-slate-700">Nominal Kontrak:</span> <span className="text-slate-600">{fmtCurrency(contract.nominalKontrak)}</span></div>
          <div><span className="font-semibold text-slate-700">Tgl Kontrak:</span> <span className="text-slate-600">{fmtDate(contract.tanggalKontrak)}</span></div>
          <div><span className="font-semibold text-slate-700">Tgl Berakhir:</span> <span className="text-slate-600">{fmtDate(contract.tanggalBerakhirKontrak)}</span></div>
        </div>

        {/* Penagihan form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Tanggal Mulai Penagihan</label>
            <input type="date" className={inputCls} value={form.tanggalMulai}
              onChange={(e) => setForm({ ...form, tanggalMulai: e.target.value })} disabled={loading} />
          </div>
          <div>
            <label className={labelCls}>Tanggal Berakhir Penagihan</label>
            <input type="date" className={inputCls} value={form.tanggalBerakhir}
              onChange={(e) => setForm({ ...form, tanggalBerakhir: e.target.value })} disabled={loading} />
          </div>
          <div>
            <label className={labelCls}>Nominal Penagihan</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-bold text-sm pointer-events-none">Rp</span>
              <input type="number" className={`${inputCls} pl-10`} value={form.nominalPenagihan || ""}
                onChange={(e) => setForm({ ...form, nominalPenagihan: Number(e.target.value) })}
                disabled={loading} placeholder="0" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-5">
          {error && <span className="text-rose-500 text-xs font-bold mr-auto">{error}</span>}
          {success && <span className="text-emerald-600 text-xs font-bold mr-auto">{success}</span>}
          <button onClick={handleSave} disabled={loading}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400 transition-all active:scale-[0.98]">
            {loading ? "Menyimpan..." : "Simpan Penagihan"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ─── */
function FinancePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const perusahaanQuery = searchParams.get("perusahaan") || "";
  const { user, loading: sessionLoading } = useSession();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openRow, setOpenRow] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionLoading) {
      if (!user) {
        router.replace("/");
      } else if (user.role !== "SUPERADMIN" && user.role !== "ADMIN") {
        router.replace("/dashboard-response");
      } else {
        fetchData();
      }
    }
  }, [user, sessionLoading, router, perusahaanQuery]);

  async function fetchData() {
    try {
      setLoading(true);
      setError("");
      const url = perusahaanQuery
        ? `/api/contracts?perusahaan=${encodeURIComponent(perusahaanQuery)}`
        : "/api/contracts";
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengambil data");
      setContracts(json.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdated = (updated: Contract) => {
    setContracts((prev) =>
      prev.map((c) => (c.nomorKontrak === updated.nomorKontrak ? updated : c)),
    );
  };

  if (sessionLoading || loading) {
    return (
      <div className="flex w-full mt-12 items-center justify-center p-8 text-slate-500 font-medium animate-pulse">
        <svg className="mr-3 h-6 w-6 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Memuat data keuangan...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <main className="flex-1 overflow-y-auto relative p-4 lg:p-8 font-sans">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-900/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none" />
            <div className="relative z-10">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
                <span className="bg-gradient-to-br from-emerald-500 to-emerald-700 bg-clip-text text-transparent">
                  {perusahaanQuery ? `Manajemen Keuangan — ${perusahaanQuery}` : "Manajemen Keuangan"}
                </span>
              </h1>
              <p className="text-slate-500 font-medium text-sm">
                Data kontrak bersifat read-only. Klik baris untuk mengelola penagihan.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl bg-rose-50 p-4 text-rose-600 text-sm font-semibold border border-rose-100">{error}</div>
          )}

          {/* Table */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border-collapse">
                <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <tr className="border-b border-slate-100">
                    <th className="px-4 py-3 text-left">No. Kontrak</th>
                    <th className="px-4 py-3 text-left">Instansi</th>
                    <th className="px-4 py-3 text-left">Nama Pengadaan</th>
                    <th className="px-4 py-3 text-right">Nominal Kontrak</th>
                    <th className="px-4 py-3 text-right">Nominal Penagihan</th>
                    <th className="px-4 py-3 text-left">Tgl Penagihan</th>
                    <th className="px-4 py-3 text-left">Tgl Berakhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contracts.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">Belum ada data kontrak.</td></tr>
                  ) : (
                    contracts.map((c) => (
                      <Fragment key={c.nomorKontrak}>
                        <tr className={`hover:bg-slate-50 cursor-pointer transition-colors ${openRow === c.nomorKontrak ? "bg-indigo-50/30" : ""}`}
                          onClick={() => setOpenRow(openRow === c.nomorKontrak ? null : c.nomorKontrak)}>
                          <td className="px-4 py-3 font-semibold text-slate-800">{c.nomorKontrak}</td>
                          <td className="px-4 py-3 text-slate-600">{c.instansi || "-"}</td>
                          <td className="px-4 py-3 text-slate-600">{c.namaPengadaan || "-"}</td>
                          <td className="px-4 py-3 text-right text-slate-800 font-medium">{fmtCurrency(c.nominalKontrak)}</td>
                          <td className="px-4 py-3 text-right text-slate-800 font-medium">{fmtCurrency(c.penagihan?.nominalPenagihan)}</td>
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                            {c.penagihan?.tanggalMulai ? `${fmtDate(c.penagihan.tanggalMulai)} — ${fmtDate(c.penagihan.tanggalBerakhir)}` : "-"}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{fmtDate(c.tanggalBerakhirKontrak)}</td>
                        </tr>
                        {openRow === c.nomorKontrak && (
                          <tr>
                            <td colSpan={7} className="p-0">
                              <PenagihanForm contract={c} onUpdated={handleUpdated} />
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
        </div>
      </main>
    </div>
  );
}

export default function FinancePage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <FinancePageContent />
    </Suspense>
  );
}
