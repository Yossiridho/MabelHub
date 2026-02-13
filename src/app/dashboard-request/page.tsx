"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar/sidebar";
import { Bell } from "lucide-react";
import { useSession } from "@/components/session/SessionProvider";
import { useRouter } from "next/navigation";

type DashboardStats = {
  totalVisits: number;
  stayOffice: number;
  notVisited: number;
  salesCount: number;
  satkerCount: number;
  cityCount: number;
  ring: {
    ring1: number;
    ring2: number;
    ring3: number;
    ring4: number;
  };
};

type VisitRow = {
  _id: string;
  nama_sales?: string;
  visit_date?: string | Date;
  status_visit?: string;
  satuan_kerja?: string;
  city?: string;
  pic_name?: string;
  pic_phone?: string;
  status_ring?: string;
};

export default function DashboardRequestPage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [visits, setVisits] = useState<VisitRow[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTable, setLoadingTable] = useState(true);

  // SEARCH + NOTIF (UI only)
  const [search, setSearch] = useState("");
  const [unreadNotif, setUnreadNotif] = useState(3);

  // Optional: jika mau “page ini hanya untuk SALES/LEADER”
  // Kalau tidak perlu, hapus effect ini.
  useEffect(() => {
    if (!sessionLoading && user) {
      // contoh rule: SUPERADMIN/ADMIN sebaiknya ke dashboard-response
      if (user.role === "SUPERADMIN" || user.role === "ADMIN") {
        // kalau kamu mau, redirect otomatis:
        // router.replace("/dashboard-response");
      }
    }
  }, [sessionLoading, user, router]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (sessionLoading) return;
      if (!user) return; // middleware seharusnya redirect

      try {
        setLoadingStats(true);
        const res = await fetch("/api/dashboard-request", {
          cache: "no-store",
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error ?? "Failed to fetch stats");
        if (mounted) setStats(json as DashboardStats);
      } catch (e) {
        console.error(e);
        if (mounted) setStats(null);
      } finally {
        if (mounted) setLoadingStats(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [sessionLoading, user]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (sessionLoading) return;
      if (!user) return;

      try {
        setLoadingTable(true);
        const res = await fetch("/api/visits?limit=10&page=1", {
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error ?? "Failed to fetch visits");
        if (mounted) setVisits(data.items ?? []);
      } catch (e) {
        console.error(e);
        if (mounted) setVisits([]);
      } finally {
        if (mounted) setLoadingTable(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [sessionLoading, user]);

  return (
    <div className="min-h-screen bg-blue-100">
      <div className="flex">
        {/* SIDEBAR */}
        <Sidebar />

        {/* CONTENT */}
        <div className="flex-1 p-6 h-screen overflow-y-auto">
          {/* TOP BAR */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-semibold">VISIT DASHBOARD</h2>

            <div className="flex items-center gap-3">
              {/* Searchbar */}
              <div className="relative w-full md:w-95">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="h-12 w-full rounded-full bg-white px-6 pr-14 text-sm shadow-sm outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-blue-300"
                />
                <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-gray-500">
                  {/* search icon */}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
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

              <button
                type="button"
                onClick={() => setUnreadNotif(0)}
                className="relative grid h-12 w-12 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/5 hover:bg-gray-50"
                aria-label="Notifications"
              >
                <Bell className="h-6 w-6 text-gray-700" />

                {/* Badge unread */}
                {unreadNotif > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
                    {unreadNotif}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* STATS CARDS */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
            <StatCard
              title="TOTAL VISITS"
              value={loadingStats ? undefined : stats?.totalVisits}
            />
            <StatCard
              title="STAY OFFICE"
              value={loadingStats ? undefined : stats?.stayOffice}
            />
            <StatCard
              title="NOT VISITED"
              value={loadingStats ? undefined : stats?.notVisited}
            />

            <div className="rounded-xl bg-white p-4 shadow">
              <p className="mb-3 text-xs text-gray-500">MARKET COVERAGE</p>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-semibold">
                    {loadingStats ? "-" : (stats?.salesCount ?? "-")}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">Sales</p>
                </div>

                <div>
                  <p className="text-2xl font-semibold">
                    {loadingStats ? "-" : (stats?.satkerCount ?? "-")}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">Satker</p>
                </div>

                <div>
                  <p className="text-2xl font-semibold">
                    {loadingStats ? "-" : (stats?.cityCount ?? "-")}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">City</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-4 shadow">
              <p className="mb-3 text-xs text-gray-500">RING DISTRIBUTION</p>
              <div className="grid grid-cols-4 gap-4 text-center">
                {(["ring1", "ring2", "ring3", "ring4"] as const).map(
                  (ring, i) => (
                    <div key={ring}>
                      <p className="text-2xl font-semibold">
                        {loadingStats ? "-" : (stats?.ring?.[ring] ?? "-")}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">Ring {i + 1}</p>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* FILTER */}
          <div className="mb-6 rounded-xl bg-white/70 p-5 shadow backdrop-blur-md">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
              {[
                "Semua Sales",
                "Tanggal Mulai",
                "Tanggal Akhir",
                "Semua Status",
                "Semua Ring",
                "Semua City",
              ].map((label) => (
                <select
                  key={label}
                  className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                >
                  <option>{label}</option>
                </select>
              ))}
            </div>

            <div className="mt-4">
              <select className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm">
                <option>Semua Satker</option>
              </select>
            </div>
          </div>

          {/* TABLE */}
          <div className="rounded-xl bg-white shadow-lg">
            <table className="w-full text-sm">
              <thead className="bg-white text-blue-700">
                <tr>
                  {[
                    "NAMA SALES",
                    "VISIT DATE",
                    "STATUS",
                    "SATUAN KERJA",
                    "CITY",
                    "PIC NAME",
                    "PIC PHONE",
                    "RING",
                  ].map((header) => (
                    <th key={header} className="rounded-xl px-4 py-3 text-left">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loadingTable ? (
                  <tr>
                    <td className="px-4 py-4 text-gray-500" colSpan={8}>
                      Loading data...
                    </td>
                  </tr>
                ) : visits.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4 text-gray-500" colSpan={8}>
                      Belum ada data.
                    </td>
                  </tr>
                ) : (
                  visits.map((row) => (
                    <tr key={row._id} className="border-t">
                      <td className="px-4 py-3">{row.nama_sales ?? "-"}</td>
                      <td className="px-4 py-3">
                        {row.visit_date
                          ? new Date(row.visit_date).toLocaleDateString("id-ID")
                          : "-"}
                      </td>
                      <td className="px-4 py-3">{row.status_visit ?? "-"}</td>
                      <td className="px-4 py-3">{row.satuan_kerja ?? "-"}</td>
                      <td className="px-4 py-3">{row.city ?? "-"}</td>
                      <td className="px-4 py-3">{row.pic_name ?? "-"}</td>
                      <td className="px-4 py-3">{row.pic_phone ?? "-"}</td>
                      <td className="px-4 py-3">{row.status_ring ?? "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value?: number }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value ?? "-"}</p>
    </div>
  );
}
