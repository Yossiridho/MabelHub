import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const limit = Number(searchParams.get("limit") || 10);
  const page = Number(searchParams.get("page") || 1);

  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safePage = Math.max(page, 1);
  const skip = (safePage - 1) * safeLimit;

  const client = await clientPromise;
  const db = client.db("MabelHub");

  // IMPORTANT: pakai nama collection yang benar
  const col = db.collection("VisitActivity")

  const [items, total] = await Promise.all([
    col.find({})
      .sort({ visit_date: -1, createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .toArray(),
    col.countDocuments({}),
  ]);

  return NextResponse.json({
    items,
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    },
  });
}
