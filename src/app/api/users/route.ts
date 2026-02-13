import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import { hashPassword } from "@/lib/password";
import { assertSuperadmin } from "@/lib/auth-server";

export async function GET(req: Request) {
  const gate = assertSuperadmin(req);
  if (!gate.ok)
    return NextResponse.json({ error: gate.error }, { status: gate.status });

  await dbConnect();
  const users = await User.find({})
    .sort({ createdAt: -1 })
    .select(
      "fullName email username role isActive createdAt updatedAt lastLoginAt",
    )
    .lean();

  return NextResponse.json({ data: users });
}

export async function POST(req: Request) {
  const gate = assertSuperadmin(req);
  if (!gate.ok)
    return NextResponse.json({ error: gate.error }, { status: gate.status });

  await dbConnect();
  const body = await req.json();

  const fullName = String(body?.fullName ?? "").trim();
  const email = String(body?.email ?? "")
    .trim()
    .toLowerCase();
  const username = String(body?.username ?? "")
    .trim()
    .toLowerCase();
  const password = String(body?.password ?? "");
  const role = String(body?.role ?? "").toUpperCase();

  if (!fullName || !email || !username || !password || !role) {
    return NextResponse.json(
      { error: "Field wajib: fullName, email, username, password, role" },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(password);

  try {
    const created = await User.create({
      fullName,
      email,
      username,
      passwordHash,
      role,
    });

    return NextResponse.json({ data: created.toJSON() }, { status: 201 });
  } catch (e: any) {
    // duplicate key
    if (e?.code === 11000) {
      const keys = Object.keys(e?.keyPattern ?? {});
      return NextResponse.json(
        { error: `Duplicate: ${keys.join(", ")}` },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Gagal membuat user" }, { status: 500 });
  }
}
