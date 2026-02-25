"use client";

import React, { useEffect, useState } from "react";

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
          "relative mt-16 w-[70%] rounded-2xl bg-white shadow-2xl ring-1 ring-black/10",
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
            className="grid h-9 w-9 place-items-center rounded-lg bg-white text-xl font-bold text-black hover:bg-red-500"
            aria-label="Close"
          >
            X
          </button>
        </div>

        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

type HistoryItem = {
  _id?: string;
  at?: string;
  action?: string;
  by?: string;
  note?: string;
};

export default function HistoryInstansiModal({
  open,
  onClose,
  companyId,
}: {
  open: boolean;
  onClose: () => void;
  companyId: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (!open || !companyId) return;

    (async () => {
      try {
        setLoading(true);

        // ✅ sesuaikan kalau endpoint kamu beda:
        // contoh: /api/companies/:id/history
        const res = await fetch(`/api/companies/${companyId}/history`, {
          cache: "no-store",
        });

        if (!res.ok) {
          setItems([]);
          return;
        }

        const json = await res.json().catch(() => ({}));
        setItems(Array.isArray(json?.items) ? json.items : []);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, companyId]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="HISTORY"
      subtitle="Riwayat perubahan instansi."
      widthClass="item-center max-w-8xl"
    >
      {loading ? (
        <div className="py-12 text-center text-md text-black/60">Loading...</div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-sm text-black/60">
          Tidak ada history.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/10">
          <div className="overflow-x-auto">
            <table className="min-w-full text-md">
              <thead className="bg-white">
                <tr>
                  {["Waktu", "Aksi", "Oleh", "Catatan"].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap border-b border-black/10 px-4 py-3 text-left text-[11px] font-extrabold tracking-wide text-black/80"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white">
                {items.map((x, idx) => (
                  <tr key={x?._id ?? String(idx)} className="border-t border-black/10">
                    <td className="px-4 py-4">{x?.at ?? "-"}</td>
                    <td className="px-4 py-4">{x?.action ?? "-"}</td>
                    <td className="px-4 py-4">{x?.by ?? "-"}</td>
                    <td className="px-4 py-4">{x?.note ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-black/10 px-5 py-4 text-xs text-black/60">
            Total history: <b className="text-black">{items.length}</b>
          </div>
        </div>
      )}
    </Modal>
  );
}
