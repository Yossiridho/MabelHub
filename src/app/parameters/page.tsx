"use client";

import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/sidebar/sidebar";
import { useSession } from "@/components/session/SessionProvider";
import { useRouter } from "next/navigation";

type ParamKey =
  | "kota_kabupaten"
  | "klpd"
  | "ring"
  | "segmen"
  | "posisi"
  | "status_kunjungan"
  | "kegiatan"
  | "perusahaan";

type ParamDoc = {
  _id: string;
  kota_kabupaten: string[];
  klpd: string[];
  ring: string[];
  segmen: string[];
  posisi: string[];
  status_kunjungan: string[];
  kegiatan: string[];
  perusahaan: string[];
  updatedAt?: string;
};

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

const KEY_LABEL: Record<ParamKey, string> = {
  kota_kabupaten: "Kota/Kabupaten",
  klpd: "KLPD",
  ring: "Ring",
  segmen: "Segmen",
  posisi: "Posisi",
  status_kunjungan: "Status Kunjungan",
  kegiatan: "Kegiatan",
  perusahaan: "Perusahaan",
};

const ALL_KEYS: ParamKey[] = [
  "kota_kabupaten",
  "klpd",
  "ring",
  "segmen",
  "posisi",
  "status_kunjungan",
  "kegiatan",
  "perusahaan",
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

  const [key, setKey] = useState<ParamKey>("kota_kabupaten");
  const [value, setValue] = useState("");
  const [parentRing, setParentRing] = useState(""); // Untuk Segmen
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
      kota_kabupaten: d?.kota_kabupaten ?? [],
      klpd: d?.klpd ?? [],
      ring: d?.ring ?? [],
      segmen: d?.segmen ?? [],
      posisi: d?.posisi ?? [],
      status_kunjungan: d?.status_kunjungan ?? [],
      kegiatan: d?.kegiatan ?? [],
      perusahaan: d?.perusahaan ?? [],
    } as Record<ParamKey, string[]>;
  }, [doc]);

  async function onAdd() {
    const v = value.trim();
    if (!v) return;

    let finalValue = v;
    if (key === "segmen") {
      if (!parentRing) {
        setErr("Silakan pilih Parent Ring untuk segmen ini!");
        return;
      }
      finalValue = `${parentRing}::${v}`;
    }

    setSaving(true);
    setErr("");
    try {
      const res = await fetch("/api/parameters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: finalValue }),
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

              {key === "segmen" && (
                <div className="md:col-span-3">
                  <div className="text-md font-extrabold tracking-wider text-black">
                    Parent Ring
                  </div>
                  <div className="relative mt-2">
                    <select
                      value={parentRing}
                      onChange={(e) => setParentRing(e.target.value)}
                      className="h-12 w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="">Pilih Ring...</option>
                      {listByKey.ring.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-600">
                      ▾
                    </span>
                  </div>
                </div>
              )}

              <div
                className={cn(
                  key === "segmen" ? "md:col-span-2" : "md:col-span-5",
                )}
              >
                <div className="text-md font-extrabold tracking-wider text-black">
                  Value Baru
                </div>
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onAdd();
                  }}
                  className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Isi value..."
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
                ["kota_kabupaten", "klpd", "ring"],
                ["segmen", "posisi", "status_kunjungan"],
                ["kegiatan", "perusahaan"],
              ] as ParamKey[][]
            )
              .flat()
              .map((k) => (
                <CardList
                  key={k}
                  title={KEY_LABEL[k]}
                  items={listByKey[k]}
                  loading={loading}
                  onDelete={(v) => onDeleteItem(k, v)}
                  isSegmen={k === "segmen"}
                />
              ))}
          </section>
        </div>
      </div>
    </div>
  );
}

function formatSegmen(raw: string) {
  if (!raw.includes("::")) return raw;
  const [r, s] = raw.split("::");
  return `${s} (${r})`;
}

function CardList({
  title,
  items,
  loading,
  onDelete,
  isSegmen,
}: {
  title: string;
  items: string[];
  loading: boolean;
  onDelete: (v: string) => void;
  isSegmen?: boolean;
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
      <div className="bg-white"></div>

      <div className="p-2">
        {sorted.length === 0 ? (
          <div className="text-sm text-gray-500">Belum ada data.</div>
        ) : (
          <div className="space-y-2">
            {sorted.map((v) => {
              return (
                <div
                  key={v}
                  className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 ring-1 ring-gray-200 hover:bg-gray-200/70"
                >
                  <span className="flex-1 text-left text-sm font-semibold text-black">
                    {isSegmen ? formatSegmen(v) : v}
                  </span>

                  <button
                    type="button"
                    onClick={() => onDelete(v)}
                    className="ml-3 grid h-9 w-9 place-items-center rounded-lg bg-white ring-1 ring-black/10 hover:bg-gray-100"
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
