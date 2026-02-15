import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

type EProcDoc = {
  requestId: string;
  requestor: string;
  pemohon: string;
  lokasi: string;
  segmen: string;
  deadlineUsulan: string | Date;
  tanggalSubmit: string | Date;
  catatan?: string;

  takenByAdminId?: string | null;
  takenByAdminName?: string | null;
  takenAt?: string | Date | null;

  createdAt?: string | Date;
};

export async function POST(
  req: Request,
  ctx: { params: Promise<{ requestId: string }> }
) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "MabelHub");

    const requestId = decodeURIComponent(params.requestId);
    const body = await req.json().catch(() => ({}));

    // NANTI: ambil dari session
    const adminId = String(body?.adminId ?? "").trim();
    const adminName = String(body?.adminName ?? "Admin").trim() || "Admin";

    if (!adminId) {
      return NextResponse.json({ error: "adminId wajib" }, { status: 400 });
    }

    const now = new Date();

    // ✅ atomic: hanya bisa update kalau belum taken
    const result = await db
      .collection<EProcDoc>("eproc_requests")
      .findOneAndUpdate(
        {
          requestId,
          $or: [
            { takenByAdminId: null },
            { takenByAdminId: { $exists: false } },
          ],
        },
        {
          $set: {
            takenByAdminId: adminId,
            takenByAdminName: adminName,
            takenAt: now,
          },
        },
        {
          returnDocument: "after",
          projection: {
            _id: 0,
            requestId: 1,
            requestor: 1,
            pemohon: 1,
            lokasi: 1,
            segmen: 1,
            deadlineUsulan: 1,
            tanggalSubmit: 1,
            catatan: 1,
            takenByAdminId: 1,
            takenByAdminName: 1,
            takenAt: 1,
            createdAt: 1,
          },
        },
      );

    const updated = result.value;

    if (!updated) {
      return NextResponse.json(
        { error: "Request sudah diambil admin lain / tidak ditemukan" },
        { status: 409 },
      );
    }

    return NextResponse.json({ data: updated });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Gagal TAKE request" },
      { status: 500 },
    );
  }
}
