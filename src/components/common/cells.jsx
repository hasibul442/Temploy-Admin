"use client";
import { Avatar, Box, Switch, Typography } from "@mui/material";
import { formatCurrency, formatDate, initials } from "@/helper/format";

/** Avatar + name + optional secondary line. */
export function PersonCell({ name, sub, tone = "primary" }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
      <Avatar sx={{ width: 32, height: 32, fontSize: 12, bgcolor: `${tone}.light`, color: `${tone}.main`, fontWeight: 600, borderRadius: "11px" }}>
        {initials(name)}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 600 }}>{name}</Typography>
        {sub && <Typography noWrap sx={{ fontSize: 12, color: "text.secondary" }}>{sub}</Typography>}
      </Box>
    </Box>
  );
}

/** Bold title with a muted second line (IDs, slugs, categories). */
export function TitleCell({ title, sub, maxWidth = 280 }) {
  return (
    <Box sx={{ minWidth: 0, maxWidth }}>
      <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 600 }}>{title}</Typography>
      {sub && <Typography noWrap sx={{ fontSize: 12, color: "text.secondary" }}>{sub}</Typography>}
    </Box>
  );
}

/** Right-aligned money; `signed` shows +/− and colors credits/debits. */
export function Money({ value, signed = false }) {
  const negative = value < 0;
  return (
    <Box
      component="span"
      className="num"
      sx={{ fontWeight: 600, color: signed ? (negative ? "error.main" : "success.main") : "text.primary" }}
    >
      {signed ? (negative ? "−" : "+") : ""}
      {formatCurrency(Math.abs(value))}
    </Box>
  );
}

export function DateCell({ value }) {
  return (
    <Box component="span" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
      {formatDate(value)}
    </Box>
  );
}

/** Inline on/off switch for "Active / Inactive" style rows. Stops row-click propagation. */
export function ActiveSwitch({ row, api, field = "active", entity = "Item" }) {
  return (
    <Switch
      size="small"
      checked={Boolean(row[field])}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => api.update(row.id, { [field]: e.target.checked }, `${entity} ${e.target.checked ? "enabled" : "disabled"}`)}
      slotProps={{ input: { "aria-label": `${entity} active` } }}
    />
  );
}

/** Small neutral pill for tags like "Fixed", "Hourly", "Default". */
export function Tag({ children, tone }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        px: 1,
        py: 0.25,
        borderRadius: "8px",
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
        bgcolor: tone ? `${tone}.light` : "action.selected",
        color: tone ? `${tone}.main` : "text.secondary",
      }}
    >
      {children}
    </Box>
  );
}
