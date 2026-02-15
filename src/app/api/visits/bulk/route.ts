import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

function formatVisitDate(yyyyMmDd: string) {
  // convert "2026-02-15" -> "15-Feb-2026"
  const d = new Date(yyyyMmDd);
  if (Number.isNaN(d.getTime())) return yyyyMmDd;

  const day = d.getDate();
  const mon = d.toLocaleDateString("en-US", { month: "short" }); // Feb
  const year = d.getFullYear();
  return `${day}-${mon}-${year}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const tanggal = String(body?.tanggal ?? "").trim(); // yyyy-mm-dd
    const items = Array.isArray(body?.items) ? body.items : [];

    // dari session kamu sekarang userId ada di SessionUser.userId
    const createdBy = String(body?.createdBy ?? "").trim();
    const nama_sales = String(body?.nama_sales ?? "").trim();

    if (!tanggal) {
      return NextResponse.json({ error: "tanggal wajib" }, { status: 400 });
    }
    if (!items.length) {
      return NextResponse.json({ error: "items wajib (min 1)" }, { status: 400 });
    }

    const visit_date = formatVisitDate(tanggal);
    const now = new Date();
    const created_at = now.toISOString().slice(0, 19).replace("T", " "); // "YYYY-MM-DD HH:mm:ss"

    const docs = items.map((it: any) => {
      const status_ring = String(it?.status_ring ?? "").trim();
      const institusi_kerja = String(it?.institusi_kerja ?? "").trim();
      const kota_kab = String(it?.kota_kab ?? "").trim();
      const klpd = String(it?.klpd ?? "").trim();
      const satuan_kerja = String(it?.satuan_kerja ?? "").trim();

      const pic = it?.pic_default ?? {};
      const pic_name = String(pic?.nama ?? "").trim() || null;
      const pic_phone = pic?.no_telp ? String(pic.no_telp).trim() : null;
      const pic_position = String(pic?.jabatan ?? "").trim() || null;
      const pic_role = String(pic?.role ?? "").trim() || null;

      if (!status_ring || !institusi_kerja) {
        throw new Error("Setiap plan wajib punya status_ring & institusi_kerja");
      }

      return {
        // ===== fields utama sesuai VisitActivity kamu =====
        id: null,
        user_id: createdBy || null,
        visit_date,                    // string "3-Dec-2025"
        city: kota_kab || null,
        klpd: klpd || null,
        institusi_kerja,
        satuan_kerja: satuan_kerja || null,

        // PIC
        pic_name,
        pic_phone,
        pic_position,
        pic_role,

        // ===== sisanya untuk add plans: NULL dulu =====
        created_at,
        visit_image: null,
        status_visit: "NOT VISITED",   // default plan (belum visit)
        status_market: null,
        descriptions: null,
        tindak_lanjut: null,
        kegiatan_status: null,
        no_visit_per_month: null,

        status_ring,
        nama_sales: nama_sales || null,
      };
    });

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "MabelHub");
    const col = db.collection("VisitActivity");

    const result = await col.insertMany(docs);

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
