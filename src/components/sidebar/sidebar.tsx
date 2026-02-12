"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Role, MenuSection } from "@/lib/menu";
import { getMenuByRole } from "@/lib/menu";

type SidebarProps = {
  role: Role;
  userLabel?: string;
  userName?: string;
  onLogoutHref?: string;
};

export default function Sidebar({
  role,
  userLabel = role === "SUPERADMIN"
    ? "SuperAdmin"
    : role === "ADMIN"
      ? "Admin"
      : "User",
  userName = "User",
  onLogoutHref = "/",
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const sections: MenuSection[] = getMenuByRole(role);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col bg-white">
      {/* PROFILE */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-gray-300" />
          <div className="mt-3 text-center leading-tight">
            <div className="text-sm font-semibold text-gray-900">
              {userLabel}
            </div>
            <div className="text-lg text-gray-600">{userName}</div>
          </div>
          <div className="mt-4 h-px w-full bg-gray-400" />
        </div>
      </div>

      {/* MENU (scrollable) */}
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

      {/* LOGOUT (footer, tidak menimpa menu) */}
      <div className="border-t border-gray-200 p-4">
        <button
          type="button"
          onClick={() => router.push(onLogoutHref)}
          className="h-12 w-full rounded-full bg-red-500 text-lg font-semibold text-white hover:bg-red-600"
        >
          LOGOUT
        </button>
      </div>
    </aside>
  );
}
