import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
    try {
        const client = await clientPromise
        const db = client.db("MabelHub")
        const col = db.collection("input_database")

        const { searchParams } = req.nextUrl

        // ----------------------------------------------------------------
        // Deteksi mode: jika ada param `page` atau `limit` → pagination mode
        // ----------------------------------------------------------------
        const hasPagination = searchParams.has("page") || searchParams.has("limit")

        // --- Statistik Unik (selalu dihitung) ---
        const uniqueNoTelp = await col.distinct("no_telp", { no_telp: { $ne: "" } })
        const uniqueProvinsi = await col.distinct("provinsi", { provinsi: { $ne: "" } })
        const uniqueKota = await col.distinct("kota", { kota: { $ne: "" } })
        const uniqueNama = await col.distinct("nama", { nama: { $ne: "" } })

        const uniqueCombinedAgg = await col.aggregate([
            { $match: { nama: { $ne: "" }, no_telp: { $ne: "" } } },
            { $group: { _id: { nama: "$nama", no_telp: "$no_telp" } } },
            { $count: "total" }
        ]).toArray()
        const totalKontakUnik = uniqueCombinedAgg[0]?.total ?? 0

        const uniqueWaAgg = await col.aggregate([
            { $match: { tipe_kontak: "WhatsApp", nama: { $ne: "" }, no_telp: { $ne: "" } } },
            { $group: { _id: { nama: "$nama", no_telp: "$no_telp" } } },
            { $count: "total" }
        ]).toArray()
        const totalWaUnik = uniqueWaAgg[0]?.total ?? 0

        // --- Tabel Analitik: Unik per Provinsi & Kota ---
        const provinsiKotaAgg = await col.aggregate([
            {
                $match: {
                    provinsi: { $ne: "" }, kota: { $ne: "" },
                    nama: { $ne: "" }, no_telp: { $ne: "" },
                }
            },
            { $group: { _id: { provinsi: "$provinsi", kota: "$kota", nama: "$nama", no_telp: "$no_telp" } } },
            { $group: { _id: { provinsi: "$_id.provinsi", kota: "$_id.kota" }, unik: { $sum: 1 } } },
            { $sort: { "_id.provinsi": 1, "_id.kota": 1 } }
        ]).toArray()

        const totalUnikSeluruh = provinsiKotaAgg.reduce((sum, r) => sum + r.unik, 0)
        const tableProvinsiKota = provinsiKotaAgg.map((r, idx) => ({
            no: idx + 1,
            provinsi: r._id.provinsi,
            kota: r._id.kota,
            unik: r.unik,
            pct: totalUnikSeluruh > 0 ? Math.round((r.unik / totalUnikSeluruh) * 100) : 0,
        }))

        // --- Tabel Analitik: WA Unik per Provinsi & Kota ---
        const waProvinsiKotaAgg = await col.aggregate([
            {
                $match: {
                    tipe_kontak: "WhatsApp",
                    provinsi: { $ne: "" }, kota: { $ne: "" },
                    nama: { $ne: "" }, no_telp: { $ne: "" },
                }
            },
            { $group: { _id: { provinsi: "$provinsi", kota: "$kota", nama: "$nama", no_telp: "$no_telp" } } },
            { $group: { _id: { provinsi: "$_id.provinsi", kota: "$_id.kota" }, unik: { $sum: 1 } } },
            { $sort: { "_id.provinsi": 1, "_id.kota": 1 } }
        ]).toArray()

        const totalWaSeluruh = waProvinsiKotaAgg.reduce((sum, r) => sum + r.unik, 0)
        const tableWaProvinsiKota = waProvinsiKotaAgg.map((r, idx) => ({
            no: idx + 1,
            provinsi: r._id.provinsi,
            kota: r._id.kota,
            unik: r.unik,
            pct: totalWaSeluruh > 0 ? Math.round((r.unik / totalWaSeluruh) * 100) : 0,
        }))

        // Statistik ringkasan (selalu disertakan)
        const summaryStats = {
            total_no_telp: uniqueNoTelp.length,
            total_provinsi: uniqueProvinsi.length,
            total_kota: uniqueKota.length,
            total_nama: uniqueNama.length,
            total_kontak_unik: totalKontakUnik,
            total_wa_unik: totalWaUnik,
            provinsi_kota: tableProvinsiKota,
            wa_provinsi_kota: tableWaProvinsiKota,
        }

        // ----------------------------------------------------------------
        // Mode tanpa pagination: kembalikan semua rows sekaligus (legacy)
        // ----------------------------------------------------------------
        if (!hasPagination) {
            const allRows = await col.find({}).sort({ created_at: -1 }).toArray()
            const data = allRows.map((r) => ({
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
            return NextResponse.json({ ...summaryStats, rows: data })
        }

        // ----------------------------------------------------------------
        // Mode pagination: bangun filter dari query params
        // ----------------------------------------------------------------
        const page = Math.max(1, Number(searchParams.get("page") ?? 1))
        const limit = Math.min(500, Math.max(1, Number(searchParams.get("limit") ?? 25)))
        const skip = (page - 1) * limit

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter: Record<string, any> = {}

        const bulanArr    = searchParams.getAll("bulan")
        const produkArr   = searchParams.getAll("produk")
        const merekArr    = searchParams.getAll("merek")
        const perusahaanArr = searchParams.getAll("perusahaan")
        const provinsiArr = searchParams.getAll("provinsi")
        const kotaArr     = searchParams.getAll("kota")
        const tipeArr     = searchParams.getAll("tipe")
        const startDate   = searchParams.get("startDate")
        const endDate     = searchParams.get("endDate")

        if (produkArr.length > 0)    filter["produk_relevan"]  = { $in: produkArr }
        if (merekArr.length > 0)     filter["merek"]           = { $in: merekArr }
        if (perusahaanArr.length > 0) filter["nama_perusahaan"] = { $in: perusahaanArr }
        if (provinsiArr.length > 0)  filter["provinsi"]        = { $in: provinsiArr }
        if (kotaArr.length > 0)      filter["kota"]            = { $in: kotaArr }
        if (tipeArr.length > 0)      filter["tipe_kontak"]     = { $in: tipeArr }

        // ---- Date filter ----
        if (bulanArr.length > 0) {
            // Multi-bulan: build $or of per-month ranges (WIB)
            const monthRanges = bulanArr.flatMap(m => {
                const [y, mo] = m.split("-")
                if (!y || !mo) return []
                const from = new Date(`${y}-${mo}-01T00:00:00+07:00`)
                const to   = new Date(from)
                to.setMonth(to.getMonth() + 1)
                return [{ created_at: { $gte: from, $lt: to } }]
            })
            if (monthRanges.length === 1) Object.assign(filter, monthRanges[0])
            else if (monthRanges.length > 1) filter["$or"] = monthRanges
        } else if (startDate || endDate) {
            // Date-range filter — WIB (+07:00).
            // Use $or to handle both native Date and ISO-string stored dates.
            const s = startDate ? new Date(`${startDate}T00:00:00+07:00`) : null
            const e = endDate   ? new Date(`${endDate}T23:59:59+07:00`)   : null
            const dateCond: Record<string, Date> = {}
            if (s) dateCond["$gte"] = s
            if (e) dateCond["$lte"] = e
            filter["created_at"] = dateCond
        }

        const [totalCount, pageRows] = await Promise.all([
            col.countDocuments(filter),
            col.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).toArray(),
        ])

        const items = pageRows.map((r) => ({
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
            ...summaryStats,
            items,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.max(1, Math.ceil(totalCount / limit)),
            },
        })

    } catch (error) {
        console.error("Error fetching tracking data:", error)
        return NextResponse.json(
            { error: "Gagal mengambil data" },
            { status: 500 }
        )
    }
}