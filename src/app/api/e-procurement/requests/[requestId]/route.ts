import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { assertLoggedIn } from "@/lib/auth-server";

type ProductItem = {
  id: string;
  merek: string;
  subKategori: string;
  qty: number;
  spesifikasi: string;
  paguPerItem: number | "";
  hargaTayang: number | "";
  linkInaproc: string;
  linkEcom: string;

  // Admin Response Fields per item
  statusBarangAdmin?: string; // e.g Todo, Progress, Hold, Cancel, Done
  tayangInaprocAdmin?: string; // e.g Ya, Tidak
};

type EProcDoc = {
  requestId: string;
  requestor: string;
  pemohon: string;
  lokasi: string;
  segmen: string;
  deadlineUsulan: string;
  tanggalSubmit: string;
  catatan?: string;

  items: ProductItem[];

  createdBy: {
    userId: string;
    role: string;
    username: string;
    fullName: string;
  };

  assignedTo?: {
    userId: string;
    role: string;
    username: string;
    fullName: string;
  };

  createdAt: Date;
  updatedAt: Date;

  takenByAdminId: string | null;
  takenByAdminName: string | null;
  takenAt: Date | null;

  // Admin Response Fields
  perusahaan?: string;
  catatanAdmin?: string;
  statusAkhir?: string; // Computed automatically
  // History tracking
  history?: {
    action: string;
    actor: string;
    timestamp: Date;
    details: string[];
  }[];
};

async function getParams<T>(ctx: { params: T | Promise<T> }) {
  return await Promise.resolve(ctx.params);
}

function canAccess(session: any, doc: EProcDoc) {
  if (session.role === "SUPERADMIN") return true;
  if (doc.createdBy?.userId === session.userId) return true;
  if (doc.assignedTo?.userId === session.userId) return true;
  return false;
}

export async function GET(
  req: Request,
  ctx: { params: { requestId: string } | Promise<{ requestId: string }> },
) {
  const auth = assertLoggedIn(req);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { requestId } = await getParams(ctx);
  const rid = decodeURIComponent(requestId);

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "MabelHub");
  const col = db.collection<EProcDoc>("eproc_requests");

  const doc = await col.findOne({ requestId: rid }, { projection: { _id: 0 } });
  if (!doc) {
    return NextResponse.json(
      { error: "Request tidak ditemukan" },
      { status: 404 },
    );
  }

  if (!canAccess(auth.session, doc)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  if (doc.takenByAdminId) {
    return NextResponse.json(
      { error: "Request sudah diambil admin, tidak bisa direvisi" },
      { status: 409 },
    );
  }

  return NextResponse.json({
    data: {
      header: {
        requestor: doc.requestor,
        pemohon: doc.pemohon,
        segmen: doc.segmen,
        deadline: doc.deadlineUsulan,
        lokasi: doc.lokasi,
        catatanHeader: doc.catatan ?? "",
        assignedToUserId: doc.assignedTo?.userId ?? doc.createdBy?.userId ?? "",
      },
      items: doc.items ?? [],
      infoId: doc.requestId,
      tanggalSubmit: doc.tanggalSubmit,
    },
  });
}

export async function PUT(
  req: Request,
  ctx: { params: { requestId: string } | Promise<{ requestId: string }> },
) {
  const auth = assertLoggedIn(req);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { requestId } = await getParams(ctx);
  const rid = decodeURIComponent(requestId);

  const body = await req.json().catch(() => ({}));
  const header = body?.header ?? {};
  const items: ProductItem[] = Array.isArray(body?.items) ? body.items : [];

  const requestor = String(header.requestor ?? "").trim();
  const pemohon = String(header.pemohon ?? "").trim();
  const segmen = String(header.segmen ?? "").trim();
  const deadlineUsulan = String(header.deadline ?? "").trim();
  const lokasi = String(header.lokasi ?? "").trim();
  const catatan = String(header.catatanHeader ?? "").trim();

  if (!requestor || !pemohon || !segmen) {
    return NextResponse.json(
      { error: "Header wajib: requestor, pemohon, segmen" },
      { status: 400 },
    );
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "MabelHub");
  const col = db.collection<EProcDoc>("eproc_requests");

  const existing = await col.findOne(
    { requestId: rid },
    { projection: { _id: 0 } },
  );
  if (!existing) {
    return NextResponse.json(
      { error: "Request tidak ditemukan" },
      { status: 404 },
    );
  }

  if (!canAccess(auth.session, existing)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  if (existing.takenByAdminId) {
    return NextResponse.json(
      { error: "Request sudah diambil admin, tidak bisa direvisi" },
      { status: 409 },
    );
  }

  const now = new Date();

  // TRACK HISTORY
  const historyDetails: string[] = [];

  if (existing.requestor !== requestor) {
    historyDetails.push(`Requestor: "${existing.requestor}" -> "${requestor}"`);
  }
  if (existing.pemohon !== pemohon) {
    historyDetails.push(`Pemohon: "${existing.pemohon}" -> "${pemohon}"`);
  }
  if (existing.segmen !== segmen) {
    historyDetails.push(`Segmen: "${existing.segmen}" -> "${segmen}"`);
  }
  if ((existing.lokasi || "") !== lokasi) {
    historyDetails.push(`Lokasi: "${existing.lokasi || ""}" -> "${lokasi}"`);
  }
  if ((existing.deadlineUsulan || "") !== deadlineUsulan) {
    historyDetails.push(
      `Deadline: "${existing.deadlineUsulan || ""}" -> "${deadlineUsulan}"`,
    );
  }
  if ((existing.catatan || "") !== catatan) {
    historyDetails.push(
      `Catatan Header: "${existing.catatan || ""}" -> "${catatan}"`,
    );
  }

  // Items tracking
  const oldItems = existing.items || [];
  const newItems = items || [];

  const oldMap = new Map(oldItems.map((i) => [i.id, i]));
  const newMap = new Map(newItems.map((i) => [i.id, i]));

  // Check new and updated items
  newItems.forEach((nItem) => {
    const oItem = oldMap.get(nItem.id);
    if (!oItem) {
      if (nItem.qty > 0) {
        historyDetails.push(
          `Item Ditambahkan: "${nItem.merek}" (Kategori: ${nItem.subKategori}, Qty: ${nItem.qty})`,
        );
      }
    } else {
      if (oItem.qty > 0 && nItem.qty === 0) {
        historyDetails.push(`Item Dihapus (Qty -> 0): "${nItem.merek}"`);
      } else if (nItem.qty > 0) {
        // Did fields change?
        const itemChanges = [];
        if (oItem.merek !== nItem.merek)
          itemChanges.push(`Merek ("${oItem.merek}" -> "${nItem.merek}")`);
        if (oItem.subKategori !== nItem.subKategori)
          itemChanges.push(
            `Kategori ("${oItem.subKategori}" -> "${nItem.subKategori}")`,
          );
        if (oItem.qty !== nItem.qty)
          itemChanges.push(`Qty (${oItem.qty} -> ${nItem.qty})`);
        if (oItem.paguPerItem !== nItem.paguPerItem)
          itemChanges.push(
            `Pagu (${oItem.paguPerItem} -> ${nItem.paguPerItem})`,
          );

        if (itemChanges.length > 0) {
          historyDetails.push(
            `Item Diubah ("${oItem.merek || nItem.merek}"): ${itemChanges.join(", ")}`,
          );
        }
      }
    }
  });

  const updateDoc: any = {
    $set: {
      requestor,
      pemohon,
      segmen,
      deadlineUsulan,
      lokasi,
      catatan,
      items,
      updatedAt: now,
    },
  };

  if (historyDetails.length > 0) {
    const actorName = auth.session.fullName || auth.session.username || "User";
    updateDoc.$push = {
      history: {
        action: "Revisi Request",
        actor: actorName,
        timestamp: now,
        details: historyDetails,
      },
    };
  }

  const rawResult = await col.findOneAndUpdate(
    {
      requestId: rid,
      takenByAdminId: null,
    },
    updateDoc,
    {
      returnDocument: "after",
      projection: { _id: 0 },
    } as any,
  );

  const updated = (rawResult as any)?.value ?? rawResult ?? null;

  if (!updated) {
    return NextResponse.json(
      { error: "Tidak bisa revisi (sudah diambil admin / tidak ditemukan)" },
      { status: 409 },
    );
  }

  // Notifikasi untuk revisi (jika ada perubahan)
  if (historyDetails.length > 0) {
    try {
      const usersCol = db.collection("users");
      const notifCol = db.collection("notifications");

      const admins = await usersCol
        .find({ role: { $in: ["SUPERADMIN", "ADMIN"] } })
        .toArray();

      if (admins.length > 0) {
        const title = `Revisi Request E-Procurement (${rid})`;
        const message = `Ada revisi pada request e-procurement dari ${updated.requestor || "User"}. ${historyDetails.length} perubahan dicatat.`;
        const actionUrl = `/rekapitulasi-response`;

        const notifs = admins.map((admin) => ({
          userId: String(admin._id),
          title,
          message,
          actionUrl,
          isRead: false,
          createdAt: now,
        }));
        await notifCol.insertMany(notifs);
      }
    } catch (err) {
      console.error("Gagal mengirim notifikasi revisi e-proc:", err);
    }
  }

  return NextResponse.json({ data: updated });
}
