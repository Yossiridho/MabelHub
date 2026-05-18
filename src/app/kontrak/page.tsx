"use client";

import { useEffect, useState, Fragment, Suspense } from "react";
import { useSession } from "@/components/session/SessionProvider";
import { useSearchParams, useRouter } from "next/navigation";
import SearchableSelect from "@/components/ui/SearchableSelect";

type Contract = {
  nomorKontrak: string;
  perusahaan: string;
  requestIds: string[];
  link: string;
  namaFolder: string;
  instansi: string;
  tanggalKontrak: string;
  namaPengadaan: string;
  nominalKontrak: number;
  fisik: "YA" | "TIDAK";
  scan: "YA" | "TIDAK";
  keterangan: string;
  marketing: string;
  bendera: string;
  tanggalPenyerahan: string;
  catatan: string;
  pic: string;
  tanggalBerakhirKontrak: string;
  penagihan: {
    tanggalMulai: string;
    tanggalBerakhir: string;
    nominalPenagihan: number;
  };
  createdAt: string;
  updatedAt: string;
};

type UserOption = { _id: string; fullName: string; role: string };

const emptyForm = (): Omit<Contract, "createdAt" | "updatedAt"> => ({
  nomorKontrak: "",
  perusahaan: "",
  requestIds: [],
  link: "",
  namaFolder: "",
  instansi: "",
  tanggalKontrak: "",
  namaPengadaan: "",
  nominalKontrak: 0,
  fisik: "TIDAK",
  scan: "TIDAK",
  keterangan: "",
  marketing: "",
  bendera: "",
  tanggalPenyerahan: "",
  catatan: "",
  pic: "",
  tanggalBerakhirKontrak: "",
  penagihan: { tanggalMulai: "", tanggalBerakhir: "", nominalPenagihan: 0 },
});

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

/* ─────────── Contract Form Modal ─────────── */
function ContractFormModal({
  initial,
  isEdit,
  perusahaan,
  salesUsers,
  adminUsers,
  onSave,
  onClose,
}: {
  initial: Omit<Contract, "createdAt" | "updatedAt">;
  isEdit: boolean;
  perusahaan: string;
  salesUsers: UserOption[];
  adminUsers: UserOption[];
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ ...initial, perusahaan: initial.perusahaan || perusahaan });
  const [reqIdInput, setReqIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string, val: any) => setForm((p) => ({ ...p, [key]: val }));

  const addReqId = () => {
    const v = reqIdInput.trim();
    if (v && !form.requestIds.includes(v)) {
      set("requestIds", [...form.requestIds, v]);
      setReqIdInput("");
    }
  };

  const removeReqId = (id: string) =>
    set("requestIds", form.requestIds.filter((r) => r !== id));

  const handleSubmit = async () => {
    if (!form.nomorKontrak.trim()) {
      setError("Nomor Kontrak wajib diisi");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSave(form);
    } catch (e: any) {
      setError(e?.message ?? "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all";
  const labelCls = "block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 my-auto">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">
            {isEdit ? "Edit Kontrak" : "Tambah Kontrak Baru"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nomor Kontrak *</label>
              <input className={inputCls} value={form.nomorKontrak} disabled={isEdit}
                onChange={(e) => set("nomorKontrak", e.target.value)} placeholder="Masukkan nomor kontrak" />
            </div>
            <div>
              <label className={labelCls}>Nama Pengadaan</label>
              <input className={inputCls} value={form.namaPengadaan}
                onChange={(e) => set("namaPengadaan", e.target.value)} />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Instansi</label>
              <input className={inputCls} value={form.instansi}
                onChange={(e) => set("instansi", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Bendera (Nama Perusahaan)</label>
              <input className={inputCls} value={form.bendera}
                onChange={(e) => set("bendera", e.target.value)} />
            </div>
          </div>

          {/* Row 3 - Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Tanggal Kontrak</label>
              <input type="date" className={inputCls} value={form.tanggalKontrak}
                onChange={(e) => set("tanggalKontrak", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Tanggal Berakhir</label>
              <input type="date" className={inputCls} value={form.tanggalBerakhirKontrak}
                onChange={(e) => set("tanggalBerakhirKontrak", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Tanggal Penyerahan</label>
              <input type="date" className={inputCls} value={form.tanggalPenyerahan}
                onChange={(e) => set("tanggalPenyerahan", e.target.value)} />
            </div>
          </div>

          {/* Row 4 - Nominal + Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nominal Kontrak</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-bold text-sm pointer-events-none">Rp</span>
                <input type="number" className={`${inputCls} pl-10`} value={form.nominalKontrak || ""}
                  onChange={(e) => set("nominalKontrak", Number(e.target.value))} placeholder="0" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Link</label>
              <input className={inputCls} value={form.link}
                onChange={(e) => set("link", e.target.value)} placeholder="https://..." />
            </div>
          </div>

          {/* Row 5 - Folder + Fisik/Scan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Nama Folder</label>
              <input className={inputCls} value={form.namaFolder}
                onChange={(e) => set("namaFolder", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Fisik</label>
              <select className={inputCls} value={form.fisik} onChange={(e) => set("fisik", e.target.value)}>
                <option value="TIDAK">TIDAK</option>
                <option value="YA">YA</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Scan</label>
              <select className={inputCls} value={form.scan} onChange={(e) => set("scan", e.target.value)}>
                <option value="TIDAK">TIDAK</option>
                <option value="YA">YA</option>
              </select>
            </div>
          </div>

          {/* Row 6 - Marketing + PIC */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Marketing (Sales)</label>
              <SearchableSelect
                value={form.marketing}
                onChange={(val: string) => set("marketing", val)}
                options={salesUsers.map((u) => ({ value: u.fullName, label: u.fullName }))}
                placeholder="Pilih Sales..."
              />
            </div>
            <div>
              <label className={labelCls}>PIC (Admin)</label>
              <SearchableSelect
                value={form.pic}
                onChange={(val: string) => set("pic", val)}
                options={adminUsers.map((u) => ({ value: u.fullName, label: u.fullName }))}
                placeholder="Pilih Admin..."
              />
            </div>
          </div>

          {/* Row 7 - Request IDs */}
          <div>
            <label className={labelCls}>Request ID Terkait</label>
            <div className="flex gap-2 mb-2">
              <input className={`${inputCls} flex-1`} value={reqIdInput}
                onChange={(e) => setReqIdInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addReqId())}
                placeholder="Ketik REQ-ID lalu Enter" />
              <button type="button" onClick={addReqId}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors">
                +
              </button>
            </div>
            {form.requestIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.requestIds.map((id) => (
                  <span key={id} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-indigo-200">
                    {id}
                    <button onClick={() => removeReqId(id)} className="text-indigo-400 hover:text-red-500 ml-1">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Row 8 - Keterangan + Catatan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Keterangan</label>
              <textarea className={`${inputCls} min-h-[80px]`} value={form.keterangan}
                onChange={(e) => set("keterangan", e.target.value)} rows={3} />
            </div>
            <div>
              <label className={labelCls}>Catatan</label>
              <textarea className={`${inputCls} min-h-[80px]`} value={form.catatan}
                onChange={(e) => set("catatan", e.target.value)} rows={3} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3">
          {error && <span className="text-rose-500 text-xs font-bold mr-auto">{error}</span>}
          <button onClick={onClose} disabled={loading}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors">
            Batal
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400 transition-all active:scale-[0.98]">
            {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Kontrak"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Main Page Content ─────────── */
function KontrakPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const perusahaanQuery = searchParams.get("perusahaan") || "";
  const { user, loading: sessionLoading } = useSession();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [salesUsers, setSalesUsers] = useState<UserOption[]>([]);
  const [adminUsers, setAdminUsers] = useState<UserOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Contract | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

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

      const [contractsRes, usersRes] = await Promise.all([
        fetch(url),
        fetch("/api/users"),
      ]);

      const contractsJson = await contractsRes.json();
      const usersJson = await usersRes.json();

      if (!contractsRes.ok) throw new Error(contractsJson.error || "Gagal mengambil data");

      setContracts(contractsJson.data || []);

      const users = usersJson.data || [];
      setSalesUsers(users.filter((u: any) => u.role === "SALES"));
      setAdminUsers(users.filter((u: any) => u.role === "ADMIN" || u.role === "SUPERADMIN"));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (data: any) => {
    const res = await fetch("/api/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Gagal menyimpan");
    setShowForm(false);
    fetchData();
  };

  const handleUpdate = async (data: any) => {
    const res = await fetch(`/api/contracts/${encodeURIComponent(data.nomorKontrak)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Gagal menyimpan");
    setEditTarget(null);
    fetchData();
  };

  const isExpiring = (d: string) => {
    if (!d) return false;
    const diff = new Date(d).getTime() - Date.now();
    return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  };

  if (sessionLoading || loading) {
    return (
      <div className="flex w-full mt-12 items-center justify-center p-8 text-slate-500 font-medium animate-pulse">
        <svg className="mr-3 h-6 w-6 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Memuat data kontrak...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <main className="flex-1 overflow-y-auto relative p-4 lg:p-8 font-sans">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-900/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none" />
            <div className="relative z-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
                  <span className="bg-gradient-to-br from-indigo-500 to-indigo-700 bg-clip-text text-transparent">
                    {perusahaanQuery ? `Manajemen Kontrak — ${perusahaanQuery}` : "Manajemen Kontrak"}
                  </span>
                </h1>
                <p className="text-slate-500 font-medium text-sm">Kelola data kontrak, dokumen, dan PIC.</p>
              </div>
              <button onClick={() => setShowForm(true)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition-all active:scale-[0.98]">
                + Tambah Kontrak
              </button>
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
                    <th className="px-4 py-3 text-left">Bendera</th>
                    <th className="px-4 py-3 text-left">Marketing</th>
                    <th className="px-4 py-3 text-left">PIC</th>
                    <th className="px-4 py-3 text-right">Nominal</th>
                    <th className="px-4 py-3 text-left">Tgl Berakhir</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contracts.length === 0 ? (
                    <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-medium">Belum ada kontrak.</td></tr>
                  ) : (
                    contracts.map((c) => (
                      <Fragment key={c.nomorKontrak}>
                        <tr className={`hover:bg-slate-50 cursor-pointer transition-colors ${isExpiring(c.tanggalBerakhirKontrak) ? "bg-amber-50/50" : ""}`}
                          onClick={() => setExpandedRow(expandedRow === c.nomorKontrak ? null : c.nomorKontrak)}>
                          <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {c.nomorKontrak}
                              {isExpiring(c.tanggalBerakhirKontrak) && (
                                <span title="Kontrak segera berakhir!" className="inline-flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{c.instansi || "-"}</td>
                          <td className="px-4 py-3 text-slate-600">{c.namaPengadaan || "-"}</td>
                          <td className="px-4 py-3 text-slate-600">{c.bendera || "-"}</td>
                          <td className="px-4 py-3 text-slate-600">{c.marketing || "-"}</td>
                          <td className="px-4 py-3 text-slate-600">{c.pic || "-"}</td>
                          <td className="px-4 py-3 text-right text-slate-800 font-medium whitespace-nowrap">{fmtCurrency(c.nominalKontrak)}</td>
                          <td className={`px-4 py-3 whitespace-nowrap ${isExpiring(c.tanggalBerakhirKontrak) ? "text-amber-600 font-semibold" : "text-slate-600"}`}>
                            {fmtDate(c.tanggalBerakhirKontrak)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={(e) => { e.stopPropagation(); setEditTarget(c); }}
                              className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200">
                              Edit
                            </button>
                          </td>
                        </tr>
                        {expandedRow === c.nomorKontrak && (
                          <tr className="bg-slate-50/50 border-b border-slate-100">
                            <td colSpan={9} className="px-6 py-5 text-sm">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div><span className="font-semibold text-slate-700">Link:</span>{" "}<span className="text-slate-600">{c.link ? <a href={c.link} target="_blank" className="text-indigo-600 underline">{c.link}</a> : "-"}</span></div>
                                <div><span className="font-semibold text-slate-700">Folder:</span> <span className="text-slate-600">{c.namaFolder || "-"}</span></div>
                                <div><span className="font-semibold text-slate-700">Fisik:</span> <span className={`font-bold ${c.fisik === "YA" ? "text-emerald-600" : "text-slate-400"}`}>{c.fisik}</span></div>
                                <div><span className="font-semibold text-slate-700">Scan:</span> <span className={`font-bold ${c.scan === "YA" ? "text-emerald-600" : "text-slate-400"}`}>{c.scan}</span></div>
                                <div><span className="font-semibold text-slate-700">Tgl Kontrak:</span> <span className="text-slate-600">{fmtDate(c.tanggalKontrak)}</span></div>
                                <div><span className="font-semibold text-slate-700">Tgl Penyerahan:</span> <span className="text-slate-600">{fmtDate(c.tanggalPenyerahan)}</span></div>
                                <div className="md:col-span-2"><span className="font-semibold text-slate-700">Keterangan:</span> <span className="text-slate-600">{c.keterangan || "-"}</span></div>
                                <div className="md:col-span-2"><span className="font-semibold text-slate-700">Catatan:</span> <span className="text-slate-600">{c.catatan || "-"}</span></div>
                                <div className="md:col-span-2"><span className="font-semibold text-slate-700">Request IDs:</span> <span className="text-slate-600">{c.requestIds?.length ? c.requestIds.join(", ") : "-"}</span></div>
                              </div>
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

      {/* Modals */}
      {showForm && (
        <ContractFormModal
          initial={{ ...emptyForm(), perusahaan: perusahaanQuery }}
          isEdit={false}
          perusahaan={perusahaanQuery}
          salesUsers={salesUsers}
          adminUsers={adminUsers}
          onSave={handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}
      {editTarget && (
        <ContractFormModal
          initial={editTarget}
          isEdit={true}
          perusahaan={perusahaanQuery}
          salesUsers={salesUsers}
          adminUsers={adminUsers}
          onSave={handleUpdate}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}

export default function KontrakPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <KontrakPageContent />
    </Suspense>
  );
}
