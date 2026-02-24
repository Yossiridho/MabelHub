"use client";

import React from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/sidebar";
import { ArrowLeft } from "lucide-react";
import { useSession } from "@/components/session/SessionProvider";

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

  items?: any[];
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
  const res = await fetch("/api/e-procurement/requests?mode=takeable", {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = await res.json().catch(() => ({}));
  return (json?.data ?? []) as EProcRow[];
}

async function apiTake(requestId: string) {
  const res = await fetch(
    `/api/e-procurement/requests/${encodeURIComponent(requestId)}/take`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // ✅ adminId/adminName TIDAK dikirim lagi (ambil dari session di server)
      body: JSON.stringify({}),
    },
  );

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error ?? "Gagal TAKE");
  return (json?.data ?? null) as EProcRow | null;
}

export default function EProcurementResponsePage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();

  const [rows, setRows] = useState<EProcRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [takingId, setTakingId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const [openDetail, setOpenDetail] = useState<Record<string, boolean>>({});

  // ✅ Guard: hanya ADMIN / SUPERADMIN
  useEffect(() => {
    if (!sessionLoading && user) {
      if (user.role !== "SUPERADMIN" && user.role !== "ADMIN") {
        router.replace("/dashboard-request");
      }
    }
  }, [sessionLoading, user, router]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (sessionLoading) return;
      if (!user) return;

      setLoading(true);
      setError("");
      const data = await apiListTakeable();
      if (mounted) setRows(data);
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [sessionLoading, user]);

  const isEmpty = useMemo(() => !loading && rows.length === 0, [loading, rows]);

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="flex">
        <Sidebar />

        <div className="flex-1 p-6 h-screen overflow-y-auto">
          <div className="px-3 pt-2 pb-2">
            <div>
              <div className="text-2xl pl-4 font-extrabold text-black">
                E-PROCUREMENT RESPONSE
              </div>
              <div className="text-sm ml-4 text-gray-600">
                Request e-procurement yang bisa diambil admin.
              </div>
            </div>

            {/* Main container */}
            <div className="mt-6 rounded-2xl bg-white shadow-md overflow-hidden">
              <div className="px-4 py-3 bg-blue-300 border-b border-gray-300 text-md font-semibold">
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
                        <th className="px-4 py-3 text-center">Aksi</th>
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

                                await apiTake(r.requestId);

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
      <tr
        className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer"
        onClick={onToggle}
        title="Klik untuk lihat detail"
      >
        <td className="px-4 py-3">{r.requestId}</td>
        <td className="px-4 py-3">{r.requestor}</td>
        <td className="px-4 py-3">{r.pemohon}</td>
        <td className="px-4 py-3">{r.lokasi}</td>
        <td className="px-4 py-3">{r.segmen}</td>
        <td className="px-4 py-3">{fmtDate(r.deadlineUsulan)}</td>

        <td className="px-4 py-3 text-center">
          <button
            disabled={isTaking}
            onClick={(e) => {
              e.stopPropagation();
              onTake();
            }}
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
        <tr className="border-b border-neutral-100 bg-neutral-50">
          <td colSpan={7} className="px-4 py-4 text-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4">
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

            <div className="mb-2">
              <h4 className="font-semibold text-neutral-800 mb-2">
                Rincian Items ({r.items?.length || 0})
              </h4>
              {r.items && r.items.length > 0 ? (
                <div className="overflow-x-auto border border-neutral-200 rounded-md">
                  <table className="w-full text-xs text-left bg-white">
                    <thead className="bg-neutral-100">
                      <tr>
                        <th className="px-2 py-2">Merek</th>
                        <th className="px-2 py-2">Sub Kategori</th>
                        <th className="px-2 py-2">Spesifikasi</th>
                        <th className="px-2 py-2">Qty</th>
                        <th className="px-2 py-2 pl-4">Pagu</th>
                        <th className="px-2 py-2">Harga Tayang</th>
                        <th className="px-2 py-2">Link Inaproc</th>
                        <th className="px-2 py-2">Link ECom</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.items.map((it, idx) => (
                        <tr
                          key={it.id || idx}
                          className="border-t border-neutral-200"
                        >
                          <td className="px-2 py-2">{it.merek || "-"}</td>
                          <td className="px-2 py-2">{it.subKategori || "-"}</td>
                          <td className="px-2 py-2">{it.spesifikasi || "-"}</td>
                          <td className="px-2 py-2">{it.qty ?? "-"}</td>
                          <td className="px-2 py-2 pl-4">
                            {it.paguPerItem || "-"}
                          </td>
                          <td className="px-2 py-2">{it.hargaTayang || "-"}</td>
                          <td className="px-2 py-2">
                            {it.linkInaproc ? (
                              <a
                                href={it.linkInaproc}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-500 hover:underline"
                                onClick={(e) => e.stopPropagation()} // in case
                              >
                                Link
                              </a>
                            ) : (
                              <span className="text-black">-</span>
                            )}
                          </td>
                          <td className="px-2 py-2">
                            {it.linkEcom ? (
                              <a
                                href={it.linkEcom}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-500 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Link
                              </a>
                            ) : (
                              <span className="text-black">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-neutral-500 text-xs">
                  Tidak ada item rincian
                </div>
              )}
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
