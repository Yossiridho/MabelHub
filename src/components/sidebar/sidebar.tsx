"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getMenuByRole, Role } from "@/lib/menu";

type SidebarProps = {
  role: Role;
  title?: string;
};

export default function Sidebar({ role, title = "CRM" }: SidebarProps) {
  const pathname = usePathname();
  const menus = getMenuByRole(role);

  return (
    <aside className="fixed inset-y-0 left-0 h-screen w-64 border-r bg-white">
      <div className="px-5 py-4 border-b">
        <div className="text-lg font-semibold">{title}</div>
        <div className="text-xs text-gray-500 mt-1">Role: {role}</div>
      </div>

      <nav className="p-3 space-y-1">
        {menus.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "block rounded-md px-3 py-2 text-sm transition",
                active
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-100",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
