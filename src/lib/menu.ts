export type Role = "SUPERADMIN" | "ADMIN" | "USER";

export type MenuItem = {
  label: string;
  href: string;
};

export type MenuSection = {
  title: string;
  items: MenuItem[];
};

export const MENU_ITEMS: MenuItem[] = [
  {
    label: "DASHBOARD",
    href: "/dashboard-visit",
    roles: ["SUPER_ADMIN", "ADMIN", "LEADER", "USER"],
  },
  {
    label: "PLAN ACTIVITY",
    href: "/plan-activity",
    roles: ["SUPER_ADMIN", "ADMIN", "LEADER", "USER"],
  },
  {
    label: "E-Procurement",
    href: "/e-procurement",
    roles: ["SUPER_ADMIN", "ADMIN", "LEADER", "USER"],
  },
  {
    label: "REPORT",
    href: "/report",
    roles: ["SUPER_ADMIN", "ADMIN", "LEADER", "USER"],
  },
];

export function getMenuByRole(role: Role): MenuSection[] {
  return MENUS_BY_ROLE[role] ?? [];
}
