"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/session/SessionProvider";
import {
  BookOpen,
  ShoppingBag,
  Award,
  Briefcase,
  FileText,
  Shield,
  Monitor,
  Tag,
  Layers,
  Wrench,
  ChevronRight,
  Search,
  Package,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = {
  id: string;
  name: string;
  docCount: number;
  icon: React.ReactNode;
  iconBg: string;
  superAdminOnly: boolean;
  description: string;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const ALL_CATEGORIES: Category[] = [
  {
    id: "brochure",
    name: "Brochure",
    docCount: 4,
    icon: <BookOpen className="w-7 h-7" />,
    iconBg: "bg-blue-100 text-blue-600",
    superAdminOnly: false,
    description: "Brosur produk & layanan",
  },
  {
    id: "catalogue",
    name: "Catalogue",
    docCount: 4,
    icon: <ShoppingBag className="w-7 h-7" />,
    iconBg: "bg-purple-100 text-purple-600",
    superAdminOnly: false,
    description: "Katalog produk lengkap",
  },
  {
    id: "company-profile",
    name: "Company Profile",
    docCount: 5,
    icon: <Briefcase className="w-7 h-7" />,
    iconBg: "bg-orange-100 text-orange-600",
    superAdminOnly: false,
    description: "Profil perusahaan resmi",
  },
  {
    id: "datasheet",
    name: "Datasheet",
    docCount: 2,
    icon: <FileText className="w-7 h-7" />,
    iconBg: "bg-pink-100 text-pink-600",
    superAdminOnly: false,
    description: "Lembar data teknis produk",
  },
  {
    id: "presentation-materials",
    name: "Presentation Materials",
    docCount: 6,
    icon: <Monitor className="w-7 h-7" />,
    iconBg: "bg-violet-100 text-violet-600",
    superAdminOnly: false,
    description: "Materi presentasi sales",
  },
  {
    id: "pricelist",
    name: "Pricelist",
    docCount: 1,
    icon: <Tag className="w-7 h-7" />,
    iconBg: "bg-emerald-100 text-emerald-600",
    superAdminOnly: false,
    description: "Daftar harga produk & jasa",
  },
  {
    id: "id-kit",
    name: "ID KIT",
    docCount: 4,
    icon: <Layers className="w-7 h-7" />,
    iconBg: "bg-rose-100 text-rose-600",
    superAdminOnly: false,
    description: "Identitas visual & kit brand",
  },
  {
    id: "tools",
    name: "Tools",
    docCount: 3,
    icon: <Wrench className="w-7 h-7" />,
    iconBg: "bg-cyan-100 text-cyan-600",
    superAdminOnly: false,
    description: "Alat bantu & template kerja",
  },
  // ── SuperAdmin only ──
  {
    id: "certification",
    name: "Certification",
    docCount: 10,
    icon: <Award className="w-7 h-7" />,
    iconBg: "bg-yellow-100 text-yellow-600",
    superAdminOnly: true,
    description: "Sertifikat & akreditasi resmi",
  },
  {
    id: "legalitas",
    name: "Legalitas",
    docCount: 4,
    icon: <Shield className="w-7 h-7" />,
    iconBg: "bg-indigo-100 text-indigo-600",
    superAdminOnly: true,
    description: "Dokumen legal & perizinan",
  },
];

// ─── Category Card ─────────────────────────────────────────────────────────────

function CategoryCard({
  cat,
  onClick,
  isSuperAdmin,
}: {
  cat: Category;
  onClick: () => void;
  isSuperAdmin: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 hover:shadow-md hover:ring-blue-200 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col"
    >
      {/* SuperAdmin badge */}
      {cat.superAdminOnly && isSuperAdmin && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200">
            <Shield className="w-2.5 h-2.5" />
            SUPERADMIN
          </span>
        </div>
      )}

      {/* Top gradient accent */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-400 rounded-t-2xl" />

      <div className="flex flex-col gap-4 p-6 flex-1">
        {/* Icon */}
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center ${cat.iconBg} group-hover:scale-105 transition-transform duration-200`}
        >
          {cat.icon}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-base leading-tight">
            {cat.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
          <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
            <Package className="w-3 h-3" />
            {cat.docCount} Dokumen
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold text-green-700 ring-1 ring-green-200">
            <span className="text-green-500">🔓</span>
            Terbuka
          </span>

          <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:gap-2 transition-all">
            Lihat semua
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ProdukPage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();

  const [search, setSearch] = useState("");

  const isSuperAdmin = user?.role === "SUPERADMIN";

  // Filter categories by role & search
  const visibleCategories = ALL_CATEGORIES.filter((cat) => {
    if (cat.superAdminOnly && !isSuperAdmin) return false;
    if (search.trim()) {
      return cat.name.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  // Guard: wait for session
  useEffect(() => {
    if (!sessionLoading && !user) router.replace("/");
  }, [sessionLoading, user, router]);

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-blue-50 grid place-items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-blue-900 uppercase tracking-widest animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="flex-1 p-6">
        <main className="w-full max-w-none">

          {/* ── Header ── */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
            <div>
              <h1 className="text-3xl font-extrabold text-black drop-shadow-sm">
                PRODUCT HUB
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Pusat Dokumen & Materi Produk MabelHub
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kategori dokumen..."
                className="h-11 w-full rounded-full bg-white pl-11 pr-5 text-sm outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>
          </div>

          {/* ── Stats Bar ── */}
          <div className="mb-6 flex flex-wrap gap-3 px-2">
            <div className="bg-white rounded-xl px-5 py-3 shadow-sm ring-1 ring-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Kategori</p>
                <p className="text-lg font-extrabold text-gray-900">
                  {visibleCategories.length}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl px-5 py-3 shadow-sm ring-1 ring-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Dokumen</p>
                <p className="text-lg font-extrabold text-gray-900">
                  {visibleCategories.reduce((s, c) => s + c.docCount, 0)}
                </p>
              </div>
            </div>

            {isSuperAdmin && (
              <div className="bg-white rounded-xl px-5 py-3 shadow-sm ring-1 ring-amber-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">SuperAdmin</p>
                  <p className="text-lg font-extrabold text-amber-700">Akses Penuh</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Section: Semua Pengguna ── */}
          {visibleCategories.filter((c) => !c.superAdminOnly).length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 px-2 mb-4">
                <div className="h-5 w-1 rounded-full bg-blue-500" />
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Umum — Tersedia untuk Semua Pengguna
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleCategories
                  .filter((c) => !c.superAdminOnly)
                  .map((cat) => (
                    <CategoryCard
                      key={cat.id}
                      cat={cat}
                      isSuperAdmin={isSuperAdmin}
                      onClick={() => router.push(`/produk/${cat.id}`)}
                    />
                  ))}
              </div>
            </section>
          )}

          {/* ── Section: SuperAdmin Only ── */}
          {isSuperAdmin &&
            visibleCategories.filter((c) => c.superAdminOnly).length > 0 && (
              <section className="mb-8">
                <div className="flex items-center gap-2 px-2 mb-4">
                  <div className="h-5 w-1 rounded-full bg-amber-500" />
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Khusus SuperAdmin
                  </h2>
                  <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200">
                    <Shield className="w-2.5 h-2.5" />
                    Restricted
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {visibleCategories
                    .filter((c) => c.superAdminOnly)
                    .map((cat) => (
                      <CategoryCard
                        key={cat.id}
                        cat={cat}
                        isSuperAdmin={isSuperAdmin}
                        onClick={() => router.push(`/produk/${cat.id}`)}
                      />
                    ))}
                </div>
              </section>
            )}

          {/* ── Empty state ── */}
          {visibleCategories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <Search className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-semibold">
                Tidak ada kategori yang sesuai dengan pencarian.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
