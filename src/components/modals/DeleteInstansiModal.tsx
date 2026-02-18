"use client";

import React, { useState } from "react";

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

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "h-11 rounded-full px-6 text-md font-extrabold tracking-wide",
        "bg-white ring-1 ring-black/15 shadow-sm hover:bg-black/5",
        "disabled:opacity-50 disabled:hover:bg-white",
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
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "h-11 rounded-full px-7 text-md font-extrabold tracking-wide text-white",
        "bg-black hover:bg-black/90",
        "disabled:opacity-50",
      )}
    >
      {children}
    </button>
  );
}

export default function DeleteInstansiModal({
  open,
  onClose,
  companyId,
  companyName,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  companyId: string | null;
  companyName?: string;
  onDeleted: () => Promise<void> | void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (!companyId) return;

    setDeleting(true);
    try {
      // ✅ sesuaikan kalau endpoint kamu beda:
      const res = await fetch(`/api/companies/${companyId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Gagal menghapus instansi.");
        return;
      }

      await onDeleted();
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="HAPUS INSTANSI"
      subtitle="Aksi ini tidak bisa dibatalkan."
      widthClass="max-w-5xl"
    >
      <div className="text-md">
        <div className="rounded-2xl bg-white p-5 ring-1 ring-black/10">
          <div className="text-sm text-black/70">Anda yakin ingin menghapus:</div>
          <div className="mt-1 text-base font-extrabold text-black">
            {companyName || "-"}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <PrimaryButton onClick={onClose}>BATAL</PrimaryButton>
          <SolidButton onClick={confirmDelete} disabled={deleting}>
            {deleting ? "MENGHAPUS..." : "HAPUS"}
          </SolidButton>
        </div>
      </div>
    </Modal>
  );
}
