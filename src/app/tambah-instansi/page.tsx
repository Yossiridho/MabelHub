"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/sidebar";
import { useSession } from "@/components/session/SessionProvider";

type Role = "SUPERADMIN" | "ADMIN" | "LEADER" | "SALES";

type InstansiForm = {
  institusi_kerja: string;
  kota_kab: string;
  klpd: string;
  satuan_kerja: string;
  status_ring: string;
  kode_dinas: string;
  pic_nama: string;
  pic_telp: string;
  pic_jabatan: string;
  pic_role: string;
};

function clsx(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold tracking-wide text-black/70">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "h-11 w-full rounded-xl bg-white px-4 text-md text-black outline-none",
        "ring-1 ring-black/10 focus:ring-2 focus:ring-black/20",
        props.className || "",
      )}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={clsx(
        "h-11 w-full rounded-xl bg-white px-4 text-sm text-gray-500 outline-none",
        "ring-1 ring-black/10 focus:ring-2 focus:ring-black/20",
        props.className || "",
      )}
    />
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  className,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "h-11 rounded-full px-6 text-md font-extrabold tracking-wide",
        "ring-1 ring-black/15 shadow-sm hover:bg-black/5",
        className || "",
      )}
    >
      {children}
    </button>
  );
}

function SolidButton({
  children,
  onClick,
  disabled,
  className,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "h-11 rounded-full px-7 text-md font-extrabold tracking-wider ring-1",
        "ring-1 ring-black/15 shadow-sm hover:bg-black/5",
        className || "",
      )}
    >
      {children}
    </button>
  );
}

const emptyForm = (): InstansiForm => ({
  institusi_kerja: "",
  kota_kab: "",
  klpd: "",
  satuan_kerja: "",
  status_ring: "",
  kode_dinas: "",
  pic_nama: "",
  pic_telp: "",
  pic_jabatan: "",
  pic_role: "",
});

export default function AddInstansiPage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();

  // ✅ multi instansi (layout seperti yang kamu mau: scroll tengah, footer fixed)
  const [forms, setForms] = useState<InstansiForm[]>([emptyForm()]);
  const [saving, setSaving] = useState(false);

  // file upload excel (opsional, kalau kamu tetap pakai)
  const fileRef = useRef<HTMLInputElement | null>(null);

  // role guard
  useEffect(() => {
    if (sessionLoading) return;
    if (!user) return;

    const ok =
      user.role === "SALES" ||
      user.role === "LEADER" ||
      user.role === "ADMIN" ||
      user.role === "SUPERADMIN";

    if (!ok) router.replace("/");
  }, [sessionLoading, user, router]);

  const role = (user?.role || "SALES") as Role;

  // ✅ bedakan fungsi berdasarkan role
  const isDirectApproved = role === "SUPERADMIN" || role === "ADMIN";
  const endpoint = isDirectApproved
    ? "/api/companies"
    : "/api/company-requests";

  const title = isDirectApproved ? "TAMBAH INSTANSI" : "REGISTER COMPANY";
  const subtitle = isDirectApproved
    ? "Tambah instansi langsung APPROVED."
    : "Request instansi akan masuk ke pending (menunggu approve).";

  function updateForm(idx: number, patch: Partial<InstansiForm>) {
    setForms((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }

  function addMore() {
    setForms((prev) => [...prev, emptyForm()]);
  }

  function removeAt(idx: number) {
    setForms((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== idx);
    });
  }

  const canSubmit = useMemo(() => {
    return forms.every(
      (f) =>
        f.institusi_kerja &&
        f.kota_kab &&
        f.klpd &&
        f.satuan_kerja &&
        f.status_ring,
    );
  }, [forms]);

  async function submit() {
    if (!canSubmit) {
      alert(
        "Lengkapi: Nama Institusi, Kota/Kabupaten, KLPD, Satuan Kerja, Status Segmen.",
      );
      return;
    }

    setSaving(true);
    try {
      for (const f of forms) {
        const payload = {
          institusi_kerja: f.institusi_kerja.trim(),
          kota_kab: f.kota_kab.trim(),
          klpd: f.klpd.trim(),
          satuan_kerja: f.satuan_kerja.trim(),
          status_ring: f.status_ring,
          kode_dinas: f.kode_dinas.trim(),
          pic_default: {
            nama: f.pic_nama.trim(),
            no_telp: f.pic_telp.trim(),
            jabatan: f.pic_jabatan.trim(),
            role: f.pic_role.trim(),
          },
        };

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          alert(json?.error || "Gagal submit.");
          return;
        }
      }

      alert(
        isDirectApproved
          ? "Instansi berhasil ditambahkan (Approved)."
          : "Request berhasil dikirim (Pending).",
      );

      // reset & balik
      setForms([emptyForm()]);
      router.back();
    } finally {
      setSaving(false);
    }
  }
  async function handleUploadExcel(file: File) {
    try {
      const XLSX = await import("xlsx");

      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];

      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, {
        defval: "",
      });

      const mapped: InstansiForm[] = rows
        .map((r) => ({
          institusi_kerja: String(r["Institusi Kerja"] || "").trim(),
          kota_kab: String(r["Kota/Kabupaten"] || "").trim(),
          klpd: String(r["KLPD"] || "").trim(),
          satuan_kerja: String(r["Satuan Kerja"] || "").trim(),
          status_ring: String(r["Status Ring"] || "").trim(),

          kode_dinas: "",

          pic_nama: String(r["Nama PIC"] || "").trim(),
          pic_telp: String(r["No Telepon PIC"] || "").trim(),
          pic_jabatan: String(r["Jabatan PIC"] || "").trim(),
          pic_role: String(r["Role PIC"] || "").trim(),
        }))
        .filter(
          (x) =>
            x.institusi_kerja ||
            x.kota_kab ||
            x.klpd ||
            x.satuan_kerja ||
            x.status_ring,
        );

      if (mapped.length === 0) {
        alert(
          "File kosong / header tidak sesuai. Pastikan pakai sheet 'Template' dan isi mulai baris ke-2.",
        );
        return;
      }

      setForms(mapped);
    } catch (e) {
      alert("Gagal membaca Excel. Pastikan file .xlsx valid.");
    }
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="flex">
        <Sidebar />

        <div className="flex-1 p-6 min-h-screen overflow-y-auto">
          <main className="mx-auto pt-4 max-w-10xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => router.back()}
                    className="grid h-10 w-10 place-items-center rounded-full bg-white/70 text-gray-700 shadow-sm ring-1 ring-black/10 hover:bg-white"
                    aria-label="Back"
                  >
                    ←
                  </button>
                  <div className="flex flex-col">
                    <h1 className="text-2xl font-extrabold text-black">
                      {title}
                    </h1>
                    <p className="text-xs text-black/60">{subtitle}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* card container */}
            <div className="pt-6 rounded-2xl bg-white p-6 ring-1 ring-gray-200">
              <div className="mt-4 mb-4 text-md text-black">
                Download template?{" "}
                <a
                  href="/templates/template_instansi.xlsx"
                  className="font-extrabold text-black underline"
                  download
                >
                  download
                </a>
              </div>

              {/* layout: middle scroll */}
              <div className="flex flex-col">
                <div className="flex-1 overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 gap-6">
                    {forms.map((form, idx) => (
                      <div key={idx}>
                        <div className="mb-3 flex items-center justify-between">
                          <div className="text-md font-extrabold tracking-wide text-black">
                            INSTANSI {idx + 1}
                          </div>

                          {forms.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => removeAt(idx)}
                              className="rounded-full bg-white px-3 py-2 text-xs font-extrabold ring-1 ring-gray-300 hover:bg-gray-300"
                            >
                              X
                            </button>
                          ) : null}
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <Field label="NAMA INSTITUSI">
                            <Input
                              value={form.institusi_kerja}
                              onChange={(e) =>
                                updateForm(idx, {
                                  institusi_kerja: e.target.value,
                                })
                              }
                              placeholder="Contoh: PLN / RSUD / Dinkes..."
                            />
                          </Field>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Field label="KOTA/KABUPATEN">
                              <Input
                                value={form.kota_kab}
                                onChange={(e) =>
                                  updateForm(idx, { kota_kab: e.target.value })
                                }
                                placeholder="Contoh: Kota Bandung"
                              />
                            </Field>

                            <Field label="KLPD">
                              <Input
                                value={form.klpd}
                                onChange={(e) =>
                                  updateForm(idx, { klpd: e.target.value })
                                }
                                placeholder="Contoh: BUMN / B2B / Kementerian..."
                              />
                            </Field>
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Field label="SATUAN KERJA">
                              <Input
                                value={form.satuan_kerja}
                                onChange={(e) =>
                                  updateForm(idx, {
                                    satuan_kerja: e.target.value,
                                  })
                                }
                                placeholder="Contoh: Dinas / Office / Unit kerja..."
                              />
                            </Field>

                            <Field label="STATUS SEGMEN (RING)">
                              <Select
                                value={form.status_ring}
                                onChange={(e) =>
                                  updateForm(idx, {
                                    status_ring: e.target.value,
                                  })
                                }
                              >
                                <option value="">Pilih...</option>
                                <option value="RING 1">RING 1</option>
                                <option value="RING 2">RING 2</option>
                                <option value="RING 3">RING 3</option>
                                <option value="RING 4">RING 4</option>
                              </Select>
                            </Field>
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Field label="KODE DINAS (OPSIONAL)">
                              <Input
                                value={form.kode_dinas}
                                onChange={(e) =>
                                  updateForm(idx, {
                                    kode_dinas: e.target.value,
                                  })
                                }
                                placeholder="Contoh: B2-CSMS"
                              />
                            </Field>

                            <Field label="ROLE PIC (OPSIONAL)">
                              <Select
                                value={form.pic_role}
                                onChange={(e) =>
                                  updateForm(idx, { pic_role: e.target.value })
                                }
                              >
                                <option value="">Pilih...</option>
                                <option value="Kepala">Kepala</option>
                                <option value="Staff">Staff</option>
                                <option value="Pengadaan">Pengadaan</option>
                                <option value="IT">IT</option>
                              </Select>
                            </Field>
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Field label="NAMA PIC (OPSIONAL)">
                              <Input
                                value={form.pic_nama}
                                onChange={(e) =>
                                  updateForm(idx, { pic_nama: e.target.value })
                                }
                                placeholder="Contoh: Pak Rama"
                              />
                            </Field>

                            <Field label="NO. TELEPON PIC (OPSIONAL)">
                              <Input
                                value={form.pic_telp}
                                onChange={(e) =>
                                  updateForm(idx, { pic_telp: e.target.value })
                                }
                                placeholder="Contoh: 62812xxxx"
                              />
                            </Field>
                          </div>

                          <Field label="JABATAN PIC (OPSIONAL)">
                            <Input
                              value={form.pic_jabatan}
                              onChange={(e) =>
                                updateForm(idx, { pic_jabatan: e.target.value })
                              }
                              placeholder="Contoh: Pengadaan / IT / Kepala Bagian..."
                            />
                          </Field>
                        </div>

                        {idx < forms.length - 1 ? (
                          <div className="mt-6 border-t border-black/10" />
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                {/* footer fixed */}
                <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-5">
                  <PrimaryButton
                    onClick={addMore}
                    className="bg-blue-600 text-gray-100 hover:bg-blue-700"
                  >
                    TAMBAH INSTANSI
                  </PrimaryButton>

                  <div className="flex gap-3">
                    <PrimaryButton
                      onClick={() => fileRef.current?.click()}
                      disabled={saving}
                      className="bg-green-600 text-gray-100 hover:bg-green-700"
                    >
                      UPLOAD
                    </PrimaryButton>

                    <SolidButton
                      onClick={submit}
                      disabled={saving || !canSubmit}
                      className="bg-blue-600 text-gray-100 hover:bg-blue-700"
                    >
                      {saving ? "MENYIMPAN..." : "SUBMIT"}
                    </SolidButton>
                  </div>

                  <input ref={fileRef} type="file" className="hidden" />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          await handleUploadExcel(f);
        }}
      />
    </div>
  );
}
