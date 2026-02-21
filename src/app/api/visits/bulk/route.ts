import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { assertLoggedIn } from "@/lib/auth-server";

function formatVisitDate(yyyyMmDd: string) {
  const d = new Date(yyyyMmDd);
  if (Number.isNaN(d.getTime())) return "";
  const day = d.getDate();
  const mon = d.toLocaleDateString("en-US", { month: "short" });
  const year = d.getFullYear();
  return `${day}-${mon}-${year}`;
}

function formatCreatedAt(dt: Date) {
  return dt.toISOString().slice(0, 19).replace("T", " ");
}

type TeamDoc = { leaderId: string; memberIds: string[] };

async function getLeaderAllowedUserIds(db: any, leaderId: string) {
  const team = (await db
    .collection("teams")
    .findOne({ leaderId })) as TeamDoc | null;
  const ids = [leaderId, ...(team?.memberIds ?? [])];
  return Array.from(new Set(ids));
}

type UserLite = {
  userId: string;
  role: string;
  username: string;
  fullName: string;
};

async function loadUsersMap(db: any, userIds: string[]) {
  const ids = Array.from(new Set(userIds)).filter((x) => ObjectId.isValid(x));
  if (!ids.length) return new Map<string, UserLite>();

  const rows = await db
    .collection("users")
    .find(
      { _id: { $in: ids.map((x) => new ObjectId(x)) } },
      { projection: { role: 1, username: 1, fullName: 1 } },
    )
    .toArray();

  const map = new Map<string, UserLite>();
  for (const r of rows) {
    map.set(String((r as any)._id), {
      userId: String((r as any)._id),
      role: String((r as any).role || ""),
      username: String((r as any).username || ""),
      fullName: String((r as any).fullName || ""),
    });
  }
  return map;
}

export async function POST(req: Request) {
  const auth = assertLoggedIn(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const tanggal = String(body?.tanggal ?? "").trim();
    const items = Array.isArray(body?.items) ? body.items : [];

    if (!tanggal)
      return NextResponse.json({ error: "tanggal wajib" }, { status: 400 });
    if (!items.length) {
      return NextResponse.json(
        { error: "items wajib (min 1)" },
        { status: 400 },
      );
    }

    const visit_date = formatVisitDate(tanggal);
    if (!visit_date) {
      return NextResponse.json(
        { error: "format tanggal tidak valid" },
        { status: 400 },
      );
    }

    const now = new Date();
    const created_at = formatCreatedAt(now);

    const session = auth.session;
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "MabelHub");
    const visits = db.collection("VisitActivity");

    // LEADER allowed list (self + memberIds)
    const leaderAllowed =
      session.role === "LEADER"
        ? await getLeaderAllowedUserIds(db, session.userId)
        : [];

    // 1) hitung target user per item + validasi role
    const resolvedTargets: string[] = [];

    for (const it of items) {
      let targetUserId = session.userId;
      const requestedTarget = String(it?.targetUserId ?? "").trim();

      if (requestedTarget) {
        // SALES tidak boleh override
        if (session.role === "SALES") {
          return NextResponse.json(
            { error: "FORBIDDEN: sales tidak boleh assign user lain" },
            { status: 403 },
          );
        }

        // LEADER: harus anggota tim / self
        if (session.role === "LEADER") {
          if (!leaderAllowed.includes(requestedTarget)) {
            return NextResponse.json(
              { error: "FORBIDDEN: target bukan anggota team leader" },
              { status: 403 },
            );
          }
          targetUserId = requestedTarget;
        }

        // SUPERADMIN/ADMIN: boleh assign ke SALES/LEADER saja (atau self)
        if (session.role === "SUPERADMIN" || session.role === "ADMIN") {
          targetUserId = requestedTarget;
        }
      }

      resolvedTargets.push(targetUserId);
    }

    // 2) preload user map untuk semua target agar nama_sales benar
    const userMap = await loadUsersMap(db, [
      session.userId,
      ...resolvedTargets,
    ]);

    // 3) validasi role target untuk SUPERADMIN/ADMIN
    if (session.role === "SUPERADMIN" || session.role === "ADMIN") {
      for (const tid of resolvedTargets) {
        if (tid === session.userId) continue;
        const u = userMap.get(tid);
        if (!u) {
          return NextResponse.json(
            { error: `Target user tidak ditemukan: ${tid}` },
            { status: 404 },
          );
        }
        if (u.role !== "SALES" && u.role !== "LEADER") {
          return NextResponse.json(
            {
              error: "FORBIDDEN: SUPERADMIN hanya boleh assign ke SALES/LEADER",
            },
            { status: 403 },
          );
        }
      }
    }

    // 4) build docs
    const docs: any[] = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];

      const status_ring = String(it?.status_ring ?? "").trim();
      const institusi_kerja = String(it?.institusi_kerja ?? "").trim();
      const kota_kab = String(it?.kota_kab ?? "").trim();
      const klpd = String(it?.klpd ?? "").trim();
      const satuan_kerja = String(it?.satuan_kerja ?? "").trim();

      if (!status_ring || !institusi_kerja) {
        return NextResponse.json(
          { error: "Setiap plan wajib punya status_ring & institusi_kerja" },
          { status: 400 },
        );
      }

      const targetUserId = resolvedTargets[i];
      const targetUser = userMap.get(targetUserId);

      const nama_sales =
        (targetUser?.fullName || "").trim() ||
        (targetUser?.username || "").trim() ||
        session.fullName ||
        session.username ||
        null;

      const pic = it?.pic_default ?? {};

      docs.push({
        id: null,

        // legacy
        user_id: targetUserId || null,

        // new
        assignedTo: targetUser
          ? {
              userId: targetUser.userId,
              role: targetUser.role,
              username: targetUser.username,
              fullName: targetUser.fullName,
            }
          : {
              userId: targetUserId || "",
              role: "",
              username: "",
              fullName: "",
            },

        nama_sales,

        visit_date,
        city: kota_kab || null,
        klpd: klpd || null,
        institusi_kerja,
        satuan_kerja: satuan_kerja || null,

        pic_name: pic?.nama ?? null,
        pic_phone: pic?.no_telp ?? null,
        pic_position: pic?.jabatan ?? null,
        pic_role: pic?.role ?? null,

        created_at,
        created_by_user_id: session.userId,
        created_by_name: session.fullName || session.username,

        visit_image: null,

        status_visit: "NOT VISITED",
        status_market: null,
        descriptions: null,
        tindak_lanjut: null,
        kegiatan_status: null,
        no_visit_per_month: null,

        status_ring,
      });
    }

    const result = await visits.insertMany(docs);

    return NextResponse.json(
      {
        ok: true,
        insertedCount: result.insertedCount,
        insertedIds: Object.values(result.insertedIds).map(String),
      },
      { status: 201 },
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Gagal insert bulk" },
      { status: 500 },
    );
  }
}
