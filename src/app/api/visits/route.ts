import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { assertLoggedIn } from "@/lib/auth-server";

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

// escape regex search
function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// "2025-12-03" -> "3-Dec-2025"
function toVisitDateStr(yyyyMmDd: string) {
  const d = new Date(yyyyMmDd);
  if (Number.isNaN(d.getTime())) return "";
  const day = d.getDate();
  const mon = d.toLocaleString("en-US", { month: "short" }); // Dec
  const year = d.getFullYear();
  return `${day}-${mon}-${year}`;
}

// Date -> "YYYY-MM-DD HH:mm:ss"
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

type TeamDoc = {
  leaderId: string; // userId leader (string ObjectId)
  memberIds: string[]; // userId sales (string ObjectId)
};

async function getLeaderAllowedUserIds(db: any, leaderId: string) {
  const team = (await db
    .collection<TeamDoc>("teams")
    .findOne({ leaderId })) as TeamDoc | null;

  const ids = [leaderId, ...(team?.memberIds ?? [])];
  return Array.from(new Set(ids));
}

/**
 * GET /api/visits?limit=25&page=1&q=...
 * Optional:
 *  - assignedTo=USER_ID  (leader/admin filter)
 */
export async function GET(req: Request) {
  const auth = assertLoggedIn(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const session = auth.session;

  const { searchParams } = new URL(req.url);

  const limit = clamp(Number(searchParams.get("limit") || 25), 1, 100);
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const skip = (page - 1) * limit;

  const q = String(searchParams.get("q") || "").trim();
  const assignedTo = String(searchParams.get("assignedTo") || "").trim(); // optional

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "MabelHub");
  const col = db.collection("VisitActivity");

  // =========================
  // ACCESS FILTER (ROLE)
  // =========================
  const match: any = {};

  // user_id di dokumen kamu saat ini berisi string userId
  if (session.role === "SALES") {
    match.user_id = session.userId;
  } else if (session.role === "LEADER") {
    const allowed = await getLeaderAllowedUserIds(db, session.userId);

    if (assignedTo) {
      if (!allowed.includes(assignedTo)) {
        return NextResponse.json(
          { error: "FORBIDDEN: bukan anggota tim" },
          { status: 403 },
        );
      }
      match.user_id = assignedTo;
    } else {
      match.user_id = { $in: allowed };
    }
  } else {
    // ADMIN/SUPERADMIN
    if (assignedTo) match.user_id = assignedTo;
  }

  // =========================
  // SEARCH FILTER
  // =========================
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    match.$or = [
      { visit_date: rx }, // string "3-Dec-2025"
      { city: rx },
      { klpd: rx },
      { institusi_kerja: rx },
      { satuan_kerja: rx },
      { status_visit: rx },
      { nama_sales: rx },
      { status_ring: rx },
    ];
  }

  // =========================
  // SORT SAFE: parse date strings
  // =========================
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

/**
 * POST /api/visits
 * body:
 *  - tanggal (yyyy-mm-dd)
 *  - status_ring
 *  - institusi_kerja
 *  - kota_kab
 *  - klpd
 *  - satuan_kerja
 * Optional (leader/admin):
 *  - assignedToUserId (buat plan untuk anggota)
 */
export async function POST(req: Request) {
  const auth = assertLoggedIn(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const session = auth.session;

  try {
    const body = await req.json().catch(() => ({}));

    // input dari add plans
    const tanggal = String(body?.tanggal || "").trim(); // yyyy-mm-dd
    const status_ring = String(body?.status_ring || "").trim();
    const institusi_kerja = String(body?.institusi_kerja || "").trim();
    const kota_kab = String(body?.kota_kab || "").trim();
    const klpd = String(body?.klpd || "").trim();
    const satuan_kerja = String(body?.satuan_kerja || "").trim();

    // target assignment
    const assignedToUserIdRaw = String(body?.assignedToUserId || "").trim();
    let assignedToUserId = session.userId;

    // role rules:
    // - SALES: hanya boleh untuk dirinya
    // - LEADER: boleh untuk dirinya & member tim
    // - ADMIN/SUPERADMIN: bebas
    if (assignedToUserIdRaw) {
      if (session.role === "SALES") {
        return NextResponse.json(
          { error: "FORBIDDEN: sales tidak boleh assign ke user lain" },
          { status: 403 },
        );
      }

      if (session.role === "LEADER") {
        // cek member tim
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB || "MabelHub");
        const allowed = await getLeaderAllowedUserIds(db, session.userId);
        if (!allowed.includes(assignedToUserIdRaw)) {
          return NextResponse.json(
            { error: "FORBIDDEN: bukan anggota tim" },
            { status: 403 },
          );
        }
      }

      assignedToUserId = assignedToUserIdRaw;
    }

    if (
      !tanggal ||
      !status_ring ||
      !institusi_kerja ||
      !kota_kab ||
      !klpd ||
      !satuan_kerja
    ) {
      return NextResponse.json(
        {
          error:
            "Field wajib: tanggal, status_ring, institusi_kerja, kota_kab, klpd, satuan_kerja",
        },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "MabelHub");
    const visits = db.collection("VisitActivity");
    const users = db.collection("users");

    // ambil nama_sales dari users.fullName (berdasarkan assignedToUserId)
    let nama_sales: string | null = null;
    if (assignedToUserId && ObjectId.isValid(assignedToUserId)) {
      const u = await users.findOne(
        { _id: new ObjectId(assignedToUserId) },
        { projection: { fullName: 1, username: 1 } },
      );
      nama_sales = (u as any)?.fullName ?? (u as any)?.username ?? null;
    }

    // generate incremental field `id` (angka)
    const last = await visits
      .find({}, { projection: { id: 1 } })
      .sort({ id: -1 })
      .limit(1)
      .toArray();
    const nextId = Number((last?.[0] as any)?.id || 0) + 1;

    const now = new Date();

    const doc = {
      id: nextId,
      user_id: assignedToUserId, // string userId
      visit_date: toVisitDateStr(tanggal),
      city: kota_kab,
      klpd,
      institusi_kerja,
      satuan_kerja,

      // PIC default (kalau ada)
      pic_name: body?.pic_default?.nama ?? null,
      pic_phone: body?.pic_default?.no_telp ?? null,
      pic_position: body?.pic_default?.jabatan ?? null,
      pic_role: body?.pic_default?.role ?? null,

      // meta
      created_at: toCreatedAtStr(now),

      // tracking siapa yang membuat plan (berguna audit)
      created_by_user_id: session.userId,
      created_by_name: session.fullName || session.username,

      // field lain kosong dulu
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
    return NextResponse.json(
      { error: e?.message ?? "Gagal menyimpan" },
      { status: 500 },
    );
  }
}
