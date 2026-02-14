"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type SessionUser = {
  userId: string;
  role: "SUPERADMIN" | "ADMIN" | "LEADER" | "SALES";
  username: string;
  fullName: string;
};

type SessionState = {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const SessionCtx = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      setUser(json?.user ?? null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <SessionCtx.Provider value={{ user, loading, refresh }}>
      {children}
    </SessionCtx.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionCtx);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
