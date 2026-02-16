import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { assertLoggedIn, assertLeaderOrSales } from "@/lib/auth-server";

type Segment = "RING 1" | "RING 2" | "RING 3" | "RING 4" | string;

type ProductItem = {
  id: string;
  merek: string;
  subKategori: string;
  qty: number;
  spesifikasi: string;
  paguPerItem: number | "";
  hargaTayang: number | "";
  linkInaproc: string;
  linkEcom: string;
};

type EProcDoc = {
  requestId: string;
  requestor: string;
  pemohon: string;
  lokasi: string;
  segmen: Segment;
  deadlineUsulan: string; // yyyy-mm-dd
  tanggalSubmit: string; // ISO
  catatan?: string;

  items: ProductItem[];

  createdBy: {
    userId: string;
    role: string;
    username: string;
    fullName: string;
  };

  createdAt: Date;
  updatedAt: Date;

  takenByAdminId: string | null;
  takenByAdminName: string | null;
  takenAt: Date | null;
};

declare global {
  // eslint-disable-next-line no-var
  var __eproc_indexes_promise: Promise<void> | undefined;
}

async function ensureIndexes(db: any) {
  if (!global.__eproc_indexes_promise) {
    global.__eproc_indexes_promise = (async () => {
      const col = db.collection<EProcDoc>("eproc_requests");
      await col.createIndex({ requestId: 1 }, { unique: true });
      await col.createIndex({ takenByAdminId: 1, takenAt: -1 });
      await col.createIndex({ createdAt: -1 });
      await col.createIndex({ "createdBy.userId": 1, createdAt: -1 });
    })();
  }
  await global.__eproc_indexes_promise;
}

function makeRequestId() {
  // simple & unique enough
  return `REQ-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`.toUpperCase();
}

export async function GET(req: Request) {
  const auth = assertLoggedIn(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const mode = (searchParams.get("mode") ?? "takeable").toLowerCase();

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "MabelHub");
  await ensureIndexes(db);

  const col = db.collection<EProcDoc>("eproc_requests");

  const filter: any = {};

  if (mode === "takeable") {
    // untuk halaman e-procurement-response: list yang belum diambil
    filter.takenByAdminId = null;
  } else if (mode === "taken") {
    // untuk rekapitulasi-response: yang sudah diambil
    filter.takenByAdminId = { $ne: null };

    // ADMIN hanya lihat yang diambil dirinya
    if (auth.session.role === "ADMIN") {
      filter.takenByAdminId = auth.session.userId;
    }
  } else if (mode === "mine") {
    // untuk sales/leader lihat punya sendiri
    filter["createdBy.userId"] = auth.session.userId;
  } else {
    // fallback aman
    filter.takenByAdminId = null;
  }

  const items = await col
    .find(filter, { projection: { _id: 0 } })
    .sort({ takenAt: -1, createdAt: -1 })
    .limit(500)
    .toArray();

  return NextResponse.json({ data: items });
}

export async function POST(req: Request) {
  const auth = assertLeaderOrSales(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json().catch(() => ({}));

  const header = body?.header ?? {};
  const items: ProductItem[] = Array.isArray(body?.items) ? body.items : [];

  const requestor = String(header.requestor ?? "").trim();
  const pemohon = String(header.pemohon ?? "").trim();
  const segmen = String(header.segmen ?? "").trim();
  const deadlineUsulan = String(header.deadline ?? "").trim(); // dari page.tsx kamu
  const lokasi = String(header.lokasi ?? "").trim();
  const catatan = String(header.catatanHeader ?? "").trim();

  if (!requestor || !pemohon || !segmen) {
    return NextResponse.json(
      { error: "Header wajib: requestor, pemohon, segmen" },
      { status: 400 },
    );
  }

  const requestId = makeRequestId();
  const now = new Date();

  const doc: EProcDoc = {
    requestId,
    requestor,
    pemohon,
    lokasi,
    segmen,
    deadlineUsulan: deadlineUsulan || "",
    tanggalSubmit: now.toISOString(),
    catatan: catatan || "",

    items,

    createdBy: {
      userId: auth.session.userId,
      role: auth.session.role,
      username: auth.session.username,
      fullName: auth.session.fullName,
    },

    createdAt: now,
    updatedAt: now,

    takenByAdminId: null,
    takenByAdminName: null,
    takenAt: null,
  };

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "MabelHub");
  await ensureIndexes(db);

  await db.collection<EProcDoc>("eproc_requests").insertOne(doc);

  return NextResponse.json({ data: doc }, { status: 201 });
}
