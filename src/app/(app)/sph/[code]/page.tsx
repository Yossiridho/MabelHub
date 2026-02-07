import Link from "next/link";
import { notFound } from "next/navigation";
import { getSph } from "@/lib/sph/mockdb";

export default async function SphDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const decoded = decodeURIComponent(code);

  const sph = getSph(decoded);
  if (!sph) return notFound();

  const totalActual = sph.items.reduce((sum, it) => {
    const price = typeof it.actualPrice === "number" ? it.actualPrice : 0;
    return sum + price * it.qty;
  }, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Detail SPH</h1>
          <p className="text-sm text-muted-foreground">{sph.code}</p>
        </div>
        <Link className="text-sm underline" href="/sph">
          Kembali
        </Link>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <div className="grid gap-2 md:grid-cols-2">
          <div>
            <div className="text-xs text-muted-foreground">Judul</div>
            <div className="font-medium">{sph.title}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Pembuat</div>
            <div className="font-medium">{sph.createdBy.name}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Team</div>
            <div className="font-medium">{sph.teamId}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Status Admin</div>
            <div className="font-medium">{sph.adminStatus}</div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="font-medium mb-3">Items</div>
        <ul className="space-y-2">
          {sph.items.map((it) => (
            <li key={it.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{it.name}</div>
                <div className="text-xs text-muted-foreground">
                  Qty: {it.qty}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Harga aktual:{" "}
                {typeof it.actualPrice === "number"
                  ? it.actualPrice.toLocaleString("id-ID")
                  : "—"}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border p-4">
        <div className="font-medium mb-2">Raw JSON (sementara)</div>
        <pre className="text-xs overflow-auto bg-gray-50 p-3 rounded-md">
          {JSON.stringify(sph, null, 2)}
        </pre>
      </div>
    </div>
  );
}
