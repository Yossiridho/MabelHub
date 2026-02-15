import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "MabelHub");
  const col = db.collection("VisitActivity");

  const doc = await col.findOne({ _id: new ObjectId(id) });
  if (!doc) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });

  return NextResponse.json({ data: { ...doc, _id: String((doc as any)._id) } });
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "MabelHub");
  const col = db.collection("VisitActivity");

  const updated = await col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: body },
    { returnDocument: "after" },
  );

  // ✅ TS-safe: updated bisa null
  const doc = updated?.value;
  if (!doc) {
    return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({
    data: { ...doc, _id: String((doc as any)._id) },
  });
}

