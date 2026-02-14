import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

function badId() {
  return NextResponse.json({ error: "Invalid id" }, { status: 400 });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!ObjectId.isValid(id)) return badId();

  const client = await clientPromise;
  const db = client.db("MabelHub");
  const col = db.collection("VisitActivity");

  const doc = await col.findOne({ _id: new ObjectId(id) });
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: doc });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) return badId();

  const body = await req.json().catch(() => ({}));

  const $set: any = {};
  if (body.visit_date !== undefined)
    $set.visit_date = body.visit_date ? new Date(body.visit_date) : null;
  if (body.city !== undefined) $set.city = String(body.city ?? "");
  if (body.klpd !== undefined) $set.klpd = String(body.klpd ?? "");
  if (body.institusi_kerja !== undefined)
    $set.institusi_kerja = String(body.institusi_kerja ?? "");
  if (body.satuan_kerja !== undefined)
    $set.satuan_kerja = String(body.satuan_kerja ?? "");
  if (body.status_visit !== undefined)
    $set.status_visit = String(body.status_visit ?? "");
  if (body.status_ring !== undefined)
    $set.status_ring = String(body.status_ring ?? "");

  const client = await clientPromise;
  const db = client.db("MabelHub");
  const col = db.collection("VisitActivity");

  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set },
    { returnDocument: "after" },
  );

  if (!result.value) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: result.value });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) return badId();

  const client = await clientPromise;
  const db = client.db("MabelHub");
  const col = db.collection("VisitActivity");

  const result = await col.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
