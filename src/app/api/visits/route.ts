import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { VisitActivity } from "@/models/VisitActivity";

function parseDate(v: string | null) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);

  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "10")));
  const q = (searchParams.get("q") ?? "").trim();

  const sales = (searchParams.get("sales") ?? "").trim(); // nama_sales
  const status = (searchParams.get("status") ?? "").trim(); // status_visit
  const ring = (searchParams.get("ring") ?? "").trim(); // status_ring: "RING 1" etc
  const city = (searchParams.get("city") ?? "").trim();
  const satker = (searchParams.get("satker") ?? "").trim();

  const start = parseDate(searchParams.get("start"));
  const end = parseDate(searchParams.get("end"));

  const filter: any = {};

  // pencarian sederhana (optional)
  if (q) {
    filter.$or = [
      { nama_sales: { $regex: q, $options: "i" } },
      { satuan_kerja: { $regex: q, $options: "i" } },
      { city: { $regex: q, $options: "i" } },
      { pic_name: { $regex: q, $options: "i" } },
    ];
  }

  if (sales) filter.nama_sales = sales;
  if (status) filter.status_visit = status;
  if (ring) filter.status_ring = ring;
  if (city) filter.city = city;
  if (satker) filter.satuan_kerja = satker;

  if (start || end) {
    filter.visit_date = {};
    if (start) filter.visit_date.$gte = start;
    if (end) filter.visit_date.$lte = end;
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    VisitActivity.find(filter)
      .sort({ visit_date: -1 })
      .skip(skip)
      .limit(limit)
      .select("nama_sales visit_date status_visit satuan_kerja city pic_name pic_phone status_ring")
      .lean(),
    VisitActivity.countDocuments(filter),
  ]);

  return NextResponse.json({
    page,
    limit,
    total,
    items,
  });
}
