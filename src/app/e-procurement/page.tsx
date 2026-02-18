"use client";

import React, { useMemo, useState, useEffect } from "react";
import Sidebar from "@/components/sidebar/sidebar";
import { useSession } from "@/components/session/SessionProvider";
import { useRouter } from "next/navigation";

type Segment = "RING 1" | "RING 2" | "RING 3" | "RING 4";

type ProductItem = {
  id: string;
  merek: string;
  subKategori: string;
  qty: number;
  spesifikasi: string;
  paguPerItem: number | "";
  hargaTayang: number | "";
  linkInaproc: string;
  linkEcom: string;
};

const SEGMENTS: Segment[] = ["RING 1", "RING 2", "RING 3", "RING 4"];

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function EProcurementRequestPage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();

  // ✅ Guard (opsional): halaman request biasanya untuk SALES/LEADER
  useEffect(() => {
    if (!sessionLoading && user) {
    }
  }, [sessionLoading, user, router]);

  // ===== Header form state =====
  const [requestor, setRequestor] = useState("");
  const [pemohon, setPemohon] = useState("");
  const [segmen, setSegmen] = useState<Segment | "">("");
  const [deadline, setDeadline] = useState<string>("");
  const [lokasi, setLokasi] = useState("");
  const [catatanHeader, setCatatanHeader] = useState("");

  // ===== ID info (footer) =====
  const [infoId, setInfoId] = useState("REQ-");

  // ===== Products state =====
  const [items, setItems] = useState<ProductItem[]>([
    {
      id: "1",
      merek: "",
      subKategori: "",
      qty: 1,
      spesifikasi: "",
      paguPerItem: "",
      hargaTayang: "",
      linkInaproc: "",
      linkEcom: "",
    },
  ]);

  const totalProduk = useMemo(() => items.length, [items]);

  // ===== Modal state =====
  const [openRevisi, setOpenRevisi] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);
  const [revisiId, setRevisiId] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        merek: "",
        subKategori: "",
        qty: 1,
        spesifikasi: "",
        paguPerItem: 0,
        hargaTayang: 0,
        linkInaproc: "",
        linkEcom: "",
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  const updateItem = <K extends keyof ProductItem>(
    id: string,
    key: K,
    value: ProductItem[K],
  ) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [key]: value } : it)),
    );
  };

  // ===== Modal handlers =====
  const closeModal = () => {
    setOpenRevisi(false);
    setOpenUpload(false);
  };

  const handleRevisi = () => setOpenRevisi(true);
  const handleUploadProduk = () => setOpenUpload(true);

  const handleLoadId = async () => {
    alert(`LOAD ID: ${revisiId || "-"}`);
    setOpenRevisi(false);
  };

  const handlePickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setUploadFile(f);
  };

  const handleSubmitUpload = () => {
    alert(`UPLOAD FILE: ${uploadFile?.name ?? "-"}`);
    setOpenUpload(false);
  };

  const handleKirim = () => {
    const payload = {
      header: { requestor, pemohon, segmen, deadline, lokasi, catatanHeader },
      items,
      infoId,
    };
    console.log("SUBMIT:", payload);
    alert("KIRIM REQUEST (placeholder). Cek console untuk payload.");
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="flex">
        {/* SIDEBAR */}
        <Sidebar />

       <div className="flex-1 p-6 h-screen overflow-y-auto">
      <div className="px-3 pt-2 pb-2">
        <h1 className="text-2xl font-extrabold pl-4 text-black">
        E-PROCUREMENT
        </h1>
        <div className="px-6 pb-6">
        </div>
     </div>

  {/* ===== HEADER FORM CARD ===== */}
  <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
    
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <div>
        <label className="text-sm font-semibold text-blue-600">
          REQUESTOR
        </label>
        <div className="relative mt-2">
          <select
            value={requestor}
            onChange={(e) => setRequestor(e.target.value)}
            className="h-12 w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">-- Pilih --</option>
            <option value="Sales A">Sales A</option>
            <option value="Sales B">Sales B</option>
            <option value="Sales C">Sales C</option>
          </select>

          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </div>
      </div>

              <div>
                <label className="text-sm font-semibold text-blue-600">
                  PEMOHON (ENTITY)
                </label>
                <input
                  value={pemohon}
                  onChange={(e) => setPemohon(e.target.value)}
                  className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* SEGMEN */}
              <div>
                <label className="text-sm font-semibold text-blue-600">
                  SEGMEN
                </label>
                <div className="relative mt-2">
                  <select
                    value={segmen}
                    onChange={(e) => setSegmen(e.target.value as Segment)}
                    className="h-12 w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">-- Pilih --</option>
                    {SEGMENTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>

              {/* DEADLINE */}
              <div>
                <label className="text-sm font-semibold text-blue-600">
                  DEADLINE USULAN
                </label>
                <div className="relative mt-2">
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M7 3v2M17 3v2M4 9h16M6 5h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>

              {/* LOKASI */}
              <div>
                <label className="text-sm font-semibold text-blue-600">
                  LOKASI
                </label>
                <input
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* CATATAN HEADER */}
              <div>
                <label className="text-sm font-semibold text-blue-600">
                  CATATAN HEADER
                </label>
                <input
                  value={catatanHeader}
                  onChange={(e) => setCatatanHeader(e.target.value)}
                  className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-1.5">
              <h2 className="text-3xl my-6 font-semibold text-gray-700">
                Daftar Produk
              </h2>
              <span className="grid h-10 min-w-10 place-items-center rounded-xl bg-gray-600 px-3 text-white">
                {totalProduk}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleRevisi}
                className="h-11 rounded-full bg-red-600 px-5 text-sm font-semibold text-white ring-1 ring-black/10 hover:bg-red-700"
              >
                Load/Revisi
              </button>

              <button
                onClick={handleUploadProduk}
                className="h-11 rounded-full bg-green-600 px-5 text-sm font-semibold text-white ring-1 ring-black/10 hover:bg-green-700"
              >
                Upload Produk
              </button>
            </div>
          </section>

          {/* ===== PRODUCT CARDS ===== */}
          <section className="space-y-6">
            {items.map((it, idx) => (
              <div
                key={it.id} // key={`${it.id}-${idx}`}
                className="relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
              >
                <div className="absolute inset-y-0 left-0 w-2 bg-blue-600" />

                <div className="absolute left-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {idx + 1}
                </div>

                <button
                  onClick={() => removeItem(it.id)}
                  className="absolute right-6 top-6 text-gray-500 hover:text-gray-800"
                  aria-label="Remove item"
                  title="Remove item"
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 6 6 18M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>

                <div className="mb-6 p-8 pl-20">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                    <div className="md:col-span-6">
                      <label className="text-sm font-semibold text-blue-600">
                        MEREK PRODUK
                      </label>
                      <input
                        value={it.merek}
                        onChange={(e) =>
                          updateItem(it.id, "merek", e.target.value)
                        }
                        className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="text-sm font-semibold text-blue-600">
                        SUB-KATEGORI
                      </label>
                      <input
                        value={it.subKategori}
                        onChange={(e) =>
                          updateItem(it.id, "subKategori", e.target.value)
                        }
                        className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold text-blue-600">
                        QTY
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={it.qty}
                        onChange={(e) =>
                          updateItem(
                            it.id,
                            "qty",
                            Math.max(1, Number(e.target.value)),
                          )
                        }
                        className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="text-sm font-semibold text-blue-600">
                      SPESIFIKASI DETAIL
                    </label>
                    <textarea
                      value={it.spesifikasi}
                      onChange={(e) =>
                        updateItem(it.id, "spesifikasi", e.target.value)
                      }
                      rows={4}
                      className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-12">
                    <div className="md:col-span-3">
                      <label className="text-sm font-semibold text-blue-600">
                        PAGU PER ITEM
                      </label>
                      <input
                        type="number"
                        value={it.paguPerItem}
                        onChange={(e) =>
                          updateItem(
                            it.id,
                            "paguPerItem",
                            Number(e.target.value),
                          )
                        }
                        className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-sm font-semibold text-blue-600">
                        HARGA TAYANG
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={it.hargaTayang}
                        onChange={(e) =>
                          updateItem(
                            it.id,
                            "hargaTayang",
                            Number(e.target.value),
                          )
                        }
                        className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-sm font-semibold text-blue-600">
                        LINK INAPROC
                      </label>
                      <input
                        value={it.linkInaproc}
                        onChange={(e) =>
                          updateItem(it.id, "linkInaproc", e.target.value)
                        }
                        className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-sm font-semibold text-blue-600">
                        LINK E-COM
                      </label>
                      <input
                        value={it.linkEcom}
                        onChange={(e) =>
                          updateItem(it.id, "linkEcom", e.target.value)
                        }
                        className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-black/5">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
              <div className="md:col-span-4">
                <div className="flex h-14 w-full items-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700">
                  <span className="text-gray-500">ID :</span>
                  <span className="ml-2">{infoId || "-"}</span>
                </div>
              </div>

              <div className="md:col-span-8 flex w-full justify-end gap-4">
                <button
                  onClick={addItem}
                  className="inline-flex h-14 items-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  <span className="text-lg leading-none">+</span> Tambah Barang
                </button>

                <button
                  onClick={handleKirim}
                  className="h-14 rounded-2xl bg-green-700 px-32 text-sm font-extrabold tracking-wide text-white shadow-sm hover:bg-green-800 active:scale-[0.99]"
                >
                  KIRIM REQUEST
                </button>
              </div>
            </div>
          </section>
        </div>

        {openRevisi && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/35"
              onClick={closeModal}
            />
            <div className="relative w-180 max-w-[92vw] rounded-2xl bg-white p-7 shadow-xl">
              <div className="text-sm font-semibold tracking-wide text-gray-900">
                MASUKAN ID
              </div>

              <div className="mt-4 flex overflow-hidden rounded-xl bg-gray-300/70">
                <input
                  value={revisiId}
                  onChange={(e) => setRevisiId(e.target.value)}
                  className="h-12 flex-1 bg-transparent px-4 text-sm outline-none"
                />
                <button
                  onClick={handleLoadId}
                  className="h-12 bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  LOAD ID
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== MODAL UPLOAD ===== */}
        {openUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/35"
              onClick={closeModal}
            />
            <div className="relative w-180 max-w-[92vw] rounded-2xl bg-white p-7 shadow-xl">
              <div className="text-sm font-semibold tracking-wide text-gray-900">
                UPLOAD EXCEL
              </div>

              <div className="mt-4 rounded-xl bg-gray-300/70 px-4 py-3">
                <label className="flex cursor-pointer items-center justify-center gap-3 rounded-lg py-2 text-sm font-semibold text-gray-700 hover:bg-black/5">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handlePickFile}
                  />
                  PILIH FILE
                  {uploadFile && (
                    <span className="ml-2 text-xs font-medium text-gray-600">
                      ({uploadFile.name})
                    </span>
                  )}
                </label>
              </div>

              <div className="mt-3 text-center text-sm text-gray-800">
                Unduh Template?{" "}
                <a
                  href="/templates/template-eproc.xlsx"
                  className="font-semibold text-blue-600 hover:underline"
                  download
                >
                  download
                </a>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={closeModal}
                  className="h-10 rounded-lg bg-white px-4 text-sm font-semibold ring-1 ring-black/10 hover:bg-gray-50"
                >
                  BATAL
                </button>
                <button
                  onClick={handleSubmitUpload}
                  className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  UPLOAD
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
