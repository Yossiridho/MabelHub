import type { Role, SphDoc } from "./types";
import { getBaseUrl } from "@/lib/utils/base-url";

export async function fetchSphList(params: {
  role: Role;
  userId: string;
  teamId: string;
  tab?: "queue" | "my";
}): Promise<SphDoc[]> {
  const sp = new URLSearchParams();
  sp.set("role", params.role);
  sp.set("userId", params.userId);
  sp.set("teamId", params.teamId);
  if (params.tab) sp.set("tab", params.tab);

  const baseUrl = await getBaseUrl();
  const url = `${baseUrl}/api/mock/sph?${sp.toString()}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal mengambil daftar SPH");

  const json = await res.json();
  return json.data as SphDoc[];
}
