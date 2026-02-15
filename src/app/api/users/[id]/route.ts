import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { hashPassword } from "@/lib/password";
import { assertSuperadmin } from "@/lib/auth-server";

type UserRole = "SUPERADMIN" | "ADMIN" | "LEADER" | "SALES";

type UserDoc = {
  fullName: string;
  email: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
};

function getDbName() {
  return process.env.MONGODB_DB || "MabelHub";
}

function normalizeRole(role: string): UserRole | null {
  const r = role.toUpperCase().trim();
  if (r === "SUPERADMIN") return "SUPERADMIN";
  if (r === "ADMIN") return "ADMIN";
  if (r === "LEADER") return "LEADER";
  if (r === "SALES") return "SALES";
  return null;
}

declare global {
  // eslint-disable-next-line no-var
  var __mabel_users_indexes_promise: Promise<void> | undefined;
}

async function ensureUserIndexes(db: any) {
  if (!global.__mabel_users_indexes_promise) {
    global.__mabel_users_indexes_promise = (async () => {
      const col = db.collection("users");
      try {
        await col.createIndex({ email: 1 }, { unique: true, background: true });
      } catch {}
      try {
        await col.createIndex(
          { username: 1 },
          { unique: true, background: true }
        );
      } catch {}
      try {
        await col.createIndex({ createdAt: -1 }, { background: true });
      } catch {}
    })();
  }
  await global.__mabel_users_indexes_promise;
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const gate = await assertSuperadmin(req);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const { id } = await ctx.params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }
  const _id = new ObjectId(id);

  try {
    const client = await clientPromise;
    const db = client.db(getDbName());
    await ensureUserIndexes(db);

    const col = db.collection<UserDoc>("users");
    const body = await req.json().catch(() => ({}));

    const $set: Partial<UserDoc> & Record<string, any> = {};
    const now = new Date();

    if (body.fullName !== undefined) $set.fullName = String(body.fullName).trim();
    if (body.email !== undefined) $set.email = String(body.email).trim().toLowerCase();
    if (body.username !== undefined) $set.username = String(body.username).trim().toLowerCase();

    if (body.role !== undefined) {
      const r = normalizeRole(String(body.role));
      if (!r) {
        return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
      }
      $set.role = r;
    }

    if (body.isActive !== undefined) $set.isActive = Boolean(body.isActive);

    if (body.password !== undefined && String(body.password).length > 0) {
      $set.passwordHash = await hashPassword(String(body.password));
    }

    if (Object.keys($set).length === 0) {
      return NextResponse.json(
        { error: "Tidak ada field untuk diupdate" },
        { status: 400 }
      );
    }

    $set.updatedAt = now;

    // ✅ Update dulu
    const upd = await col.updateOne({ _id }, { $set });

    if (upd.matchedCount === 0) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    // ✅ Ambil dokumen terbaru (tanpa passwordHash)
    const doc = await col.findOne(
      { _id },
      { projection: { passwordHash: 0 } as any }
    );

    return NextResponse.json({
      data: {
        ...doc,
        _id: String(_id),
      },
    });
  } catch (e: any) {
    if (e?.code === 11000) {
      const keys = Object.keys(e?.keyPattern ?? {});
      return NextResponse.json(
        { error: `Duplicate: ${keys.join(", ")}` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: e?.message ?? "Gagal update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const gate = await assertSuperadmin(req);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const { id } = await ctx.params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }
  const _id = new ObjectId(id);

  try {
    const client = await clientPromise;
    const db = client.db(getDbName());
    await ensureUserIndexes(db);

    const col = db.collection<UserDoc>("users");

    // ✅ hapus langsung
    const del = await col.deleteOne({ _id });

    if (del.deletedCount === 0) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Gagal menghapus user" },
      { status: 500 }
    );
  }
}
