export type Role = "SUPER_ADMIN" | "ADMIN" | "LEADER" | "USER";

export type MenuItem = {
  label: string;
  href: string;
  roles: Role[];
};

export const MENU_ITEMS: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard-visit",
    roles: ["SUPER_ADMIN", "ADMIN", "LEADER", "USER"],
  },
  {
    label: "Visit Activity",
    href: "/visits/plans",
    roles: ["SUPER_ADMIN","ADMIN", "LEADER", "USER"],
  },
  {
    label: "instansi",
    href: "/instansi",
    roles: ["SUPER_ADMIN","ADMIN", "LEADER", "USER"],
  },
  {
    label: "data visit",
    href: "/data-visit",
    roles: ["SUPER_ADMIN","ADMIN", "LEADER", "USER"],
  },
];

export function getMenuByRole(role: Role) {
  return MENU_ITEMS.filter((m) => m.roles.includes(role));
}
