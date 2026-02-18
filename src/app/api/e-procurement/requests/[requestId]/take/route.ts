import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { assertAdminOrSuperadmin } from "@/lib/auth-server";

type EProcDoc = {
  requestId: string;
  takenByAdminId: string | null;
  takenByAdminName: string | null;
  takenAt: Date | null;
};

async function getParams<T>(ctx: { params: T | Promise<T> }) {
  return await Promise.resolve(ctx.params);
}

export async function POST(
  req: Request,
  ctx: { params: { requestId: string } | Promise<{ requestId: string }> },
) {
  const auth = assertAdminOrSuperadmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { requestId } = await getParams(ctx);
  const rid = decodeURIComponent(requestId);

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "MabelHub");

  const now = new Date();

  const result = await db.collection("eproc_requests").findOneAndUpdate(
    { requestId: rid, takenByAdminId: null }, // 🔒 lock
    {
      $set: {
        takenByAdminId: auth.session.userId,
        takenByAdminName: auth.session.fullName,
        takenAt: now,
        updatedAt: now,
      },
    },
    { returnDocument: "after", projection: { _id: 0 } },
  );

  if (!result.value) {
    return NextResponse.json(
      { error: "Request sudah diambil admin lain / tidak ditemukan" },
      { status: 409 },
    );
  }

  return NextResponse.json({ data: result.value });
}
