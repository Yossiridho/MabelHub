import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { assertLoggedIn } from "@/lib/auth-server";

function getDbName() {
  return process.env.MONGODB_DB || "MabelHub";
}

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
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

  const company = await db.collection("companies").findOne({
    _id: new ObjectId(id),
    approval_status: "APPROVED",
  });

  if (!company) {
    return NextResponse.json({ error: "Company tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({
    data: { ...company, _id: String((company as any)._id) },
  });
}
