import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { assertSuperadmin, assertLoggedIn } from "@/lib/auth-server";

const DB_NAME = "MabelHub";
const COL_NAME = "Parameters";
const DOC_ID = "global";

type ParamKey =
  | "sales"
  | "segmen"
  | "status_kunjungan"
  | "posisi"
  | "kegiatan"
  | "klpd"
  | "perusahaan";

function norm(v: string) {
  return String(v ?? "").trim();
}

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

async function ensureDoc() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const col = db.collection(COL_NAME);

  const existing = await col.findOne({ _id: DOC_ID as any });
  if (existing) return { col };

  await col.insertOne({
    _id: DOC_ID as any,
    sales: [],
    segmen: [],
    status_kunjungan: [],
    posisi: [],
    kegiatan: [],
    klpd: [],
    perusahaan: [],
    updatedAt: new Date(),
  });

  return { col };
}

export async function GET(req: Request) {
  const gate = assertLoggedIn(req);
  if (!gate.ok) return bad(gate.error, gate.status);

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const col = db.collection(COL_NAME);

  const doc = await col.findOne({ _id: DOC_ID as any });

  // kalau belum ada, buat default
  if (!doc) {
    await ensureDoc();
    const created = await col.findOne({ _id: DOC_ID as any });
    return NextResponse.json({ data: created });
  }

  return NextResponse.json({ data: doc });
}

export async function POST(req: Request) {
  const gate = assertSuperadmin(req);
  if (!gate.ok) return bad(gate.error, gate.status);

  const body = await req.json().catch(() => ({}));
  const key = norm(body?.key) as ParamKey;
  const value = norm(body?.value);

  if (!key) return bad("key wajib");
  if (!value) return bad("value wajib");

  const allowed: ParamKey[] = [
    "sales",
    "segmen",
    "status_kunjungan",
    "posisi",
    "kegiatan",
    "klpd",
    "perusahaan",
  ];
  if (!allowed.includes(key)) return bad("key tidak valid");

  const { col } = await ensureDoc();

  await col.updateOne(
    { _id: DOC_ID as any },
    {
      $addToSet: { [key]: value } as any,
      $set: { updatedAt: new Date() },
    } as any,
    { upsert: true },
  );

  const doc = await col.findOne({ _id: DOC_ID as any });
  return NextResponse.json({ ok: true, data: doc });
}

export async function DELETE(req: Request) {
  const gate = assertSuperadmin(req);
  if (!gate.ok) return bad(gate.error, gate.status);

  const body = await req.json().catch(() => ({}));
  const key = norm(body?.key) as ParamKey;
  const value = norm(body?.value);

  if (!key) return bad("key wajib");
  if (!value) return bad("value wajib");

  const allowed: ParamKey[] = [
    "sales",
    "segmen",
    "status_kunjungan",
    "posisi",
    "kegiatan",
    "klpd",
    "perusahaan",
  ];
  if (!allowed.includes(key)) return bad("key tidak valid");

  const { col } = await ensureDoc();

  await col.updateOne(
    { _id: DOC_ID as any },
    {
      $pull: { [key]: value } as any,
      $set: { updatedAt: new Date() },
    } as any,
    { upsert: true },
  );

  const doc = await col.findOne({ _id: DOC_ID as any });
  return NextResponse.json({ ok: true, data: doc });
}
