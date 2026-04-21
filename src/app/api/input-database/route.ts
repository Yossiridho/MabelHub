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
        const docs = items.map((item: {
            id: string
            nama: string
            jabatan: string
            tipeKontak: string
            noTelp: string
            email: string
        }) => ({
            // Data identifikasi
            ticket_code:        header.ticketCode        || "",
            requestor:          header.requestor         || "",
            assigned_to:        header.assignedToUserId  || "",
            // Data perusahaan
            segmen:             header.segmen            || "",
            nama_perusahaan:    header.namaPerusahaan    || "",
            provinsi:           header.provinsi          || "",
            kota:               header.kota              || "",
            alamat:             header.alamat            || "",
            bidang_perusahaan:  header.bidangPerusahaan  || "",
            segmentasi:         header.segmentasi        || "",
            produk_relevan:     header.produkRelevan     || "",
            merek_tayang:       header.merekTayang       || "",
            brand_owner:        header.brandOwner        || "",
            sumber_data:        header.sumberData        || "",
            link_produk:        header.linkProduk        || "",
            link_toko:          header.linkToko          || "",
            // Data kontak
            nama:               item.nama       || "",
            jabatan:            item.jabatan    || "",
            tipe_kontak:        item.tipeKontak || "",
            no_telp:            item.noTelp     || "",
            email:              item.email      || "",
            // Metadata
            created_at: now,
            updated_at: now,
        }))
        const items: KontakItem[] = Array.isArray(body?.items) ? body.items : [];
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