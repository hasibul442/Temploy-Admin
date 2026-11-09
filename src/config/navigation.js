import {
  LuLayoutDashboard,
  LuChartLine,
  LuUsers,
  LuBriefcase,
  LuPackage,
  LuShoppingBag,
  LuSparkles,
  LuWallet,
  LuArrowDownToLine,
  LuLandmark,
  LuFlag,
  LuScale,
  LuFolderTree,
  LuLanguages,
  LuShieldCheck,
  LuSettings,
  LuImage,
} from "react-icons/lu";

/**
 * Single source of truth for the sidebar, breadcrumbs and placeholder pages.
 *
 * An item is either a link ({ label, href, icon, badge? }) or a group
 * ({ label, icon, children: [{ label, href, badge? }] }) that renders as a
 * collapsible second-level menu. `badge` values are mock counts until the API
 * is wired up; a group shows the sum of its children's badges.
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
      {
        label: "Skills",
        icon: LuSparkles,
        children: [
          { label: "All skills", href: "/skills" },
          { label: "Skill tests", href: "/test" },
        ],
      },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Transactions", href: "/transactions", icon: LuWallet },
      { label: "Withdrawals", href: "/withdrawals", icon: LuArrowDownToLine, badge: 5 },
      { label: "Payout methods", href: "/payout-methods", icon: LuLandmark },
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
      { label: "Banners", href: "/banners", icon: LuImage },
      {
        label: "Catalog",
        icon: LuFolderTree,
        children: [
          { label: "Categories", href: "/categories" },
          { label: "Subcategories", href: "/subcategories" },
          { label: "Levels", href: "/levels" },
          { label: "Units", href: "/unit" },
        ],
      },
      {
        label: "Localization",
        icon: LuLanguages,
        children: [
          { label: "Currencies", href: "/currencies" },
          { label: "Countries", href: "/countries" },
          { label: "Languages", href: "/languages" },
        ],
      },
      { label: "Employees & roles", href: "/employees", icon: LuShieldCheck },
      { label: "System settings", href: "/settings", icon: LuSettings },
    ],
  },
];

/** Every linkable page (groups flattened to their children). */
export const NAV_ITEMS = NAV_SECTIONS.flatMap((s) =>
  s.items.flatMap((i) =>
    i.children
      ? i.children.map((c) => ({ ...c, icon: c.icon ?? i.icon, parent: i.label, section: s.title }))
      : [{ ...i, section: s.title }]
  )
);

export function findNavItem(pathname) {
  if (pathname === "/") return NAV_ITEMS[0];
  return NAV_ITEMS.filter((i) => i.href !== "/" && pathname.startsWith(i.href)).sort(
    (a, b) => b.href.length - a.href.length
  )[0];
}
