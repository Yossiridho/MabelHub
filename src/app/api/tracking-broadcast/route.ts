import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";

type KontakTrackingItem = {
    id: string
    nama_perusahaan: string
    produk_relevan: string
    alamat: string
    nama: string
    no_telp: string
}

export async function GET(req: NextRequest) {
    try {
        const client = await clientPromise
        const db = client.db("MabelHub")
        const col = db.collection("input_database")

        const { searchParams } = req.nextUrl

        const bulanArr = searchParams.getAll("bulan")
        const produkArr = searchParams.getAll("produk")
        const perusahaanArr = searchParams.getAll("perusahaan")
        const provinsiArr = searchParams.getAll("provinsi")
        const kotaArr = searchParams.getAll("kota")
        const statusWaArr = searchParams.getAll("status_wa")
        const keSalesArr = searchParams.getAll("ke_sales")
        const startDate = searchParams.get("startDate")
        const endDate = searchParams.get("endDate")

        const page = Math.max(1, Number(searchParams.get("page") ?? 1))
        const limit = Math.min(500, Math.max(1, Number(searchParams.get("limit") ?? 25)))
        const skip = (page - 1) * limit

        const midExpr = { $arrayElemAt: [{ $split: ["$code_input", "-"] }, 1] }
        const dateStrExpr = {
            $concat: [
                "20",
                { $substr: [midExpr, 4, 2] },
                { $substr: [midExpr, 2, 2] },
                { $substr: [midExpr, 0, 2] },
            ]
        }

        const matchStage: Record<string, any> = {}
        if (produkArr.length > 0) matchStage["produk_relevan"] = { $in: produkArr }
        if (perusahaanArr.length > 0) matchStage["nama_perusahaan"] = { $in: perusahaanArr }
        if (provinsiArr.length > 0) matchStage["provinsi"] = { $in: provinsiArr }
        if (kotaArr.length > 0) matchStage["kota"] = { $in: kotaArr }

        if (bulanArr.length > 0) {
            const monthConditions = bulanArr.map(m => {
                const [yyyy, mm] = m.split("-")
                if (!yyyy || !mm) return null
                const yy = yyyy.slice(2)
                return {
                    $and: [
                        { $eq: [{ $substr: [midExpr, 2, 2] }, mm] },
                        { $eq: [{ $substr: [midExpr, 4, 2] }, yy] }
                    ]
                }
            }).filter(Boolean)

            if (monthConditions.length === 1) matchStage["$expr"] = monthConditions[0]
            else if (monthConditions.length > 1) matchStage["$expr"] = { $or: monthConditions }

        } else if (startDate || endDate) {
            const conditions: any[] = []
            if (startDate) conditions.push({ $gte: [dateStrExpr, startDate.replace(/-/g, "")] })
            if (endDate) conditions.push({ $lte: [dateStrExpr, endDate.replace(/-/g, "")] })
            matchStage["$expr"] = conditions.length === 1 ? conditions[0] : { $and: conditions }
        }

        const matchAfterLookup: Record<string, any> = {}
        if (statusWaArr.length > 0) matchAfterLookup["broadcast.status_wa"] = { $in: statusWaArr }
        if (keSalesArr.length > 0) matchAfterLookup["broadcast.ke_sales"] = { $in: keSalesArr }

        const pipeline: any[] = [
            { $match: matchStage },
            {
                $lookup: {
                    from: "tracking_broadcast",
                    localField: "code_input",
                    foreignField: "kode",
                    as: "broadcast"
                }
            },
            {
                $addFields: {
                    broadcast: { $arrayElemAt: ["$broadcast", -1] }
                }
            },
            ...(Object.keys(matchAfterLookup).length > 0
                ? [{ $match: matchAfterLookup }]
                : []
            ),
        ]

        const [countResult, pageRows, statusWaCounts] = await Promise.all([
            // Hitung total
            col.aggregate([...pipeline, { $count: "total" }]).toArray(),

            // Ambil data dengan pagination
            col.aggregate([
                ...pipeline,
                { $sort: { created_at: -1 } },
                { $skip: skip },
                { $limit: limit },
            ]).toArray(),

            // Hitung per status_wa (selalu dari semua data, tanpa filter)
            col.aggregate([
                {
                    $lookup: {
                        from: "tracking_broadcast",
                        localField: "code_input",
                        foreignField: "kode",
                        as: "broadcast"
                    }
                },
                {
                    $addFields: {
                        broadcast: { $arrayElemAt: ["$broadcast", -1] }
                    }
                },
                {
                    $group: {
                        _id: { $ifNull: ["$broadcast.status_wa", ""] },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]).toArray(),
        ])

        const totalCount = countResult[0]?.total ?? 0
        const countMap = Object.fromEntries(statusWaCounts.map((s: any) => [s._id, s.count]))

        const items = pageRows.map((r) => ({
            _id: r._id?.toString() ?? "",
            kode: r.code_input ?? "",
            nama_perusahaan: r.nama_perusahaan ?? "",
            segmen: r.segmen ?? "",
            segmentasi: r.segmentasi ?? "",
            kota: r.kota ?? "",
            provinsi: r.provinsi ?? "",
            produk: r.produk_relevan ?? "",
            merek_tayang: r.merek_tayang ?? "",
            pic: r.nama ?? "",
            jabatan: r.jabatan ?? "",
            telp: String(r.no_telp ?? ""),
            tipe: r.tipe_kontak ?? "",
            bidang_perusahaan: r.bidang_perusahaan ?? "",
            brand_owner: r.brand_owner ?? "",
            email: r.email ?? "",
            link_produk: r.link_produk ?? "",
            link_toko: r.link_toko ?? "",
            alamat: r.alamat ?? "",
            sumber_date: r.sumber_date ?? "",
            sumber_lain: r.sumber_lain ?? "",
            penginput: r.penginput ?? "",
            jenis_entitas: r.jenis_entitas ?? "",
            keterangan_update: r.keterangan_update ?? "",
            bulan_data: r.bulan_data ?? "",
            status_wa: r.broadcast?.status_wa ?? "",
            ke_sales: r.broadcast?.ke_sales ?? "",
            updated_at: r.updated_at
                ? new Date(r.updated_at).toLocaleDateString('id-ID')
                : "",
        }))

        return NextResponse.json({
            items,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.max(1, Math.ceil(totalCount / limit)),
            },
            statusWaSummary: {
                terkirim:    countMap["Terkirim(1C)"] ?? 0,
                diterima:    countMap["Diterima(2C)"] ?? 0,
                belumRespon: countMap["Dibaca - Belum Respons"] ?? 0,
                positif:     countMap["Dibaca - Respons - Positif"] ?? 0,
                netral:      countMap["Dibaca - Respons - Netral"] ?? 0,
                negatif:     countMap["Dibaca - Respons - Negatif"] ?? 0,
                aktif:       countMap["Aktif Progres"] ?? 0,
                kosong:      countMap[""] ?? 0,
            }
        })

    } catch (error) {
        console.error("Error fetching broadcast data:", error)
        return NextResponse.json(
            { error: "Gagal mengambil data" },
            { status: 500 }
        )
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { header, items } = body

        if (!header || !items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: "Payload tidak valid: header atau items kosong" },
                { status: 400 }
            )
        }

        const client = await clientPromise
        const db = client.db("MabelHub")
        const col = db.collection("tracking_broadcast")

        const now = new Date()

        const docs = items.map((item: KontakTrackingItem) => ({
            nama_perusahaan: header.namaPerusahaan || "",
            produk_relevan: header.produkRelevan || "",
            alamat: header.alamat || "",
            nama: header.nama || "",
            no_telp: header.noTelp || "",
            created_at: now,
            updated_at: now,
        }))
        const result = await col.insertMany(docs)

        return NextResponse.json(
            { success: true, inserted: result.insertedCount },
            { status: 201 }
        )
    } catch (error) {
        console.error("[POST /api/tracking-broadcast] Error:", error)
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        )
    }
}