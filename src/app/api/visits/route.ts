import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

function asString(v: string | null) {
  const s = (v ?? "").trim();
  return s.length ? s : "";
}

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const limit = Number(searchParams.get("limit") || 25);
  const page = Number(searchParams.get("page") || 1);

  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safePage = Math.max(page, 1);
  const skip = (safePage - 1) * safeLimit;

  // filters (sesuaikan dengan UI)
  const q = asString(searchParams.get("q"));
  const sales = asString(searchParams.get("sales"));
  const status = asString(searchParams.get("status"));
  const ring = asString(searchParams.get("ring"));
  const city = asString(searchParams.get("city"));
  const satker = asString(searchParams.get("satker"));
  const start = asString(searchParams.get("start")); // yyyy-mm-dd
  const end = asString(searchParams.get("end")); // yyyy-mm-dd

  const filter: any = {};

  if (sales && sales !== "ALL") filter.nama_sales = sales;
  if (status && status !== "ALL") filter.status_visit = status;
  if (ring && ring !== "ALL") filter.status_ring = ring;
  if (city && city !== "ALL") filter.city = city;
  if (satker && satker !== "ALL") filter.satuan_kerja = satker;

  if (start || end) {
    filter.visit_date = {};
    if (start) filter.visit_date.$gte = new Date(`${start}T00:00:00.000Z`);
    if (end) filter.visit_date.$lte = new Date(`${end}T23:59:59.999Z`);
  }

  // free text search (simple regex)
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [
      { nama_sales: rx },
      { satuan_kerja: rx },
      { city: rx },
      { pic_name: rx },
      { pic_phone: rx },
      { klpd: rx },
      { institusi_kerja: rx },
      { status_visit: rx },
      { status_ring: rx },
      { tindak_lanjut: rx },
      { kegiatan_status: rx },
      { descriptions: rx },
    ];
  }

  const client = await clientPromise;
  const db = client.db("MabelHub");
  const col = db.collection("VisitActivity");

  const [itemsRaw, total] = await Promise.all([
    col
      .find(filter)
      .sort({ visit_date: -1, createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .toArray(),
    col.countDocuments(filter),
  ]);

  // map ke format UI kamu
  const items = itemsRaw.map((d: any) => ({
    _id: String(d._id),

    nama_sales: d.nama_sales ?? "-",
    visit_date: d.visit_date ? new Date(d.visit_date).toISOString() : "",
    status_visit: d.status_visit ?? "-",
    satuan_kerja: d.satuan_kerja ?? "-",
    city: d.city ?? "-",
    pic_name: d.pic_name ?? "-",
    pic_phone: d.pic_phone ?? "-",
    status_ring: d.status_ring ?? "-",

    created_at: d.created_at
      ? new Date(d.created_at).toISOString()
      : d.createdAt
        ? new Date(d.createdAt).toISOString()
        : "",

    market_status: d.status_market ?? "-",
    klpd: d.klpd ?? "-",
    reschedule: d.reschedule_date
      ? new Date(d.reschedule_date).toISOString()
      : "-",
    institusi_kerja: d.institusi_kerja ?? "-",
    pic_position: d.pic_position ?? "-",
    pic_role: d.pic_role ?? "-",
    tindak_lanjut: d.tindak_lanjut ?? "-",
    kegiatan_status: d.kegiatan_status ?? "-",
    deskripsi: d.descriptions ?? "-",
  }));

  return NextResponse.json({
    items,
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  });
}
