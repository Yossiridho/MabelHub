"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar/sidebar";
import { Bell } from "lucide-react";
import { Search } from "lucide-react";
import { useSession } from "@/components/session/SessionProvider";
import { useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

  const [search, setSearch] = useState("");
  const [unreadNotif, setUnreadNotif] = useState(3);
  useEffect(() => {
    if (!sessionLoading && user) {
      if (user.role === "SUPERADMIN" || user.role === "ADMIN") {
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
    <div className="min-h-screen bg-blue-50">
      <div className="flex">
        <Sidebar />

        {/* CONTENT */}
        <div className="flex-1 p-6 h-screen overflow-y-auto">
          {/* TOP BAR */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl pl-4 font-extrabold">VISIT DASHBOARD</h2>

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
                  <Search className="h-5 w-5" />
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

          {/* CHARTS SECTION */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:auto-rows-fr">
          <div className="rounded-xl bg-white p-6 shadow lg:row-span-2 lg:col-span-1">
             <h3 className="mb-4 text-md font-semibold text-black">
                 VISITS OVERVIEW
             </h3>

           <div className="h-[420px] w-full">
           {loadingStats ? (
         <div className="flex h-full items-center justify-center text-gray-400">
        Loading...
      </div>
    ) : (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={[
              { name: "Visits", value: stats?.totalVisits || 0 },
              { name: "Stay Office", value: stats?.stayOffice || 0 },
              { name: "Not Visited", value: stats?.notVisited || 0 },
            ]}
            cx="50%"
            cy="50%"
            outerRadius={130}   // dibesarkan
            paddingAngle={3}
            dataKey="value"
            label
          >
            <Cell fill="#3b82f6" />
            <Cell fill="#10b981" />
            <Cell fill="#ef4444" />
          </Pie>

          <Tooltip />
          <Legend verticalAlign="bottom" height={50} />
        </PieChart>
      </ResponsiveContainer>
    )}
  </div>
</div>

  {/* Market Coverage Chart (KANAN ATAS) */}
  <div className="rounded-xl bg-white p-5 shadow lg:col-span-2">
    <h3 className="mb-4 text-md font-bold text-black">
      MARKET COVERAGE
    </h3>
    <div className="h-64 w-full">
      {loadingStats ? (
        <div className="flex h-full items-center justify-center text-gray-400">
          Loading...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={[
              { name: "Sales", count: stats?.salesCount || 0 },
              { name: "Satker", count: stats?.satkerCount || 0 },
              { name: "City", count: stats?.cityCount || 0 },
            ]}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "black" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "gray" }}
            />
            <Tooltip cursor={{ fill: "transparent" }} />
            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  </div>

  {/* Ring Distribution Chart (KANAN BAWAH) */}
  <div className="rounded-xl bg-white p-5 shadow lg:col-span-2">
    <h3 className="mb-4 text-md font-bold text-black">
      RING DISTRIBUTION
    </h3>
    <div className="h-64 w-full">
      {loadingStats ? (
        <div className="flex h-full items-center justify-center text-gray-400">
          Loading...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={[
              { name: "Ring 1", count: stats?.ring?.ring1 || 0 },
              { name: "Ring 2", count: stats?.ring?.ring2 || 0 },
              { name: "Ring 3", count: stats?.ring?.ring3 || 0 },
              { name: "Ring 4", count: stats?.ring?.ring4 || 0 },
            ]}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6B7280" }}
            />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "black" }}
              width={65}
            />
            <Tooltip cursor={{ fill: "transparent" }} />
            <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  </div>
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
