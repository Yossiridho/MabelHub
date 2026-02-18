import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("MabelHub");
  const col = db.collection("VisitActivity");

  const [sales, cities, satkers] = await Promise.all([
    col.distinct("nama_sales"),
    col.distinct("city"),
    col.distinct("satuan_kerja"),
  ]);

  return NextResponse.json({
    sales: (sales ?? []).filter(Boolean).sort(),
    cities: (cities ?? []).filter(Boolean).sort(),
    satkers: (satkers ?? []).filter(Boolean).sort(),
  });
}
