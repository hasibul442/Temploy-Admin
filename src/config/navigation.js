import {
  LuLayoutDashboard,
  LuChartLine,
  LuUsers,
  LuBriefcase,
  LuPackage,
  LuShoppingBag,
  LuSparkles,
  LuClipboardCheck,
  LuWallet,
  LuArrowDownToLine,
  LuFlag,
  LuScale,
  LuFolderTree,
  LuFolders,
  LuMedal,
  LuCoins,
  LuLanguages,
  LuRuler,
  LuShieldCheck,
  LuSettings,
} from "react-icons/lu";

/**
 * Single source of truth for the sidebar, breadcrumbs and placeholder pages.
 * `badge` values are mock counts until the API is wired up.
 */
export const NAV_SECTIONS = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/", icon: LuLayoutDashboard },
      { label: "Analytics", href: "/analytics", icon: LuChartLine },
    ],
  },
  {
    title: "Marketplace",
    items: [
      { label: "Users", href: "/users", icon: LuUsers },
      { label: "Jobs", href: "/jobs", icon: LuBriefcase, badge: 12 },
      { label: "Offers", href: "/offers", icon: LuPackage },
      { label: "Orders", href: "/orders", icon: LuShoppingBag },
      { label: "Skills", href: "/skills", icon: LuSparkles },
      { label: "Skill tests", href: "/test", icon: LuClipboardCheck },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Transactions", href: "/transactions", icon: LuWallet },
      { label: "Withdrawals", href: "/withdrawals", icon: LuArrowDownToLine, badge: 5 },
    ],
  },
  {
    title: "Moderation",
    items: [
      { label: "Reports", href: "/reports", icon: LuFlag, badge: 8 },
      { label: "Disputes", href: "/disputes", icon: LuScale, badge: 3 },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "Categories", href: "/categories", icon: LuFolderTree },
      { label: "Subcategories", href: "/subcategories", icon: LuFolders },
      { label: "Levels", href: "/levels", icon: LuMedal },
      { label: "Currencies", href: "/currencies", icon: LuCoins },
      { label: "Languages", href: "/languages", icon: LuLanguages },
      { label: "Units", href: "/unit", icon: LuRuler },
      { label: "Employees & roles", href: "/employees", icon: LuShieldCheck },
      { label: "System settings", href: "/settings", icon: LuSettings },
    ],
  },
];

export const NAV_ITEMS = NAV_SECTIONS.flatMap((s) =>
  s.items.map((i) => ({ ...i, section: s.title }))
);

export function findNavItem(pathname) {
  if (pathname === "/") return NAV_ITEMS[0];
  return NAV_ITEMS.filter((i) => i.href !== "/" && pathname.startsWith(i.href)).sort(
    (a, b) => b.href.length - a.href.length
  )[0];
}
