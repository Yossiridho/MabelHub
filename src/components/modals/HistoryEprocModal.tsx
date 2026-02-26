"use client";

import React from "react";

function clsx(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}

function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  widthClass = "max-w-5xl",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  widthClass?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/35"
        aria-label="Close modal"
      />
      <div
        className={clsx(
          "relative mt-16 w-[94%] rounded-2xl bg-[#f7f2f2] shadow-2xl ring-1 ring-black/10",
          widthClass,
        )}
      >
        <div className="flex items-start justify-between border-b border-black/10 px-6 py-5">
          <div>
            <h2 className="text-base font-extrabold tracking-wide text-black">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-xs text-black/60">{subtitle}</p>
            ) : null}
          </div>

          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-black/5 text-xl font-black text-black hover:bg-black/10"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

export type EProcHistoryItem = {
  at: string;
  action: string;
  tindakLanjut?: string;
  statusReqSales?: string;
  catatan?: string;
  by: string;
};

export default function HistoryEprocModal({
  open,
  onClose,
  requestId,
}: {
  open: boolean;
  onClose: () => void;
  requestId: string | null;
}) {
  const [items, setItems] = React.useState<EProcHistoryItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open || !requestId) return;

    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/e-procurement/requests/${encodeURIComponent(requestId)}/history`,
          {
            cache: "no-store",
          },
        );
        if (!res.ok) {
          if (isMounted) setItems([]);
          return;
        }
        const json = await res.json();
        if (isMounted) setItems(json?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [open, requestId]);

  function formatDateTime(iso?: string | Date | null): string {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(
      d.getHours(),
    )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="History Tindak Lanjut"
      subtitle="Riwayat perubahan tindak lanjut usulan E-Procurement."
      widthClass="item-center max-w-7xl"
    >
      {loading ? (
        <div className="py-12 text-center text-sm text-black/60">
          Loading history...
        </div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-sm text-black/60">
          Tidak ada history.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/10 max-h-[60vh] overflow-y-auto">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-md">
              <thead className="bg-white sticky top-0 shadow-sm">
                <tr>
                  {["Waktu", "Oleh", "Aksi", "Status", "Catatan"].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap border-b border-black/10 px-4 py-3 text-left text-sm font-bold tracking-wide text-black/80"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white">
                {items.map((x, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-black/10 hover:bg-black/5 align-top"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      {x?.at ? formatDateTime(x.at) : "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {x?.by ?? "-"}
                    </td>
                    <td
                      className={`px-4 py-4 font-bold min-w-[200px] ${x?.tindakLanjut === "Lanjut" ? "text-green-600" : x?.tindakLanjut === "Cancel" ? "text-red-600" : "text-blue-600"}`}
                    >
                      {x?.action || x?.tindakLanjut || "-"}
                    </td>
                    <td className="px-4 py-4 min-w-[300px]">
                      {x?.statusReqSales || "-"}
                    </td>
                    <td className="px-4 py-4 min-w-[400px] whitespace-pre-wrap leading-relaxed">
                      {x?.catatan || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden flex flex-col p-4 gap-4 bg-gray-50/50">
            {items.map((x, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm flex flex-col gap-4"
              >
                <div className="flex justify-between items-start border-b border-black/5 pb-3">
                  <div>
                    <div className="text-xs text-black/50 font-medium mb-0.5">
                      Waktu
                    </div>
                    <div className="text-sm font-semibold text-black/80">
                      {x?.at ? formatDateTime(x.at) : "-"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-black/50 font-medium mb-0.5">
                      Oleh
                    </div>
                    <div className="text-sm font-semibold text-black/80">
                      {x?.by ?? "-"}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-black/50 font-medium mb-1">
                    Aksi
                  </div>
                  <div
                    className={`text-base font-bold ${x?.tindakLanjut === "Lanjut" ? "text-green-600" : x?.tindakLanjut === "Cancel" ? "text-red-600" : "text-blue-600"}`}
                  >
                    {x?.action || x?.tindakLanjut || "-"}
                  </div>
                </div>

                {x?.statusReqSales && (
                  <div>
                    <div className="text-xs text-black/50 font-medium mb-1">
                      Status
                    </div>
                    <div className="text-sm text-black/80 font-medium">
                      {x.statusReqSales}
                    </div>
                  </div>
                )}

                {x?.catatan && (
                  <div className="bg-blue-50/50 p-4 rounded-xl mt-1 border border-blue-100">
                    <div className="text-xs text-blue-800 font-bold mb-2 flex items-center gap-1.5">
                      <span>📝</span> Catatan
                    </div>
                    <div className="text-sm text-black/80 whitespace-pre-wrap leading-relaxed">
                      {x.catatan}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-black/10 px-5 py-4 text-xs text-black/60">
            Total history: <b className="text-black">{items.length}</b>
          </div>
        </div>
      )}
    </Modal>
  );
}
