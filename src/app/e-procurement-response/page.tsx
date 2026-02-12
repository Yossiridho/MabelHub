"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/sidebar";
import type { Role } from "@/lib/menu";
import { ArrowLeft } from "lucide-react";

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

async function apiListTakeable(): Promise<EProcRow[]> {
  const res = await fetch("/api/eprocurement/requests?mode=takeable", {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = await res.json();
  return (json?.data ?? []) as EProcRow[];
}

async function apiTake(requestId: string, adminId: string, adminName: string) {
  const res = await fetch(
    `/api/eprocurement/requests/${encodeURIComponent(requestId)}/take`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminId, adminName }),
    },
  );

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error ?? "Gagal TAKE");
  return json?.data as EProcRow;
}

export default function EProcurementResponsePage() {
  const router = useRouter();

  // SEMENTARA (nanti dari auth/session)
  const role: Role = "SUPERADMIN";
  const adminId = "admin-1";
  const adminName = "ADMIN";

  const [rows, setRows] = useState<EProcRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [takingId, setTakingId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const [openDetail, setOpenDetail] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      const data = await apiListTakeable();
      if (mounted) setRows(data);
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const isEmpty = useMemo(() => !loading && rows.length === 0, [loading, rows]);

  return (
    <div className="min-h-screen bg-blue-100">
      <div className="flex">
        <Sidebar role={role} />

        <div className="flex-1 h-screen overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5 text-neutral-700" />
              </button>

              <div>
                <div className="text-2xl font-bold text-neutral-900">
                  E-PROCUREMENT RESPONSE
                </div>
                <div className="text-sm text-neutral-600">
                  Request e-procurement yang bisa diambil admin.
                </div>
              </div>
            </div>

            {/* Main container */}
            <div className="mt-6 rounded-xl bg-white shadow-md overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-200 text-sm font-semibold">
                Request List ({rows.length})
              </div>

              {loading ? (
                <div className="p-6 text-sm text-neutral-700">Loading...</div>
              ) : isEmpty ? (
                <div className="p-10 text-center text-sm text-neutral-600">
                  Tidak ada request yang bisa diambil.
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="min-w-[1150px] w-full text-sm">
                    <thead className="bg-neutral-50 text-neutral-600">
                      <tr className="border-b border-neutral-200">
                        <th className="px-4 py-3 text-left">Request ID</th>
                        <th className="px-4 py-3 text-left">Requestor</th>
                        <th className="px-4 py-3 text-left">Pemohon</th>
                        <th className="px-4 py-3 text-left">Lokasi</th>
                        <th className="px-4 py-3 text-left">Segmen</th>
                        <th className="px-4 py-3 text-left">Deadline</th>
                        <th className="px-4 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>

                    <tbody>
                      {rows.map((r) => {
                        const isOpen = !!openDetail[r.requestId];
                        const isTaking = takingId === r.requestId;

                        return (
                          <FragmentRow
                            key={r.requestId}
                            r={r}
                            isOpen={isOpen}
                            isTaking={isTaking}
                            onToggle={() =>
                              setOpenDetail((prev) => ({
                                ...prev,
                                [r.requestId]: !prev[r.requestId],
                              }))
                            }
                            onTake={async () => {
                              try {
                                setError("");
                                setTakingId(r.requestId);

                                await apiTake(r.requestId, adminId, adminName);

                                // remove from takeable list
                                setRows((prev) =>
                                  prev.filter(
                                    (x) => x.requestId !== r.requestId,
                                  ),
                                );
                              } catch (e: any) {
                                setError(
                                  e?.message ?? "Gagal mengambil request",
                                );
                              } finally {
                                setTakingId(null);
                              }
                            }}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {error ? (
              <div className="mt-4 rounded-md bg-red-100 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="h-10" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FragmentRow({
  r,
  isOpen,
  isTaking,
  onToggle,
  onTake,
}: {
  r: EProcRow;
  isOpen: boolean;
  isTaking: boolean;
  onToggle: () => void;
  onTake: () => void;
}) {
  return (
    <>
      <tr className="border-b border-neutral-100 hover:bg-neutral-50">
        <td className="px-4 py-3 font-semibold">
          <button
            className="text-left hover:underline"
            onClick={onToggle}
            type="button"
            title="Klik untuk lihat detail"
          >
            {r.requestId}
          </button>
        </td>
        <td className="px-4 py-3">{r.requestor}</td>
        <td className="px-4 py-3">{r.pemohon}</td>
        <td className="px-4 py-3">{r.lokasi}</td>
        <td className="px-4 py-3">{r.segmen}</td>
        <td className="px-4 py-3">{fmtDate(r.deadlineUsulan)}</td>

        <td className="px-4 py-3 text-right">
          <button
            disabled={isTaking}
            onClick={onTake}
            className={[
              "h-8 rounded-full px-4 text-xs font-semibold text-white",
              isTaking
                ? "bg-neutral-400"
                : "bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98]",
            ].join(" ")}
          >
            {isTaking ? "TAKING..." : "TAKE"}
          </button>
        </td>
      </tr>

      {isOpen ? (
        <tr className="border-b border-neutral-100">
          <td colSpan={7} className="px-4 py-3 bg-neutral-50 text-sm">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div>
                <span className="font-medium text-neutral-700">
                  Tanggal Submit:
                </span>{" "}
                {fmtDateTime(r.tanggalSubmit)}
              </div>
              <div>
                <span className="font-medium text-neutral-700">Catatan:</span>{" "}
                {r.catatan?.trim() ? r.catatan : "-"}
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
