"use client";

import React, { useMemo, useState, useEffect } from "react";
import Sidebar from "@/components/sidebar/sidebar";
import { useSession } from "@/components/session/SessionProvider";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { useRouter } from "next/navigation";

type VisitRow = {
  _id: string;
  nama_sales: string;
  visit_date: string; // ISO string
  status_visit: string;
  satuan_kerja: string;
  city: string;
  pic_name: string;
  pic_phone: string;
  status_ring: "RING 1" | "RING 2" | "RING 3" | "RING 4" | string;

  created_at: string;
  status_market: string;
  klpd: string;
  reschedule: string; // ISO or "-"
  institusi_kerja: string;
  pic_position: string;
  pic_role: string;
  tindak_lanjut: string;
  kegiatan_status: string;
  descriptions: string;
};

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function formatDateID(iso: string) {
  if (!iso || iso === "-") return "-";
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
  const upper = (value || "-").toUpperCase();
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
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();

  // ✅ Guard role (sesuaikan kalau ada rule akses lain)
  useEffect(() => {
    if (!sessionLoading && user) {
      const ok =
        user.role === "SUPERADMIN" ||
        user.role === "ADMIN" ||
        user.role === "LEADER" ||
        user.role === "SALES";
      if (!ok) router.replace("/");
    }
  }, [sessionLoading, user, router]);

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

  // ====== server data ======
  const [rows, setRows] = useState<VisitRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ====== dropdown meta ======
  const [salesOptions, setSalesOptions] = useState<string[]>([]);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [satkerOptions, setSatkerOptions] = useState<string[]>([]);

  // fetch meta (dropdown) sekali
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch("/api/visits/meta", { cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (!mounted) return;

        setSalesOptions(Array.isArray(json?.sales) ? json.sales : []);
        setCityOptions(Array.isArray(json?.cities) ? json.cities : []);
        setSatkerOptions(Array.isArray(json?.satkers) ? json.satkers : []);
      } catch {
        if (!mounted) return;
        setSalesOptions([]);
        setCityOptions([]);
        setSatkerOptions([]);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const [paramStatus, setParamStatus] = useState<string[]>([]);
  const [paramRing, setParamRing] = useState<string[]>([]);
  useEffect(() => {
    fetch("/api/parameters")
      .then((res) => res.json())
      .then((json) => {
        const d = json?.data;
        if (d) {
          setParamStatus(d.status_kunjungan || []);
          setParamRing(d.ring || []);
        }
      })
      .catch(() => {});
  }, []);

  // fetch rows dari DB setiap filter/pagination berubah
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoadingRows(true);

      const qs = new URLSearchParams();
      qs.set("limit", String(pageSize));
      qs.set("page", String(page));

      if (fSales !== "ALL") qs.set("sales", fSales);
      if (fStatus !== "ALL") qs.set("status", fStatus);
      if (fRing !== "ALL") qs.set("ring", fRing);
      if (fCity !== "ALL") qs.set("city", fCity);
      if (fSatker !== "ALL") qs.set("satker", fSatker);
      if (fStart) qs.set("start", fStart);
      if (fEnd) qs.set("end", fEnd);

      try {
        const res = await fetch(`/api/visits?${qs.toString()}`, {
          cache: "no-store",
        });
        const json = await res.json().catch(() => ({}));

        if (!mounted) return;

        const items = Array.isArray(json?.items) ? json.items : [];
        setRows(items);

        const pg = json?.pagination ?? {};
        setTotal(Number(pg?.total ?? 0));
        setTotalPages(Number(pg?.totalPages ?? 1));

        // reset detail kalau data berubah
        setSelected(null);
      } catch {
        if (!mounted) return;
        setRows([]);
        setTotal(0);
        setTotalPages(1);
        setSelected(null);
      } finally {
        if (mounted) setLoadingRows(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [pageSize, page, fSales, fStatus, fRing, fCity, fSatker, fStart, fEnd]);

  const safePage = useMemo(
    () => Math.min(Math.max(1, page), Math.max(1, totalPages)),
    [page, totalPages],
  );

  const showingFrom = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const showingTo = Math.min(total, safePage * pageSize);

  const gotoPage = (p: number) =>
    setPage(Math.min(Math.max(1, p), Math.max(1, totalPages)));

  const onChangeFilter = (fn: (v: string) => void, v: string) => {
    fn(v);
    setSelected(null);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex-1 p-6 h-screen overflow-y-auto">
          <div className="px-3 pt-2 pb-2">
            <h1 className="text-2xl font-extrabold pl-4 text-black">
              REKAPITULASI VISIT
            </h1>
            <div className="px-6 pb-6"></div>
          </div>

          {/* FILTER CARD */}
          <section className="rounded-2xl bg-white p-7 shadow-sm">
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
                options={[{ label: "Semua Status", value: "ALL" }].concat(
                  paramStatus.map((s) => ({ label: s, value: s })),
                )}
              />

              <FilterSelect
                label="RING"
                value={fRing}
                onChange={(v) => onChangeFilter(setFRing, v)}
                options={[{ label: "Semua Ring", value: "ALL" }].concat(
                  paramRing.map((r) => ({ label: r, value: r })),
                )}
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
                <thead className="bg-blue-200">
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
                        className="whitespace-nowrap px-6 py-5 text-xs font-extrabold tracking-wider text-black"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {loadingRows ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        Tidak ada data.
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => {
                      const active = selected?._id === r._id;
                      return (
                        <React.Fragment key={r._id}>
                          <tr
                            onClick={() => setSelected(active ? null : r)}
                            className={cn(
                              "cursor-pointer border-t border-blue-50 transition-colors",
                              active ? "bg-blue-50/60" : "hover:bg-blue-50/30",
                            )}
                          >
                            <td
                              className={cn(
                                "px-6 py-6 font-extrabold text-[#0B6AA9]",
                                active
                                  ? "border-l-4 border-l-blue-600"
                                  : "border-l-4 border-l-transparent",
                              )}
                            >
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
                            <td className="px-6 py-6 text-gray-900">
                              {r.city}
                            </td>
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
                          {active && (
                            <tr className="bg-blue-50/30">
                              <td
                                colSpan={8}
                                className="px-6 py-6 border-l-4 border-l-blue-600 border-b border-b-blue-100"
                              >
                                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-blue-100">
                                  <div className="mb-4 flex items-center gap-3 text-lg font-extrabold text-gray-900">
                                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-100 text-blue-600">
                                      📖
                                    </span>
                                    Detail Kunjungan
                                  </div>
                                  <div className="grid grid-cols-1 gap-6 md:grid-cols-6 border-t border-gray-100 pt-4">
                                    <DetailItem
                                      label="Created At"
                                      value={formatDateID(r.created_at)}
                                    />
                                    <DetailItem
                                      label="Market Status"
                                      value={r.status_market}
                                    />
                                    <DetailItem label="KLPD" value={r.klpd} />
                                    <DetailItem
                                      label="Reschedule"
                                      value={
                                        r.reschedule && r.reschedule !== "-"
                                          ? formatDateID(r.reschedule)
                                          : "-"
                                      }
                                    />
                                    <DetailItem
                                      label="Institusi Kerja"
                                      value={r.institusi_kerja}
                                    />
                                    <DetailItem
                                      label="PIC Position"
                                      value={r.pic_position}
                                    />
                                    <DetailItem
                                      label="PIC Role"
                                      value={r.pic_role}
                                    />
                                    <DetailItem
                                      label="Tindak Lanjut"
                                      value={r.tindak_lanjut}
                                    />
                                    <DetailItem
                                      label="Kegiatan Status"
                                      value={r.kegiatan_status}
                                    />
                                  </div>

                                  <div className="mt-6 border-t border-gray-100 pt-4">
                                    <div className="text-xs font-extrabold tracking-wider text-gray-500">
                                      DESKRIPSI
                                    </div>
                                    <div className="mt-2 whitespace-pre-line text-sm text-gray-700">
                                      {r.descriptions || "-"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
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
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- UI Pieces ----------------------------- */

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
        <SearchableSelect
          value={value}
          onChange={(val: string) => onChange(val)}
          options={options}
          placeholder={`Pilih ${label}...`}
          className="h-12 w-full appearance-none rounded-xl border-blue-200 border bg-white"
        />
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
      <div className="text-xs font-extrabold tracking-wider text-blue-600">
        {label}
      </div>
      <div className="relative mt-2">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-full rounded-xl border border-blue-200 bg-white px-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-200"
        />
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
