import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

// ubah "2025-12-03" => "3-Dec-2025"
function toVisitDateStr(yyyyMmDd: string) {
  const d = new Date(yyyyMmDd);
  if (Number.isNaN(d.getTime())) return "";
  const day = d.getDate(); // tanpa leading zero
  const mon = d.toLocaleString("en-US", { month: "short" }); // Dec
  const year = d.getFullYear();
  return `${day}-${mon}-${year}`;
}

// ubah Date => "YYYY-MM-DD HH:mm:ss"
function toCreatedAtStr(dt: Date) {
  const pad = (x: number) => String(x).padStart(2, "0");
  const y = dt.getFullYear();
  const m = pad(dt.getMonth() + 1);
  const d = pad(dt.getDate());
  const hh = pad(dt.getHours());
  const mm = pad(dt.getMinutes());
  const ss = pad(dt.getSeconds());
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const limit = clamp(Number(searchParams.get("limit") || 25), 1, 100);
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const skip = (page - 1) * limit;

  const q = String(searchParams.get("q") || "").trim();

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "MabelHub");
  const col = db.collection("VisitActivity");

  const match: any = {};
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    match.$or = [
      { visit_date: rx },
      { city: rx },
      { klpd: rx },
      { institusi_kerja: rx },
      { satuan_kerja: rx },
      { status_visit: rx },
      { nama_sales: rx },
    ];
  }

  const pipeline: any[] = [
    { $match: match },
    {
      $addFields: {
        __visitDate: {
          $dateFromString: {
            dateString: "$visit_date",
            format: "%d-%b-%Y",
            onError: null,
            onNull: null,
          },
        },
        __createdAt: {
          $dateFromString: {
            dateString: "$created_at",
            format: "%Y-%m-%d %H:%M:%S",
            onError: null,
            onNull: null,
          },
        },
      },
    },
    { $sort: { __visitDate: -1, __createdAt: -1, _id: -1 } },
    {
      $facet: {
        items: [
          { $skip: skip },
          { $limit: limit },
          { $project: { __visitDate: 0, __createdAt: 0 } },
        ],
        total: [{ $count: "count" }],
      },
    },
  ];

  const agg = await col.aggregate(pipeline).toArray();
  const first = agg?.[0] || { items: [], total: [] };

  const itemsRaw = Array.isArray(first.items) ? first.items : [];
  const total = Number(first.total?.[0]?.count || 0);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const items = itemsRaw.map((it: any) => ({ ...it, _id: String(it._id) }));

  return NextResponse.json({
    items,
    pagination: { total, page, limit, totalPages },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // input dari add plans
    const tanggal = String(body?.tanggal || "").trim(); // yyyy-mm-dd
    const status_ring = String(body?.status_ring || "").trim();
    const institusi_kerja = String(body?.institusi_kerja || "").trim();
    const kota_kab = String(body?.kota_kab || "").trim();
    const klpd = String(body?.klpd || "").trim();
    const satuan_kerja = String(body?.satuan_kerja || "").trim();

    // dari session (pakai userId, bukan _id)
    const createdBy = String(body?.createdBy || "").trim();

    if (!tanggal || !status_ring || !institusi_kerja || !kota_kab || !klpd || !satuan_kerja) {
      return NextResponse.json(
        { error: "Field wajib: tanggal, status_ring, institusi_kerja, kota_kab, klpd, satuan_kerja" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "MabelHub");
    const visits = db.collection("VisitActivity");
    const users = db.collection("users");

    // ambil nama_sales dari users.fullName
    let nama_sales: string | null = null;
    if (createdBy && ObjectId.isValid(createdBy)) {
      const u = await users.findOne(
        { _id: new ObjectId(createdBy) },
        { projection: { fullName: 1 } },
      );
      nama_sales = (u as any)?.fullName ?? null;
    }

    // generate incremental field `id` (angka)
    const last = await visits.find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).toArray();
    const nextId = Number((last?.[0] as any)?.id || 0) + 1;

    const now = new Date();

    // bentuk dokumen sesuai struktur yang kamu mau
    const doc = {
      id: nextId,
      user_id: createdBy || null,               // kamu minta user_id, jadi isi string userId dulu
      visit_date: toVisitDateStr(tanggal),      // "3-Dec-2025"
      city: kota_kab,                           // contoh "Kota Bandung"
      klpd,
      institusi_kerja,
      satuan_kerja,

      // PIC dari company (kalau ada)
      pic_name: body?.pic_default?.nama ?? null,
      pic_phone: body?.pic_default?.no_telp ?? null,
      pic_position: body?.pic_default?.jabatan ?? null,
      pic_role: body?.pic_default?.role ?? null,

      // field lain: null dulu (nanti di edit)
      created_at: toCreatedAtStr(now),
      visit_image: null,
      status_visit: null,
      status_market: null,
      descriptions: null,
      tindak_lanjut: null,
      kegiatan_status: null,
      no_visit_per_month: null,

      status_ring,
      nama_sales: nama_sales ?? null,
    };

    const ins = await visits.insertOne(doc as any);

    return NextResponse.json(
      { ok: true, data: { ...doc, _id: String(ins.insertedId) } },
      { status: 201 },
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Gagal menyimpan" }, { status: 500 });
  }
}
