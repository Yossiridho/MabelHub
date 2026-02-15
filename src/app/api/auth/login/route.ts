import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyPassword } from "@/lib/password";
import { signSession } from "@/lib/jwt";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const identity = String(body?.identity ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  if (!identity || !password) {
    return NextResponse.json(
      { error: "Identity dan password wajib" },
      { status: 400 },
    );
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "MabelHub");

  // ✅ pastikan nama collection user kamu benar: "users" atau "Users"
  const usersCol = db.collection("users");

  // cari user by username/email (case-insensitive)
  const user = await usersCol.findOne({
    $or: [{ username: identity }, { email: identity }],
  });

  if (!user) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 401 });
  }

  // field password di db kamu harus konsisten
  const passwordHash =
    (user as any).passwordHash || (user as any).password_hash || "";

  if (!passwordHash) {
    return NextResponse.json(
      { error: "User belum memiliki passwordHash" },
      { status: 500 },
    );
  }

  const ok = await verifyPassword(password, passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Password salah" }, { status: 401 });
  }

  if ((user as any).isActive === false) {
    return NextResponse.json({ error: "User nonaktif" }, { status: 403 });
  }

  const token = signSession({
    userId: String((user as any)._id),
    role: (user as any).role,
    username: (user as any).username,
    fullName: (user as any).fullName,
  });

  const res = NextResponse.json({
    ok: true,
    user: {
      _id: String((user as any)._id),
      role: (user as any).role,
      username: (user as any).username,
      fullName: (user as any).fullName,
      email: (user as any).email,
    },
  });

  res.cookies.set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
