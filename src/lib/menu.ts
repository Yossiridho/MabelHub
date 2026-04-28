export type Role = "SUPERADMIN" | "ADMIN" | "LEADER" | "SALES";

export type MenuItem = {
  label: string;
  href: string;
  icon: string;
};

export type MenuSection = {
  title: string;
  icon: string; // NEW: Section icon
  items: MenuItem[];
};

export const MENUS_BY_ROLE: Record<Role, MenuSection[]> = {
  SUPERADMIN: [
    {
      title : "TELEMARKETING",
      icon : "Bot",
      items: [
        { label: "Input Database", href: "/input-database", icon: "Bot"},
        { label: "Tracking Database", href: "/tracking-database", icon: "Database"},
        { label: "Tracking Broadcast", href: "/tracking-broadcast", icon: "MessageCircleCode"},
        { label: "Report Progres", href: "/report-progres", icon: "FileText"},
      ]
    },
    {
      title: "ACTIVITY REQUEST",
      icon: "Edit3",
      items: [
        { label: "Dashboard", href: "/dashboard-request", icon: "LayoutDashboard" },
        { label: "Plan Activity", href: "/plan-activity", icon: "MapPin" },
        { label: "E-Procurement", href: "/e-procurement", icon: "ShoppingCart" },
        { label: "Rekapitulasi Visit", href: "/rekapitulasi-visit", icon: "BarChart3" },
        { label: "Rekapitulasi E-Procurement", href: "/rekapitulasi-Eproc", icon: "PieChart" },
        { label: "Tindak Lanjut Sales", href: "/tindak-lanjut-sales", icon: "User"},
      ],
    },
    {
      title: "ACTIVITY RESPONSE",
      icon: "CheckCircle",
      items: [
        { label: "Dashboard", href: "/dashboard-response", icon: "LayoutDashboard" },
        { label: "E-Procurement Request", href: "/e-procurement-response", icon: "ClipboardList" },
        { label: "Rekapitulasi", href: "/rekapitulasi-response", icon: "BarChart" },
        { label: "Finance", href: "/finance", icon: "Banknote" },
        { label: "Instansi", href: "/instansi", icon: "Building2" }
      ],
    },
    {
      title: "Lainnya",
      icon: "MoreHorizontal",
      items: [
        { label: "Add User", href: "/add-user", icon: "UserPlus" },
        { label: "Parameter", href: "/parameters", icon: "Settings" },
        { label: "Teams", href: "/teams", icon: "Users" },
      ],
    },
  ],

  ADMIN: [
    {
      title: "ACTIVITY REQUEST",
      icon: "Edit3",
      items: [{ label: "E-Procurement", href: "/e-procurement", icon: "ShoppingCart" }],
    },
    {
      title: "ACTIVITY RESPONSE",
      icon: "CheckCircle",
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
      icon: "Edit3",
      items: [
        { label: "Dashboard", href: "/dashboard-request", icon: "LayoutDashboard" },
        { label: "Plan Activity", href: "/plan-activity", icon: "MapPin" },
        { label: "E-Procurement", href: "/e-procurement", icon: "ShoppingCart" },
        { label: "Rekapitulasi Visit", href: "/rekapitulasi-visit", icon: "BarChart3" },
        { label: "Rekapitulasi E-Procurement", href: "/rekapitulasi-Eproc", icon: "PieChart" },
      ],
    },
  ],

  SALES: [
    {
      title: "ACTIVITY REQUEST",
      icon: "Edit3",
      items: [
        { label: "Dashboard", href: "/dashboard-request", icon: "LayoutDashboard" },
        { label: "Plan Activity", href: "/plan-activity", icon: "MapPin" },
        { label: "E-Procurement", href: "/e-procurement", icon: "ShoppingCart" },
        { label: "Rekapitulasi Visit", href: "/rekapitulasi-visit", icon: "BarChart3" },
        { label: "Rekapitulasi E-Procurement", href: "/rekapitulasi-Eproc", icon: "PieChart" },
      ],
    },
  ],
};

export function getMenuByRole(role: Role): MenuSection[] {
  return MENUS_BY_ROLE[role] ?? [];
}
