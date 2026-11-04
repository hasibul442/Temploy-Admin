/**
 * Mock analytics data. Deterministic (no Math.random) so SSR and client match.
 * Money values are in USD; replace with API responses when the backend is ready.
 */

const MONTHS = ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
const fmtDay = (n) =>
  new Date(Date.UTC(2026, 10, 4) - n * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

// A smooth-ish wave + trend so charts look plausible.
const wave = (i, base, trend, amp, period = 7) => Math.round(base + trend * i + amp * Math.sin((i / period) * Math.PI * 2) + ((i * 37) % 11) - 5);

const daily = Array.from({ length: 30 }, (_, k) => {
  const i = k; // 0 = 29 days ago
  return {
    label: fmtDay(29 - i),
    gmv: wave(i, 8200, 95, 1400) ,
    orders: wave(i, 38, 0.6, 7),
    users: wave(i, 120, 1.4, 22),
  };
});

const monthly = MONTHS.map((m, i) => ({
  label: m,
  gmv: [182, 176, 195, 210, 224, 218, 241, 256, 249, 272, 290, 312][i] * 1000,
  orders: [880, 860, 940, 1010, 1080, 1050, 1160, 1220, 1190, 1290, 1370, 1460][i],
  users: [2400, 2310, 2580, 2760, 2900, 2850, 3120, 3300, 3210, 3480, 3700, 3912][i],
}));

/** Time series per range: `7d`, `30d`, `12m`. */
export const series = { "7d": daily.slice(-7), "30d": daily, "12m": monthly };

/** Headline KPIs per range: value, % change vs previous period, sparkline trend. */
export const kpisByRange = {
  "7d": [
    { key: "gmv", label: "Gross volume", value: 61840, format: "currency", delta: 8.2, trend: daily.slice(-7).map((d) => d.gmv) },
    { key: "orders", label: "Orders", value: 291, delta: 5.4, trend: daily.slice(-7).map((d) => d.orders) },
    { key: "users", label: "New users", value: 954, delta: -2.1, trend: daily.slice(-7).map((d) => d.users) },
    { key: "conv", label: "Job → hire rate", value: 34.6, format: "percent", delta: 1.8, trend: [31, 32, 33, 32, 34, 35, 34.6] },
  ],
  "30d": [
    { key: "gmv", label: "Gross volume", value: 287300, format: "currency", delta: 12.4, trend: daily.map((d) => d.gmv) },
    { key: "orders", label: "Orders", value: 1284, delta: 6.1, trend: daily.map((d) => d.orders) },
    { key: "users", label: "New users", value: 3912, delta: -3.2, trend: daily.map((d) => d.users) },
    { key: "conv", label: "Job → hire rate", value: 33.1, format: "percent", delta: 2.4, trend: [29, 30, 30, 31, 32, 31, 33, 33.1] },
  ],
  "12m": [
    { key: "gmv", label: "Gross volume", value: 2825000, format: "currency", delta: 41.7, trend: monthly.map((d) => d.gmv) },
    { key: "orders", label: "Orders", value: 14510, delta: 29.3, trend: monthly.map((d) => d.orders) },
    { key: "users", label: "New users", value: 36442, delta: 22.8, trend: monthly.map((d) => d.users) },
    { key: "conv", label: "Job → hire rate", value: 31.8, format: "percent", delta: 4.1, trend: [26, 27, 27, 28, 29, 29, 30, 30, 31, 31, 32, 31.8] },
  ],
};

/** Marketplace funnel for the last 30 days. */
export const funnel = [
  { step: "Visitors", value: 182400 },
  { step: "Sign-ups", value: 9840 },
  { step: "Jobs posted", value: 3880 },
  { step: "Freelancer hired", value: 1284 },
  { step: "Order completed", value: 1102 },
];

export const topCategories = [
  { category: "Development & IT", gmv: 104200 },
  { category: "Design & Creative", gmv: 71600 },
  { category: "Writing & Translation", gmv: 38900 },
  { category: "Sales & Marketing", gmv: 33100 },
  { category: "Admin Support", gmv: 21400 },
  { category: "Finance & Accounting", gmv: 18100 },
];

export const topCountries = [
  { country: "Bangladesh", users: 11840 },
  { country: "United States", users: 4210 },
  { country: "India", users: 3960 },
  { country: "United Kingdom", users: 2280 },
  { country: "Pakistan", users: 1940 },
  { country: "Germany", users: 1320 },
];

/** Share of GMV by payment method (sums to 100). */
export const paymentMix = [
  { method: "Card", share: 38, color: "series1" },
  { method: "bKash", share: 27, color: "series2" },
  { method: "PayPal", share: 18, color: "series3" },
  { method: "Bank transfer", share: 11, color: "muted" },
  { method: "Nagad", share: 6, color: "grid" },
];

/** Busiest hours (orders placed), 0–23, for a simple activity heat strip. */
export const hourlyActivity = Array.from({ length: 24 }, (_, h) =>
  Math.round(20 + 80 * Math.max(0, Math.sin(((h - 6) / 24) * Math.PI * 2)) + ((h * 13) % 9))
);
