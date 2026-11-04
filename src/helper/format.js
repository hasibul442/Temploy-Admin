const whole = new Intl.NumberFormat("en-US");
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/**
 * 12.9K / 4.2M / 10K. Hand-rolled on purpose: Intl's compact notation differs between
 * Node and Chrome (e.g. "$10K" vs "$10.0K"), which breaks hydration of prerendered pages.
 */
function compact(value) {
  const abs = Math.abs(value);
  for (const [div, suffix] of [[1e9, "B"], [1e6, "M"], [1e3, "K"]]) {
    if (abs >= div) return `${Number((value / div).toFixed(1))}${suffix}`;
  }
  return whole.format(value);
}

/** 1,284 / 12.9K / $4.2M style auto-compaction for stat values. */
export function formatStat(value, format) {
  if (format === "percent") return `${value.toFixed(1)}%`;
  if (format === "currency") return value >= 10000 ? `${value < 0 ? "-" : ""}$${compact(Math.abs(value))}` : usd.format(value);
  return value >= 10000 ? compact(value) : whole.format(value);
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
