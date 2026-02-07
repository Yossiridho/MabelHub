import SphTable from "@/components/sph/SphTable";
import { getSessionUser } from "@/lib/auth/session";
import { fetchSphList } from "@/lib/sph/api";

export default async function AdminMyOrdersPage() {
  const user = await getSessionUser();

  const data = await fetchSphList({
    role: user.role,
    userId: user.id,
    teamId: user.teamId,
    tab: "my",
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Orderan Saya</h1>
        <p className="text-sm text-muted-foreground">
          Semua SPH yang pernah Anda ambil (claim).
        </p>
      </div>

      <SphTable data={data} />
    </div>
  );
}
