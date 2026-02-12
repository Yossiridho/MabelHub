"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/sidebar/sidebar";
import type { Role } from "@/lib/menu";

type EProcRow = {
  requestId: string;
  requestor: string;
  pemohon: string;
  lokasi: string;
  segmen: string;
  deadlineUsulan: string | Date;
  tanggalSubmit: string | Date;
  catatan?: string;

  takenByAdminId?: string | null;
  takenByAdminName?: string | null;
  takenAt?: string | Date | null;
};

function fmtDate(d: string | Date) {
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "-";
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function fmtDateTime(d: string | Date) {
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "-";
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  const hh = String(dt.getHours()).padStart(2, "0");
  const mi = String(dt.getMinutes()).padStart(2, "0");
  const ss = String(dt.getSeconds()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy} ${hh}:${mi}:${ss}`;
}

async function apiListTaken(role: Role, adminId: string): Promise<EProcRow[]> {
  const qs = new URLSearchParams({ mode: "taken", role });
  if (adminId) qs.set("adminId", adminId);

  const res = await fetch(`/api/eprocurement/requests?${qs.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = await res.json();
  return (json?.data ?? []) as EProcRow[];
}

export default function RekapitulasiPage() {
  const role: Role = "SUPERADMIN"; // ganti jadi "ADMIN" untuk test
  const adminId = role === "SUPERADMIN" ? "" : "admin-1";
  const isSuperAdmin = role === "SUPERADMIN";

  const [rows, setRows] = useState<EProcRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [adminFilter, setAdminFilter] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = await apiListTaken(role, adminId);
      if (mounted) setRows(data);
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [role, adminId]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    return rows.filter((r) => {
      const matchAdmin =
        !isSuperAdmin ||
        !adminFilter.trim() ||
        (r.takenByAdminName ?? "")
          .toLowerCase()
          .includes(adminFilter.trim().toLowerCase());

      const matchQ =
        !qq ||
        [
          r.requestId,
          r.requestor,
          r.pemohon,
          r.lokasi,
          r.segmen,
          r.takenByAdminName ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(qq);

      return matchAdmin && matchQ;
    });
  }, [rows, adminFilter, q, isSuperAdmin]);

  return (
    <div className="min-h-screen bg-blue-100">
      <div className="flex">
        <Sidebar role={role} />

        <div className="flex-1 h-screen overflow-y-auto">
          <div className="p-6">
            <div className="text-2xl font-bold text-neutral-900">
              REKAPITULASI
            </div>
            <div className="mt-1 text-sm text-neutral-600">
              Menampilkan request e-procurement yang sudah diambil admin.
            </div>

            {/* Filter bar (simple) */}
            <div className="mt-6 rounded-xl bg-white p-4 shadow-md">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari requestId / pemohon / lokasi / segmen..."
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                />
                {isSuperAdmin ? (
                  <input
                    value={adminFilter}
                    onChange={(e) => setAdminFilter(e.target.value)}
                    placeholder="Filter Admin (nama)..."
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                  />
                ) : null}
              </div>
            </div>

            {/* Table */}
            <div className="mt-6 rounded-xl bg-white shadow-md overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-200 text-sm font-semibold">
                Data Rekap ({filtered.length})
              </div>

              {loading ? (
                <div className="p-6 text-sm text-neutral-700">Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="p-10 text-center text-sm text-neutral-700">
                  Belum ada request yang diambil (atau filter tidak cocok).
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="min-w-[1100px] w-full text-sm">
                    <thead className="bg-neutral-50 text-neutral-600">
                      <tr className="border-b border-neutral-200">
                        <th className="px-4 py-3 text-left">Request ID</th>
                        <th className="px-4 py-3 text-left">Requestor</th>
                        <th className="px-4 py-3 text-left">Pemohon</th>
                        <th className="px-4 py-3 text-left">Lokasi</th>
                        <th className="px-4 py-3 text-left">Segmen</th>
                        <th className="px-4 py-3 text-left">Deadline</th>
                        <th className="px-4 py-3 text-left">Taken By</th>
                        <th className="px-4 py-3 text-left">Taken At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((r) => (
                        <tr
                          key={r.requestId}
                          className="border-b border-neutral-100 hover:bg-neutral-50"
                        >
                          <td className="px-4 py-3 font-semibold">
                            {r.requestId}
                          </td>
                          <td className="px-4 py-3">{r.requestor}</td>
                          <td className="px-4 py-3">{r.pemohon}</td>
                          <td className="px-4 py-3">{r.lokasi}</td>
                          <td className="px-4 py-3">{r.segmen}</td>
                          <td className="px-4 py-3">
                            {fmtDate(r.deadlineUsulan)}
                          </td>
                          <td className="px-4 py-3">
                            {r.takenByAdminName ?? "-"}
                          </td>
                          <td className="px-4 py-3">
                            {r.takenAt ? fmtDateTime(r.takenAt) : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="h-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
