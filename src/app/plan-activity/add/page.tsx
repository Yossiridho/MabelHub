"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/sidebar/sidebar";
import { useSession } from "@/components/session/SessionProvider";

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
  id: string;
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

type AssigneeOption = {
  userId: string;
  fullName?: string;
  username?: string;
  role?: string; // "SALES" | "LEADER"
};

function displayAssignee(a: AssigneeOption) {
  const name =
    (a.fullName || "").trim() || (a.username || "").trim() || a.userId;
  const role = (a.role || "").trim();
  return role ? `${name} • ${role}` : name;
}

function pickArray(json: any) {
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.users)) return json.users;
  if (Array.isArray(json?.members)) return json.members;
  if (Array.isArray(json)) return json;
  return [];
}

function newItem(): PlanItem {
  return {
    id: crypto.randomUUID(),
    status_ring: "",
    institusiQuery: "",
    selectedCompany: null,

    kota_kab: "",
    klpd: "",
    satuan_kerja: "",

    pic_default: { nama: "", no_telp: "", jabatan: "", role: "" },

    showSug: false,
    loadingSug: false,
    sugs: [],
  };
}

function AddPlansContent() {
  const router = useRouter();
  const sp = useSearchParams();

  const editId = sp.get("edit");
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

  const [tanggal, setTanggal] = useState("");
  const [items, setItems] = useState<PlanItem[]>([newItem()]);
  const [saving, setSaving] = useState(false);

  // parameter master list
  const [paramRing, setParamRing] = useState<string[]>([]);
  useEffect(() => {
    fetch("/api/parameters")
      .then((res) => res.json())
      .then((json) => {
        const d = json?.data;
        if (d) setParamRing(d.ring || []);
      })
      .catch(() => {});
  }, []);

  // ✅ Assignee logic
  const canPickAssignee =
    user?.role === "LEADER" ||
    user?.role === "SUPERADMIN" ||
    user?.role === "ADMIN";

  const [assigneeOptions, setAssigneeOptions] = useState<AssigneeOption[]>([]);
  const [assigneeUserId, setAssigneeUserId] = useState<string>(""); // "" = self

  useEffect(() => {
    if (sessionLoading) return;
    if (!user) return;

    (async () => {
      try {
        // SALES: no dropdown
        if (user.role === "SALES") {
          setAssigneeOptions([]);
          setAssigneeUserId("");
          return;
        }

        // LEADER: load team members (sales)
        if (user.role === "LEADER") {
          const res = await fetch("/api/teams/me/members", {
            cache: "no-store",
          });
          const json = await res.json().catch(() => ({}));
          const arr = pickArray(json);

          const list: AssigneeOption[] = arr
            .map((m: any) => ({
              userId: String(m.userId || m._id || ""),
              fullName: m.fullName ? String(m.fullName) : "",
              username: m.username ? String(m.username) : "",
              role: m.role ? String(m.role) : "SALES",
            }))
            .filter((x: AssigneeOption) => x.userId);

          setAssigneeOptions(list);
          setAssigneeUserId(""); // default self
          return;
        }

        // SUPERADMIN/ADMIN: load all users then filter SALES/LEADER
        if (user.role === "SUPERADMIN" || user.role === "ADMIN") {
          const res = await fetch("/api/users", { cache: "no-store" });
          const json = await res.json().catch(() => ({}));
          const arr = pickArray(json);

          const list: AssigneeOption[] = arr
            .map((u: any) => ({
              userId: String(u._id || u.userId || ""),
              fullName: u.fullName ? String(u.fullName) : "",
              username: u.username ? String(u.username) : "",
              role: u.role ? String(u.role) : "",
            }))
            .filter(
              (x: AssigneeOption) =>
                x.userId && (x.role === "SALES" || x.role === "LEADER"),
            );

          setAssigneeOptions(list);
          setAssigneeUserId(""); // default self
          return;
        }

        setAssigneeOptions([]);
        setAssigneeUserId("");
      } catch {
        setAssigneeOptions([]);
        setAssigneeUserId("");
      }
    })();
  }, [sessionLoading, user]);

  // NOTE: sekarang belum handle edit multi.
  useEffect(() => {
    if (editId) {
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
    return items.every((it) => Boolean(it.status_ring && it.institusiQuery));
  }, [tanggal, items]);

  async function submitAll() {
    if (!canSubmit) {
      alert("Tanggal wajib, dan setiap plan wajib punya Ring + Institusi.");
      return;
    }

    try {
      setSaving(true);

      // ✅ kirim targetUserId per item ("" = self)
      const payload = {
        tanggal,
        createdBy: user?.userId || null,
        nama_sales: user?.fullName || null,
        items: items.map((it) => ({
          status_ring: it.status_ring,
          institusi_kerja: it.institusiQuery,
          kota_kab: it.kota_kab,
          klpd: it.klpd,
          satuan_kerja: it.satuan_kerja,
          pic_default: it.pic_default,
          targetUserId: canPickAssignee ? assigneeUserId : "", // backend resolve
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
            {/* BREADCRUMB */}
            <nav className="mb-4 flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                <li>
                  <button
                    onClick={() => router.push("/plan-activity")}
                    className="hover:text-blue-600 transition-colors"
                  >
                    Plan Activity
                  </button>
                </li>
                <li>
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </li>
                <li aria-current="page">
                  <span className="text-black font-extrabold">
                    {editId ? "Edit Plans" : "Add Plans"}
                  </span>
                </li>
              </ol>
            </nav>

            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/plan-activity")}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 hover:text-gray-700 transition"
                  aria-label="Back"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                </button>
                <div className="flex flex-col">
                  <h1 className="text-2xl font-extrabold tracking-wide text-black">
                    {editId ? "EDIT PLANS" : "ADD PLANS"}
                  </h1>
                  <p className="text-xs text-black/60 font-medium mt-0.5">
                    {editId
                      ? "Ubah detail rencana aktivitas."
                      : "Buat rencana aktivitas baru."}
                  </p>
                </div>
              </div>

              {user?.role === "SALES" && (
                <button
                  type="button"
                  onClick={() => router.push("/tambah-instansi")}
                  className="rounded-lg bg-blue-50 px-5 py-2.5 text-sm font-bold text-blue-700 shadow-sm ring-1 ring-blue-200 hover:bg-blue-100 hover:ring-blue-300 transition-all flex items-center gap-2"
                >
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  REGISTER INSTANSI
                </button>
              )}
            </div>

            {/* TANGGAL + ASSIGNEE */}
            <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="text-xs font-bold tracking-wide text-gray-500 uppercase">
                    Tanggal{" "}
                    <span className="text-gray-400 lowercase font-normal">
                      (1 untuk semua plan)
                    </span>
                  </label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="mt-2 block w-full rounded-lg border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all"
                  />
                </div>

                {canPickAssignee ? (
                  <div>
                    <label className="text-xs font-bold tracking-wide text-gray-500 uppercase">
                      Assign To{" "}
                      <span className="text-gray-400 lowercase font-normal">
                        (opsional)
                      </span>
                    </label>
                    <select
                      value={assigneeUserId}
                      onChange={(e) => setAssigneeUserId(e.target.value)}
                      className="mt-2 block w-full rounded-lg border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-white transition-all"
                    >
                      <option value="">(Diri sendiri)</option>
                      {assigneeOptions.map((a) => (
                        <option key={a.userId} value={a.userId}>
                          {displayAssignee(a)}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
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
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Leader: sales team | Admin: semua sales & leader.
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold tracking-wide text-gray-500 uppercase">
                      Assign To
                    </label>
                    <div className="mt-2 block w-full rounded-lg bg-gray-50 border-0 py-2.5 px-4 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-200 sm:text-sm sm:leading-6 select-none cursor-not-allowed flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Auto: Diri sendiri (Role SALES)
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* LIST ITEM */}
            <div className="space-y-6">
              {items.map((it, idx) => (
                <div
                  key={it.id}
                  className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden relative group"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs ring-4 ring-white">
                        {idx + 1}
                      </div>
                      <h3 className="font-extrabold text-sm text-gray-900 tracking-wide">
                        DETAIL RENCANA KEGIATAN
                      </h3>
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(it.id)}
                        className="flex items-center gap-1.5 rounded-lg text-red-500 px-3 py-1.5 text-xs font-bold ring-1 ring-red-200 hover:bg-red-50 hover:ring-red-300 transition-colors"
                      >
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        HAPUS
                      </button>
                    )}
                  </div>

                  <div className="p-6 grid grid-cols-1 gap-y-6 gap-x-8 md:grid-cols-2">
                    {/* RING */}
                    <div>
                      <label className="text-xs font-bold tracking-wide text-gray-500 uppercase">
                        Status Ring
                      </label>
                      <select
                        value={it.status_ring}
                        onChange={(e) => {
                          patchItem(it.id, { status_ring: e.target.value });
                          resetCompanyFields(it.id);
                        }}
                        className="mt-2 block w-full rounded-lg border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-white transition-all"
                      >
                        <option value="">Pilih Status Ring...</option>
                        {paramRing.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="hidden md:block" />

                    {/* Institusi autocomplete */}
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold tracking-wide text-gray-500 uppercase">
                        Institusi{" "}
                        <span className="text-gray-400 lowercase font-normal">
                          (Approved List)
                        </span>
                      </label>

                      <div className="relative mt-2">
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <svg
                              className="h-4 w-4 text-gray-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
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
                                ? "Silakan pilih Status Ring terlebih dahulu"
                                : "Ketik untuk mencari nama institusi..."
                            }
                            className={`block w-full rounded-lg border-0 py-2.5 pl-10 pr-4 shadow-sm ring-1 ring-inset sm:text-sm sm:leading-6 transition-all ${
                              !it.status_ring
                                ? "bg-gray-50 text-gray-500 ring-gray-200 cursor-not-allowed"
                                : "bg-white text-gray-900 ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600"
                            }`}
                          />
                        </div>

                        {it.showSug && it.status_ring && (
                          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                            <div className="max-h-60 overflow-y-auto w-full">
                              {it.loadingSug ? (
                                <div className="flex justify-center items-center px-4 py-8 text-sm text-gray-500">
                                  <span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></span>
                                  Mencari instansi...
                                </div>
                              ) : it.sugs.length === 0 ? (
                                <div className="px-4 py-6 text-sm text-center text-gray-500">
                                  <svg
                                    className="mx-auto h-8 w-8 text-gray-400 mb-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1.5}
                                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                                    />
                                  </svg>
                                  Tidak ada instansi yang cocok untuk ring ini.
                                </div>
                              ) : (
                                it.sugs.map((c) => (
                                  <button
                                    key={c._id}
                                    type="button"
                                    onClick={() => pickCompany(it.id, c)}
                                    className="block w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 transition-colors border-b border-gray-50 last:border-none"
                                  >
                                    <div className="font-bold text-sm text-gray-900">
                                      {c.institusi_kerja}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5 truncate">
                                      <svg
                                        className="w-3.5 h-3.5 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                      </svg>
                                      {c.kota_kab}{" "}
                                      <span className="text-gray-300">•</span>{" "}
                                      {c.klpd}{" "}
                                      <span className="text-gray-300">•</span>{" "}
                                      {c.satuan_kerja}
                                    </div>
                                  </button>
                                ))
                              )}
                            </div>
                            <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 flex justify-end">
                              <button
                                type="button"
                                onClick={() =>
                                  patchItem(it.id, { showSug: false })
                                }
                                className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                              >
                                Tutup Daftar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Autofill */}
                    <div>
                      <label className="text-xs font-bold tracking-wide text-gray-400 uppercase">
                        Kota/Kabupaten
                      </label>
                      <input
                        value={it.kota_kab}
                        readOnly
                        className="mt-2 block w-full rounded-lg bg-gray-50 border-0 py-2.5 px-4 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-200 sm:text-sm sm:leading-6 select-none"
                        placeholder="Terisi otomatis"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold tracking-wide text-gray-400 uppercase">
                        KLPD
                      </label>
                      <input
                        value={it.klpd}
                        readOnly
                        className="mt-2 block w-full rounded-lg bg-gray-50 border-0 py-2.5 px-4 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-200 sm:text-sm sm:leading-6 select-none"
                        placeholder="Terisi otomatis"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-bold tracking-wide text-gray-400 uppercase">
                        Satuan Kerja
                      </label>
                      <input
                        value={it.satuan_kerja}
                        readOnly
                        className="mt-2 block w-full rounded-lg bg-gray-50 border-0 py-2.5 px-4 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-200 sm:text-sm sm:leading-6 select-none"
                        placeholder="Terisi otomatis"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ACTIONS BOTTOM */}
            <div className="mt-8 flex flex-col-reverse md:flex-row items-center justify-end gap-4 pb-8 border-t border-gray-200/60 pt-6">
              <button
                type="button"
                onClick={addItem}
                className="w-full md:w-auto flex items-center justify-center gap-2 h-11 rounded-lg bg-white px-6 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
              >
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                TAMBAH RENCANA LAIN
              </button>

              <button
                type="button"
                onClick={submitAll}
                disabled={!canSubmit || saving}
                className={`w-full md:w-48 flex items-center justify-center gap-2 h-11 rounded-lg px-6 text-sm font-bold text-white shadow-sm transition-all
                  ${
                    !canSubmit || saving
                      ? "bg-blue-400 cursor-not-allowed opacity-80"
                      : "bg-blue-600 hover:bg-blue-700 hover:shadow ring-1 ring-blue-700"
                  }`}
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Menyimpan...
                  </>
                ) : (
                  <>
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
                    SIMPAN SEMUA
                  </>
                )}
              </button>
            </div>

            <div className="h-10" />
          </main>
        </div>
      </div>
    </div>
  );
}

export default function AddPlansPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddPlansContent />
    </Suspense>
  );
}
