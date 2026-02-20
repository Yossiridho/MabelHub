"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/sidebar";
import { useSession } from "@/components/session/SessionProvider";

type VisitRow = {
  _id: string;
  visit_date?: string; // "3-Dec-2025"
  created_at?: string; // "2025-12-03 16:15:30" (string)
  city?: string;
  klpd?: string;
  institusi_kerja?: string;
  satuan_kerja?: string;
  status_visit?: string; // "Visited"
};

type PlanRow = {
  id: string; // _id
  tanggal: string; // visit_date
  kota: string;
  klpd: string;
  institusi_kerja: string;
  satuan_kerja: string;
  status: string;
  _sortTs: number; // untuk sorting (baru -> besar)
};

function monthIndex(mon: string) {
  const m = mon.toLowerCase();
  const map: Record<string, number> = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    mei: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    agu: 7,
    sep: 8,
    oct: 9,
    okt: 9,
    nov: 10,
    dec: 11,
    des: 11,
  };
  return map[m] ?? -1;
}

// parse "3-Dec-2025" -> timestamp
function parseVisitDateToTs(v?: string) {
  if (!v) return 0;
  const parts = v.split("-");
  if (parts.length !== 3) return 0;

  const day = Number(parts[0]);
  const mon = monthIndex(parts[1]);
  const year = Number(parts[2]);
  if (!day || mon < 0 || !year) return 0;

  const d = new Date(year, mon, day, 12, 0, 0); // jam 12 biar aman timezone
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

// parse "2025-12-03 16:15:30" -> timestamp
function parseCreatedAtToTs(v?: string) {
  if (!v) return 0;
  // ubah "YYYY-MM-DD HH:mm:ss" jadi ISO "YYYY-MM-DDTHH:mm:ss"
  const iso = v.includes("T") ? v : v.replace(" ", "T");
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

function formatTanggalHeader(dateStr: string) {
  if (!dateStr) return "-";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const day = parts[0];
    const month = String(parts[1] || "").toUpperCase();
    return `${day} ${month}`;
  }
  return dateStr;
}

export default function PlanActivityPage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();

  const [search, setSearch] = useState("");

  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [openDates, setOpenDates] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const limit = 25;
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  // Guard role
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

  function groupByTanggal(rows: PlanRow[]) {
    return rows.reduce<Record<string, PlanRow[]>>((acc, r) => {
      const key = r.tanggal || "UNKNOWN";
      acc[key] = acc[key] || [];
      acc[key].push(r);
      return acc;
    }, {});
  }

  async function fetchPlans(nextPage: number, q: string) {
    try {
      setLoading(true);

      const qs = new URLSearchParams({
        page: String(nextPage),
        limit: String(limit),
      });

      if (q.trim()) qs.set("q", q.trim());

      const res = await fetch(`/api/visits?${qs.toString()}`, {
        cache: "no-store",
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPlans([]);
        setTotalPages(1);
        setTotalRows(0);
        setOpenDates({});
        return;
      }

      const items: VisitRow[] = Array.isArray(json?.items) ? json.items : [];

      // map + hitung sortTs (visit_date utama, fallback created_at)
      const mapped: PlanRow[] = items.map((v) => {
        const visitTs = parseVisitDateToTs(v.visit_date);
        const createdTs = parseCreatedAtToTs(v.created_at);
        const sortTs = visitTs || createdTs || 0;

        return {
          id: String(v._id),
          tanggal: v.visit_date || "",
          kota: v.city || "",
          klpd: v.klpd || "",
          institusi_kerja: v.institusi_kerja || "",
          satuan_kerja: v.satuan_kerja || "",
          status: v.status_visit || "",
          _sortTs: sortTs,
        };
      });

      // pastikan urutan terbaru di page ini
      mapped.sort((a, b) => b._sortTs - a._sortTs);

      setPlans(mapped);

      const tp = Number(json?.pagination?.totalPages || 1);
      setTotalPages(tp > 0 ? tp : 1);

      const total = Number(json?.pagination?.total || 0);
      setTotalRows(total > 0 ? total : 0);

      // buka group tanggal paling baru
      const grouped = groupByTanggal(mapped);
      const firstKey = Object.keys(grouped).sort((a, b) => {
        if (a === "UNKNOWN") return 1;
        if (b === "UNKNOWN") return -1;
        return parseVisitDateToTs(b) - parseVisitDateToTs(a);
      })[0];

      if (firstKey) setOpenDates({ [firstKey]: true });
      else setOpenDates({});
    } finally {
      setLoading(false);
    }
  }

  // fetch awal & saat page berubah
  useEffect(() => {
    if (sessionLoading) return;
    if (!user) return;
    fetchPlans(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sessionLoading, user]);

  // debounce search + reset page
  useEffect(() => {
    if (sessionLoading) return;
    if (!user) return;

    const t = setTimeout(() => {
      setPage(1);
      fetchPlans(1, search);
    }, 350);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const grouped = useMemo(() => {
    // plans sudah di-sort terbaru, groupnya ikutin
    const g = groupByTanggal(plans);
    const keys = Object.keys(g).sort((a, b) => {
      if (a === "UNKNOWN") return 1;
      if (b === "UNKNOWN") return -1;
      return parseVisitDateToTs(b) - parseVisitDateToTs(a);
    });
    return { keys, map: g };
  }, [plans]);

  function toggleDate(key: string) {
    setOpenDates((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="flex">
        <Sidebar />

        <div className="flex-1 h-screen overflow-y-auto p-6">
          <main className="w-full max-w-none">
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <h2 className="text-2xl font-extrabold pl-4 tracking-wide text-black">
                PLAN ACTIVITY
              </h2>

              <div className="relative w-full md:w-105">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="h-11 w-full rounded-full bg-white px-5 pr-11 text-sm outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-black/20"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M10.5 18.5a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M16.5 16.5 21 21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {loading
                  ? "Loading..."
                  : `Total ${totalRows || "-"} • Page ${page} / ${totalPages}`}
              </div>

              <button
                onClick={() => router.push("/plan-activity/add")}
                className="h-10 rounded-full bg-white px-6 text-sm font-extrabold shadow ring-1 ring-black/10 hover:bg-gray-50"
              >
                ADD PLANS
              </button>
            </div>

            {/* TABLE */}
            <div className="w-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
              <div className="grid grid-cols-7 bg-blue-200 px-4 py-3 text-sm font-semibold text-black">
                <div>Tanggal</div>
                <div>Kota</div>
                <div>K/L/PD</div>
                <div>Institusi Kerja</div>
                <div>Satuan Kerja</div>
                <div className="text-center">Status</div>
                <div className="text-center">Aksi</div>
              </div>

              {grouped.keys.length === 0 ? (
                <div className="px-4 py-12 text-center text-gray-600">
                  {loading ? "Loading..." : "Belum ada data."}
                </div>
              ) : (
                grouped.keys.map((dateKey) => {
                  const rows = grouped.map[dateKey] || [];
                  const isOpen = !!openDates[dateKey];

                  return (
                    <div key={dateKey} className="border-t border-black/20">
                      <button
                        type="button"
                        onClick={() => toggleDate(dateKey)}
                        className="flex w-full items-center justify-between bg-white px-2 py-3 pl-6 text-m font-semibold text-black"
                      >
                        <span>
                          {dateKey === "UNKNOWN"
                            ? "-"
                            : formatTanggalHeader(dateKey)}
                        </span>
                        <span className="text-xl font-black">
                          {isOpen ? "▾" : "▸"}
                        </span>
                      </button>

                      {isOpen && (
                        <div>
                          {rows.map((r) => (
                            <div
                              key={r.id}
                              className="grid grid-cols-7 items-center bg-white px-4 py-4 text-sm text-black border-t border-black/10"
                            >
                              <div className="opacity-0 select-none">
                                {r.tanggal}
                              </div>

                              <div className="uppercase">{r.kota || "-"}</div>
                              <div className="uppercase">{r.klpd || "-"}</div>
                              <div className="uppercase">
                                {r.institusi_kerja || "-"}
                              </div>
                              <div className="uppercase">
                                {r.satuan_kerja || "-"}
                              </div>
                              <div className="text-center font-semibold">
                                {(r.status || "-").toUpperCase()}
                              </div>

                              <div className="text-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    router.push(
                                      `/plan-activity/add?edit=${r.id}`,
                                    )
                                  }
                                  className="font-semibold hover:underline"
                                >
                                  EDIT
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* PAGINATION */}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={loading || page <= 1}
                className="rounded-lg bg-white px-3 py-2 text-sm font-semibold ring-1 ring-black/10 hover:bg-gray-100"
              >
                Prev
              </button>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={loading || page >= totalPages}
                className="rounded-lg bg-white px-3 py-2 text-sm font-semibold ring-1 ring-black/10 hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
