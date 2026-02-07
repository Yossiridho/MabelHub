import SphTable from "@/components/sph/SphTable";
import { getSessionUser } from "@/lib/auth/session"; // gunakan util session kamu
import { fetchSphList } from "@/lib/sph/api";

export default async function SphListPage() {
  const user = await getSessionUser();
  // user minimal: { id, name, role, teamId }

  const data = await fetchSphList({
    role: user.role,
    userId: user.id,
    teamId: user.teamId,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">SPH</h1>
        <p className="text-sm text-muted-foreground">
          Daftar SPH sesuai hak akses Anda.
        </p>
      </div>

      <SphTable data={data} />
    </div>
  );
}
