import React, { useState } from "react";

export type ExportScope = "page" | "all";

export interface ExportColumn {
  id: string;
  label: string;
}

interface ExportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ExportColumn[];
  onExport: (selectedColumnIds: string[], scope: ExportScope) => void;
  isLoading?: boolean;
}

export default function ExportExcelModal({
  isOpen,
  onClose,
  columns,
  onExport,
  isLoading = false,
}: ExportExcelModalProps) {
  const [scope, setScope] = useState<ExportScope>("page");

  // By default, select all columns
  const [selectedCols, setSelectedCols] = useState<Set<string>>(
    new Set(columns.map((c) => c.id)),
  );

  if (!isOpen) return null;

  const handleToggleCol = (id: string) => {
    const next = new Set(selectedCols);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedCols(next);
  };

  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedCols(new Set(columns.map((c) => c.id)));
    } else {
      setSelectedCols(new Set());
    }
  };

  const handleExportClick = () => {
    if (selectedCols.size === 0) {
      alert("Pilih minimal 1 kolom untuk di-export.");
      return;
    }
    onExport(Array.from(selectedCols), scope);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Export Excel</h2>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Pilih Data yang Diexport:
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="exportScope"
                value="page"
                checked={scope === "page"}
                onChange={() => setScope("page")}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-800">Halaman Ini Saja</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="exportScope"
                value="all"
                checked={scope === "all"}
                onChange={() => setScope("all")}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-800">
                Semua Data (Berdasarkan Filter)
              </span>
            </label>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700">
              Pilih Kolom:
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSelectAll(true)}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Pilih Semua
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => handleSelectAll(false)}
                className="text-xs text-red-600 hover:underline font-medium"
              >
                Hapus Semua
              </button>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50/50 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {columns.map((col) => (
              <label
                key={col.id}
                className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCols.has(col.id)}
                  onChange={() => handleToggleCol(col.id)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 whitespace-nowrap"
                />
                <span
                  className="text-xs font-medium text-gray-700 truncate"
                  title={col.label}
                >
                  {col.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 border-t border-gray-100 pt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
            disabled={isLoading}
          >
            Batal
          </button>
          <button
            onClick={handleExportClick}
            disabled={isLoading || selectedCols.size === 0}
            className="px-4 py-2 text-sm font-bold text-white bg-green-600 rounded-xl shadow-sm ring-1 ring-green-700 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? "Mengekspor..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}
