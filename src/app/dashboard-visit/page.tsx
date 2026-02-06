"use client";

import { useEffect, useState } from "react";
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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/dashboard-visit")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-blue-100 p-6">
      <div className="mb-6 flex items-center justify-between rounded-xl bg-white/60 backdrop-blur-md px-6 py-4 shadow">
        <div>
          <h1 className="text-xl font-semibold text-blue-600">
            VISIT TRACKING
          </h1>
          <p className="text-xs text-gray-400">Sales Visit Monitoring System</p>
        </div>

        <button
          onClick={() => router.push("/")}
          className="rounded-lg bg-red-100 px-4 py-2 text-sm text-red-600 hover:bg-red-200"
        >
          LOGOUT
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Visit Dashboard</h2>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
        <StatCard title="TOTAL VISITS" value={stats?.totalVisits} />
        <StatCard title="STAY OFFICE" value={stats?.stayOffice} />
        <StatCard title="NOT VISITED" value={stats?.notVisited} />

        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-xs text-gray-500 mb-3">MARKET COVERAGE</p>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold">
                {stats?.salesCount ?? "-"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Sales</p>
            </div>

            <div>
              <p className="text-2xl font-semibold">
                {stats?.satkerCount ?? "-"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Satker</p>
            </div>

            <div>
              <p className="text-2xl font-semibold">
                {stats?.cityCount ?? "-"}
              </p>
              <p className="text-xs text-gray-500 mt-1">City</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-xs text-gray-500 mb-3">RING DISTRIBUTION</p>
          <div className="grid grid-cols-4 gap-4 text-center">
            {(["ring1", "ring2", "ring3", "ring4"] as const).map((ring, i) => (
              <div key={ring}>
                <p className="text-2xl font-semibold">
                  {stats?.ring?.[ring] ?? "-"}
                </p>
                <p className="text-xs text-gray-500 mt-1">Ring {i + 1}</p>
              </div>
            ))}{" "}
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-xl bg-white/70 backdrop-blur-md p-5 shadow">
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
                <th key={header} className=" rounded-xl px-4 py-3 text-left">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <tr className="text-gray-400"></tr>
          </tbody>
        </table>
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
