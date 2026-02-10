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
        <div className="shrink-0">
          <Sidebar role={role} />
        </div>

     {/* CONTENT */}
        <div className="flex-1 p-6">
          {/* TOP BAR */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-semibold">PLAN ACTIVITY</h2>
            <div className="flex items-center gap-3"></div>
            
            <div className="flex items-center gap-3">
  <div className="relative w-full md:w-[380px]">
  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

  <input
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search..."
    className="h-12 w-full rounded-full bg-white pl-11 pr-4 text-sm shadow-sm outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-blue-300"
  />
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
