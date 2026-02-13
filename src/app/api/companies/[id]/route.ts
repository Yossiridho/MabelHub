import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const client = await clientPromise;
  const db = client.db("MabelHub");

  const company = await db.collection("companies").findOne({
    _id: new ObjectId(params.id),
    approval_status: "APPROVED",
  });

  return NextResponse.json(company);
}
