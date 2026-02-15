"use client";

import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  role: "SUPERADMIN" | "ADMIN" | "LEADER" | "SALES";
  onSuccess?: () => void; // opsional: misal refresh suggestion setelah submit
};

export default function RegisterCompanyModal({
  open,
  onClose,
  role,
  onSuccess,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  const [form, setForm] = useState({
    institusi_kerja: "",
    kota_kab: "",
    klpd: "",
    satuan_kerja: "",
    status_ring: "",
    pic_nama: "",
    pic_telp: "",
    pic_jabatan: "",
    pic_role: "",
  });

  const [saving, setSaving] = useState(false);

  function resetForm() {
    setForm({
      institusi_kerja: "",
      kota_kab: "",
      klpd: "",
      satuan_kerja: "",
      status_ring: "",
      pic_nama: "",
      pic_telp: "",
      pic_jabatan: "",
      pic_role: "",
    });
  }

  async function submit() {
    const payload = {
      institusi_kerja: form.institusi_kerja.trim(),
      kota_kab: form.kota_kab.trim(),
      klpd: form.klpd.trim(),
      satuan_kerja: form.satuan_kerja.trim(),
      status_ring: form.status_ring,
      pic_default: {
        nama: form.pic_nama.trim(),
        no_telp: form.pic_telp.trim(),
        jabatan: form.pic_jabatan.trim(),
        role: form.pic_role.trim(),
      },
    };

    if (!payload.institusi_kerja || !payload.status_ring) {
      alert("Nama institusi dan Status Ring wajib diisi.");
      return;
    }

    const endpoint =
      role === "SUPERADMIN" ? "/api/companies" : "/api/company-requests";

    try {
      setSaving(true);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(json?.error || "Gagal submit");
        return;
      }

      alert(
        role === "SUPERADMIN"
          ? "Instansi berhasil ditambahkan (Approved)."
          : "Request instansi berhasil dikirim (Pending)."
      );

      resetForm();
      onSuccess?.();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  if (!mounted || !open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        aria-label="Close modal overlay"
      />

      {/* modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/10">
          {/* header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <div className="text-lg font-extrabold text-black">
                REGISTER COMPANY
              </div>
              <div className="text-xs text-gray-500">
                {role === "SUPERADMIN"
                  ? "Akan langsung masuk ke daftar instansi (Approved)."
                  : "Akan masuk ke pending request untuk di-approve Super Admin."}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-full bg-gray-100 text-xl font-black text-gray-700 hover:bg-gray-200"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* body */}
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-800">
                  Nama Institusi
                </label>
                <input
                  value={form.institusi_kerja}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, institusi_kerja: e.target.value }))
                  }
                  className="mt-2 h-12 w-full rounded-xl bg-gray-50 px-4 text-sm ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-gray-800">
                    Kota/Kabupaten
                  </label>
                  <input
                    value={form.kota_kab}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, kota_kab: e.target.value }))
                    }
                    className="mt-2 h-12 w-full rounded-xl bg-gray-50 px-4 text-sm ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-black/20"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-800">
                    KLPD
                  </label>
                  <input
                    value={form.klpd}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, klpd: e.target.value }))
                    }
                    className="mt-2 h-12 w-full rounded-xl bg-gray-50 px-4 text-sm ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-black/20"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-800">
                    Satuan Kerja
                  </label>
                  <input
                    value={form.satuan_kerja}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, satuan_kerja: e.target.value }))
                    }
                    className="mt-2 h-12 w-full rounded-xl bg-gray-50 px-4 text-sm ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-black/20"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-800">
                    Status Ring
                  </label>
                  <select
                    value={form.status_ring}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, status_ring: e.target.value }))
                    }
                    className="mt-2 h-12 w-full rounded-xl bg-gray-50 px-4 text-sm ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-black/20"
                  >
                    <option value="">Pilih...</option>
                    <option value="RING 1">RING 1</option>
                    <option value="RING 2">RING 2</option>
                    <option value="RING 3">RING 3</option>
                    <option value="RING 4">RING 4</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-800">
                    Nama PIC
                  </label>
                  <input
                    value={form.pic_nama}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, pic_nama: e.target.value }))
                    }
                    className="mt-2 h-12 w-full rounded-xl bg-gray-50 px-4 text-sm ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-black/20"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-800">
                    No. Telepon PIC
                  </label>
                  <input
                    value={form.pic_telp}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, pic_telp: e.target.value }))
                    }
                    className="mt-2 h-12 w-full rounded-xl bg-gray-50 px-4 text-sm ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-black/20"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-800">
                    Jabatan PIC
                  </label>
                  <input
                    value={form.pic_jabatan}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, pic_jabatan: e.target.value }))
                    }
                    className="mt-2 h-12 w-full rounded-xl bg-gray-50 px-4 text-sm ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-black/20"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-800">
                    Role PIC
                  </label>
                  <input
                    value={form.pic_role}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, pic_role: e.target.value }))
                    }
                    className="mt-2 h-12 w-full rounded-xl bg-gray-50 px-4 text-sm ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-black/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="flex items-center justify-between gap-3 border-t px-6 py-4">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="h-11 rounded-full bg-white px-6 text-sm font-extrabold ring-1 ring-black/10 hover:bg-gray-50"
              disabled={saving}
            >
              Batal
            </button>

            <button
              type="button"
              onClick={submit}
              disabled={saving}
              className="h-11 rounded-full bg-gray-900 px-8 text-sm font-extrabold text-white hover:bg-black disabled:opacity-60"
            >
              {saving ? "SUBMIT..." : "SUBMIT"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
