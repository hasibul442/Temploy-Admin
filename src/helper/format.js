const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const whole = new Intl.NumberFormat("en-US");
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usdCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

/** 1,284 / 12.9K / $4.2M style auto-compaction for stat values. */
export function formatStat(value, format) {
  if (format === "percent") return `${value.toFixed(1)}%`;
  if (format === "currency") return value >= 10000 ? usdCompact.format(value) : usd.format(value);
  return value >= 10000 ? compact.format(value) : whole.format(value);
}

export const formatNumber = (v) => whole.format(v);
export const formatCurrency = (v) => usd.format(v);

export function formatDate(iso) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
