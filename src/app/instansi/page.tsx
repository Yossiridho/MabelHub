"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/sidebar/sidebar";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/menu";
import PendingRequestsModal from "@/components/modals/PendingRequestsModal";
import DeleteInstansiModal from "@/components/modals/DeleteInstansiModal";
import HistoryInstansiModal from "@/components/modals/HistoryInstansiModal";
import EditInstansiModal from "@/components/modals/EditInstansiModal";

type Company = {
  _id: string;
  kota_kab?: string;
  klpd?: string;
  institusi_kerja?: string;
  satuan_kerja?: string;
  kode_dinas?: string;
  status_ring?: string;
  pic_default?: {
    nama?: string;
    no_telp?: string;
    jabatan?: string;
    role?: string;
  };
};

type CompanyRequest = Company & {
  requested_at?: string;
  requested_by?: string;
};

type ApiResp = {
  items: Company[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  options: {
    kota: string[];
    klpd: string[];
    segmen: string[];
  };
};

function clsx(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}

function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  widthClass = "max-w-5xl",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  widthClass?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/35"
        aria-label="Close modal"
      />
      <div
        className={clsx(
          "relative mt-16 w-[94%] rounded-2xl bg-[#f7f2f2] shadow-2xl ring-1 ring-black/10",
          widthClass,
        )}
      >
        <div className="flex items-start justify-between border-b border-black/10 px-6 py-5">
          <div>
            <h2 className="text-base font-extrabold tracking-wide text-black">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-xs text-black/60">{subtitle}</p>
            ) : null}
          </div>

          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-black/5 text-xl font-black text-black hover:bg-black/10"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold tracking-wide text-gray-500 uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "block w-full rounded-lg border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all",
        props.className || "",
      )}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={clsx(
        "block w-full rounded-lg border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-white transition-all",
        props.className || "",
      )}
    />
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors",
        "disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed",
        className || "",
      )}
    >
      {children}
    </button>
  );
}

function SolidButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-bold text-white shadow-sm ring-1 ring-inset ring-blue-700 hover:bg-blue-700 hover:shadow transition-all",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className || "",
      )}
    >
      {children}
    </button>
  );
}

function StatusPill({ value }: { value?: string }) {
  const v = (value || "-").toUpperCase();
  const isB2G =
    v.includes("RING 1") || v.includes("RING 2") || v.includes("RING 3");
  const isB2B = v.includes("RING 4");
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-extrabold",
        "ring-1 ring-black/10",
        isB2G && "bg-blue-50 text-blue-700",
        isB2B && "bg-emerald-50 text-emerald-700",
        !isB2G && !isB2B && "bg-gray-50 text-gray-700",
      )}
    >
      {v}
    </span>
  );
}

export default function InstansiPage() {
  const router = useRouter();
  const role: Role = "SUPERADMIN";
  const [pendingCount, setPendingCount] = useState(0);

  // filters
  const [search, setSearch] = useState("");
  const [kota, setKota] = useState("ALL");
  const [klpd, setKlpd] = useState("ALL");
  const [segmen, setSegmen] = useState("ALL");

  // pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  // data
  const [loading, setLoading] = useState(true);
  const [resp, setResp] = useState<ApiResp | null>(null);
  const totalPages = resp?.totalPages ?? 1;

  // modals
  const [openAdd, setOpenAdd] = useState(false);
  const [openPending, setOpenPending] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);

  // add form
  const [form, setForm] = useState({
    institusi_kerja: "",
    kota_kab: "",
    klpd: "",
    satuan_kerja: "",
    status_ring: "",
    kode_dinas: "",
    pic_nama: "",
    pic_telp: "",
    pic_jabatan: "",
    pic_role: "",
  });
  const [savingAdd, setSavingAdd] = useState(false);

  // pending
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pending, setPending] = useState<CompanyRequest[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function fetchPendingCount() {
    try {
      const res = await fetch("/api/company-requests?status=PENDING", {
        cache: "no-store",
      });
      if (!res.ok) return setPendingCount(0);

      const data = await res.json();
      setPendingCount(Array.isArray(data) ? data.length : 0);
    } catch {
      setPendingCount(0);
    }
  }

  async function loadApproved() {
    setLoading(true);
    const qs = new URLSearchParams({
      q: search,
      kota,
      klpd,
      segmen,
      page: String(page),
      limit: String(limit),
    });

    const res = await fetch(`/api/instansi?${qs.toString()}`, {
      cache: "no-store",
    });
    const data = (await res.json()) as ApiResp;
    setResp(data);
    setLoading(false);
  }

  useEffect(() => {
    loadApproved();
    fetchPendingCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, kota, klpd, segmen]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      loadApproved();
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const kotaOptions = useMemo(() => resp?.options.kota ?? [], [resp]);
  const klpdOptions = useMemo(() => resp?.options.klpd ?? [], [resp]);
  const segmenOptions = useMemo(() => resp?.options.segmen ?? [], [resp]);

  async function submitAddInstansi() {
    if (role !== "SUPERADMIN") return;

    if (
      !form.institusi_kerja ||
      !form.kota_kab ||
      !form.klpd ||
      !form.satuan_kerja ||
      !form.status_ring
    ) {
      alert(
        "Lengkapi: Nama Institusi, Kota/Kabupaten, KLPD, Satuan Kerja, Status Segmen.",
      );
      return;
    }

    setSavingAdd(true);
    const payload = {
      institusi_kerja: form.institusi_kerja,
      kota_kab: form.kota_kab,
      klpd: form.klpd,
      satuan_kerja: form.satuan_kerja,
      status_ring: form.status_ring,
      kode_dinas: form.kode_dinas,
      pic_default: {
        nama: form.pic_nama,
        no_telp: form.pic_telp,
        jabatan: form.pic_jabatan,
        role: form.pic_role,
      },
    };

    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSavingAdd(false);

    if (!res.ok) {
      alert("Gagal menambah instansi.");
      return;
    }

    setOpenAdd(false);
    setForm({
      institusi_kerja: "",
      kota_kab: "",
      klpd: "",
      satuan_kerja: "",
      status_ring: "",
      kode_dinas: "",
      pic_nama: "",
      pic_telp: "",
      pic_jabatan: "",
      pic_role: "",
    });

    await loadApproved();
  }

  async function loadPending() {
    setPendingLoading(true);
    const res = await fetch("/api/company-requests?status=PENDING", {
      cache: "no-store",
    });
    const data = await res.json();
    setPending(Array.isArray(data) ? data : []);
    setPendingLoading(false);
  }

  async function openPendingModal() {
    setOpenPending(true);
    await loadPending();
    await fetchPendingCount();
  }

  async function approveRequest(id: string) {
    if (!confirm("Approve instansi ini?")) return;
    setBusyId(id);

    try {
      const res = await fetch(`/api/company-requests/${id}/approve`, {
        method: "POST",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(
          `Gagal approve: ${errorData.message || "Terjadi kesalahan pada server"}`,
        );
      }
    } catch (e: any) {
      alert(`Terjadi kesalahan jaringan: ${e.message}`);
    }

    setBusyId(null);
    await loadPending();
    await loadApproved();
    await fetchPendingCount();
  }

  async function rejectRequest(id: string) {
    const reason = prompt("Alasan reject:");
    if (!reason) return;

    setBusyId(id);
    try {
      const res = await fetch(`/api/company-requests/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reject_reason: reason }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(
          `Gagal reject: ${errorData.message || "Terjadi kesalahan pada server"}`,
        );
      }
    } catch (e: any) {
      alert(`Terjadi kesalahan jaringan: ${e.message}`);
    }

    setBusyId(null);
    await loadPending();
    await fetchPendingCount();
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="flex">
        <Sidebar />

        <div className="flex-1 p-6 h-screen overflow-y-auto">
          <main className="mx-auto pt-4 max-w-none">
            {/* BREADCRUMB */}
            <nav className="mb-4 flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                <li aria-current="page">
                  <span className="text-black font-extrabold cursor-default">
                    Instansi
                  </span>
                </li>
              </ol>
            </nav>

            {/* Top */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col">
                <h1 className="text-2xl font-extrabold tracking-wide text-black uppercase">
                  Daftar Instansi
                </h1>
                <p className="text-xs text-black/60 font-medium mt-0.5">
                  Rekap data instansi yang sudah <b>APPROVED</b>
                </p>
              </div>

              {role === "SUPERADMIN" ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => router.push("/tambah-instansi")}
                    className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white shadow-sm ring-1 ring-inset ring-blue-700 hover:bg-blue-700 hover:shadow transition-all"
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
                    TAMBAH INSTANSI
                  </button>
                  <button
                    onClick={openPendingModal}
                    className="relative flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 text-orange-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    REQUEST PENDING
                    {pendingCount > 0 && (
                      <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white ring-2 ring-white shadow-sm">
                        {pendingCount > 99 ? "99+" : pendingCount}
                      </span>
                    )}
                  </button>
                </div>
              ) : null}
            </div>

            {/* Filters */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 mb-6">
              <div className="grid gap-6 md:grid-cols-4 md:items-end">
                <Field label="PENCARIAN">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari institusi / satuan kerja / PIC..."
                    />
                  </div>
                </Field>

                <Field label="KOTA/KABUPATEN">
                  <Select
                    value={kota}
                    onChange={(e) => {
                      setKota(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="ALL">Semua Kota</option>
                    {kotaOptions.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="KLPD">
                  <Select
                    value={klpd}
                    onChange={(e) => {
                      setKlpd(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="ALL">Semua KLPD</option>
                    {klpdOptions.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="RING">
                  <Select
                    value={segmen}
                    onChange={(e) => {
                      setSegmen(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="ALL">Semua Ring</option>
                    {segmenOptions.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            </div>

            {/* Table */}
            <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-gray-50/50 border-b border-gray-200">
                    <tr>
                      {[
                        "Kota/Kab",
                        "KLPD",
                        "Institusi Kerja",
                        "Satuan Kerja",
                        "Kode Dinas",
                        "Nama PIC",
                        "No. HP PIC",
                        "Jabatan PIC",
                        "Role PIC",
                        "Status Ring",
                        "History",
                        "Aksi",
                      ].map((h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap px-6 py-4 text-xs font-bold tracking-wider text-gray-500 uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 bg-white">
                    {loading ? (
                      <tr>
                        <td
                          colSpan={12}
                          className="px-6 py-12 text-center text-sm text-gray-500"
                        >
                          <div className="flex justify-center items-center gap-2">
                            <span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                            Loading data instansi...
                          </div>
                        </td>
                      </tr>
                    ) : resp?.items?.length ? (
                      resp.items.map((c) => (
                        <tr
                          key={c._id}
                          className="hover:bg-gray-50/50 transition-colors group"
                        >
                          <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                            {c.kota_kab ?? "-"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                            {c.klpd ?? "-"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-gray-900 font-bold">
                            {c.institusi_kerja ?? "-"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                            {c.satuan_kerja ?? "-"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                            {c.kode_dinas ?? "-"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-gray-900">
                            {c.pic_default?.nama ?? "-"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                            {c.pic_default?.no_telp ?? "-"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                            {c.pic_default?.jabatan ?? "-"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                            {c.pic_default?.role ?? "-"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-center">
                            <StatusPill value={c.status_ring} />
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-center">
                            <button
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all mx-auto"
                              title="History"
                              onClick={() => {
                                setActiveCompany(c);
                                setOpenHistory(true);
                              }}
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
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </button>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                              <button
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 transition-all ring-1 ring-inset ring-transparent hover:ring-blue-100"
                                title="Edit"
                                onClick={() => {
                                  setActiveCompany(c);
                                  setOpenEdit(true);
                                }}
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
                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                  />
                                </svg>
                              </button>
                              <button
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-all ring-1 ring-inset ring-transparent hover:ring-red-100"
                                title="Delete"
                                onClick={() => {
                                  setActiveCompany(c);
                                  setOpenDelete(true);
                                }}
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={12}
                          className="px-6 py-12 text-center text-sm text-gray-500"
                        >
                          Tidak ada data instansi yang sesuai.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              <div className="flex flex-col gap-4 border-t border-gray-100 bg-gray-50/50 px-6 py-4 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-gray-500">
                  Menampilkan{" "}
                  <b className="text-gray-900">{(page - 1) * limit + 1}</b> -{" "}
                  <b className="text-gray-900">
                    {Math.min(page * limit, resp?.total ?? 0)}
                  </b>{" "}
                  dari <b className="text-gray-900">{resp?.total ?? 0}</b> data
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Tampilkan
                    </span>
                    <Select
                      value={String(limit)}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1);
                      }}
                      className="!py-1.5 h-auto text-sm"
                    >
                      {[10, 25, 50, 100].map((n) => (
                        <option key={n} value={n}>
                          {n} / halaman
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white ring-1 ring-inset ring-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title="First"
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
                          d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white ring-1 ring-inset ring-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title="Prev"
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
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    <div className="px-3 text-sm font-bold text-gray-700 whitespace-nowrap">
                      Hal {page}{" "}
                      <span className="text-gray-400 font-normal">
                        dari {totalPages}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white ring-1 ring-inset ring-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title="Next"
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white ring-1 ring-inset ring-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title="Last"
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
                          d="M13 5l7 7-7 7M5 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* ================= MODAL: REQUEST PENDING ================= */}
      <PendingRequestsModal
        open={openPending}
        onClose={() => setOpenPending(false)}
        pending={pending}
        pendingLoading={pendingLoading}
        busyId={busyId}
        approveRequest={approveRequest}
        rejectRequest={rejectRequest}
      />
      <HistoryInstansiModal
        open={openHistory}
        onClose={() => setOpenHistory(false)}
        companyId={activeCompany?._id ?? null}
      />

      <EditInstansiModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        company={activeCompany}
        onSaved={loadApproved}
      />

      <DeleteInstansiModal
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        companyId={activeCompany?._id ?? null}
        companyName={activeCompany?.institusi_kerja ?? "-"}
        onDeleted={loadApproved}
      />
    </div>
  );
}
