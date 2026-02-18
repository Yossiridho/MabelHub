import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { assertLoggedIn } from "@/lib/auth-server";

function getDbName() {
  return process.env.MONGODB_DB || "MabelHub";
}

function toStringId(doc: any) {
  if (!doc) return doc;
  return { ...doc, _id: String(doc._id) };
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const gate = await assertLoggedIn(req);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const { id } = await ctx.params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(getDbName());

  // GET hanya approved (sesuai kebutuhan autocomplete/suggestion kamu)
  const company = await db.collection("companies").findOne({
    _id: new ObjectId(id),
    approval_status: "APPROVED",
  });

  if (!company) {
    return NextResponse.json(
      { error: "Company tidak ditemukan" },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: toStringId(company) });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const client = await clientPromise;
  const db = client.db(getDbName());
  const col = db.collection("companies");

  const _id = new ObjectId(id);
  const $set = {
    institusi_kerja: body.institusi_kerja,
    kota_kab: body.kota_kab,
    klpd: body.klpd,
    satuan_kerja: body.satuan_kerja,
    status_ring: body.status_ring,
    kode_dinas: body.kode_dinas,
    pic_default: body.pic_default,
    updatedAt: new Date(),
  };

  const updatedDoc = await col.findOneAndUpdate(
    { _id, approval_status: "APPROVED" },
    { $set },
    { returnDocument: "after" }
  );

  // ✅ updatedDoc itu dokumen langsung
  if (!updatedDoc) {
    return NextResponse.json({ error: "Company tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({
    data: { ...updatedDoc, _id: String((updatedDoc as any)._id) },
  });
}


export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const gate = await assertLoggedIn(req);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const { id } = await ctx.params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(getDbName());

  // DELETE: juga jangan paksa approval_status
  const del = await db
    .collection("companies")
    .deleteOne({ _id: new ObjectId(id) });

  if (!del.deletedCount) {
    return NextResponse.json(
      { error: "Company tidak ditemukan" },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}
