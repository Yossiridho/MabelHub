"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Sidebar from "@/components/sidebar/sidebar";
import { useSession } from "@/components/session/SessionProvider";
import { useRouter } from "next/navigation";
import NotificationMenu from "@/components/modals/NotificationMenu";
import {
  Search,
  ClipboardList,
  Building2,
  CheckCircle2,
  PackageOpen,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  Sector,
  Rectangle,
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#f97316",
];

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

  perusahaan?: string;
  statusUsulan?: string;
  statusAkhir?: string;
};

type ChartFilter = {
  company: string | null;
  segment: string | null;
  status: string | null;
};

type Summary = {
  total: number;
  bySegment: Array<{ label: string; value: number }>;
  byCompany: Array<{ label: string; value: number }>;
  byStatus: Array<{ label: string; value: number }>;
};

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g style={{ cursor: "pointer" }}>
      <text
        x={cx}
        y={cy}
        dy={8}
        textAnchor="middle"
        fill={fill}
        className="font-bold text-sm"
      >
        {payload.label}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
        className="text-xs font-semibold"
      >
        {`Total: ${value}`}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
        className="text-[10px]"
      >
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

function fmtDate(d: string | Date) {
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "-";
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

async function apiListTakeable(): Promise<EProcRow[]> {
  const res = await fetch("/api/e-procurement/requests?mode=takeable", {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = await res.json().catch(() => ({}));
  return (json?.data ?? []) as EProcRow[];
}

async function apiListAll(): Promise<EProcRow[]> {
  const res = await fetch("/api/e-procurement/requests?mode=all", {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = await res.json().catch(() => ({}));
  return (json?.data ?? []) as EProcRow[];
}

async function apiTake(requestId: string) {
  const res = await fetch(`/api/e-procurement/requests/${requestId}/take`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // adminId tidak perlu dikirim karena diambil dari session di backend
    body: JSON.stringify({}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error ?? "Gagal mengambil request");
  return true;
}

export default function DashboardResponsePage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();

  const [rows, setRows] = useState<EProcRow[]>([]);
  const [allRows, setAllRows] = useState<EProcRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [takingId, setTakingId] = useState<string | null>(null);

  const [q, setQ] = useState("");

  const [activeIndex, setActiveIndex] = useState(0);
  const onPieEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, []);

  const [chartFilter, setChartFilter] = useState<ChartFilter>({
    company: null,
    segment: null,
    status: null,
  });

  const toggleFilter = (
    type: "company" | "segment" | "status",
    value: string,
  ) => {
    setChartFilter((prev) => ({
      ...prev,
      [type]: prev[type] === value ? null : value,
    }));
  };

  // Guard: dashboard response untuk ADMIN/SUPERADMIN saja (opsional tapi masuk akal)
  useEffect(() => {
    if (!sessionLoading && user) {
      if (user.role !== "SUPERADMIN" && user.role !== "ADMIN") {
        router.replace("/dashboard-request");
      }
    }
  }, [sessionLoading, user, router]);

  // Dynamic summary
  const summary: Summary = useMemo(() => {
    const fullyFiltered = allRows.filter((r) => {
      if (
        chartFilter.company &&
        (r.perusahaan || "Belum Ditentukan") !== chartFilter.company
      )
        return false;
      if (
        chartFilter.segment &&
        (r.segmen || "Unknown") !== chartFilter.segment
      )
        return false;
      if (
        chartFilter.status &&
        (r.statusAkhir || r.statusUsulan || "Masuk") !== chartFilter.status
      )
        return false;
      return true;
    });

    const countSegmen: Record<string, number> = {};
    const countCompany: Record<string, number> = {};
    const countStatus: Record<string, number> = {};

    const segmenData = allRows.filter((r) => {
      if (
        chartFilter.company &&
        (r.perusahaan || "Belum Ditentukan") !== chartFilter.company
      )
        return false;
      if (
        chartFilter.status &&
        (r.statusAkhir || r.statusUsulan || "Masuk") !== chartFilter.status
      )
        return false;
      return true;
    });
    segmenData.forEach((r) => {
      const s = r.segmen || "Unknown";
      countSegmen[s] = (countSegmen[s] || 0) + 1;
    });

    const companyData = allRows.filter((r) => {
      if (
        chartFilter.segment &&
        (r.segmen || "Unknown") !== chartFilter.segment
      )
        return false;
      if (
        chartFilter.status &&
        (r.statusAkhir || r.statusUsulan || "Masuk") !== chartFilter.status
      )
        return false;
      return true;
    });
    companyData.forEach((r) => {
      const c = r.perusahaan || "Belum Ditentukan";
      countCompany[c] = (countCompany[c] || 0) + 1;
    });

    const statusData = allRows.filter((r) => {
      if (
        chartFilter.company &&
        (r.perusahaan || "Belum Ditentukan") !== chartFilter.company
      )
        return false;
      if (
        chartFilter.segment &&
        (r.segmen || "Unknown") !== chartFilter.segment
      )
        return false;
      return true;
    });
    statusData.forEach((r) => {
      const st = r.statusAkhir || r.statusUsulan || "Masuk";
      countStatus[st] = (countStatus[st] || 0) + 1;
    });

    const toArr = (obj: Record<string, number>) =>
      Object.entries(obj)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value);

    return {
      total: fullyFiltered.length,
      bySegment: toArr(countSegmen),
      byCompany: toArr(countCompany),
      byStatus: toArr(countStatus),
    };
  }, [allRows, chartFilter]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (sessionLoading) return;
      if (!user) return;

      setLoadingRows(true);
      const [takeableData, entireData] = await Promise.all([
        apiListTakeable(),
        apiListAll(),
      ]);
      if (mounted) {
        setRows(takeableData);
        setAllRows(entireData);
        setLoadingRows(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [sessionLoading, user]);

  const filtered = useMemo(() => {
    let base = rows;

    if (chartFilter.company) {
      base = base.filter(
        (r) => (r.perusahaan || "Belum Ditentukan") === chartFilter.company,
      );
    }
    if (chartFilter.segment) {
      base = base.filter(
        (r) => (r.segmen || "Unknown") === chartFilter.segment,
      );
    }
    if (chartFilter.status) {
      base = base.filter(
        (r) =>
          (r.statusAkhir || r.statusUsulan || "Masuk") === chartFilter.status,
      );
    }

    const qq = q.trim().toLowerCase();
    if (!qq) return base;
    return base.filter((r) =>
      [
        r.requestId,
        r.requestor,
        r.pemohon,
        r.lokasi,
        r.segmen,
        fmtDate(r.deadlineUsulan),
      ]
        .join(" ")
        .toLowerCase()
        .includes(qq),
    );
  }, [rows, q, chartFilter]);

  const hasOrders = filtered.length > 0;

  async function onTake(requestId: string) {
    try {
      setTakingId(requestId);
      await apiTake(requestId);
      // refresh list
      const takeableData = await apiListTakeable();
      setRows(takeableData);

      const allData = await apiListAll();
      setAllRows(allData);
    } catch (e: any) {
      alert(e?.message ?? "Gagal mengambil request");
    } finally {
      setTakingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Content */}
        <div className="flex-1 h-screen overflow-y-auto">
          <div className="w-full px-6 py-6">
            {/* Header row (mirip dashboard-request) */}
            <div className="flex items-center justify-between gap-4">
              <div className="text-2xl pl-4 font-extrabold text-black">
                RESPONSE DASHBOARD
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative hidden md:block">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search..."
                    className="w-[360px] rounded-full border border-neutral-200 bg-white px-4 py-2 pr-10 text-sm shadow-sm outline-none focus:ring-2 focus:ring-sky-200"
                  />
                  <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                </div>

                {/* Bell */}
                <div className="hidden lg:flex">
                  <NotificationMenu />
                </div>
              </div>
            </div>

            {/* Top cards row (warna & feel sama) */}
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <TopCard
                title="TOTAL REQUEST"
                icon={<ClipboardList className="h-4 w-4 text-neutral-500" />}
                right={
                  <div className="text-3xl font-bold">{summary.total}</div>
                }
              >
                <MiniTable
                  rows={summary.bySegment}
                  onRowClick={(val) => toggleFilter("segment", val)}
                  activeLabel={chartFilter.segment}
                />
              </TopCard>

              <TopCard
                title="PERUSAHAAN"
                icon={<Building2 className="h-4 w-4 text-neutral-500" />}
              >
                <MiniTable
                  rows={summary.byCompany}
                  onRowClick={(val) => toggleFilter("company", val)}
                  activeLabel={chartFilter.company}
                />
              </TopCard>

              <TopCard
                title="STATUS"
                icon={<CheckCircle2 className="h-4 w-4 text-neutral-500" />}
              >
                <MiniTable
                  rows={summary.byStatus}
                  onRowClick={(val) => toggleFilter("status", val)}
                  activeLabel={chartFilter.status}
                />
              </TopCard>
            </div>

            {/* Takeable orders (putih, rounded, shadow) */}
            <div className="mt-6 rounded-xl bg-white p-4 shadow-md">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-neutral-900">
                    Request yang bisa diambil
                  </div>
                  <div className="text-xs text-neutral-500">
                    Request order dari e-procurement yang bisa di-claim admin.
                  </div>
                </div>

                <div className="hidden md:block text-xs text-neutral-600">
                  Queue:{" "}
                  <span className="font-semibold">{filtered.length}</span>
                </div>
              </div>

              {(chartFilter.company ||
                chartFilter.segment ||
                chartFilter.status) && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-500">
                    Active Filters:
                  </span>
                  {chartFilter.company && (
                    <div className="inline-flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 ring-1 ring-inset ring-sky-200">
                      <span className="flex items-center gap-1">
                        <span className="text-sky-500">🏢</span>
                        Perusahaan:{" "}
                        <span className="font-bold">{chartFilter.company}</span>
                      </span>
                      <button
                        onClick={() =>
                          toggleFilter("company", chartFilter.company!)
                        }
                        className="ml-1 flex h-5 w-5 items-center justify-center rounded-md hover:bg-sky-200/50 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {chartFilter.segment && (
                    <div className="inline-flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-800 ring-1 ring-inset ring-purple-200">
                      <span className="flex items-center gap-1">
                        <span className="text-purple-500">🎯</span>
                        Segmen:{" "}
                        <span className="font-bold">{chartFilter.segment}</span>
                      </span>
                      <button
                        onClick={() =>
                          toggleFilter("segment", chartFilter.segment!)
                        }
                        className="ml-1 flex h-5 w-5 items-center justify-center rounded-md hover:bg-purple-200/50 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {chartFilter.status && (
                    <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200">
                      <span className="flex items-center gap-1">
                        <span className="text-emerald-500">✅</span>
                        Status:{" "}
                        <span className="font-bold">{chartFilter.status}</span>
                      </span>
                      <button
                        onClick={() =>
                          toggleFilter("status", chartFilter.status!)
                        }
                        className="ml-1 flex h-5 w-5 items-center justify-center rounded-md hover:bg-emerald-200/50 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() =>
                      setChartFilter({
                        company: null,
                        segment: null,
                        status: null,
                      })
                    }
                    className="text-xs font-semibold text-red-500 hover:text-red-700 underline underline-offset-2 ml-2"
                  >
                    Clear All
                  </button>
                </div>
              )}

              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {loadingRows ? (
                  <>
                    <TakeCardSkeleton />
                    <TakeCardSkeleton />
                  </>
                ) : hasOrders ? (
                  filtered
                    .slice(0, 2)
                    .map((r) => (
                      <TakeCard
                        key={r.requestId}
                        row={r}
                        taking={takingId === r.requestId}
                        onTake={() => onTake(r.requestId)}
                      />
                    ))
                ) : (
                  <EmptyTakeState />
                )}
              </div>
            </div>

            {/* Overview (putih + shadow) */}
            <div className="mt-6 rounded-xl bg-white p-4 shadow-md">
              <div className="text-sm font-semibold text-neutral-900">
                Overview
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <OverviewCard title="PERUSAHAAN" className="lg:col-span-2">
                  <div className="h-[280px] w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={summary.byCompany}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                          stroke="#e5e7eb"
                        />
                        <XAxis
                          type="number"
                          allowDecimals={false}
                          tick={{ fill: "#6b7280" }}
                        />
                        <YAxis
                          type="category"
                          dataKey="label"
                          width={200}
                          tick={{
                            fontSize: 11,
                            fill: "#374151",
                            fontWeight: 500,
                          }}
                          interval={0}
                        />
                        <Tooltip
                          cursor={{ fill: "#f3f4f6" }}
                          formatter={(value: any) => [value, "Request"]}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Bar
                          dataKey="value"
                          radius={[0, 4, 4, 0]}
                          barSize={20}
                          activeBar={
                            <Rectangle
                              fill="#bae6fd"
                              stroke="#3b82f6"
                              strokeWidth={1}
                              radius={[0, 4, 4, 0]}
                            />
                          }
                        >
                          {summary.byCompany.map((entry, index) => {
                            const isSelected =
                              chartFilter.company === entry.label;
                            const isDimmed =
                              chartFilter.company !== null && !isSelected;
                            return (
                              <Cell
                                key={`cell-${index}`}
                                cursor="pointer"
                                fill={isDimmed ? "#93c5fd" : "#3b82f6"}
                                opacity={isDimmed ? 0.35 : 1}
                                onClick={() =>
                                  toggleFilter("company", entry.label)
                                }
                              />
                            );
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </OverviewCard>

                <OverviewCard title="TOTAL REQUEST" className="lg:row-span-2">
                  <div className="h-[400px] w-full flex justify-center items-center text-xs mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          // @ts-ignore
                          activeIndex={activeIndex}
                          activeShape={renderActiveShape}
                          data={summary.bySegment}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={90}
                          innerRadius={60}
                          dataKey="value"
                          nameKey="label"
                          onMouseEnter={onPieEnter}
                          onClick={(data, index) => {
                            if (summary.bySegment[index]) {
                              toggleFilter(
                                "segment",
                                summary.bySegment[index].label,
                              );
                            }
                          }}
                        >
                          {summary.bySegment.map((entry, index) => {
                            const isSelected =
                              chartFilter.segment === entry.label;
                            const isDimmed =
                              chartFilter.segment !== null && !isSelected;
                            return (
                              <Cell
                                key={`cell-${index}`}
                                cursor="pointer"
                                fill={COLORS[index % COLORS.length]}
                                opacity={isDimmed ? 0.35 : 1}
                                onClick={() =>
                                  toggleFilter("segment", entry.label)
                                }
                              />
                            );
                          })}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => [value, "Request"]}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Legend
                          wrapperStyle={{
                            fontSize: "11px",
                            paddingTop: "20px",
                          }}
                          verticalAlign="bottom"
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </OverviewCard>

                <OverviewCard title="STATUS" className="lg:col-span-2">
                  <div className="h-[280px] w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={summary.byStatus}
                        margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#e5e7eb"
                        />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 10, fill: "#374151" }}
                          interval={0}
                          angle={-25}
                          textAnchor="end"
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fill: "#6b7280" }}
                        />
                        <Tooltip
                          cursor={{ fill: "#f3f4f6" }}
                          formatter={(value: any) => [value, "Request"]}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Bar
                          dataKey="value"
                          radius={[4, 4, 0, 0]}
                          barSize={30}
                          activeBar={
                            <Rectangle
                              fill="#6ee7b7"
                              stroke="#10b981"
                              strokeWidth={1}
                              radius={[4, 4, 0, 0]}
                            />
                          }
                        >
                          {summary.byStatus.map((entry, index) => {
                            const isSelected =
                              chartFilter.status === entry.label;
                            const isDimmed =
                              chartFilter.status !== null && !isSelected;
                            return (
                              <Cell
                                key={`cell-${index}`}
                                cursor="pointer"
                                fill={isDimmed ? "#a7f3d0" : "#10b981"}
                                opacity={isDimmed ? 0.35 : 1}
                                onClick={() =>
                                  toggleFilter("status", entry.label)
                                }
                              />
                            );
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </OverviewCard>
              </div>
            </div>

            <div className="h-10" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- UI Blocks ----------------------------- */

function TopCard({
  title,
  icon,
  right,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <div className="text-[11px] font-semibold tracking-wider text-neutral-500">
            {title}
          </div>
        </div>
        {right ? <div className="text-neutral-900">{right}</div> : null}
      </div>

      <div className="mt-3">{children}</div>
    </div>
  );
}

function MiniTable({
  rows,
  onRowClick,
  activeLabel,
}: {
  rows: Array<{ label: string; value: number }>;
  onRowClick?: (label: string) => void;
  activeLabel?: string | null;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200">
      {rows.map((r, idx) => {
        const isActive = activeLabel === r.label;
        return (
          <div
            key={r.label}
            onClick={() => onRowClick && onRowClick(r.label)}
            className={`flex items-center justify-between px-3 py-2 text-[11px] ${
              idx !== rows.length - 1 ? "border-b border-neutral-200" : ""
            } ${onRowClick ? "cursor-pointer hover:bg-sky-50 transition-colors" : ""} ${
              isActive ? "bg-sky-100/50" : ""
            }`}
          >
            <div
              className={`font-medium ${isActive ? "text-sky-800 font-bold" : "text-neutral-700"}`}
            >
              {r.label}
            </div>
            <div
              className={`tabular-nums font-semibold ${isActive ? "text-sky-900" : "text-neutral-900"}`}
            >
              {r.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TakeCard({
  row,
  onTake,
  taking,
}: {
  row: EProcRow;
  onTake: () => void;
  taking: boolean;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-neutral-500">
            REQUEST ID
          </div>
          <div className="mt-1 text-sm font-semibold text-neutral-900">
            {row.requestId}
          </div>
        </div>

        <button
          className="h-9 rounded-full bg-neutral-900 px-4 text-xs font-semibold text-white hover:bg-neutral-800 active:scale-[0.98]"
          onClick={onTake}
          disabled={taking}
        >
          {taking ? "TAKING..." : "TAKE"}
        </button>
      </div>

      <div className="mt-3 h-px w-full bg-neutral-200" />

      <div className="mt-3 grid grid-cols-2 gap-4">
        <Info label="REQUESTOR" value={row.requestor} />
        <Info label="DEADLINE USULAN" value={fmtDate(row.deadlineUsulan)} />

        <div className="col-span-2">
          <Info label="PEMOHON" value={row.pemohon} bold />
        </div>

        <Info label="SEGMEN" value={row.segmen} />
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-neutral-500">
            KOTA/LOKASI
          </div>
          <div className="mt-1 inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-800">
            {row.lokasi}
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] font-semibold tracking-wider text-neutral-500">
        {label}
      </div>
      <div
        className={`mt-1 text-[13px] text-neutral-800 ${bold ? "font-semibold" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

function EmptyTakeState() {
  return (
    <div className="lg:col-span-2 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
          <PackageOpen className="h-6 w-6 text-neutral-700" />
        </div>
        <div className="mt-3 text-sm font-semibold text-neutral-900">
          Tidak ada order yang bisa diambil
        </div>
        <div className="mt-1 text-xs text-neutral-600">
          Jika ada request baru dari e-procurement, maka akan muncul di sini.
        </div>
      </div>
    </div>
  );
}

function TakeCardSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-neutral-200" />
          <div className="h-4 w-40 rounded bg-neutral-200" />
        </div>
        <div className="h-9 w-20 rounded-full bg-neutral-200" />
      </div>
      <div className="mt-3 h-px w-full bg-neutral-200" />
      <div className="mt-3 grid grid-cols-2 gap-4">
        <div className="h-10 rounded bg-neutral-200" />
        <div className="h-10 rounded bg-neutral-200" />
        <div className="col-span-2 h-10 rounded bg-neutral-200" />
        <div className="h-10 rounded bg-neutral-200" />
        <div className="h-10 rounded bg-neutral-200" />
      </div>
    </div>
  );
}

function OverviewCard({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border border-neutral-200 bg-white p-4 shadow-sm ${className ?? ""}`}
    >
      <div className="text-[11px] font-semibold tracking-wider text-neutral-500">
        {title}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ChartPlaceholder({
  icon,
  tall,
}: {
  icon: React.ReactNode;
  tall?: boolean;
}) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50",
        tall ? "h-[320px]" : "h-[160px]",
      ].join(" ")}
    >
      <div className="absolute inset-0 opacity-[0.35]">
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-size-[24px_24px]" />
      </div>
      <div className="relative flex h-full items-center justify-center text-neutral-700">
        {icon}
      </div>
    </div>
  );
}
