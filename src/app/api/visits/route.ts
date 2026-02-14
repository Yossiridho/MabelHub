import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

function toYmd(d: any) {
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function mapDoc(doc: any) {
  return {
    id: String(doc._id),
    tanggal: doc.visit_date ? toYmd(doc.visit_date) : "",
    kota: doc.city ?? "",
    klpd: doc.klpd ?? "",
    institusi_kerja: doc.institusi_kerja ?? "",
    satuan_kerja: doc.satuan_kerja ?? "",
    status: doc.status_visit ?? "",
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  const client = await clientPromise;
  const db = client.db("MabelHub");
  const col = db.collection("VisitActivity");

  const filter: any = {};
  if (q) {
    // native simple search (case-insensitive)
    filter.$or = [
      { city: { $regex: q, $options: "i" } },
      { klpd: { $regex: q, $options: "i" } },
      { institusi_kerja: { $regex: q, $options: "i" } },
      { satuan_kerja: { $regex: q, $options: "i" } },
      { status_visit: { $regex: q, $options: "i" } },
    ];
  }

  const items = await col
    .find(filter, {
      projection: {
        visit_date: 1,
        city: 1,
        klpd: 1,
        institusi_kerja: 1,
        satuan_kerja: 1,
        status_visit: 1,
      },
    })
    .sort({ visit_date: -1, createdAt: -1 })
    .limit(500)
    .toArray();

  return NextResponse.json({ data: items.map(mapDoc) });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const items = Array.isArray(body?.items) ? body.items : [];

  if (!items.length) {
    return NextResponse.json({ error: "items wajib diisi" }, { status: 400 });
  }

  const now = new Date();

  // insert ke field yg sesuai model VisitActivity
  const docs = items.map((it: any) => ({
    visit_date: it.tanggal ? new Date(it.tanggal) : null,
    city: String(it.kota ?? ""),
    klpd: String(it.klpd ?? ""),
    institusi_kerja: String(it.institusi_kerja ?? ""),
    satuan_kerja: String(it.satuan_kerja ?? ""),
    status_visit: String(it.status ?? ""),
    created_at: now, // field model kamu
  }));

  const client = await clientPromise;
  const db = client.db("MabelHub");
  const col = db.collection("VisitActivity");

  const result = await col.insertMany(docs);

  return NextResponse.json(
    { ok: true, insertedIds: Object.values(result.insertedIds).map(String) },
    { status: 201 },
  );
}
