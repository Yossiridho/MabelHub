import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import EProcRequest from "@/models/EProcRequest";

type Role = "SUPERADMIN" | "ADMIN" | string;

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode"); // takeable | taken
  const role = (searchParams.get("role") ?? "ADMIN") as Role;
  const adminId = searchParams.get("adminId") ?? "";

  const filter: any = {};

  if (mode === "takeable") {
    // hanya yg belum diambil
    filter.takenByAdminId = null;
  } else if (mode === "taken") {
    // default rekap: yg sudah diambil
    filter.takenByAdminId = { $ne: null };

    // enforce rule:
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
    // default aman: kembalikan takeable
    filter.takenByAdminId = null;
  }

  const data = await EProcRequest.find(filter)
    .sort({ takenAt: -1, createdAt: -1 })
    .limit(200)
    .select(
      "requestId requestor pemohon lokasi segmen deadlineUsulan tanggalSubmit catatan takenByAdminId takenByAdminName takenAt"
    )
    .lean();

  return NextResponse.json({ data });
}
