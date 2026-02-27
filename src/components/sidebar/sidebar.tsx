"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Role, MenuSection } from "@/lib/menu";
import { getMenuByRole } from "@/lib/menu";
import { useSession } from "@/components/session/SessionProvider";
import NotificationMenu from "@/components/modals/NotificationMenu";
import { Menu, X, ChevronUp } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  // Swipe gesture tracking
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Accordion state (default open) initialized synchronously on client to prevent layout shifts
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => {
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem("sidebarAccordionState");
          if (saved) return JSON.parse(saved);
        } catch (e) {}
      }
      return {};
    },
  );

  const role = user?.role as Role;
  const sections: MenuSection[] = user ? getMenuByRole(role) : [];

  const toggleSection = (e: React.MouseEvent, title: string) => {
    e.stopPropagation();
    setOpenSections((prev) => {
      const newState = { ...prev, [title]: prev[title] === false };

      // Save to localStorage
      try {
        localStorage.setItem("sidebarAccordionState", JSON.stringify(newState));
      } catch (err) {}

      return newState;
    });
  };

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <aside className="flex h-screen w-[260px] items-center justify-center border-r bg-white">
        <div className="text-sm text-gray-500">Loading...</div>
      </aside>
    );
  }

  // Jika tidak ada user (harusnya middleware sudah redirect)
  if (!user) return null;

  const userLabel =
    role === "SUPERADMIN"
      ? "SuperAdmin"
      : role === "ADMIN"
        ? "Admin"
        : role === "LEADER"
          ? "Leader"
          : "Sales";

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX; // Initialize to start position to prevent false swipes on tap
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      // Swiped left
      setIsOpen(false);
    }
    // Reset
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
  }

  return (
    <>
      <style>{`
        @media (max-width: 1023px) {
          /* Automatically push the page content container down on mobile and tablet */
          /* Since sidebar is an adjacent sibling to the content div in layout, this safely avoids manual padding on every page */
          aside ~ div {
            padding-top: 5rem !important;
          }
        }
      `}</style>

      {/* Mobile Top Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white z-40 border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-extrabold text-blue-600 text-lg tracking-wide">
            MabelHub
          </span>
        </div>

        {/* User Mini Avatar on Mobile */}
        <div className="flex items-center gap-4">
          <NotificationMenu />
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shadow-inner">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        suppressHydrationWarning
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`fixed top-0 left-0 z-50 h-screen w-[260px] bg-white border-r transition-transform duration-300 ease-in-out lg:sticky lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 pt-6 pb-4 relative">
          {/* Close Button Mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

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
                <button
                  onClick={(e) => toggleSection(e, section.title)}
                  className="w-full bg-blue-100 px-6 py-3 flex items-center justify-between text-lg font-semibold text-gray-700 hover:bg-blue-200 transition-colors focus:outline-none"
                >
                  <span>{section.title}</span>
                  <ChevronUp
                    suppressHydrationWarning
                    className={`w-5 h-5 transition-transform duration-200 ${
                      openSections[section.title] !== false
                        ? ""
                        : "transform rotate-180"
                    }`}
                  />
                </button>

                <div
                  suppressHydrationWarning
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                    openSections[section.title] !== false
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={[
                          "block px-3 py-2 text-lg transition border-l-4",
                          isActive(item.href)
                            ? "border-blue-500 bg-blue-50 font-semibold text-blue-700"
                            : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                          "pl-6",
                        ].join(" ")}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
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
    </>
  );
}
