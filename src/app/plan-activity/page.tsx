"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar/sidebar";
import { Search, Bell } from "lucide-react";
import type { Role } from "@/lib/menu";

export default function PlanActivityPage() {
  const [search, setSearch] = useState("");
  const [unreadNotif, setUnreadNotif] = useState(3);
  const role: Role = "USER";

  return (
    <div className="min-h-screen bg-blue-100">
      <div className="flex">

        <Sidebar role={role} title="VISIT TRACKING" />

        <div className="flex-1 p-6 pl-50 h-screen overflow-y-auto">
          <main className="mx-auto max-w-6xl rounded-2xl bg-white p-6 shadow">
            {/* HEADER */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-semibold">PLAN ACTIVITY</h2>

              <div className="relative w-full md:w-90">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="h-10 w-full rounded-full bg-gray-50 px-4 pr-11 text-sm outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-blue-300"
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


            <div className="mt-4 flex justify-end">
              <button className="h-9 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700">
                ADD PLANS
              </button>
            </div>

            {/* TABLE */}
            <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-black/10">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    {[
                      "TANGGAL",
                      "KOTA",
                      "K/L/PD",
                      "INSTITUSI KERJA",
                      "SATUAN KERJA",
                      "STATUS",
                      "AKSI",
                    ].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white">
                  <tr>
                    <td colSpan={7} className="px-4 py-14 text-center text-gray-500">
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
