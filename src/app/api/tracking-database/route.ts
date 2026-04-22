import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
    try {
        const client = await clientPromise
        const db = client.db("MabelHub")
        const col = db.collection("input_database")

        // --- Statistik Unik ---

        // Jumlah no_telp unik (non-empty)
        const uniqueNoTelp = await col.distinct("no_telp", { no_telp: { $ne: "" } })

        // Jumlah provinsi unik (non-empty)
        const uniqueProvinsi = await col.distinct("provinsi", { provinsi: { $ne: "" } })

        // Jumlah kota unik (non-empty)
        const uniqueKota = await col.distinct("kota", { kota: { $ne: "" } })

        // Jumlah nama unik (non-empty)
        const uniqueNama = await col.distinct("nama", { nama: { $ne: "" } })

        // Jumlah kombinasi unik nama + no_telp (kontak unik sejati)
        const uniqueCombinedAgg = await col.aggregate([
            {
                $match: {
                    nama: { $ne: "" },
                    no_telp: { $ne: "" },
                }
            },
            {
                $group: {
                    _id: { nama: "$nama", no_telp: "$no_telp" }
                }
            },
            { $count: "total" }
        ]).toArray()
        const totalKontakUnik = uniqueCombinedAgg[0]?.total ?? 0

        // Jumlah kontak WA unik (tipe_kontak = WhatsApp, kombinasi nama+no_telp unik)
        const uniqueWaAgg = await col.aggregate([
            {
                $match: {
                    tipe_kontak: "WhatsApp",
                    nama: { $ne: "" },
                    no_telp: { $ne: "" },
                }
            },
            {
                $group: {
                    _id: { nama: "$nama", no_telp: "$no_telp" }
                }
            },
            { $count: "total" }
        ]).toArray()
        const totalWaUnik = uniqueWaAgg[0]?.total ?? 0

        // --- Data Tabel: Unik per Provinsi & Kota ---
        const provinsiKotaAgg = await col.aggregate([
            {
                $match: {
                    provinsi: { $ne: "" },
                    kota: { $ne: "" },
                    nama: { $ne: "" },
                    no_telp: { $ne: "" },
                }
            },
            {
                $group: {
                    _id: {
                        provinsi: "$provinsi",
                        kota: "$kota",
                        nama: "$nama",
                        no_telp: "$no_telp"
                    }
                }
            },
            {
                $group: {
                    _id: { provinsi: "$_id.provinsi", kota: "$_id.kota" },
                    unik: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.provinsi": 1, "_id.kota": 1 }
            }
        ]).toArray()

        const totalUnikSeluruh = provinsiKotaAgg.reduce((sum, r) => sum + r.unik, 0)

        const tableProvinsiKota = provinsiKotaAgg.map((r, idx) => ({
            no: idx + 1,
            provinsi: r._id.provinsi,
            kota: r._id.kota,
            unik: r.unik,
            pct: totalUnikSeluruh > 0 ? Math.round((r.unik / totalUnikSeluruh) * 100) : 0,
        }))

        // --- Data Tabel: WA Unik per Provinsi & Kota ---
        const waProvinsiKotaAgg = await col.aggregate([
            {
                $match: {
                    tipe_kontak: "WhatsApp",
                    provinsi: { $ne: "" },
                    kota: { $ne: "" },
                    nama: { $ne: "" },
                    no_telp: { $ne: "" },
                }
            },
            {
                $group: {
                    _id: {
                        provinsi: "$provinsi",
                        kota: "$kota",
                        nama: "$nama",
                        no_telp: "$no_telp"
                    }
                }
            },
            {
                $group: {
                    _id: { provinsi: "$_id.provinsi", kota: "$_id.kota" },
                    unik: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.provinsi": 1, "_id.kota": 1 }
            }
        ]).toArray()

        const totalWaSeluruh = waProvinsiKotaAgg.reduce((sum, r) => sum + r.unik, 0)

        const tableWaProvinsiKota = waProvinsiKotaAgg.map((r, idx) => ({
            no: idx + 1,
            provinsi: r._id.provinsi,
            kota: r._id.kota,
            unik: r.unik,
            pct: totalWaSeluruh > 0 ? Math.round((r.unik / totalWaSeluruh) * 100) : 0,
        }))

        // --- Data utama tabel tracking ---
        const rows = await col.find({}).sort({ created_at: -1 }).toArray()
        const data = rows.map((r) => ({
            kode: r.code_input ?? "",
            nama_perusahaan: r.nama_perusahaan ?? "",
            kota: r.kota ?? "",
            provinsi: r.provinsi ?? "",
            produk: r.produk_relevan ?? "",
            pic: r.nama ?? "",
            jabatan: r.jabatan ?? "",
            telp: r.no_telp ?? "",
            tipe: r.tipe_kontak ?? "",
        }))

        return NextResponse.json({
            // Statistik ringkasan
            total_no_telp: uniqueNoTelp.length,
            total_provinsi: uniqueProvinsi.length,
            total_kota: uniqueKota.length,
            total_nama: uniqueNama.length,
            total_kontak_unik: totalKontakUnik,
            total_wa_unik: totalWaUnik,
            // Tabel analitik
            provinsi_kota: tableProvinsiKota,
            wa_provinsi_kota: tableWaProvinsiKota,
            // Data utama
            rows: data,
        })

    } catch (error) {
        console.error("Error fetching tracking data:", error)
        return NextResponse.json(
            { error: "Gagal mengambil data" },
            { status: 500 }
        )
    }
}