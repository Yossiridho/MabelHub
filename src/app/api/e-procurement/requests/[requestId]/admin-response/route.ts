import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { assertLoggedIn } from "@/lib/auth-server";

async function getParams<T>(ctx: { params: T | Promise<T> }) {
  return await Promise.resolve(ctx.params);
}

export async function PUT(
  req: Request,
  ctx: { params: { requestId: string } | Promise<{ requestId: string }> },
) {
  const auth = assertLoggedIn(req);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  // Hanya ADMIN dan SUPERADMIN yang boleh mengubah status response
  if (auth.session.role !== "ADMIN" && auth.session.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { requestId } = await getParams(ctx);
  const rid = decodeURIComponent(requestId);

  const body = await req.json().catch(() => ({}));

  const perusahaan = String(body.perusahaan ?? "").trim();
  const catatanAdmin = String(body.catatanAdmin ?? "").trim();
  const statusAkhirInput = String(body.statusAkhir ?? "").trim();
  const incomingItems = Array.isArray(body.items) ? body.items : [];

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "MabelHub");
  const col = db.collection("eproc_requests");

  const existing = await col.findOne({ requestId: rid });
  if (!existing) {
    return NextResponse.json(
      { error: "Request tidak ditemukan" },
      { status: 404 },
    );
  }

  // Jika ADMIN biasa, pastikan dia yang ambil request-nya
  if (auth.session.role === "ADMIN") {
    if (existing.takenByAdminId !== auth.session.userId) {
      return NextResponse.json(
        {
          error:
            "Hanya Admin yang mengambil request yang dapat mengubah statusnya",
        },
        { status: 403 },
      );
    }
  }

  const existingItems = existing.items || [];
  const now = new Date();

  // Merge items to manage tanggalProses and tanggalDone
  const items = incomingItems.map((inItem: any) => {
    const exItem = existingItems.find((e: any) => e.id === inItem.id) || {};
    const outItem = { ...inItem };

    // Preserve existing dates
    if (exItem.tanggalProses) outItem.tanggalProses = exItem.tanggalProses;
    if (exItem.tanggalDone) outItem.tanggalDone = exItem.tanggalDone;

    // Check if status changed
    const oldStatus = (exItem.statusBarangAdmin || "").toLowerCase();
    const newStatus = (inItem.statusBarangAdmin || "").toLowerCase();

    if (newStatus !== oldStatus) {
      if (newStatus === "progress" && !outItem.tanggalProses) {
        outItem.tanggalProses = now;
      }
      if (newStatus === "done" && !outItem.tanggalDone) {
        outItem.tanggalDone = now;
      }
    }

    return outItem;
  });

  // Auto-calculate statusAkhir
  let computedStatus = "Masuk";
  if (items && items.length > 0) {
    const total = items.length;
    let countDone = 0;
    let countProgress = 0;
    let countHoldCancel = 0;

    for (const it of items) {
      const st = (it.statusBarangAdmin || "").toLowerCase();
      if (st === "done") countDone++;
      else if (st === "progress") countProgress++;
      else if (st === "hold" || st === "cancel") countHoldCancel++;
    }

    if (countProgress > 0) {
      computedStatus = "Proses";
    } else if (countDone === total) {
      computedStatus = "Done";
    } else if (countDone > 0 && countDone + countHoldCancel === total) {
      // Ada yang done, sisanya cuma hold/cancel
      computedStatus = "Done";
    } else if (countHoldCancel === total) {
      computedStatus = "Batal";
    } else if (countDone > 0 || countHoldCancel > 0) {
      // fallback if there's a mix but no progress and not matching above
      computedStatus = "Proses";
    }
  }

  const rawResult = await col.findOneAndUpdate(
    { requestId: rid },
    {
      $set: {
        perusahaan,
        catatanAdmin,
        items,
        statusUsulan: computedStatus,
        statusAkhir: computedStatus === "Done" ? statusAkhirInput : "",
        updatedAt: now,
      },
    },
    { returnDocument: "after", projection: { _id: 0 } },
  );

  const updated = rawResult?.value ?? rawResult ?? null;

  if (!updated) {
    return NextResponse.json(
      { error: "Gagal menyimpan response admin" },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: updated });
}
