import type { SphDoc, Companies } from "./types";

const nowIso = () => new Date().toISOString();

const seedSph = (): SphDoc[] => {
  const base = nowIso();

  return [
    {
      code: "SPH-20260206-0001",
      title: "Pengadaan Laptop",
      createdBy: { id: "u_sales_1", name: "Sales A" },
      teamId: "team-1",
      createdAt: base,
      submittedAt: base,
      adminStatus: "masuk",
      items: [
        { id: "i1", name: "Laptop ThinkPad", qty: 5 },
        { id: "i2", name: "Mouse Wireless", qty: 10 },
      ],
    },
    {
      code: "SPH-20260206-0002",
      title: "Pengadaan Printer",
      createdBy: { id: "u_leader_1", name: "Leader A" },
      teamId: "team-1",
      createdAt: base,
      submittedAt: base,
      claimedByAdminId: "u_admin_1",
      claimedAt: base,
      companyId: "c-1",
      adminStatus: "proses",
      adminProsesAt: base,
      notes: "Sedang cek stok vendor",
      inaprocPublished: false,
      items: [
        { id: "i1", name: "Printer LaserJet", qty: 2, actualPrice: 3500000 },
      ],
    },
    {
      code: "SPH-20260206-0003",
      title: "Pengadaan AC",
      createdBy: { id: "u_sales_2", name: "Sales B" },
      teamId: "team-2",
      createdAt: base,
      submittedAt: base,
      claimedByAdminId: "u_admin_2",
      claimedAt: base,
      companyId: "c-2",
      adminStatus: "done",
      adminProsesAt: base,
      adminDoneAt: base,
      inaprocPublished: true,
      inaprocPublishedAt: base,
      finalStatus: "terbit_bast",
      finalStatusAt: base,
      projectStatus: "penagihan",
      items: [{ id: "i1", name: "AC 1PK", qty: 6, actualPrice: 4200000 }],
    },
  ];
};

// In-memory state
let SPH: SphDoc[] = seedSph();

export const companies: Companies = [
  { id: "c-1", name: "PT Mabel Utama" },
  { id: "c-2", name: "PT Mabel Nusantara" },
  { id: "c-3", name: "CV Mabel Jaya" },
];

export function listSph(): SphDoc[] {
  return SPH;
}

export function getSph(code: string): SphDoc | undefined {
  return SPH.find((x) => x.code === code);
}

export function replaceSph(code: string, doc: SphDoc): void {
  SPH = SPH.map((x) => (x.code === code ? doc : x));
}

export function claimSph(code: string, adminId: string): SphDoc {
  const idx = SPH.findIndex((x) => x.code === code);
  if (idx === -1) throw new Error("SPH tidak ditemukan");

  const current = SPH[idx];
  if (current.claimedByAdminId)
    throw new Error("SPH sudah di-claim admin lain");

  const next: SphDoc = {
    ...current,
    claimedByAdminId: adminId,
    claimedAt: new Date().toISOString(),
  };

  SPH[idx] = next;
  return next;
}

export function resetSeed(): void {
  SPH = seedSph();
}
