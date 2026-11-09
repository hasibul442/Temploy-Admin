import { Box, Typography } from "@mui/material";

/** Label-over-value pairs in as many columns as fit. items: [{ label, value, wide? }]; falsy items are skipped. */
export default function Facts({ items, min = 170 }) {
  return (
    <Box component="dl" sx={{ m: 0, display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`, columnGap: 2.5, rowGap: 1.5 }}>
      {items.filter(Boolean).map((it) => (
        <Box key={it.label} sx={{ minWidth: 0, gridColumn: it.wide ? { xs: "1 / -1", sm: "span 2" } : undefined }}>
          <Typography component="dt" sx={{ fontSize: 12, color: "text.secondary" }}>{it.label}</Typography>
          <Box component="dd" sx={{ m: 0, mt: 0.25, fontSize: 13.5, fontWeight: 500, overflowWrap: "anywhere" }}>{it.value}</Box>
        </Box>
      ))}
    </Box>
  );
}
