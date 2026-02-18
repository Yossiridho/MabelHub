"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/* ================== UI (SAMA SEPERTI SEBELUMNYA) ================== */
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
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "h-11 rounded-full px-6 text-md font-extrabold tracking-wide",
        "bg-white ring-1 ring-black/15 shadow-sm hover:bg-black/5",
        "disabled:opacity-50 disabled:hover:bg-white",
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
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "h-11 rounded-full px-7 text-md font-extrabold tracking-wide text-white",
        "bg-black hover:bg-black/90",
        "disabled:opacity-50",
        className || "",
      )}
    >
      {children}
    </button>
  );
}

/* ================== LOGIC ================== */
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

export default function AddInstansiModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}) {
  const [savingAdd, setSavingAdd] = useState(false);
  const [forms, setForms] = useState<InstansiForm[]>([emptyForm()]);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setForms([emptyForm()]);
    setSavingAdd(false);
  }, [open]);

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

  async function submitAddInstansi() {
    if (!canSubmit) {
      alert(
        "Lengkapi: Nama Institusi, Kota/Kabupaten, KLPD, Satuan Kerja, Status Segmen.",
      );
      return;
    }

    setSavingAdd(true);
    try {
      for (const f of forms) {
        const payload = {
          institusi_kerja: f.institusi_kerja,
          kota_kab: f.kota_kab,
          klpd: f.klpd,
          satuan_kerja: f.satuan_kerja,
          status_ring: f.status_ring,
          kode_dinas: f.kode_dinas,
          pic_default: {
            nama: f.pic_nama,
            no_telp: f.pic_telp,
            jabatan: f.pic_jabatan,
            role: f.pic_role,
          },
        };

        const res = await fetch("/api/companies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          alert(err?.error || "Gagal menambah instansi (sebagian).");
          return;
        }
      }

      await onSaved();
      onClose();
    } finally {
      setSavingAdd(false);
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

          // template kamu tidak punya kode_dinas → kosongkan saja
          kode_dinas: "",

          pic_nama: String(r["Nama PIC"] || "").trim(),
          pic_telp: String(r["No Telepon PIC"] || "").trim(),
          pic_jabatan: String(r["Jabatan PIC"] || "").trim(),
          pic_role: String(r["Role PIC"] || "").trim(),
        }))
        // anggap row valid kalau minimal ada institusi/kota/klpd/satuan kerja
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
    <Modal
      open={open}
      onClose={onClose}
      title="Tambah Instansi"
      subtitle="Tambah instansi langsung APPROVED (khusus SUPER ADMIN)."
      widthClass="max-w-5xl"
    >
      <div className="flex h-[72vh] flex-col">
        <div className="-mt-3 mb-4 text-xs text-black/60">
          Download template?{" "}
          <a
            href="/templates/template_instansi.xlsx"
            className="font-extrabold text-black underline"
            download
          >
            download
          </a>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 gap-6">
            {forms.map((form, idx) => (
              <div key={idx} className="rounded-2xl bg-white/0">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-xs font-extrabold tracking-wide text-black/70">
                    INSTANSI #{idx + 1}
                  </div>

                  {forms.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeAt(idx)}
                      className="rounded-lg bg-white px-3 py-2 text-xs font-extrabold ring-1 ring-black/15 hover:bg-black/5"
                    >
                      HAPUS
                    </button>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <Field label="NAMA INSTITUSI">
                    <Input
                      value={form.institusi_kerja}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateForm(idx, { institusi_kerja: e.target.value })
                      }
                      placeholder="Contoh: PLN / RSUD / Dinkes..."
                    />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="KOTA/KABUPATEN">
                      <Input
                        value={form.kota_kab}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateForm(idx, { kota_kab: e.target.value })
                        }
                        placeholder="Contoh: Kota Bandung"
                      />
                    </Field>

                    <Field label="KLPD">
                      <Input
                        value={form.klpd}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateForm(idx, { satuan_kerja: e.target.value })
                        }
                        placeholder="Contoh: Dinas / Office / Unit kerja..."
                      />
                    </Field>

                    <Field label="STATUS SEGMEN (RING)">
                      <Select
                        value={form.status_ring}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          updateForm(idx, { status_ring: e.target.value })
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateForm(idx, { kode_dinas: e.target.value })
                        }
                        placeholder="Contoh: B2-CSMS"
                      />
                    </Field>

                    <Field label="ROLE PIC (OPSIONAL)">
                      <Select
                        value={form.pic_role}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateForm(idx, { pic_nama: e.target.value })
                        }
                        placeholder="Contoh: Pak Rama"
                      />
                    </Field>

                    <Field label="NO. TELEPON PIC (OPSIONAL)">
                      <Input
                        value={form.pic_telp}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateForm(idx, { pic_telp: e.target.value })
                        }
                        placeholder="Contoh: 62812xxxx"
                      />
                    </Field>
                  </div>

                  <Field label="JABATAN PIC (OPSIONAL)">
                    <Input
                      value={form.pic_jabatan}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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

        {/* KOTAK HIJAU BAWAH (FIX) */}
        <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-5">
          <PrimaryButton onClick={addMore}>+ TAMBAH INSTANSI</PrimaryButton>

          <div className="flex gap-3">
            <PrimaryButton
              onClick={() => fileRef.current?.click()}
              disabled={savingAdd}
            >
              UPLOAD
            </PrimaryButton>

            <SolidButton
              onClick={submitAddInstansi}
              disabled={savingAdd || !canSubmit}
            >
              {savingAdd ? "MENYIMPAN..." : "SUBMIT"}
            </SolidButton>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              await handleUploadExcel(f);
            }}
          />
        </div>
      </div>
    </Modal>
  );
}
