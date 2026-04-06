"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar/sidebar";

export default function AppLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show nothing until mounted to prevent hydration errors if needed, or just allow server render.
  // Actually, standard server rendering is fine since Sidebar handles user session conditionally.

  // Halaman login utama "/" dieksklusi dari Sidebar
  if (pathname === "/") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-transparent">
      <Sidebar />
      <div className="flex-1 w-full min-w-0">
        {children}
      </div>
    </div>
  );
}
