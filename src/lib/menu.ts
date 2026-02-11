export type Role = "SUPERADMIN" | "ADMIN" | "USER";

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
        { label: "Dashboard", href: "/dashboard-visit" },
        { label: "Plan Activity", href: "/plan-activity" },
        { label: "E-Procurement", href: "/e-procurement" },
        { label: "Rekapitulasi", href: "/rekapitulasi" },
      ],
    },
    {
      title: "ACTIVITY RESPONSE",
      items: [
        { label: "Dashboard", href: "/dashboard-response" },
        { label: "E-Procurement Response", href: "/e-procurement-response" },
        { label: "Rekapitulasi", href: "/rekapitulasi-response" },
        { label: "Instansi", href: "/instansi" },
      ],
    },
    {
      title: "Lainnya",
      items: [
        { label: "Add User", href: "/users/add" },
        { label: "Parameter", href: "/parameter" },
      ],
    },
  ],

  ADMIN: [
    {
      title: "ACTIVITY REQUEST",
      items: [
        { label: "E-Procurement", href: "/e-procurement" },
        { label: "Rekapitulasi", href: "/rekapitulasi" },
      ],
    },
    {
      title: "ACTIVITY RESPONSE",
      items: [
        { label: "Dashboard", href: "/dashboard-response" },
        { label: "E-Procurement Response", href: "/e-procurement-response" },
        { label: "Rekapitulasi", href: "/rekapitulasi-response" },
      ],
    },
  ],

  USER: [
    {
      title: "ACTIVITY REQUEST",
      items: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Plan Activity", href: "/plan-activity" },
        { label: "E-Procurement", href: "/e-procurement" },
        { label: "Rekapitulasi", href: "/rekapitulasi" },
      ],
    },
  ],
};

export function getMenuByRole(role: Role): MenuSection[] {
  return MENUS_BY_ROLE[role] ?? [];
}
