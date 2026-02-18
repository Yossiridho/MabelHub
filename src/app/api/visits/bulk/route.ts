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

export async function POST(req: Request) {
  const auth = assertLoggedIn(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json().catch(() => ({}));

    const tanggal = String(body?.tanggal ?? "").trim();
    const items = Array.isArray(body?.items) ? body.items : [];

    if (!tanggal) {
      return NextResponse.json({ error: "tanggal wajib" }, { status: 400 });
    }
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
    const users = db.collection("users");

    // helper: ambil daftar userId yang boleh di-assign oleh leader
    async function getLeaderAllowedUserIds(leaderId: string) {
      const team = await db
        .collection<{ leaderId: string; memberIds: string[] }>("teams")
        .findOne({ leaderId });
      const ids = [leaderId, ...(team?.memberIds ?? [])].map(String);
      return Array.from(new Set(ids));
    }

    // cache nama user (target sales) biar tidak query berulang
    const nameCache = new Map<string, string | null>();
    async function resolveNamaSales(userId: string) {
      const key = String(userId || "").trim();
      if (!key) return null;
      if (nameCache.has(key)) return nameCache.get(key) ?? null;

      let nm: string | null = null;
      if (ObjectId.isValid(key)) {
        const u = await users.findOne(
          { _id: new ObjectId(key) },
          { projection: { fullName: 1, username: 1 } },
        );
        nm = (u as any)?.fullName ?? (u as any)?.username ?? null;
      }
      nameCache.set(key, nm);
      return nm;
    }

    // kalau leader: hitung allowed sekali
    const leaderAllowed =
      session.role === "LEADER"
        ? await getLeaderAllowedUserIds(session.userId)
        : null;

    const docs: any[] = [];

    for (const it of items) {
      const status_ring = String(it?.status_ring ?? "").trim();
      const institusi_kerja = String(it?.institusi_kerja ?? "").trim();
      const kota_kab = String(it?.kota_kab ?? "").trim();
      const klpd = String(it?.klpd ?? "").trim();
      const satuan_kerja = String(it?.satuan_kerja ?? "").trim();

      if (!status_ring || !institusi_kerja) {
        throw new Error(
          "Setiap plan wajib punya status_ring & institusi_kerja",
        );
      }

      let targetUserId = session.userId;

      // LEADER: boleh assign, tapi harus anggota tim
      if (session.role === "LEADER") {
        const requestedTarget = String(it?.targetUserId ?? "").trim();

        if (requestedTarget) {
          if (!ObjectId.isValid(requestedTarget)) {
            return NextResponse.json(
              { error: "targetUserId tidak valid" },
              { status: 400 },
            );
          }

          if (leaderAllowed && !leaderAllowed.includes(requestedTarget)) {
            return NextResponse.json(
              { error: "FORBIDDEN: targetUserId bukan anggota tim" },
              { status: 403 },
            );
          }

          targetUserId = requestedTarget;
        }
      }

      // SALES: tidak boleh override
      if (session.role === "SALES") {
        targetUserId = session.userId;
      }

      const pic = it?.pic_default ?? {};

      // ✅ nama_sales harus mengikuti targetUserId
      const nama_sales = await resolveNamaSales(targetUserId);

      docs.push({
        id: null, // kalau mau incremental, bikin counter atomik nanti
        user_id: targetUserId || null,
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

        // audit: siapa yang membuat plan
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
