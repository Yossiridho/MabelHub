"use client";

import { useEffect, useMemo, useState, Fragment } from "react";
import Sidebar from "@/components/sidebar/sidebar";
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
  statusBarangAdmin?: string;
  tayangInaprocAdmin?: string;
};

type EProcDoc = {
  requestId: string;
  requestor: string;
  pemohon: string;
  lokasi: string;
  segmen: string;
  deadlineUsulan: string;
  tanggalSubmit: string;
  catatan?: string;

  items: ProductItem[];

  takenByAdminId: string | null;
  takenByAdminName: string | null;
  takenAt?: string | null;

  statusAkhir?: string;
  perusahaan?: string;
};

function clsx(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}

function formatDateTime(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatDateOnly(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
}

export default function RekapitulasiEProcurementPage() {
  const router = useRouter();

  const [rows, setRows] = useState<EProcDoc[]>([]);
  const [loading, setLoading] = useState(true);

  // filters (sesuai UI gambar)
  const [requestor, setRequestor] = useState("ALL");
  const [pemohon, setPemohon] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [tindakLanjut, setTindakLanjut] = useState("ALL");
  const [segmen, setSegmen] = useState("ALL");

  const [startDate, setStartDate] = useState(""); // yyyy-mm-dd (input date)
  const [endDate, setEndDate] = useState(""); // yyyy-mm-dd
  const [searchId, setSearchId] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  // details panel
  const [selected, setSelected] = useState<EProcDoc | null>(null);
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const [paramSegmen, setParamSegmen] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
    fetch("/api/parameters")
      .then((res) => res.json())
      .then((json) => {
        const d = json?.data;
        if (d) setParamSegmen(d.segmen || []);
      })
      .catch(() => {});
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch("/api/e-procurement/requests?mode=all", {
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      setRows(Array.isArray(json?.data) ? json.data : []);
    } finally {
      setLoading(false);
    }
  }

  // options dropdown (dari database)
  const requestorOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => set.add((r.requestor || "").trim()));
    return Array.from(set).filter(Boolean).sort();
  }, [rows]);

  const pemohonOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => set.add((r.pemohon || "").trim()));
    return Array.from(set).filter(Boolean).sort();
  }, [rows]);

  // ===== mapping status sesuai kebutuhan UI (sementara) =====
  // kamu bisa ubah nanti kalau field "status usulan / current status / tindak lanjut" sudah ada di DB
  function getStatusUsulan(r: EProcDoc) {
    return "MASUK";
  }
  function getCurrentStatus(r: EProcDoc) {
    return r.statusAkhir || "Open";
  }
  function getTindakLanjutValue(_r: EProcDoc) {
    // belum ada field di schema kamu → placeholder "-"
    return "-";
  }

  const filtered = useMemo(() => {
    const q = searchId.trim().toLowerCase();

    return rows
      .slice()
      .sort((a, b) => {
        // newest first: takenAt desc, lalu tanggalSubmit desc
        const ta = a.takenAt ? new Date(a.takenAt).getTime() : 0;
        const tb = b.takenAt ? new Date(b.takenAt).getTime() : 0;
        if (tb !== ta) return tb - ta;

        const sa = a.tanggalSubmit ? new Date(a.tanggalSubmit).getTime() : 0;
        const sb = b.tanggalSubmit ? new Date(b.tanggalSubmit).getTime() : 0;
        return sb - sa;
      })
      .filter((r) => {
        if (requestor !== "ALL" && r.requestor !== requestor) return false;
        if (pemohon !== "ALL" && r.pemohon !== pemohon) return false;
        if (segmen !== "ALL" && r.segmen !== segmen) return false;

        if (status !== "ALL") {
          const s = getCurrentStatus(r);
          if (s !== status) return false;
        }

        if (tindakLanjut !== "ALL") {
          const t = getTindakLanjutValue(r);
          if (t !== tindakLanjut) return false;
        }

        // filter tanggal (gunakan tanggalSubmit)
        const submit = r.tanggalSubmit ? new Date(r.tanggalSubmit) : null;
        if (submit && startDate) {
          const from = new Date(startDate + "T00:00:00");
          if (submit < from) return false;
        }
        if (submit && endDate) {
          const to = new Date(endDate + "T23:59:59");
          if (submit > to) return false;
        }

        if (q) {
          const blob =
            `${r.requestId} ${r.requestor} ${r.pemohon} ${r.lokasi}`.toLowerCase();
          if (!blob.includes(q)) return false;
        }

        return true;
      });
  }, [
    rows,
    requestor,
    pemohon,
    status,
    tindakLanjut,
    segmen,
    startDate,
    endDate,
    searchId,
  ]);

  // pagination derived
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [totalPages]);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, safePage, limit]);

  const shownFrom = total === 0 ? 0 : (safePage - 1) * limit + 1;
  const shownTo = Math.min(safePage * limit, total);

  function onRowClick(r: EProcDoc) {
    setSelected(r);
    setOpenItemId(null);
  }

  function toggleItem(id: string) {
    setOpenItemId((p) => (p === id ? null : id));
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex-1 h-screen overflow-y-auto p-6">
          <main className="mx-auto ">
            {/* Header */}
            <div className="mb-4 flex items-center gap-3">
              <div className="px-6 pt-2 pb-6">
                <h1 className="text-2xl pl-3 font-extrabold tracking-wide text-black">
                  REKAPITULASI E-PROCUREMENT
                </h1>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 ring-1 ring-black/10">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-6">
                {/* Requestor */}
                <div className="md:col-span-1">
                  <div className="mb-1 text-sm font-extrabold text-blue-600">
                    REQUESTOR
                  </div>
                  <select
                    value={requestor}
                    onChange={(e) => {
                      setRequestor(e.target.value);
                      setPage(1);
                    }}
                    className="h-10 w-full rounded-xl bg-white px-4 text-sm ring-1 ring-blue-200 outline-blue-300"
                  >
                    <option value="ALL">Semua Sales</option>
                    {requestorOptions.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tanggal Mulai */}
                <div className="md:col-span-1">
                  <div className="mb-1 text-sm font-extrabold text-blue-600">
                    TANGGAL MULAI
                  </div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setPage(1);
                    }}
                    className="h-10 w-full rounded-xl bg-white px-4 text-sm ring-1 ring-blue-200 outline-blue-300"
                  />
                </div>

                {/* Tanggal Selesai */}
                <div className="md:col-span-1">
                  <div className="mb-1 text-sm font-extrabold text-blue-600">
                    TANGGAL SELESAI
                  </div>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setPage(1);
                    }}
                    className="h-10 w-full rounded-xl bg-white px-4 text-sm ring-1 ring-blue-200 outline-blue-300"
                  />
                </div>

                {/* Status */}
                <div className="md:col-span-1">
                  <div className="mb-1 text-sm font-extrabold text-blue-600">
                    STATUS
                  </div>
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      setPage(1);
                    }}
                    className="h-10 w-full rounded-xl bg-white px-4 text-sm ring-1 ring-blue-200 outline-blue-300"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="MASUK">Masuk</option>
                    <option value="DIAMBIL ADMIN">Diambil Admin</option>
                  </select>
                </div>

                {/* Tindak Lanjut */}
                <div className="md:col-span-1">
                  <div className="mb-1 text-sm font-extrabold text-blue-600">
                    TINDAK LANJUT
                  </div>
                  <select
                    value={tindakLanjut}
                    onChange={(e) => {
                      setTindakLanjut(e.target.value);
                      setPage(1);
                    }}
                    className="h-10 w-full rounded-xl bg-white px-4 text-sm ring-1 ring-blue-200 outline-blue-300"
                  >
                    <option value="ALL">Semua Tindakan</option>
                    <option value="-">-</option>
                  </select>
                </div>

                {/* Segmen */}
                <div className="md:col-span-1">
                  <div className="mb-1 text-sm font-extrabold text-blue-600">
                    SEGMEN
                  </div>
                  <select
                    value={segmen}
                    onChange={(e) => {
                      setSegmen(e.target.value);
                      setPage(1);
                    }}
                    className="h-10 w-full rounded-xl bg-white px-4 text-sm ring-1 ring-blue-200 outline-blue-300"
                  >
                    <option value="ALL">Semua Segmen</option>
                    {paramSegmen.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Pemohon */}
                <div className="md:col-span-2">
                  <div className="mb-1 text-sm font-extrabold text-blue-600">
                    PEMOHON
                  </div>
                  <select
                    value={pemohon}
                    onChange={(e) => {
                      setPemohon(e.target.value);
                      setPage(1);
                    }}
                    className="h-10 w-full rounded-xl bg-white px-4 text-sm ring-1 ring-blue-200 outline-blue-300"
                  >
                    <option value="ALL">Semua Pemohon</option>
                    {pemohonOptions.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search ID */}
                <div className="md:col-span-4">
                  <div className="mb-1 text-sm font-extrabold text-blue-600">
                    SEARCH ID
                  </div>
                  <div className="relative">
                    <input
                      value={searchId}
                      onChange={(e) => {
                        setSearchId(e.target.value);
                        setPage(1);
                      }}
                      className="h-10 w-full rounded-xl bg-white px-4 pr-10 text-sm ring-1 ring-blue-200 outline-blue-300"
                      placeholder=""
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl bg-white ring-1 ring-black/10">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-white">
                    <tr className="border-b border-black/10">
                      {[
                        "Tindak Lanjut",
                        "Requestor ID",
                        "Nama Requestor",
                        "Pemohon (Entity)",
                        "Lokasi",
                        "Deadline Usulan",
                        "Status Usulan",
                        "Current Status",
                      ].map((h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap px-3 py-2 text-left text-sm font-bold text-blue-600"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-3 py-10 text-center text-black/60"
                        >
                          Loading...
                        </td>
                      </tr>
                    ) : pageItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-3 py-10 text-center text-black/60"
                        >
                          Tidak ada data.
                        </td>
                      </tr>
                    ) : (
                      pageItems.map((r) => (
                        <tr
                          key={r.requestId}
                          onClick={() => onRowClick(r)}
                          className={clsx(
                            "cursor-pointer border-b border-black/5",
                            selected?.requestId === r.requestId &&
                              "bg-black/10",
                          )}
                        >
                          <td className="px-3 py-2">
                            {getTindakLanjutValue(r)}
                          </td>
                          <td className="px-3 py-2">{r.requestId}</td>
                          <td className="px-3 py-2">{r.requestor || "-"}</td>
                          <td className="px-3 py-2">{r.pemohon || "-"}</td>
                          <td className="px-3 py-2">{r.lokasi || "-"}</td>
                          <td className="px-3 py-2">
                            {r.deadlineUsulan || "-"}
                          </td>
                          <td className="px-3 py-2">{getStatusUsulan(r)}</td>
                          <td className="px-3 py-2">{getCurrentStatus(r)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination bar (mirip screenshot) */}
              <div className="flex flex-col gap-3 border-t border-black/10 bg-white px-4 py-3 md:flex-row md:items-center md:justify-between">
                <div className="text-md text-black">
                  Menampilkan{" "}
                  <b className="text-black">
                    {shownFrom} - {shownTo}
                  </b>{" "}
                  dari <b className="text-black">{total}</b> data
                </div>

                <div className="flex items-center gap-4">
                  <select
                    value={String(limit)}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="h-10 rounded-xl bg-white px-4 text-sm ring-1 ring-gray-200 outline-none hover:bg-gray-50"
                  >
                    {[10, 25, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n} / Halaman
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(1)}
                      disabled={safePage <= 1}
                      className="grid h-9 w-9 place-items-center rounded-lg bg-white ring-1 ring-gray-200 hover:bg-gray-200 "
                      title="Previous"
                    >
                      ⏮
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage <= 1}
                      className="grid h-9 w-9 place-items-center rounded-lg bg-white ring-1 ring-gray-200 hover:bg-gray-200 disabled:opacity-80"
                      title="Back"
                    >
                      ◀
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from(
                        { length: Math.min(totalPages, 5) },
                        (_, i) => {
                          const num = i + 1;
                          return (
                            <button
                              key={num}
                              onClick={() => setPage(num)}
                              className={clsx(
                                "h-9 w-9 rounded-lg text-sm font-extrabold ring-1 ring-black/10",
                                safePage === num
                                  ? "bg-white"
                                  : "bg-white hover:bg-gray-200",
                              )}
                            >
                              {num}
                            </button>
                          );
                        },
                      )}
                      {totalPages > 5 ? (
                        <div className="px-1 text-black/60">…</div>
                      ) : null}
                    </div>

                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={safePage >= totalPages}
                      className="grid h-9 w-9 place-items-center rounded-lg bg-white ring-1 ring-gray-200 hover:bg-gray-200"
                      title="Next"
                    >
                      ▶
                    </button>
                    <button
                      onClick={() => setPage(totalPages)}
                      disabled={safePage >= totalPages}
                      className="grid h-9 w-9 place-items-center rounded-lg bg-white ring-1 ring-gray-200 hover:bg-gray-200"
                      title="Last"
                    >
                      ⏭
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail panels bawah (sesuai screenshot) */}
            <div className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-black/10">
              {/* Rincian Informasi Request */}
              <div className="mb-4">
                <div className="flex items-center justify-between border-b border-black/20 pb-2">
                  <div className="flex items-center gap-2 font-bold text-black">
                    <span>📖</span>
                    <span>Rincian Informasi Request</span>
                  </div>

                  {selected && (
                    <button
                      onClick={() => setSelected(null)}
                      className="grid h-9 w-9 place-items-center rounded-lg bg-white text-lg font-bold ring-1 ring-white hover:bg-red-600"
                      title="Tutup"
                    >
                      X
                    </button>
                  )}
                </div>

                {selected ? (
                  <div className="mt-3 grid grid-cols-1 gap-4 text-sm text-black md:grid-cols-6">
                    <div>
                      <div className="text-sm text-black/50">Request ID</div>
                      <div className="font-semibold text-black">
                        {selected.requestId}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-black/50">
                        Nama Requestor
                      </div>
                      <div className="font-semibold text-black">
                        {selected.requestor}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-black/50">Pemohon</div>
                      <div className="font-semibold text-black">
                        {selected.pemohon}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-black/50">Lokasi</div>
                      <div className="font-semibold text-black">
                        {selected.lokasi}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-black/50">Status Usulan</div>
                      <div className="font-semibold text-black">
                        {getStatusUsulan(selected)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-black/50">Status Akhir</div>
                      <div className="font-semibold text-black">
                        {getCurrentStatus(selected)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-black/50">Perusahaan</div>
                      <div className="font-semibold text-black">
                        {selected.perusahaan || "-"}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-black/50">
                        Deadline Usulan
                      </div>
                      <div className="font-semibold text-black">
                        {selected.deadlineUsulan || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-black/50">
                        Tanggal Submit
                      </div>
                      <div className="font-semibold text-black">
                        {formatDateTime(selected.tanggalSubmit)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-black/50">Segmen</div>
                      <div className="font-semibold text-black">
                        {selected.segmen || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-black/50">PIC Admin</div>
                      <div className="font-semibold text-black">
                        {selected.takenByAdminName || "-"}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-sm text-black/50">Catatan</div>
                      <div className="font-semibold text-black">
                        {selected.catatan || "-"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-black/50">
                    Klik salah satu row untuk melihat rincian.
                  </div>
                )}
              </div>

              {/* List Barang */}
              <div>
                <div className="flex items-center gap-2 border-b border-black/20 pb-2 font-extrabold text-black/70">
                  <span>🗂</span>
                  <span>List Barang</span>
                </div>

                <div className="mt-3 overflow-hidden rounded-xl bg-white ring-1 ring-black/10">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-md">
                      <thead className="bg-white">
                        <tr className="border-b border-black/10 text-black">
                          {[
                            "Merek Product",
                            "Sub-Kategori",
                            "Qty",
                            "Tanggal Proses",
                            "Tanggal Done",
                            "Status Barang (Admin)",
                            "Tayang Inaproc (Admin)",
                          ].map((h) => (
                            <th
                              key={h}
                              className="whitespace-nowrap px-3 py-3 text-left text-sm font-bold"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {!selected?.items?.length ? (
                          <tr>
                            <td
                              colSpan={8}
                              className="px-3 py-10 text-center text-black/50"
                            >
                              Pilih request terlebih dahulu.
                            </td>
                          </tr>
                        ) : (
                          selected.items.map((it) => {
                            const isOpen = openItemId === it.id;
                            return (
                              <Fragment key={it.id}>
                                <tr
                                  onClick={() => toggleItem(it.id)}
                                  className="cursor-pointer border-t border-black/5 hover:bg-gray-50"
                                >
                                  <td className="px-3 py-3">
                                    {it.merek || "-"}
                                  </td>
                                  <td className="px-3 py-3">
                                    {it.subKategori || "-"}
                                  </td>
                                  <td className="px-3 py-3">{it.qty ?? "-"}</td>
                                  <td className="px-3 py-3">
                                    {formatDateTime(selected.takenAt)}
                                  </td>
                                  <td className="px-3 py-3">-</td>
                                  <td className="px-3 py-3">
                                    {it.statusBarangAdmin || "Masuk"}
                                  </td>
                                  <td className="px-3 py-3">
                                    {it.tayangInaprocAdmin || "-"}
                                  </td>
                                </tr>

                                {isOpen ? (
                                  <tr className="border-t border-black/5">
                                    <td
                                      colSpan={8}
                                      className="bg-gray-100 px-4 py-4"
                                    >
                                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                        <div>
                                          <div className="text-md font-bold text-blue-500">
                                            Spesifikasi Barang
                                          </div>
                                          <div className="mt-1 pl-2 text-md">
                                            {it.spesifikasi || "-"}
                                          </div>
                                        </div>

                                        <div>
                                          <div className="text-md font-bold text-blue-500">
                                            Link Inaproc
                                          </div>
                                          <div className="mt-1 pl-2 text-md">
                                            {it.linkInaproc ? (
                                              <a
                                                className="text-blue-500 underline"
                                                href={it.linkInaproc}
                                                target="_blank"
                                                rel="noreferrer"
                                              >
                                                {it.linkInaproc}
                                              </a>
                                            ) : (
                                              <span className="text-black">
                                                -
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        <div>
                                          <div className="text-md font-bold text-blue-500">
                                            Link E-Commerce
                                          </div>
                                          <div className="mt-1 pl-2 text-md">
                                            {it.linkEcom ? (
                                              <a
                                                className="text-blue-500 underline"
                                                href={it.linkEcom}
                                                target="_blank"
                                                rel="noreferrer"
                                              >
                                                {it.linkEcom}
                                              </a>
                                            ) : (
                                              <span className="text-black">
                                                -
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                ) : null}
                              </Fragment>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-2 text-sm text-black/50">
                  Klik baris barang untuk membuka detail (slide down).
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
