"use client";
import { useState } from "react";
import { Box, Typography } from "@mui/material";

/**
 * Horizontal ranked bars (single series): label above, thin bar, value at the end.
 * Hovering a row reveals its share of the total.
 */
export default function BarList({ data, labelKey, valueKey, formatValue = (v) => v }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(...data.map((d) => d[valueKey]));
  const total = data.reduce((s, d) => s + d[valueKey], 0);
  return (
    <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1.75 }}>
      {data.map((d, i) => (
        <Box
          component="li"
          key={d[labelKey]}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          sx={{ cursor: "default" }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75, fontSize: 13 }}>
            <Typography component="span" sx={{ fontSize: 13, color: "text.primary" }}>
              {d[labelKey]}
            </Typography>
            <Typography component="span" className="num" sx={{ fontSize: 13, fontWeight: 600 }}>
              {formatValue(d[valueKey])}
              <Box component="span" sx={{ color: "text.secondary", fontWeight: 400, ml: 0.75, opacity: hover === i ? 1 : 0, transition: "opacity .15s" }}>
                {((d[valueKey] / total) * 100).toFixed(0)}%
              </Box>
            </Typography>
          </Box>
          <Box sx={(theme) => ({ height: 8, borderRadius: 4, bgcolor: theme.vars.palette.chart.grid, overflow: "hidden" })}>
            <Box
              sx={(theme) => ({
                height: "100%",
                width: `${(d[valueKey] / max) * 100}%`,
                bgcolor: theme.vars.palette.chart.series1,
                borderRadius: 4,
                opacity: hover === null || hover === i ? 1 : 0.45,
                transition: "opacity .15s",
              })}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
