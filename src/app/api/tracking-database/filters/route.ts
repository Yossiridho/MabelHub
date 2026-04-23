import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("MabelHub");
        const col = db.collection("input_database");

        const [produk, merek, perusahaan, provinsi, kota, tipe, bulanRaw] = await Promise.all([
            col.distinct("produk_relevan", { produk_relevan: { $nin: ["", null] } }),
            col.distinct("merek", { merek: { $nin: ["", null] } }),
            col.distinct("nama_perusahaan", { nama_perusahaan: { $nin: ["", null] } }),
            col.distinct("provinsi", { provinsi: { $nin: ["", null] } }),
            col.distinct("kota", { kota: { $nin: ["", null] } }),
            col.distinct("tipe_kontak", { tipe_kontak: { $nin: ["", null] } }),
            col.distinct("created_at", { created_at: { $ne: null } }),
        ]);

        // Extract unique YYYY-MM months from created_at dates
        const bulanSet = new Set<string>();
        for (const d of bulanRaw) {
            try {
                const date = new Date(d);
                if (!isNaN(date.getTime())) {
                    // Convert UTC to WIB (+7) for display
                    const wibDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
                    const ym = `${wibDate.getUTCFullYear()}-${String(wibDate.getUTCMonth() + 1).padStart(2, '0')}`;
                    bulanSet.add(ym);
                }
            } catch { /* skip invalid */ }
        }
        const bulan = Array.from(bulanSet).sort().reverse();

        return NextResponse.json({
            bulan,
            produk: produk.sort(),
            merek: merek.sort(),
            perusahaan: perusahaan.sort(),
            provinsi: provinsi.sort(),
            kota: kota.sort(),
            tipe: tipe.sort(),
        });
    } catch (error) {
        console.error("Error fetching filter options:", error);
        return NextResponse.json({ error: "Gagal mengambil opsi filter" }, { status: 500 });
    }
}
