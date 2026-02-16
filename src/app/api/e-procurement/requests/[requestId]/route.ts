import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { assertLoggedIn, assertLeaderOrSales } from "@/lib/auth-server";

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
  segmen: string;
  deadlineUsulan: string;
  tanggalSubmit: string;
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

async function getParams<T>(ctx: { params: T | Promise<T> }) {
  return await Promise.resolve(ctx.params);
}

export async function GET(
  req: Request,
  ctx: { params: { requestId: string } | Promise<{ requestId: string }> },
) {
  const auth = assertLoggedIn(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { requestId } = await getParams(ctx);
  const rid = decodeURIComponent(requestId);

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "MabelHub");

  const doc = await db
    .collection<EProcDoc>("eproc_requests")
    .findOne({ requestId: rid }, { projection: { _id: 0 } });

  if (!doc) {
    return NextResponse.json(
      { error: "Request tidak ditemukan" },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: doc });
}

export async function PUT(
  req: Request,
  ctx: { params: { requestId: string } | Promise<{ requestId: string }> },
) {
  const auth = assertLeaderOrSales(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { requestId } = await getParams(ctx);
  const rid = decodeURIComponent(requestId);

  const body = await req.json().catch(() => ({}));
  const header = body?.header ?? {};
  const items: ProductItem[] = Array.isArray(body?.items) ? body.items : [];

  // map dari payload page.tsx
  const requestor = String(header.requestor ?? "").trim();
  const pemohon = String(header.pemohon ?? "").trim();
  const segmen = String(header.segmen ?? "").trim();
  const deadlineUsulan = String(header.deadline ?? "").trim();
  const lokasi = String(header.lokasi ?? "").trim();
  const catatan = String(header.catatanHeader ?? "").trim();

  if (!requestor || !pemohon || !segmen) {
    return NextResponse.json(
      { error: "Header wajib: requestor, pemohon, segmen" },
      { status: 400 },
    );
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "MabelHub");

  // rules: hanya pemilik (sales/leader pembuat) + belum di-take
  const result = await db
    .collection<EProcDoc>("eproc_requests")
    .findOneAndUpdate(
      {
        requestId: rid,
        "createdBy.userId": auth.session.userId,
        takenByAdminId: null, // tidak boleh revisi kalau sudah diambil admin
      },
      {
        $set: {
          requestor,
          pemohon,
          segmen,
          deadlineUsulan,
          lokasi,
          catatan,
          items,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after", projection: { _id: 0 } },
    );

  if (!result.value) {
    return NextResponse.json(
      {
        error:
          "Tidak bisa revisi (sudah diambil admin / bukan milik anda / tidak ditemukan)",
      },
      { status: 409 },
    );
  }

  return NextResponse.json({ data: result.value });
}
