import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import { hashPassword } from "@/lib/password";
import { assertSuperadmin } from "@/lib/auth-server";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const gate = assertSuperadmin(req);
  if (!gate.ok)
    return NextResponse.json({ error: gate.error }, { status: gate.status });

  await dbConnect();
  const id = params.id;
  const body = await req.json();

  const patch: any = {};

  if (body.fullName !== undefined)
    patch.fullName = String(body.fullName).trim();
  if (body.email !== undefined)
    patch.email = String(body.email).trim().toLowerCase();
  if (body.username !== undefined)
    patch.username = String(body.username).trim().toLowerCase();
  if (body.role !== undefined) patch.role = String(body.role).toUpperCase();
  if (body.isActive !== undefined) patch.isActive = Boolean(body.isActive);

  // kalau mau ganti password
  if (body.password !== undefined && String(body.password).length > 0) {
    patch.passwordHash = await hashPassword(String(body.password));
  }

  try {
    const updated = await User.findByIdAndUpdate(
      id,
      { $set: patch },
      { new: true },
    )
      .select(
        "fullName email username role isActive createdAt updatedAt lastLoginAt",
      )
      .lean();

    if (!updated)
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 },
      );

    return NextResponse.json({ data: updated });
  } catch (e: any) {
    if (e?.code === 11000) {
      const keys = Object.keys(e?.keyPattern ?? {});
      return NextResponse.json(
        { error: `Duplicate: ${keys.join(", ")}` },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Gagal update user" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const gate = assertSuperadmin(req);
  if (!gate.ok)
    return NextResponse.json({ error: gate.error }, { status: gate.status });

  await dbConnect();
  const id = params.id;

  const deleted = await User.findByIdAndDelete(id).lean();
  if (!deleted)
    return NextResponse.json(
      { error: "User tidak ditemukan" },
      { status: 404 },
    );

  return NextResponse.json({ ok: true });
}
