import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { cookies } from "next/headers";
import { verifySession } from "@/lib/jwt";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  const session = token ? verifySession(token) : null;
  if (!session) return NextResponse.json({ user: null }, { status: 200 });

  return NextResponse.json({ user: session }, { status: 200 });
}
