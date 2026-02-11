export type Role = 'SUPERADMIN' | 'ADMIN' | 'USER'

export type MenuItem = {
  label: string
  href: string
  roles: Role[]
}

export type MenuSection = {
  title: string
  items: MenuItem[]
}

export const MENU_ITEMS: MenuItem[] = [
  {
    label: 'DASHBOARD',
    href: '/dashboard-visit',
    roles: ['SUPERADMIN', 'ADMIN', 'USER'],
  },
  {
    label: 'PLAN ACTIVITY',
    href: '/plan-activity',
    roles: ['SUPERADMIN', 'ADMIN', 'USER'],
  },
  {
    label: 'E-Procurement',
    href: '/e-procurement',
    roles: ['SUPERADMIN', 'ADMIN', 'USER'],
  },
  {
    label: 'REPORT',
    href: '/report',
    roles: ['SUPERADMIN', 'ADMIN', 'USER'],
  },
]

export const MENUS_BY_ROLE: Record<Role, MenuSection[]> = {
  SUPERADMIN: [
    {
      title: 'Main',
      items: MENU_ITEMS,
    },
  ],
  ADMIN: [
    {
      title: 'Main',
      items: MENU_ITEMS,
    },
  ],
  USER: [
    {
      title: 'Main',
      items: MENU_ITEMS,
    },
  ],
}

export function getMenuByRole(role: Role): MenuSection[] {
  return MENUS_BY_ROLE[role] ?? []
}
