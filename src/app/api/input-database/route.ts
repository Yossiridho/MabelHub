import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

type KontakItem = {
    id: string
    nama: string
    jabatan: string
    tipeKontak: string
    noTelp: string
    email: string
}

// Mengembalikan counter berikutnya (misal "0003") berdasarkan jumlah kode unik yang sudah ada
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const prefix = searchParams.get('prefix') || ''
        const dmy = searchParams.get('dmy') || ''

        if (!prefix || !dmy) {
            return NextResponse.json({ counter: '0001' })
        }

        const client = await clientPromise
        const db = client.db("MabelHub")
        const col = db.collection("input_database")

        // Hitung jumlah kode unik yang sudah pakai prefix+dmy ini
        const pattern = `^${prefix}-${dmy}-`
        const distinct = await col.distinct("code_input", {
            code_input: { $regex: pattern }
        })

        const next = distinct.length + 1
        const counter = String(next).padStart(4, '0')

        return NextResponse.json({ counter })
    } catch (error) {
        console.error("[GET /api/input-database] Error:", error)
        return NextResponse.json({ counter: '0001' })
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
        const col = db.collection("input_database")

        const now = new Date()

        // Setiap item kontak disimpan sebagai dokumen terpisah bersama data header
        const docs = items.map((item: KontakItem) => ({
            // Data identifikasi
            code_input: header.codeInput || "",
            requestor: header.requestor || "",
            assigned_to: header.assignedToUserId || "",
            // Data perusahaan
            segmen: header.segmen || "",
            nama_perusahaan: header.namaPerusahaan || "",
            provinsi: header.provinsi || "",
            kota: header.kota || "",
            alamat: header.alamat || "",
            bidang_perusahaan: header.bidangPerusahaan || "",
            segmentasi: header.segmentasi || "",
            produk_relevan: header.produkRelevan || "",
            merek_tayang: header.merekTayang || "",
            brand_owner: header.brandOwner || "",
            sumber_data: header.sumberData || "",
            link_produk: header.linkProduk || "",
            link_toko: header.linkToko || "",
            // Data kontak
            nama: item.nama || "",
            jabatan: item.jabatan || "",
            tipe_kontak: item.tipeKontak || "",
            no_telp: item.noTelp || "",
            email: item.email || "",
            // Metadata
            created_at: now,
            updated_at: now,
        }))

        const result = await col.insertMany(docs)

        return NextResponse.json(
            { success: true, inserted: result.insertedCount },
            { status: 201 }
        )
    } catch (error) {
        console.error("[POST /api/input-database] Error:", error)
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        )
    }
}