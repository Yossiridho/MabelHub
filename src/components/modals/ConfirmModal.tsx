"use client";

import React from "react";

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export default function ConfirmModal({
  open,
  title,
  message,
  confirmText = "HAPUS",
  cancelText = "BATAL",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 transition-opacity"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3
            className="text-lg font-bold leading-6 text-gray-900"
            id="modal-title"
          >
            {title}
          </h3>
        </div>
        <div className="mt-4 text-sm text-gray-500">{message}</div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={cn(
              "inline-flex justify-center rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm focus-visible:outline focus-visible:outline-offset-2",
              confirmText === "HAPUS" && !loading
                ? "bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600"
                : "",
              confirmText !== "HAPUS" && !loading
                ? "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600"
                : "",
              loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "",
            )}
          >
            {loading ? "Menunggu..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
