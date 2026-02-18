"use client";

import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/sidebar/sidebar";
import { useSession } from "@/components/session/SessionProvider";
import { useRouter } from "next/navigation";

type ParamKey =
  | "sales"
  | "segmen"
  | "status_kunjungan"
  | "posisi"
  | "kegiatan"
  | "klpd";

type ParamDoc = {
  _id: string;
  sales: string[];
  segmen: string[];
  status_kunjungan: string[];
  posisi: string[];
  kegiatan: string[];
  klpd: string[];
  updatedAt?: string;
};

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

const KEY_LABEL: Record<ParamKey, string> = {
  sales: "Sales",
  segmen: "Segmen",
  status_kunjungan: "Status Kunjungan",
  posisi: "Posisi",
  kegiatan: "Kegiatan",
  klpd: "KLPD",
};

const ALL_KEYS: ParamKey[] = [
  "sales",
  "segmen",
  "status_kunjungan",
  "posisi",
  "kegiatan",
  "klpd",
];

export default function ParameterPage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();

  // Guard superadmin
  useEffect(() => {
    if (!sessionLoading && user) {
      if (user.role !== "SUPERADMIN") router.replace("/");
    }
  }, [sessionLoading, user, router]);

  const [doc, setDoc] = useState<ParamDoc | null>(null);
  const [loading, setLoading] = useState(true);

  const [key, setKey] = useState<ParamKey>("sales");
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function fetchDoc() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/parameters", { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Gagal load parameter");
      setDoc(json?.data ?? null);
    } catch (e: any) {
      setErr(e?.message ?? "Gagal load parameter");
      setDoc(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDoc();
  }, []);

  const listByKey = useMemo(() => {
    const d = doc;
    return {
      sales: d?.sales ?? [],
      segmen: d?.segmen ?? [],
      status_kunjungan: d?.status_kunjungan ?? [],
      posisi: d?.posisi ?? [],
      kegiatan: d?.kegiatan ?? [],
      klpd: d?.klpd ?? [],
    } as Record<ParamKey, string[]>;
  }, [doc]);

  async function onAdd() {
    const v = value.trim();
    if (!v) return;

    setSaving(true);
    setErr("");
    try {
      const res = await fetch("/api/parameters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: v }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Gagal tambah");
      setDoc(json?.data ?? null);
      setValue("");
    } catch (e: any) {
      setErr(e?.message ?? "Gagal tambah");
    } finally {
      setSaving(false);
    }
  }

  async function onDeleteItem(k: ParamKey, v: string) {
    setSaving(true);
    setErr("");
    try {
      const res = await fetch("/api/parameters", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: k, value: v }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Gagal hapus");
      setDoc(json?.data ?? null);
      if (selectedValue === v && selectedKey === k) {
        setSelectedKey(null);
        setSelectedValue(null);
      }
    } catch (e: any) {
      setErr(e?.message ?? "Gagal hapus");
    } finally {
      setSaving(false);
    }
  }

  // optional: “klik item lalu tombol hapus di kanan” feel seperti screenshot
  const [selectedKey, setSelectedKey] = useState<ParamKey | null>(null);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  function pick(k: ParamKey, v: string) {
    setSelectedKey(k);
    setSelectedValue(v);
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex-1 p-6">
          {/* Top bar */}
          <div className="mb-6 flex items-center gap-4">
            <h1 className="text-xl font-extrabold pl-3 tracking-wide text-gray-900">
              PARAMETER
            </h1>
          </div>

          {/* Add box */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/10">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
              <div className="md:col-span-5">
                <div className="text-md font-extrabold tracking-wider text-black">
                  Parameter
                </div>
                <div className="relative mt-2">
                  <select
                    value={key}
                    onChange={(e) => setKey(e.target.value as ParamKey)}
                    className="h-12 w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    {ALL_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {KEY_LABEL[k]}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-600">
                    ▾
                  </span>
                </div>
              </div>

              <div className="md:col-span-5">
                <div className="text-md font-extrabold tracking-wider text-black">
                  Value
                </div>
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onAdd();
                  }}
                  className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Isi value baru..."
                />
              </div>

              <div className="mt-8 md:col-span-2 md:flex md:justify-end">
                <button
                  onClick={onAdd}
                  disabled={saving || !value.trim()}
                  className={cn(
                    "h-12 w-full rounded-xl px-5 text-md font-semibold shadow-sm",
                    saving || !value.trim()
                      ? "bg-blue-700 text-white"
                      : "bg-blue-700 text-white",
                  )}
                >
                  TAMBAH
                </button>
              </div>
            </div>
          </section>

          {/* Grid lists */}
          <section className="mt-6 grid gap-6 md:grid-cols-3">
            {(
              [
                ["sales", "segmen", "status_kunjungan"],
                ["posisi", "kegiatan", "klpd"],
              ] as ParamKey[][]
            )
              .flat()
              .map((k) => (
                <CardList
                  key={k}
                  title={KEY_LABEL[k]}
                  items={listByKey[k]}
                  loading={loading}
                  selected={selectedKey === k ? selectedValue : null}
                  onPick={(v) => pick(k, v)}
                  onDelete={(v) => onDeleteItem(k, v)}
                  disabled={saving}
                />
              ))}
          </section>
        </div>
      </div>
    </div>
  );
}

function CardList({
  title,
  items,
  loading,
  selected,
  onPick,
  onDelete,
  disabled,
}: {
  title: string;
  items: string[];
  loading: boolean;
  selected: string | null;
  onPick: (v: string) => void;
  onDelete: (v: string) => void;
  disabled: boolean;
}) {
  const sorted = useMemo(
    () => [...items].sort((a, b) => a.localeCompare(b)),
    [items],
  );

  return (
<div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/10 overflow-hidden">
  
  {/* TITLE */}
  <div className="bg-blue-300 px-5 py-4 text-md font-extrabold text-black">
    {title}
  </div>

  {/* CONTENT */}
  <div className="bg-white">
  </div>

      <div className="p-2">
        {  sorted.length === 0 ? (
          <div className="text-sm text-gray-500">Belum ada data.</div>
        ) : (
          <div className="space-y-2">
            {sorted.map((v) => {
              const isActive = selected === v;
              return (
                <div
                  key={v}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-4 py-3 ring-1",
                    isActive
                      ? "bg-gray-100 ring-gray-300"
                      : "bg-gray-50 ring-gray-200 hover:bg-gray-200/70",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onPick(v)}
                    className="flex-1 text-left text-sm font-semibold text-black"
                    title="Klik untuk pilih"
                  >
                    {v}
                  </button>

                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onDelete(v)}
                    className={cn(
                      "ml-3 grid h-9 w-9 place-items-center rounded-lg",
                      disabled
                        ? "bg-white"
                        : "bg-gray-100 ring-1 ring-black/10 hover:bg-gray-50",
                    )}
                    aria-label="Delete"
                    title="Hapus"
                  >
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
