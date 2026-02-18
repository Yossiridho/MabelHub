"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/sidebar/sidebar";
import { useSession } from "@/components/session/SessionProvider";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  ClipboardList,
  Building2,
  CheckCircle2,
  BarChart3,
  PieChart,
  PackageOpen,
} from "lucide-react";

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

type Summary = {
  total: number;
  bySegment: Array<{ label: string; value: number }>;
  byCompany: Array<{ label: string; value: number }>;
  byStatus: Array<{ label: string; value: number }>;
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
  const [loadingRows, setLoadingRows] = useState(true);
  const [takingId, setTakingId] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [notifCount, setNotifCount] = useState(3);

  // Guard: dashboard response untuk ADMIN/SUPERADMIN saja (opsional tapi masuk akal)
  useEffect(() => {
    if (!sessionLoading && user) {
      if (user.role !== "SUPERADMIN" && user.role !== "ADMIN") {
        router.replace("/dashboard-request");
      }
    }
  }, [sessionLoading, user, router]);

  // Dummy summary (nanti bisa dari API)
  const summary: Summary = useMemo(
    () => ({
      total: 30,
      bySegment: [
        { label: "B2G", value: 10 },
        { label: "B2B", value: 10 },
        { label: "B2C", value: 10 },
      ],
      byCompany: [
        { label: "ARDIT SOLUSI NUSANTARA", value: 10 },
        { label: "MABEL SOLUSI MANDIRI", value: 10 },
        { label: "MEKAR KREASI MANDIRI", value: 10 },
      ],
      byStatus: [
        { label: "RILIS KONTRAK", value: 10 },
        { label: "BARANG TERKIRIM KE USER", value: 10 },
        { label: "TERBIT BAST", value: 10 },
      ],
    }),
    [],
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (sessionLoading) return;
      if (!user) return;

      setLoadingRows(true);
      const data = await apiListTakeable();
      if (mounted) setRows(data);
      if (mounted) setLoadingRows(false);
    })();
    return () => {
      mounted = false;
    };
  }, [sessionLoading, user]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return rows;
    return rows.filter((r) =>
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
  }, [rows, q]);

  const hasOrders = filtered.length > 0;

  async function onTake(requestId: string) {
    try {
      setTakingId(requestId);
      await apiTake(requestId);
      // refresh list
      const data = await apiListTakeable();
      setRows(data);
    } catch (e: any) {
      alert(e?.message ?? "Gagal mengambil request");
    } finally {
      setTakingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-blue-100">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Content */}
        <div className="flex-1 h-screen overflow-y-auto">
          <div className="w-full px-6 py-6">
            {/* Header row (mirip dashboard-request) */}
            <div className="flex items-center justify-between gap-4">
              <div className="text-2xl font-bold text-neutral-900">
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
                <button
                  className="relative h-11 w-11 rounded-full border border-neutral-200 bg-white shadow-sm hover:shadow-md"
                  aria-label="Notifications"
                  onClick={() => setNotifCount(0)}
                >
                  <Bell className="mx-auto h-5 w-5 text-neutral-700" />
                  {notifCount > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
                      {notifCount}
                    </span>
                  )}
                </button>
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
                <MiniTable rows={summary.bySegment} />
              </TopCard>

              <TopCard
                title="PERUSAHAAN"
                icon={<Building2 className="h-4 w-4 text-neutral-500" />}
              >
                <MiniTable rows={summary.byCompany} />
              </TopCard>

              <TopCard
                title="STATUS"
                icon={<CheckCircle2 className="h-4 w-4 text-neutral-500" />}
              >
                <MiniTable rows={summary.byStatus} />
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
                  <ChartPlaceholder
                    icon={<BarChart3 className="h-16 w-16" />}
                  />
                </OverviewCard>

                <OverviewCard title="TOTAL REQUEST" className="lg:row-span-2">
                  <ChartPlaceholder
                    icon={<PieChart className="h-20 w-20" />}
                    tall
                  />
                </OverviewCard>

                <OverviewCard title="STATUS" className="lg:col-span-2">
                  <ChartPlaceholder
                    icon={<BarChart3 className="h-16 w-16" />}
                  />
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
}: {
  rows: Array<{ label: string; value: number }>;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200">
      {rows.map((r, idx) => (
        <div
          key={r.label}
          className={`flex items-center justify-between px-3 py-2 text-[11px] ${
            idx !== rows.length - 1 ? "border-b border-neutral-200" : ""
          }`}
        >
          <div className="font-medium text-neutral-700">{r.label}</div>
          <div className="tabular-nums font-semibold text-neutral-900">
            {r.value}
          </div>
        </div>
      ))}
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
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>
      <div className="relative flex h-full items-center justify-center text-neutral-700">
        {icon}
      </div>
    </div>
  );
}
