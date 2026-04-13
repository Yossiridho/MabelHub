export type Role = "SUPERADMIN" | "ADMIN" | "LEADER" | "SALES";

export type MenuItem = {
  label: string;
  href: string;
};

export type MenuSection = {
  title: string;
  items: MenuItem[];
};

export const MENUS_BY_ROLE: Record<Role, MenuSection[]> = {
  SUPERADMIN: [
    {
      title: "ACTIVITY REQUEST",
      items: [
        { label: "Dashboard", href: "/dashboard-request" },
        { label: "Plan Activity", href: "/plan-activity" },
        { label: "E-Procurement", href: "/e-procurement" },
        { label: "Rekapitulasi Visit", href: "/rekapitulasi-visit" },
        { label: "Rekapitulasi E-Procurement", href: "/rekapitulasi-Eproc" },
      ],
    },
    {
      title: "ACTIVITY RESPONSE",
      items: [
        { label: "Dashboard", href: "/dashboard-response" },
        { label: "E-Procurement Request", href: "/e-procurement-response" },
        { label: "Rekapitulasi", href: "/rekapitulasi-response" },
        { label: "Finance", href: "/finance" },
        { label: "Instansi", href: "/instansi" },
        { label: "TM Database", href: "/tm-database" },
      ],
    },
    {
      title: "Lainnya",
      items: [
        { label: "Add User", href: "/add-user" },
        { label: "Parameter", href: "/parameters" },
        { label: "Teams", href: "/teams" },
      ],
    },
  ],

  ADMIN: [
    {
      title: "ACTIVITY REQUEST",
      items: [{ label: "E-Procurement", href: "/e-procurement" }],
    },
    {
      title: "ACTIVITY RESPONSE",
      items: [
        { label: "Dashboard", href: "/dashboard-response" },
        { label: "E-Procurement Request", href: "/e-procurement-response" },
        { label: "Rekapitulasi", href: "/rekapitulasi-response" },
        { label: "TM Database", href: "/tm-database" },
      ],
    },
  ],

  LEADER: [
    {
      title: "ACTIVITY REQUEST",
      items: [
        { label: "Dashboard", href: "/dashboard-request" },
        { label: "Plan Activity", href: "/plan-activity" },
        { label: "E-Procurement", href: "/e-procurement" },
        { label: "Rekapitulasi Visit", href: "/rekapitulasi-visit" },
        { label: "Rekapitulasi E-Procurement", href: "/rekapitulasi-Eproc" },
      ],
    },
  ],

  SALES: [
    {
      title: "ACTIVITY REQUEST",
      items: [
        { label: "Dashboard", href: "/dashboard-request" },
        { label: "Plan Activity", href: "/plan-activity" },
        { label: "E-Procurement", href: "/e-procurement" },
        { label: "Rekapitulasi Visit", href: "/rekapitulasi-visit" },
        { label: "Rekapitulasi E-Procurement", href: "/rekapitulasi-Eproc" },
      ],
    },
  ],
};

export function getMenuByRole(role: Role): MenuSection[] {
  return MENUS_BY_ROLE[role] ?? [];
}
