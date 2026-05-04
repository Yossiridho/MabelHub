export type Role = "SUPERADMIN" | "ADMIN" | "LEADER" | "SALES";

export type MenuItem = {
  label: string;
  href: string;
  icon: string;
};

export type MenuSection = {
  title: string;
  icon: string;
  items: MenuItem[];
};

export const MENUS_BY_ROLE: Record<Role, MenuSection[]> = {
  SUPERADMIN: [
    {
      title: "TELEMARKETING",
      icon: "Bot",
      items: [
        { label: "Input Database", href: "/input-database", icon: "Bot"},
        { label: "Tracking Database", href: "/tracking-database", icon: "Database"},
        { label: "Tracking Broadcast", href: "/tracking-broadcast", icon: "MessageCircleCode"},
        { label: "Report Progres", href: "/report-progres", icon: "FileText"},
      ]
    },
    {
      title: "VISIT",
      icon: "CalendarCheck",
      items: [
        { label: "Dashboard Visit", href: "/dashboard-request", icon: "LayoutDashboard" },
        { label: "Plan Activity", href: "/plan-activity", icon: "MapPin" },
        { label: "Rekapitulasi Visit", href: "/rekapitulasi-visit", icon: "BarChart3" },
      ],
    },
    {
      title: "PRODUCT",
      icon: "Package",
      items: [
        { label: "Dashboard Admin", href: "/dashboard-response", icon: "CheckSquare" },
      ],
    },
    {
      title: "E-PROCUREMENT",
      icon: "ShoppingCart",
      items: [
        { label: "Form E-Procurement", href: "/e-procurement", icon: "FilePlus" },
        { label: "Request E-Procurement", href: "/e-procurement-response", icon: "ClipboardList" },
        { label: "Rekapitulasi E-Procurement", href: "/rekapitulasi-Eproc", icon: "PieChart" },
        { label: "Tindak Lanjut Sales", href: "/tindak-lanjut-sales", icon: "User"},
      ],
    },
    {
      title: "ADMIN",
      icon: "UserCog",
      items: [
        { label: "Rekapitulasi Admin", href: "/rekapitulasi-response", icon: "BarChart" },
      ],
    },
    {
      title: "INSTANSI",
      icon: "Building2",
      items: [
        { label: "Daftar Instansi", href: "/instansi", icon: "Building2" },
        { label: "Tambah Instansi", href: "/tambah-instansi", icon: "PlusSquare" },
      ],
    },
    {
      title: "FINANCE",
      icon: "Banknote",
      items: [
        { label: "Finance", href: "/finance", icon: "Banknote" },
      ],
    },
    {
      title: "MANAJEMEN",
      icon: "ShieldCheck",
      items: [
        { label: "Add User", href: "/add-user", icon: "UserPlus" },
        { label: "Teams", href: "/teams", icon: "Users" },
        { label: "Parameter", href: "/parameters", icon: "Settings" },
      ],
    },
  ],

  ADMIN: [
    {
      title: "PRODUCT",
      icon: "Package",
      items: [
        { label: "Dashboard Admin", href: "/dashboard-response", icon: "CheckSquare" },
      ],
    },
    {
      title: "E-PROCUREMENT",
      icon: "ShoppingCart",
      items: [
        { label: "Form E-Procurement", href: "/e-procurement", icon: "FilePlus" },
        { label: "Request E-Procurement", href: "/e-procurement-response", icon: "ClipboardList" },
        { label: "Rekapitulasi E-Procurement", href: "/rekapitulasi-Eproc", icon: "PieChart" },
      ],
    },
    {
      title: "ADMIN",
      icon: "UserCog",
      items: [
        { label: "Rekapitulasi Admin", href: "/rekapitulasi-response", icon: "BarChart" },
      ],
    },
    {
      title: "INSTANSI",
      icon: "Building2",
      items: [
        { label: "Daftar Instansi", href: "/instansi", icon: "Building2" },
        { label: "Tambah Instansi", href: "/tambah-instansi", icon: "PlusSquare" },
      ],
    },
  ],

  LEADER: [
    {
      title: "VISIT",
      icon: "CalendarCheck",
      items: [
        { label: "Dashboard Visit", href: "/dashboard-request", icon: "LayoutDashboard" },
        { label: "Plan Activity", href: "/plan-activity", icon: "MapPin" },
        { label: "Rekapitulasi Visit", href: "/rekapitulasi-visit", icon: "BarChart3" },
      ],
    },
    {
      title: "E-PROCUREMENT",
      icon: "ShoppingCart",
      items: [
        { label: "Form E-Procurement", href: "/e-procurement", icon: "FilePlus" },
        { label: "Rekapitulasi E-Procurement", href: "/rekapitulasi-Eproc", icon: "PieChart" },
      ],
    },
  ],

  SALES: [
    {
      title: "VISIT",
      icon: "CalendarCheck",
      items: [
        { label: "Dashboard Visit", href: "/dashboard-request", icon: "LayoutDashboard" },
        { label: "Plan Activity", href: "/plan-activity", icon: "MapPin" },
        { label: "Rekapitulasi Visit", href: "/rekapitulasi-visit", icon: "BarChart3" },
      ],
    },
    {
      title: "E-PROCUREMENT",
      icon: "ShoppingCart",
      items: [
        { label: "Form E-Procurement", href: "/e-procurement", icon: "FilePlus" },
        { label: "Rekapitulasi E-Procurement", href: "/rekapitulasi-Eproc", icon: "PieChart" },
      ],
    },
  ],
};

export function getMenuByRole(role: Role): MenuSection[] {
  return MENUS_BY_ROLE[role] ?? [];
}
