import { cookies } from "next/headers";
import type { Role } from "@/lib/menu";

export type SessionUser = {
  id: string;
  name: string;
  role: Role;
  teamId: string;
};

/**
 * DEV-only session helper.
 *
 * Cara kerja:
 * - Membaca cookie `mh_user` yang berisi base64url(JSON)
 * - Jika tidak ada / invalid, fallback ke user dev default
 *
 * Nanti saat auth sudah real (NextAuth/JWT), file ini bisa diganti implementasinya.
 */
export async function getSessionUser(): Promise<SessionUser> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("mh_user")?.value;

  if (raw) {
    try {
      const json = Buffer.from(raw, "base64url").toString("utf8");
      const parsed = JSON.parse(json) as SessionUser;

      // minimal sanity check
      if (parsed?.id && parsed?.role && parsed?.teamId) return parsed;
    } catch {
      // ignore
    }
  }

  // fallback default agar halaman tidak crash saat dev
  return {
    id: "u_sales_1",
    name: "Dev User",
    role: "USER",
    teamId: "team-1",
  };
}
