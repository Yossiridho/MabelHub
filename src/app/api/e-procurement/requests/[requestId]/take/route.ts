import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await ctx.params;
  const decodedRequestId = decodeURIComponent(requestId);

  const body = await req.json().catch(() => ({}));

  // NANTI: ambil dari session
  const adminId = String(body?.adminId ?? "");
  const adminName = String(body?.adminName ?? "Admin");

  if (!adminId) {
    return NextResponse.json({ error: "adminId wajib" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "MabelHub");

  // ⚠️ pastikan nama collection benar
  const col = db.collection("eproc_requests");

  const now = new Date();

  // ✅ Atomic claim: hanya berhasil jika takenByAdminId masih null
  const result = await col.findOneAndUpdate(
    { requestId: decodedRequestId, takenByAdminId: null },
    {
      $set: {
        takenByAdminId: adminId,
        takenByAdminName: adminName,
        takenAt: now,
        updatedAt: now,
      },
    },
    { returnDocument: "after" }
  );

  if (!result) {
    return NextResponse.json(
      { error: "Request sudah diambil admin lain / tidak ditemukan" },
      { status: 409 }
    );
  }

  const updated = result.value;

  if (!updated) {
    return NextResponse.json(
      { error: "Request sudah diambil admin lain / tidak ditemukan" },
      { status: 409 }
    );
  }

  return NextResponse.json({ data: updated });
}
