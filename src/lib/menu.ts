export type Role = "SUPER_ADMIN" | "ADMIN" | "LEADER" | "USER";

export type MenuItem = {
  label: string;
  href: string;
  roles: Role[];
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
    label: "REPORT",
    href: "/report",
    roles: ["SUPER_ADMIN", "ADMIN", "LEADER", "USER"],
  },
  {
    label: "REQUEST SPH",
    href: "/request-sph",
    roles: ["SUPER_ADMIN", "LEADER", "USER"],
  },
];

export function getMenuByRole(role: Role) {
  return MENU_ITEMS.filter((m) => m.roles.includes(role));
}
