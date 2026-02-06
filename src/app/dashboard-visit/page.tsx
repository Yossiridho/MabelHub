"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/sidebar";
import type { Role } from "@/lib/menu";

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

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // SEARCH + NOTIF
  const [search, setSearch] = useState("");
  const [unreadNotif, setUnreadNotif] = useState(3);

  // sementara hardcode role
  const role: Role = "SUPER_ADMIN";

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = (await res.json()) as DashboardStats;
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  return (
    <div className="min-h-screen bg-blue-100">
      <div className="flex">
        {/* SIDEBAR */}
        <div className="shrink-0">
          <Sidebar role={role} title="VISIT TRACKING" />
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-6">
          {/* TOP BAR */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-semibold">Visit Dashboard</h2>

            <div className="flex items-center gap-3">
              {/* Searchbar */}
              <div className="relative w-full md:w-[380px]">
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

              {/* Notification button */}
              <button
                type="button"
                onClick={() => setUnreadNotif(0)}
                className="relative grid h-12 w-12 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/5 hover:bg-gray-50"
                aria-label="Notifications"
              >
                {/* bell icon */}
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-800"
                >
                  <path
                    d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Z"
                    fill="currentColor"
                  />
                  <path
                    d="M18 16V11a6 6 0 1 0-12 0v5l-2 2h16l-2-2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>

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
            <StatCard title="TOTAL VISITS" value={stats?.totalVisits} />
            <StatCard title="STAY OFFICE" value={stats?.stayOffice} />
            <StatCard title="NOT VISITED" value={stats?.notVisited} />

            <div className="rounded-xl bg-white p-4 shadow">
              <p className="mb-3 text-xs text-gray-500">MARKET COVERAGE</p>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-semibold">{stats?.salesCount ?? "-"}</p>
                  <p className="mt-1 text-xs text-gray-500">Sales</p>
                </div>

                <div>
                  <p className="text-2xl font-semibold">{stats?.satkerCount ?? "-"}</p>
                  <p className="mt-1 text-xs text-gray-500">Satker</p>
                </div>

                <div>
                  <p className="text-2xl font-semibold">{stats?.cityCount ?? "-"}</p>
                  <p className="mt-1 text-xs text-gray-500">City</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-4 shadow">
              <p className="mb-3 text-xs text-gray-500">RING DISTRIBUTION</p>
              <div className="grid grid-cols-4 gap-4 text-center">
                {(["ring1", "ring2", "ring3", "ring4"] as const).map((ring, i) => (
                  <div key={ring}>
                    <p className="text-2xl font-semibold">{stats?.ring?.[ring] ?? "-"}</p>
                    <p className="mt-1 text-xs text-gray-500">Ring {i + 1}</p>
                  </div>
                ))}
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
                <tr className="text-gray-400">
                  {/* biar keliatan empty state */}
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                    Belum ada data.
                  </td>
                </tr>
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
