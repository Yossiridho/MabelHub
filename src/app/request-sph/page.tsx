'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RequestSPHPage() {
  const [search, setSearch] = useState('')
  const router = useRouter();

  return (
    <div className="flex-1 p-3 sm:p-6">
      <main className="mx-auto max-w-6xl rounded-2xl bg-white p-4 sm:p-6 shadow">
        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-black">REQUEST SPH</h2>

          <div className="relative w-full md:w-[360px]">
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

        {/* ACTION */}
        <div className="mt-4 flex justify-end">
          <button onClick={() => router.push("/add-request")} className="h-9 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700">
            ADD REQUEST
          </button>
        </div>

        {/* TABLE */}
        <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-black/10">
          <table className="w-full text-sm block lg:table">
            <thead className="bg-gray-100 text-gray-700 hidden lg:table-header-group">
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

            <tbody className="bg-white block lg:table-row-group">
              <tr className="block lg:table-row">
                <td colSpan={7} className="px-4 py-14 text-center text-gray-500 block">
                  Belum ada data.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
