import { NextResponse } from "next/server";
import { companies } from "@/lib/sph/mockdb";

export async function GET() {
  return NextResponse.json({ data: companies });
}
