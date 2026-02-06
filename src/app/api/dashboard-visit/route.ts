import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    totalVisits: 0,
    stayOffice: 0,
    notVisited: 0,
    salesCount: 0,
    satkerCount: 0,
    cityCount: 0,
    ring: {
      ring1: 0,
      ring2: 0,
      ring3: 0,
      ring4: 0,
    },
  });
}
