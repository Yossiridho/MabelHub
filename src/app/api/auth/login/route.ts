import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyPassword } from "@/lib/password";
import { signSession } from "@/lib/jwt";

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json().catch(() => ({}));

  const identity = String(body?.identity ?? "")
    .trim()
    .toLowerCase(); // username/email
  const password = String(body?.password ?? "");

  if (!identity || !password) {
    return NextResponse.json(
      { error: "Identity dan password wajib" },
      { status: 400 },
    );
  }

  const user = await User.findOne({
    $or: [{ username: identity }, { email: identity }],
  }).lean();

  if (!user) {
    return NextResponse.json(
      { error: "User tidak ditemukan" },
      { status: 401 },
    );
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Password salah" }, { status: 401 });
  }

  if (user.isActive === false) {
    return NextResponse.json({ error: "User nonaktif" }, { status: 403 });
  }

  const token = signSession({
    userId: String(user._id),
    role: user.role,
    username: user.username,
    fullName: user.fullName,
  });

  const res = NextResponse.json({
    ok: true,
    user: {
      _id: String(user._id),
      role: user.role,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
    },
  });

  // httpOnly cookie (aman)
  res.cookies.set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });

  return res;
}
