"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Role, MenuSection } from "@/lib/menu";
import { getMenuByRole } from "@/lib/menu";
import { useSession } from "@/components/session/SessionProvider";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useSession();

  if (loading) {
    return (
      <aside className="flex h-screen w-[260px] items-center justify-center border-r bg-white">
        <div className="text-sm text-gray-500">Loading...</div>
      </aside>
    );
  }

  // Jika tidak ada user (harusnya middleware sudah redirect)
  if (!user) return null;

  const role = user.role as Role;

  const userLabel =
    role === "SUPERADMIN"
      ? "SuperAdmin"
      : role === "ADMIN"
        ? "Admin"
        : role === "LEADER"
          ? "Leader"
          : "Sales";

  const sections: MenuSection[] = getMenuByRole(role);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
  }

  return (
    <aside className="sticky top-0 h-screen w-82 bg-white border-r">
      <div className="px-6 pt-6 pb-4">
        <div className="flex h-full flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-gray-300" />
          <div className="mt-3 text-center leading-tight">
            <div className="text-sm font-semibold text-gray-900">
              {userLabel}
            </div>
            <div className="text-lg text-gray-600">{user.fullName}</div>
          </div>
          <div className="mt-4 h-px w-full bg-gray-400" />
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.title}
              className="overflow-hidden rounded-md bg-white shadow"
            >
              <div className="bg-gray-300 px-6 py-3 text-lg font-semibold text-gray-700">
                {section.title}
              </div>

              <div>
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "block px-3 py-2 text-lg transition",
                      "pl-6",
                      isActive(item.href)
                        ? "bg-blue-200 font-semibold text-gray-900"
                        : "text-gray-700 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* LOGOUT */}
      <div className="sticky bottom-0 bg-white px-6 pb-6 pt-3">
        <button
          type="button"
          onClick={onLogout}
          className="h-12 w-full rounded-full bg-red-500 text-lg font-semibold text-white hover:bg-red-600"
        >
          LOGOUT
        </button>
      </div>
    </aside>
  );
}
