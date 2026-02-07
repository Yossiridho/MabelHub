export type Role = "USER" | "LEADER" | "ADMIN" | "SUPER_ADMIN";

export type AdminStatus = "masuk" | "proses" | "done" | "hold" | "cancel";
export type FinalStatus = "rilis_kontrak" | "barang_terkirim" | "terbit_bast";
export type ProjectStatus =
  | "penagihan"
  | "lunas"
  | "pengumpulan_dokumen"
  | "done_project";

export type SphItem = {
  id: string;
  name: string;
  qty: number;
  actualPrice?: number; // diisi admin
};

export type SphDoc = {
  code: string;
  title: string;
  createdBy: { id: string; name: string };
  teamId: string;

  createdAt: string; // ISO
  submittedAt: string; // ISO

  claimedByAdminId?: string;
  claimedAt?: string;

  companyId?: string;

  adminStatus: AdminStatus;
  adminProsesAt?: string;
  adminDoneAt?: string;

  notes?: string;

  inaprocPublished?: boolean;
  inaprocPublishedAt?: string;

  finalStatus?: FinalStatus;
  finalStatusAt?: string;

  projectStatus?: ProjectStatus;

  contractDate?: string;
  contractAmount?: number;
  paymentDate?: string;
  paymentAmount?: number;

  items: SphItem[];
};

export type Companies = { id: string; name: string }[];
