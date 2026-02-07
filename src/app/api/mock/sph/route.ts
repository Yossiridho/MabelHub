import { NextResponse } from "next/server";
import { listSph } from "@/lib/sph/mockdb";
import type { Role, SphDoc } from "@/lib/sph/types";

/**
 * GET /api/mock/sph?role=ADMIN&userId=u_admin_1&teamId=team-1&tab=queue|my
 *
 * role:
 * - USER: return createdBy=userId
 * - LEADER: return teamId=user teamId
 * - ADMIN: tab=queue => unclaimed only, tab=my => claimedByAdminId=userId, default => all
 * - SUPER_ADMIN: all
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const role = (searchParams.get("role") || "USER") as Role;
  const userId = searchParams.get("userId") || "";
  const teamId = searchParams.get("teamId") || "";
  const tab = searchParams.get("tab") || ""; // queue | my | ""

  const all = listSph();

  const filtered: SphDoc[] = (() => {
    if (role === "SUPER_ADMIN") return all;

    if (role === "ADMIN") {
      if (tab === "queue") return all.filter((x) => !x.claimedByAdminId);
      if (tab === "my") return all.filter((x) => x.claimedByAdminId === userId);
      return all;
    }

    if (role === "LEADER") {
      return all.filter((x) => x.teamId === teamId);
    }

    // USER (sales)
    return all.filter((x) => x.createdBy.id === userId);
  })();

  // sort newest first by submittedAt
  filtered.sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));

  return NextResponse.json({ data: filtered });
}
