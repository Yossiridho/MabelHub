import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "MabelHub");

    await db.collection("company_requests").updateOne(
      { _id: new ObjectId(id), status: "PENDING" },
      {
        $set: {
          status: "REJECTED",
          reject_reason: body.reject_reason || "",
          rejected_at: new Date(),
        },
      }
    );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("reject error:", e);
    return NextResponse.json({ ok: false, message: e?.message }, { status: 500 });
  }
}
