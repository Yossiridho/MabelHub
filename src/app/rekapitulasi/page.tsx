"use client";

import React, { useMemo, useState } from "react";
import Sidebar from "@/components/sidebar/sidebar";
import type { Role } from "@/lib/menu";

type VisitRow = {
  _id: string;
  nama_sales: string;
  visit_date: string; // ISO string
  status_visit: string;
  satuan_kerja: string;
  city: string;
  pic_name: string;
  pic_phone: string;
  status_ring: "RING 1" | "RING 2" | "RING 3" | "RING 4";

  created_at: string;
  market_status: string;
  klpd: string;
  reschedule: string;
  institusi_kerja: string;
  pic_position: string;
  pic_role: string;
  tindak_lanjut: string;
  kegiatan_status: string;
  deskripsi: string;
};

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

const role: Role = "SUPERADMIN";

function formatDateID(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function getPageWindow(current: number, totalPages: number, size: number) {
  if (totalPages <= size)
    return Array.from({ length: totalPages }, (_, i) => i + 1);

  const half = Math.floor(size / 2);
  let start = Math.max(1, current - half);
  let end = start + size - 1;

  if (end > totalPages) {
    end = totalPages;
    start = end - size + 1;
  }
  return Array.from({ length: size }, (_, i) => start + i);
}

function StatusPill({ value }: { value: string }) {
  const upper = value.toUpperCase();
  const isVisited = upper.includes("VISIT") && !upper.includes("NOT");

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4 py-1 text-xs font-extrabold tracking-wide",
        isVisited
          ? "bg-green-100 text-green-700 ring-1 ring-green-200"
          : "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
      )}
    >
      {upper}
    </span>
  );
}

export default function RekapitulasiVisitPage() {
  const allRows: VisitRow[] = useMemo(
    () => [
      {
        _id: "1",
        nama_sales: "Beffry Rizkana",
        visit_date: new Date().toISOString(),
        status_visit: "Visited",
        satuan_kerja: "UNPAD-FAKULTAS EKONOMI DAN BISNIS (FEB)",
        city: "Kabupaten Sumedang",
        pic_name: "Nendi",
        pic_phone: "-",
        status_ring: "RING 1",
        created_at: new Date().toISOString(),
        market_status: "Cold",
        klpd: "Kementerian",
        reschedule: "-",
        institusi_kerja: "Rumah Sakit",
        pic_position: "Penunjang Umum",
        pic_role: "Staff",
        tindak_lanjut: "Revisit dan tetap jalin komunikasi",
        kegiatan_status: "Visit Pengembangan",
        deskripsi:
          "Follow up untuk pembelian laptop via siplah...\n1. Belira muser 4 unit\n2. Terompet king/jupiter 4 unit\n3. Tuba besar king/jupiter 2 unit\n4. Stick mayoret primere 150cm 2 unit\nSudah masuk di sheet.",
      },
      {
        _id: "2",
        nama_sales: "Beffry Rizkana",
        visit_date: new Date().toISOString(),
        status_visit: "Visited",
        satuan_kerja: "UNPAD-FAKULTAS ILMU KOMUNIKASI (FIKOM)",
        city: "Kabupaten Sumedang",
        pic_name: "Pak Deni Rustiandi",
        pic_phone: "6287821669805",
        status_ring: "RING 1",
        created_at: new Date().toISOString(),
        market_status: "Warm",
        klpd: "Kementerian",
        reschedule: "-",
        institusi_kerja: "Universitas",
        pic_position: "Pengadaan",
        pic_role: "PIC",
        tindak_lanjut: "Kirim penawaran",
        kegiatan_status: "Visit Pengembangan",
        deskripsi: "Diskusi kebutuhan dan timeline pengadaan.",
      },
      {
        _id: "3",
        nama_sales: "Beffry Rizkana",
        visit_date: new Date().toISOString(),
        status_visit: "Not Visited",
        satuan_kerja: "UNPAD-FAKULTAS ILMU SOSIAL DAN POLITIK",
        city: "Kabupaten Sumedang",
        pic_name: "-",
        pic_phone: "-",
        status_ring: "RING 1",
        created_at: new Date().toISOString(),
        market_status: "Cold",
        klpd: "-",
        reschedule: "15-Feb-2026",
        institusi_kerja: "Universitas",
        pic_position: "-",
        pic_role: "-",
        tindak_lanjut: "Reschedule",
        kegiatan_status: "Plan Visit",
        deskripsi: "Belum ada kunjungan.",
      },
    ],
    [],
  );

  // ====== filter state ======
  const [fSales, setFSales] = useState<string>("ALL");
  const [fStart, setFStart] = useState<string>("");
  const [fEnd, setFEnd] = useState<string>("");
  const [fStatus, setFStatus] = useState<string>("ALL");
  const [fRing, setFRing] = useState<string>("ALL");
  const [fCity, setFCity] = useState<string>("ALL");
  const [fSatker, setFSatker] = useState<string>("ALL");

  // ====== pagination ======
  const [pageSize, setPageSize] = useState<number>(25);
  const [page, setPage] = useState<number>(1);

  // ====== selected row for detail ======
  const [selected, setSelected] = useState<VisitRow | null>(null);

  const salesOptions = useMemo(
    () => Array.from(new Set(allRows.map((r) => r.nama_sales))).sort(),
    [allRows],
  );
  const cityOptions = useMemo(
    () => Array.from(new Set(allRows.map((r) => r.city))).sort(),
    [allRows],
  );
  const satkerOptions = useMemo(
    () => Array.from(new Set(allRows.map((r) => r.satuan_kerja))).sort(),
    [allRows],
  );

  const filtered = useMemo(() => {
    const start = fStart ? new Date(fStart).getTime() : null;
    const end = fEnd ? new Date(fEnd).getTime() : null;

    return allRows.filter((r) => {
      if (fSales !== "ALL" && r.nama_sales !== fSales) return false;
      if (fStatus !== "ALL" && r.status_visit !== fStatus) return false;
      if (fRing !== "ALL" && r.status_ring !== fRing) return false;
      if (fCity !== "ALL" && r.city !== fCity) return false;
      if (fSatker !== "ALL" && r.satuan_kerja !== fSatker) return false;

      const t = new Date(r.visit_date).getTime();
      if (start !== null && t < start) return false;
      if (end !== null && t > end) return false;

      return true;
    });
  }, [allRows, fSales, fStatus, fRing, fCity, fSatker, fStart, fEnd]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const showingFrom = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const showingTo = Math.min(total, safePage * pageSize);

  const gotoPage = (p: number) =>
    setPage(Math.min(Math.max(1, p), totalPages));

  const onChangeFilter = (fn: (v: string) => void, v: string) => {
    fn(v);
    setSelected(null);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-blue-100">
      <div className="flex min-h-screen">
        <Sidebar role={role} />

        <div className="flex-1 bg-[#F2F7FF] p-8">
          {/* HEADER */}
          <div className="mb-6 flex items-center gap-4">
            <h1 className="text-xl font-extrabold tracking-wide text-gray-900">
              REKAPITULASI VISIT
            </h1>
          </div>

          {/* FILTER CARD */}
          <section className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-blue-200">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-6">
              <FilterSelect
                label="SALES PERSON"
                value={fSales}
                onChange={(v) => onChangeFilter(setFSales, v)}
                options={[{ label: "Semua Sales", value: "ALL" }].concat(
                  salesOptions.map((s) => ({ label: s, value: s })),
                )}
              />

              <FilterDate
                label="TANGGAL MULAI"
                value={fStart}
                onChange={(v) => onChangeFilter(setFStart, v)}
              />
              <FilterDate
                label="TANGGAL AKHIR"
                value={fEnd}
                onChange={(v) => onChangeFilter(setFEnd, v)}
              />

              <FilterSelect
                label="STATUS VISIT"
                value={fStatus}
                onChange={(v) => onChangeFilter(setFStatus, v)}
                options={[
                  { label: "Semua Status", value: "ALL" },
                  { label: "Visited", value: "Visited" },
                  { label: "Not Visited", value: "Not Visited" },
                ]}
              />

              <FilterSelect
                label="RING"
                value={fRing}
                onChange={(v) => onChangeFilter(setFRing, v)}
                options={[
                  { label: "Semua Ring", value: "ALL" },
                  { label: "RING 1", value: "RING 1" },
                  { label: "RING 2", value: "RING 2" },
                  { label: "RING 3", value: "RING 3" },
                  { label: "RING 4", value: "RING 4" },
                ]}
              />

              <FilterSelect
                label="CITY"
                value={fCity}
                onChange={(v) => onChangeFilter(setFCity, v)}
                options={[{ label: "Semua City", value: "ALL" }].concat(
                  cityOptions.map((c) => ({ label: c, value: c })),
                )}
              />

              <div className="md:col-span-6">
                <FilterSelect
                  label="SATUAN KERJA"
                  value={fSatker}
                  onChange={(v) => onChangeFilter(setFSatker, v)}
                  options={[{ label: "Semua Satker", value: "ALL" }].concat(
                    satkerOptions.map((s) => ({ label: s, value: s })),
                  )}
                  full
                />
              </div>
            </div>
          </section>

          {/* TABLE */}
          <section className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#E1F3FF]">
                  <tr className="text-left">
                    {[
                      "NAMA SALES",
                      "VISIT DATE",
                      "STATUS",
                      "SATUAN KERJA",
                      "CITY",
                      "PIC NAME",
                      "PIC PHONE",
                      "RING",
                    ].map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-6 py-5 text-xs font-extrabold tracking-wider text-[#0B6AA9]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        Tidak ada data.
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((r) => {
                      const active = selected?._id === r._id;
                      return (
                        <tr
                          key={r._id}
                          onClick={() => setSelected(r)}
                          className={cn(
                            "cursor-pointer border-t border-blue-50",
                            active
                              ? "bg-blue-50/60"
                              : "hover:bg-blue-50/30",
                          )}
                        >
                          <td className="px-6 py-6 font-extrabold text-[#0B6AA9]">
                            {r.nama_sales}
                          </td>
                          <td className="px-6 py-6 text-gray-800">
                            {formatDateID(r.visit_date)}
                          </td>
                          <td className="px-6 py-6">
                            <StatusPill value={r.status_visit} />
                          </td>
                          <td className="px-6 py-6 text-gray-900">
                            {r.satuan_kerja}
                          </td>
                          <td className="px-6 py-6 text-gray-900">{r.city}</td>
                          <td className="px-6 py-6 text-gray-900">
                            {r.pic_name}
                          </td>
                          <td className="px-6 py-6 text-gray-900">
                            {r.pic_phone}
                          </td>
                          <td className="px-6 py-6 font-extrabold text-[#0B6AA9]">
                            {r.status_ring}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* PAGINATION */}
          <section className="mt-6 flex flex-col gap-3 rounded-2xl bg-white px-6 py-4 shadow-sm ring-1 ring-blue-100 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-gray-600">
              Menampilkan {showingFrom} - {showingTo} dari {total} data
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="h-10 rounded-xl border border-blue-100 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value={10}>10 / Halaman</option>
                <option value={25}>25 / Halaman</option>
                <option value={50}>50 / Halaman</option>
                <option value={100}>100 / Halaman</option>
              </select>

              <div className="flex items-center gap-2">
                <PageBtn onClick={() => gotoPage(1)} ariaLabel="First">
                  ⏮
                </PageBtn>
                <PageBtn
                  onClick={() => gotoPage(safePage - 1)}
                  ariaLabel="Prev"
                >
                  ◀
                </PageBtn>

                {getPageWindow(safePage, totalPages, 5).map((p) => (
                  <button
                    key={p}
                    onClick={() => gotoPage(p)}
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-xl border text-sm font-semibold",
                      p === safePage
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-blue-100 bg-white text-gray-700 hover:bg-blue-50/40",
                    )}
                  >
                    {p}
                  </button>
                ))}

                <PageBtn
                  onClick={() => gotoPage(safePage + 1)}
                  ariaLabel="Next"
                >
                  ▶
                </PageBtn>
                <PageBtn onClick={() => gotoPage(totalPages)} ariaLabel="Last">
                  ⏭
                </PageBtn>
              </div>
            </div>
          </section>

          {/* DETAIL */}
          <section className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3 text-lg font-extrabold text-gray-900">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gray-100">
                  📖
                </span>
                Detail Kunjungan
              </div>

              {selected && (
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-extrabold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
                >
                  TUTUP
                </button>
              )}
            </div>

            <div className="h-px w-full bg-gray-200" />

            <div className="p-6">
              {!selected ? (
                <div className="text-sm text-gray-500">
                  Klik salah satu baris pada tabel untuk melihat detail kegiatan.
                </div>
              ) : (
                <div className="rounded-xl bg-[#F7F9FB] p-6 ring-1 ring-gray-100">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-6">
                    <DetailItem
                      label="Created At"
                      value={formatDateID(selected.created_at)}
                    />
                    <DetailItem
                      label="Market Status"
                      value={selected.market_status}
                    />
                    <DetailItem label="KLPD" value={selected.klpd} />
                    <DetailItem
                      label="Reschedule"
                      value={selected.reschedule}
                    />
                    <DetailItem
                      label="Institusi Kerja"
                      value={selected.institusi_kerja}
                    />
                    <DetailItem
                      label="PIC Position"
                      value={selected.pic_position}
                    />

                    <DetailItem label="PIC Role" value={selected.pic_role} />
                    <DetailItem
                      label="Tindak Lanjut"
                      value={selected.tindak_lanjut}
                    />
                    <DetailItem
                      label="Kegiatan Status"
                      value={selected.kegiatan_status}
                    />
                  </div>

                  <div className="mt-6">
                    <div className="text-xs font-extrabold tracking-wider text-gray-500">
                      DESKRIPSI
                    </div>
                    <div className="mt-2 whitespace-pre-line text-sm text-gray-700">
                      {selected.deskripsi || "-"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  full,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ label: string; value: string }>;
  full?: boolean;
}) {
  return (
    <div className={cn(full && "w-full")}>
      <div className="text-xs font-extrabold tracking-wider text-[#0B6AA9]">
        {label}
      </div>
      <div className="relative mt-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-full appearance-none rounded-xl border border-blue-200 bg-white px-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-200"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-700">
          ▾
        </span>
      </div>
    </div>
  );
}

function FilterDate({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-xs font-extrabold tracking-wider text-[#0B6AA9]">
        {label}
      </div>
      <div className="relative mt-2">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-full rounded-xl border border-blue-200 bg-white px-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-200"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-700">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
  );
}

function PageBtn({
  children,
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="grid h-10 w-10 place-items-center rounded-xl border border-blue-100 bg-white text-gray-700 hover:bg-blue-50/40"
    >
      {children}
    </button>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-extrabold tracking-wider text-gray-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-gray-900">
        {value || "-"}
      </div>
    </div>
  );
}
