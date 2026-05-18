import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { assertLoggedIn } from "@/lib/auth-server";

export async function POST(req: Request) {
  const auth = assertLoggedIn(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "MabelHub");

    await db
      .collection("notifications")
      .updateMany(
        { userId: auth.session.userId, isRead: false },
        { $set: { isRead: true, updatedAt: new Date() } },
      );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
