import { NextResponse } from "next/server";
import { claimSph } from "@/lib/sph/mockdb";

/**
 * POST /api/mock/sph/claim
 * body: { code: string, adminId: string }
 *
 * Aturan:
 * - Hanya boleh jika SPH belum di-claim.
 * - Jika sudah di-claim, return 409.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { code?: string; adminId?: string };
    const code = (body.code || "").trim();
    const adminId = (body.adminId || "").trim();

    if (!code || !adminId) {
      return NextResponse.json(
        { message: "code dan adminId wajib diisi" },
        { status: 400 },
      );
    }

    const doc = claimSph(code, adminId);
    return NextResponse.json({ data: doc });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
    const status = msg.includes("sudah di-claim") ? 409 : 400;
    return NextResponse.json({ message: msg }, { status });
  }
}
