import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import EProcRequest from "@/models/EProcRequest";

export async function POST(
  req: Request,
  { params }: { params: { requestId: string } },
) {
  await dbConnect();

  const requestId = decodeURIComponent(params.requestId);
  const body = await req.json().catch(() => ({}));

  // NANTI: ambil dari session
  const adminId = String(body?.adminId ?? "");
  const adminName = String(body?.adminName ?? "Admin");

  if (!adminId) {
    return NextResponse.json({ error: "adminId wajib" }, { status: 400 });
  }

  const now = new Date();

  const updated = await EProcRequest.findOneAndUpdate(
    { requestId, takenByAdminId: null }, // <- kunci atomic
    {
      $set: {
        takenByAdminId: adminId,
        takenByAdminName: adminName,
        takenAt: now,
      },
    },
    { new: true },
  ).lean();

  if (!updated) {
    return NextResponse.json(
      { error: "Request sudah diambil admin lain / tidak ditemukan" },
      { status: 409 },
    );
  }

  return NextResponse.json({ data: updated });
}
