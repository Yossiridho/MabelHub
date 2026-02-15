"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/sidebar/sidebar";
import { useSession } from "@/components/session/SessionProvider";
import RegisterCompanyModal from "@/components/modals/RegisterCompanyModal";

type Company = {
  _id: string;
  institusi_kerja: string;
  kota_kab: string;
  klpd: string;
  satuan_kerja: string;
  status_ring?: string;
  pic_default?: {
    nama?: string;
    no_telp?: string;
    jabatan?: string;
    role?: string;
  };
};

type PlanItem = {
  id: string; // local id untuk render
  status_ring: string;
  institusiQuery: string;
  selectedCompany: Company | null;

  kota_kab: string;
  klpd: string;
  satuan_kerja: string;

  pic_default: {
    nama: string;
    no_telp: string;
    jabatan: string;
    role: string;
  };

  showSug: boolean;
  loadingSug: boolean;
  sugs: Company[];
};

function newItem(): PlanItem {
  return {
    id: crypto.randomUUID(),
    status_ring: "",
    institusiQuery: "",
    selectedCompany: null,

    kota_kab: "",
    klpd: "",
    satuan_kerja: "",

    pic_default: {
      nama: "",
      no_telp: "",
      jabatan: "",
      role: "",
    },

    showSug: false,
    loadingSug: false,
    sugs: [],
  };
}

export default function AddPlansPage() {
  const [openReg, setOpenReg] = useState(false);
  const router = useRouter();
  const sp = useSearchParams();
  const editId = sp.get("edit"); // kalau edit single (nanti), sekarang fokus add multi
  const { user, loading: sessionLoading } = useSession();

  // Guard
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

  // ====== tanggal cuma 1 ======
  const [tanggal, setTanggal] = useState("");

  // ====== banyak plan item ======
  const [items, setItems] = useState<PlanItem[]>([newItem()]);
  const [saving, setSaving] = useState(false);

  // NOTE: sekarang belum handle edit multi (lebih kompleks).
  useEffect(() => {
    if (editId) {
      // untuk edit plan single, sebaiknya kamu pakai page terpisah /plan-activity/edit/[id]
      // biar tidak bentrok dengan bulk mode.
    }
  }, [editId]);

  function addItem() {
    setItems((prev) => [...prev, newItem()]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  function patchItem(id: string, updates: Partial<PlanItem>) {
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, ...updates } : x)),
    );
  }

  function resetCompanyFields(id: string) {
    patchItem(id, {
      selectedCompany: null,
      institusiQuery: "",
      sugs: [],
      showSug: false,
      kota_kab: "",
      klpd: "",
      satuan_kerja: "",
      pic_default: { nama: "", no_telp: "", jabatan: "", role: "" },
    } as any);
  }

  function pickCompany(id: string, c: Company) {
    patchItem(id, {
      selectedCompany: c,
      institusiQuery: c.institusi_kerja,
      showSug: false,
      kota_kab: c.kota_kab || "",
      klpd: c.klpd || "",
      satuan_kerja: c.satuan_kerja || "",
      pic_default: {
        nama: c.pic_default?.nama || "",
        no_telp: c.pic_default?.no_telp || "",
        jabatan: c.pic_default?.jabatan || "",
        role: c.pic_default?.role || "",
      },
    });
  }

  async function fetchSuggestion(itemId: string, q: string) {
    const it = items.find((x) => x.id === itemId);
    if (!it?.status_ring) return;

    try {
      patchItem(itemId, { loadingSug: true, showSug: true });

      const qs = new URLSearchParams({
        ring: it.status_ring,
        q: q || "",
        limit: "10",
      });

      const res = await fetch(`/api/companies/suggest?${qs.toString()}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        patchItem(itemId, { sugs: [], loadingSug: false });
        return;
      }

      const data = await res.json().catch(() => ({}));
      patchItem(itemId, {
        sugs: (data?.items ?? []) as Company[],
        loadingSug: false,
      });
    } catch {
      patchItem(itemId, { sugs: [], loadingSug: false });
    }
  }

  const canSubmit = useMemo(() => {
    if (!tanggal) return false;
    if (!items.length) return false;

    // tiap item minimal ring + institusi (dan sebaiknya dipilih dari suggestion -> selectedCompany)
    return items.every((it) => Boolean(it.status_ring && it.institusiQuery));
  }, [tanggal, items]);

  async function submitAll() {
    if (!canSubmit) {
      alert("Tanggal wajib, dan setiap plan wajib punya Ring + Institusi.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        tanggal, // yyyy-mm-dd
        createdBy: user?.userId || null, // ✅ pakai userId dari SessionProvider
        nama_sales: user?.fullName || null, // ✅ fullName jadi nama_sales
        items: items.map((it) => ({
          status_ring: it.status_ring,
          institusi_kerja: it.institusiQuery,
          kota_kab: it.kota_kab,
          klpd: it.klpd,
          satuan_kerja: it.satuan_kerja,
          pic_default: it.pic_default,
        })),
      };

      const res = await fetch("/api/visits/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.error || "Gagal menyimpan");
        return;
      }

      alert("Plan berhasil disimpan ke database");
      router.push("/plan-activity");
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

              {/* tombol register company untuk SALES (sesuai kode kamu sebelumnya) */}
              {user?.role === "SALES" && (
                <button
                  type="button"
                  onClick={() => setOpenReg(true)}
                  className="rounded-full bg-white px-5 py-2 text-sm font-extrabold shadow ring-1 ring-black/10 hover:bg-gray-50"
                >
                  Register Company
                </button>
              )}
            </div>

            {/* TANGGAL cuma 1 */}
            <div className="mb-6 rounded-2xl bg-[#f5efef] p-6 ring-1 ring-black/10">
              <label className="text-sm">Tanggal (1 untuk semua plan)</label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="mt-2 h-12 w-full rounded-xl bg-white px-4 text-sm ring-1 ring-black/10 outline-none"
              />
            </div>

            {/* LIST ITEM */}
            <div className="space-y-5">
              {items.map((it, idx) => (
                <div
                  key={it.id}
                  className="rounded-2xl bg-[#f5efef] p-6 ring-1 ring-black/10 relative"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="font-extrabold text-black">
                      PLAN #{idx + 1}
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(it.id)}
                        className="text-sm font-bold text-red-700 hover:underline"
                      >
                        Hapus Plan
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* RING */}
                    <div>
                      <label className="text-sm">Status Ring</label>
                      <select
                        value={it.status_ring}
                        onChange={(e) => {
                          patchItem(it.id, { status_ring: e.target.value });
                          resetCompanyFields(it.id);
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

                    <div />

                    {/* Institusi autocomplete */}
                    <div className="md:col-span-2">
                      <label className="text-sm">
                        Institusi (approved sesuai ring)
                      </label>

                      <div className="relative mt-2">
                        <input
                          value={it.institusiQuery}
                          onChange={(e) => {
                            const val = e.target.value;
                            patchItem(it.id, {
                              institusiQuery: val,
                              showSug: true,
                            });
                            if (it.status_ring) fetchSuggestion(it.id, val);
                          }}
                          onFocus={() => {
                            if (it.status_ring)
                              fetchSuggestion(it.id, it.institusiQuery);
                          }}
                          disabled={!it.status_ring}
                          placeholder={
                            !it.status_ring
                              ? "Pilih Ring dulu"
                              : "Ketik nama institusi..."
                          }
                          className="h-12 w-full rounded-xl bg-white px-4 text-sm ring-1 ring-black/10 outline-none disabled:bg-gray-100"
                        />

                        {it.showSug && it.status_ring && (
                          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl bg-white shadow ring-1 ring-black/10">
                            {it.loadingSug ? (
                              <div className="px-4 py-3 text-sm text-gray-500">
                                Loading...
                              </div>
                            ) : it.sugs.length === 0 ? (
                              <div className="px-4 py-3 text-sm text-gray-500">
                                Tidak ada instansi approved untuk ring ini.
                              </div>
                            ) : (
                              it.sugs.map((c) => (
                                <button
                                  key={c._id}
                                  type="button"
                                  onClick={() => pickCompany(it.id, c)}
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

                            <div className="flex items-center justify-between border-t px-3 py-2">
                              <button
                                type="button"
                                onClick={() =>
                                  patchItem(it.id, { showSug: false })
                                }
                                className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                              >
                                Tutup
                              </button>

                              <div className="text-xs text-gray-500">
                                {it.selectedCompany
                                  ? "Dipilih ✓"
                                  : "Belum dipilih"}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Autofill */}
                    <div>
                      <label className="text-sm">Kota/Kabupaten</label>
                      <input
                        value={it.kota_kab}
                        readOnly
                        className="mt-2 h-12 w-full rounded-xl bg-gray-200 px-4 text-sm ring-1 ring-black/10 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm">KLPD</label>
                      <input
                        value={it.klpd}
                        readOnly
                        className="mt-2 h-12 w-full rounded-xl bg-gray-200 px-4 text-sm ring-1 ring-black/10 outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm">Satuan Kerja</label>
                      <input
                        value={it.satuan_kerja}
                        readOnly
                        className="mt-2 h-12 w-full rounded-xl bg-gray-200 px-4 text-sm ring-1 ring-black/10 outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ACTIONS BOTTOM */}
            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={addItem}
                className="h-11 rounded-full bg-white px-6 text-sm font-extrabold shadow ring-1 ring-black/10 hover:bg-gray-50"
              >
                + Tambah Plan
              </button>

              <button
                type="button"
                onClick={submitAll}
                disabled={!canSubmit || saving}
                className="h-12 w-56 rounded-full bg-gray-300 text-base font-extrabold ring-1 ring-black/10 hover:bg-gray-200 disabled:opacity-50"
              >
                {saving ? "SAVING..." : "SUBMIT"}
              </button>
            </div>

            <div className="h-10" />
          </main>
        </div>
      </div>
      <RegisterCompanyModal
        open={openReg}
        onClose={() => setOpenReg(false)}
        role={user?.role || "SALES"}
        onSuccess={() => {
        }}
      />
    </div>
  );
}
