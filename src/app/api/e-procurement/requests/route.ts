import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

type Role = "SUPERADMIN" | "ADMIN" | "LEADER" | "SALES" | string;

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

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "MabelHub");

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode"); // takeable | taken
    const role = (searchParams.get("role") ?? "ADMIN").toUpperCase() as Role;
    const adminId = searchParams.get("adminId") ?? "";

    const filter: Record<string, any> = {};

    if (mode === "takeable") {
      // belum diambil
      filter.$or = [{ takenByAdminId: null }, { takenByAdminId: { $exists: false } }];
    } else if (mode === "taken") {
      // sudah diambil
      filter.takenByAdminId = { $ne: null };

      // admin hanya boleh lihat taken miliknya
      if (role !== "SUPERADMIN") {
        if (!adminId) {
          return NextResponse.json(
            { error: "adminId wajib untuk role non-superadmin" },
            { status: 400 },
          );
        }
        filter.takenByAdminId = adminId;
      }
    } else {
      // default aman: kembalikan takeable
      filter.$or = [{ takenByAdminId: null }, { takenByAdminId: { $exists: false } }];
    }

    const data = await db
      .collection<EProcDoc>("eproc_requests")
      .find(filter, {
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
      })
      .sort({ takenAt: -1, createdAt: -1 })
      .limit(200)
      .toArray();

    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Gagal mengambil data e-procurement" },
      { status: 500 },
    );
  }
}
