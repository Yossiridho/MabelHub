import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

type Role = "SUPERADMIN" | "ADMIN" | string;

export async function GET(req: Request) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "MabelHub");

  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode"); // takeable | taken
  const role = (searchParams.get("role") ?? "ADMIN") as Role;
  const adminId = searchParams.get("adminId") ?? "";

  const filter: any = {};

  if (mode === "takeable") {
    // yang belum diambil
    filter.takenByAdminId = null;
  } else if (mode === "taken") {
    filter.takenByAdminId = { $ne: null };

    // kalau bukan superadmin → hanya miliknya sendiri
    if (role !== "SUPERADMIN") {
      if (!adminId) {
        return NextResponse.json(
          { error: "adminId wajib untuk role non-superadmin" },
          { status: 400 }
        );
      }

      filter.takenByAdminId = adminId;
    }
  } else {
    // default aman
    filter.takenByAdminId = null;
  }

  const col = db.collection("eproc_requests"); 
  // ⚠️ pastikan nama collection sesuai di MongoDB

  const data = await col
    .find(filter)
    .sort({ takenAt: -1, createdAt: -1 })
    .limit(200)
    .project({
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
    })
    .toArray();

  return NextResponse.json({ data });
}
