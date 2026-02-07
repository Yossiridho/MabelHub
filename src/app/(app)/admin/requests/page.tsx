import { redirect } from "next/navigation";

import SphTable from "@/components/sph/SphTable";
import { getSessionUser } from "@/lib/auth/session";
import { fetchSphList } from "@/lib/sph/api";

export default async function AdminRequestsPage() {
  const user = await getSessionUser();

  const data = await fetchSphList({
    role: user.role,
    userId: user.id,
    teamId: user.teamId,
    tab: "queue", // harus return yang belum di-claim
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Request Masuk</h1>
        <p className="text-sm text-muted-foreground">
          SPH yang belum di-claim admin mana pun.
        </p>
      </div>

      <SphTable data={data} enableClaim currentAdminId={user.id} />
    </div>
  );
}
