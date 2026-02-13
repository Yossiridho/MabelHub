"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/sidebar";
import { useSession } from "@/components/session/SessionProvider";

type PlanRow = {
  id: string;
  tanggal: string; // yyyy-mm-dd
  kota: string;
  klpd: string;
  institusi_kerja: string;
  satuan_kerja: string;
  status: string;
};

const LS_KEY = "mabelhub_plan_activity_v1";

function loadPlans(): PlanRow[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePlans(plans: PlanRow[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(plans));
  } catch {}
}

function formatTanggalHeader(yyyyMmDd: string) {
  if (!yyyyMmDd) return "-";
  const d = new Date(yyyyMmDd);
  if (Number.isNaN(d.getTime())) return yyyyMmDd;

  const day = d.getDate();
  const month = d.toLocaleDateString("id-ID", { month: "long" }).toUpperCase();
  return `${day} ${month}`;
}

function toSortKey(yyyyMmDd: string) {
  return yyyyMmDd || "0000-00-00";
}

export default function PlanActivityPage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();

  const [search, setSearch] = useState("");
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [openDates, setOpenDates] = useState<Record<string, boolean>>({});

  function groupByTanggal(rows: PlanRow[]) {
    return rows.reduce<Record<string, PlanRow[]>>((acc, r) => {
      const key = r.tanggal || "UNKNOWN";
      acc[key] = acc[key] || [];
      acc[key].push(r);
      return acc;
    }, {});
  }

  // ✅ Guard role (opsional)
  useEffect(() => {
    if (!sessionLoading && user) {
      // contoh: semua role boleh lihat -> hapus effect ini.
      // contoh aman: minimal SALES/LEADER/ADMIN/SUPERADMIN boleh lihat:
      const ok =
        user.role === "SALES" ||
        user.role === "LEADER" ||
        user.role === "ADMIN" ||
        user.role === "SUPERADMIN";

      if (!ok) router.replace("/");
    }
  }, [sessionLoading, user, router]);

  useEffect(() => {
    const data = loadPlans();
    setPlans(data);

    // default: tanggal terbaru terbuka
    const grouped = groupByTanggal(data);
    const firstKey = Object.keys(grouped).sort((a, b) =>
      toSortKey(b).localeCompare(toSortKey(a)),
    )[0];

    if (firstKey) setOpenDates({ [firstKey]: true });
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return plans;

    return plans.filter((p) =>
      [p.tanggal, p.kota, p.klpd, p.institusi_kerja, p.satuan_kerja, p.status]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [plans, search]);

  const grouped = useMemo(() => {
    const g = groupByTanggal(filtered);
    const keys = Object.keys(g).sort((a, b) => {
      if (a === "UNKNOWN") return 1;
      if (b === "UNKNOWN") return -1;
      return toSortKey(b).localeCompare(toSortKey(a));
    });
    return { keys, map: g };
  }, [filtered]);

  function toggleDate(key: string) {
    setOpenDates((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function deletePlan(id: string) {
    const next = plans.filter((p) => p.id !== id);
    setPlans(next);
    savePlans(next);
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="flex">
        {/* ✅ SIDEBAR (role dari session) */}
        <Sidebar />

        {/* CONTENT */}
        <div className="flex-1 h-screen overflow-y-auto p-6">
          <main className="w-full max-w-none">
            {/* HEADER */}
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-extrabold tracking-wide text-black">
                  PLAN ACTIVITY
                </h2>
              </div>

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
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => router.push("/plan-activity/add")}
                className="h-10 rounded-full bg-white px-6 text-sm font-extrabold shadow ring-1 ring-black/10 hover:bg-gray-50"
              >
                ADD PLANS
              </button>
            </div>

            {/* TABLE WRAPPER */}
            <div className="w-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
              {/* TABLE HEAD */}
              <div className="grid grid-cols-7 bg-blue-200 px-4 py-3 text-sm font-semibold text-black">
                <div>Tanggal</div>
                <div>Kota</div>
                <div>K/L/PD</div>
                <div>Institusi Kerja</div>
                <div>Satuan Kerja</div>
                <div className="text-center">Status</div>
                <div className="text-center">Aksi</div>
              </div>

              {/* BODY */}
              {grouped.keys.length === 0 ? (
                <div className="px-4 py-12 text-center text-gray-600">
                  Belum ada data.
                </div>
              ) : (
                grouped.keys.map((dateKey) => {
                  const rows = grouped.map[dateKey] || [];
                  const isOpen = !!openDates[dateKey];

                  return (
                    <div key={dateKey} className="border-t border-black/20">
                      {/* DATE GROUP ROW */}
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

                      {/* DROPDOWN ROWS */}
                      {isOpen && (
                        <div>
                          {rows.map((r) => (
                            <div
                              key={r.id}
                              className="grid grid-cols-7 items-center bg-white px-4 py-4 text-sm text-black border-t border-black/10"
                            >
                              {/* kolom tanggal dikosongkan */}
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
                                  className="mr-3 font-semibold hover:underline"
                                >
                                  EDIT
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deletePlan(r.id)}
                                  className="font-semibold text-red-700 hover:underline"
                                >
                                  HAPUS
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
          </main>
        </div>
      </div>
    </div>
  );
}
