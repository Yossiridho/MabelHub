import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "PENDING";

  const client = await clientPromise;
  const db = client.db("MabelHub");

  const rows = await db
    .collection("company_requests")
    .find({ status })
    .sort({ requested_at: -1 })
    .toArray();

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();

  const client = await clientPromise;
  const db = client.db("MabelHub");

  const doc = {
    institusi_kerja: body.institusi_kerja || "",
    satuan_kerja: body.satuan_kerja || "",
    kota_kab: body.kota_kab || "",
    klpd: body.klpd || "",
    status_ring: body.status_ring || "",

    pic_default: {
      nama: body.pic_default?.nama || "",
      no_telp: body.pic_default?.no_telp || "",
      jabatan: body.pic_default?.jabatan || "",
      role: body.pic_default?.role || "",
    },

    status: "PENDING",
    requested_by: body.requested_by || null,
    requested_at: new Date(),

    reviewed_by: null,
    reviewed_at: null,
    reject_reason: "",
  };

  const res = await db.collection("company_requests").insertOne(doc);
  return NextResponse.json({ ok: true, insertedId: res.insertedId });
}
