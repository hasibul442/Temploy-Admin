/**
 * Mock admin team data: staff accounts, roles and the permission matrix.
 * Deterministic so SSR and client match. Replace with API calls later.
 */
import { daysAgo } from "./marketplace";

/** Every area of the admin a role can be granted access to. */
export const PERMISSION_MODULES = [
  { key: "dashboard", label: "Dashboard & analytics", hint: "Overview, analytics, exports" },
  { key: "users", label: "Users", hint: "Freelancer and client accounts" },
  { key: "jobs", label: "Jobs & offers", hint: "Approve, reject and edit listings" },
  { key: "orders", label: "Orders", hint: "Order status, cancellations" },
  { key: "finance", label: "Transactions & withdrawals", hint: "Payouts, refunds, ledgers" },
  { key: "moderation", label: "Reports & disputes", hint: "Take-downs, dispute rulings" },
  { key: "catalog", label: "Catalog", hint: "Categories, subcategories, skills" },
  { key: "localization", label: "Localization", hint: "Currencies, countries, languages" },
  { key: "team", label: "Employees & roles", hint: "Staff accounts and permissions" },
  { key: "settings", label: "System settings", hint: "Fees, integrations, maintenance" },
];

export const PERMISSION_ACTIONS = ["view", "create", "edit", "delete"];

const all = Object.fromEntries(PERMISSION_MODULES.map((m) => [m.key, [...PERMISSION_ACTIONS]]));
const viewOnly = (keys) => Object.fromEntries(keys.map((k) => [k, ["view"]]));

export const roles = [
  {
    id: "super-admin",
    name: "Super admin",
    description: "Full access to everything, including billing and roles. Can't be edited.",
    tone: "secondary",
    locked: true,
    permissions: all,
  },
  {
    id: "admin",
    name: "Admin",
    description: "Runs day-to-day operations. Everything except roles and system settings.",
    tone: "primary",
    permissions: { ...all, team: ["view"], settings: ["view"] },
  },
  {
    id: "moderator",
    name: "Moderator",
    description: "Keeps the marketplace safe: reviews listings, reports and disputes.",
    tone: "warning",
    permissions: {
      ...viewOnly(["dashboard", "users", "orders"]),
      jobs: ["view", "edit"],
      moderation: ["view", "create", "edit"],
    },
  },
  {
    id: "finance",
    name: "Finance manager",
    description: "Approves withdrawals, issues refunds and reconciles transactions.",
    tone: "success",
    permissions: { ...viewOnly(["dashboard", "users", "orders"]), finance: ["view", "create", "edit"] },
  },
  {
    id: "support",
    name: "Support agent",
    description: "Helps users with accounts and orders. Read-mostly access.",
    tone: "info",
    permissions: { ...viewOnly(["users", "jobs", "orders", "moderation"]), users: ["view", "edit"] },
  },
  {
    id: "content",
    name: "Content editor",
    description: "Maintains the catalog and translations.",
    tone: "error",
    permissions: { ...viewOnly(["dashboard"]), catalog: ["view", "create", "edit"], localization: ["view", "edit"] },
  },
];

export const ROLE_NAMES = roles.map((r) => r.name);

const STAFF = [
  ["Hasibul Hasan", "Super admin"],
  ["Rumana Akter", "Admin"],
  ["Imran Kabir", "Admin"],
  ["Shila Das", "Moderator"],
  ["Mahmud Hasan", "Moderator"],
  ["Tahsin Rahman", "Moderator"],
  ["Nusrat Jahan", "Finance manager"],
  ["Arman Hossain", "Finance manager"],
  ["Sadia Islam", "Support agent"],
  ["Fahim Ahmed", "Support agent"],
  ["Mitu Chowdhury", "Support agent"],
  ["Raihan Kabir", "Support agent"],
  ["Tania Sultana", "Content editor"],
  ["Zubair Alam", "Content editor"],
];
const STATUS = ["Active", "Active", "Active", "Active", "Pending", "Active", "Suspended"];

export const employees = STAFF.map(([name, role], i) => {
  const status = i === 0 ? "Active" : STATUS[(i * 3) % STATUS.length];
  return {
    id: `EMP-${100 + i}`,
    name,
    email: `${name.split(" ")[0].toLowerCase()}@temploy.com`,
    role,
    status,
    twoFactor: i % 4 !== 2,
    lastActive: status === "Pending" ? null : daysAgo((i * 2) % 9),
    joined: daysAgo(40 + i * 23),
  };
});
