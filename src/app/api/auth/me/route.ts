import { NextResponse } from "next/server";
import { verifySession } from "@/lib/jwt";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/session=([^;]+)/);
  const token = match?.[1] ?? "";

  const session = token ? verifySession(token) : null;
  if (!session) return NextResponse.json({ user: null }, { status: 200 });

  return NextResponse.json({ user: session }, { status: 200 });
}
