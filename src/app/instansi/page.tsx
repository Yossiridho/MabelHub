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
      <label className="text-[11px] font-bold tracking-wide text-black/70">
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
        "h-11 w-full rounded-xl bg-white px-4 text-md text-black outline-none",
        "ring-1 ring-black/10 focus:ring-2 focus:ring-black/20",
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
        "h-11 w-full rounded-xl bg-white px-4 text-sm text-gray-500 outline-none",
        "ring-1 ring-black/10 focus:ring-2 focus:ring-black/20",
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
        "h-11 rounded-full px-6 text-md font-extrabold tracking-wide",
        "ring-1 ring-black/15 shadow-sm hover:bg-black/5",
        "disabled:opacity-50 disabled:hover:bg-white",
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
        "h-11 rounded-full px-7 text-md font-extrabold tracking-wide",
        "bg-black hover:bg-black/90",
        "disabled:opacity-50",
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

    const res = await fetch(`/api/instansi?${qs.toString()}`);
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
    const res = await fetch("/api/company-requests?status=PENDING");
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

    await fetch(`/api/company-requests/${id}/approve`, { method: "POST" });

    setBusyId(null);
    await loadPending();
    await loadApproved();
    await fetchPendingCount();
  }

  async function rejectRequest(id: string) {
    const reason = prompt("Alasan reject:");
    if (!reason) return;

    setBusyId(id);
    await fetch(`/api/company-requests/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reject_reason: reason }),
    });

    setBusyId(null);
    await loadPending();
    await fetchPendingCount();
  }

  return (
    <div className="min-h-screen bg-blue-100">
      <div className="flex">
        <Sidebar />

        <div className="flex-1 p-6 h-screen overflow-y-auto">
          <main className="mx-auto pt-4 max-w-9xl">
            {/* Top */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-extrabold text-black">INSTANSI</h1>
                <p className="text-xs text-black">
                  Rekap instansi yang sudah <b>APPROVED</b>
                </p>
              </div>

              {role === "SUPERADMIN" ? (
                <div className="flex gap-3">
                  <PrimaryButton onClick={() => router.push("/tambah-instansi")}>
                    TAMBAH INSTANSI
                  </PrimaryButton>
                  <PrimaryButton onClick={openPendingModal}>
                    <span className="relative inline-flex items-center">
                      REQUEST PENDING
                      {pendingCount > 0 && (
                        <span className="absolute -right-4 -top-3 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[11px] font-extrabold text-white ring-2 ring-white">
                          {pendingCount > 99 ? "99+" : pendingCount}
                        </span>
                      )}
                    </span>
                  </PrimaryButton>
                </div>
              ) : null}
            </div>

            {/* Filters */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-blue-200">
              <div className="grid gap-4 md:grid-cols-4 md:items-end">
                <Field label="SEARCH">
                  <div className="relative">
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari institusi / satuan kerja / PIC..."
                      className="pr-10"
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

                <Field label="SEGMEN">
                  <Select
                    value={segmen}
                    onChange={(e) => {
                      setSegmen(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="ALL">Semua Segmen</option>
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
            <div className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-blue-200 ">
              <div className="overflow-x-auto">
                <table className="min-w-full text-md">
                  <thead className="bg-blue-200 text-black ring-2 ring-blue-300">
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
                        "Status Segmen",
                        "History",
                        "Aksi",
                      ].map((h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap border-b border-gray-300 px-4 py-3 text-left text-xs font-extrabold tracking-wide text-black"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="bg-white ring-1 ring-blue-200">
                    {loading ? (
                      <tr>
                        <td
                          colSpan={12}
                          className="px-4 py-12 text-center text-md"
                        >
                          Loading...
                        </td>
                      </tr>
                    ) : resp?.items?.length ? (
                      resp.items.map((c) => (
                        <tr key={c._id} className="border-t border-gray-300">
                          <td className="px-4 py-4">{c.kota_kab ?? "-"}</td>
                          <td className="px-4 py-4">{c.klpd ?? "-"}</td>
                          <td className="px-4 py-4 ">
                            {c.institusi_kerja ?? "-"}
                          </td>
                          <td className="px-4 py-4">{c.satuan_kerja ?? "-"}</td>
                          <td className="px-4 py-4">{c.kode_dinas ?? "-"}</td>
                          <td className="px-4 py-4">
                            {c.pic_default?.nama ?? "-"}
                          </td>
                          <td className="px-4 py-4">
                            {c.pic_default?.no_telp ?? "-"}
                          </td>
                          <td className="px-4 py-4">
                            {c.pic_default?.jabatan ?? "-"}
                          </td>
                          <td className="px-4 py-4">
                            {c.pic_default?.role ?? "-"}
                          </td>
                          <td className="px-4 py-4">
                            <StatusPill value={c.status_ring} />
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button
                              className="rounded-lg bg-white px-3 py-2 text-xs font-bold ring-1 ring-black/10 hover:bg-black/5"
                              title="History"
                              onClick={() => {
                                setActiveCompany(c);
                                setOpenHistory(true);
                              }}
                            >
                              ⟲
                            </button>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                className="rounded-lg bg-white px-3 py-2 text-xs font-bold ring-1 ring-black/10 hover:bg-black/5"
                                title="Edit"
                                onClick={() => {
                                  setActiveCompany(c);
                                  setOpenEdit(true);
                                }}
                              >
                                ✎
                              </button>
                              <button
                                className="rounded-lg bg-white px-3 py-2 text-xs font-bold ring-1 ring-black/10 hover:bg-black/5"
                                title="Delete"
                                onClick={() => {
                                  setActiveCompany(c);
                                  setOpenDelete(true);
                                }}
                              >
                                🗑
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={12}
                          className="px-4 py-12 text-center text-md text-black/60"
                        >
                          Tidak ada data.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              <div className="flex flex-col gap-3 border-t border-black/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div className="text-md text-gray-500">
                  Menampilkan{" "}
                  <b className="text-black">
                    {(page - 1) * limit + 1} -{" "}
                    {Math.min(page * limit, resp?.total ?? 0)}
                  </b>{" "}
                  dari <b className="text-black">{resp?.total ?? 0}</b> data
                </div>

                <div className="flex items-center gap-3">
                  <Select
                    value={String(limit)}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="h-10 rounded-xl"
                  >
                    {[10, 25, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n} / Halaman
                      </option>
                    ))}
                  </Select>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                      className="grid h-10 w-10 place-items-center rounded-xl bg-white ring-1 ring-black/30 hover:bg-black/5"
                      title="First"
                    >
                      ⏮
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="grid h-10 w-10 place-items-center rounded-xl bg-white ring-1 ring-black/30 hover:bg-black/5"
                      title="Prev"
                    >
                      ◀
                    </button>

                    <div className="px-8 py-8 text-md font-extrabold text-gray-500 whitespace-nowrap">
                      {page} / {totalPages}
                    </div>

                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="grid h-10 w-10 place-items-center rounded-xl bg-white ring-1 ring-black/30 hover:bg-black/5"
                      title="Next"
                    >
                      ▶
                    </button>
                    <button
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                      className="grid h-10 w-10 place-items-center rounded-xl bg-white ring-1 ring-black/30 hover:bg-black/5"
                      title="Last"
                    >
                      ⏭
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
