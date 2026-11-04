"use client";
import { useId, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useElementWidth from "./useElementWidth";

function niceMax(v) {
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}

/**
 * Single-series area/line chart with a crosshair + tooltip.
 * One y-axis only; pass one measure at a time.
 */
export default function AreaChart({ data, xKey, yKey, height = 280, formatValue = (v) => v, ariaLabel }) {
  const theme = useTheme();
  const gradId = useId();
  const [ref, width] = useElementWidth();
  const [hover, setHover] = useState(null);

  const m = { top: 12, right: 12, bottom: 28, left: 48 };
  const w = Math.max(width - m.left - m.right, 10);
  const h = height - m.top - m.bottom;
  const max = niceMax(Math.max(...data.map((d) => d[yKey])) * 1.05);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const x = (i) => (i / (data.length - 1)) * w;
  const y = (v) => h - (v / max) * h;

  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d[yKey])}`).join("");
  const area = `${line}L${x(data.length - 1)},${h}L0,${h}Z`;
  const color = theme.vars.palette.chart.series1;
  // Thin x-axis labels so each gets ~64px (30 daily points would otherwise overlap).
  const showEvery = Math.max(1, Math.ceil(data.length / Math.max(1, Math.floor(w / 64))));

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left - m.left;
    const i = Math.round((px / w) * (data.length - 1));
    setHover(Math.min(data.length - 1, Math.max(0, i)));
  };

  const hv = hover !== null ? data[hover] : null;

  return (
    <Box ref={ref} sx={{ position: "relative", width: "100%" }}>
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={ariaLabel}
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setHover(null)}
        style={{ display: "block", touchAction: "pan-y" }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <g transform={`translate(${m.left},${m.top})`}>
          {ticks.map((t) => (
            <g key={t} transform={`translate(0,${y(t)})`}>
              <line x1={0} x2={w} stroke={theme.vars.palette.chart.grid} strokeDasharray={t === 0 ? undefined : "3 4"} />
              <text x={-10} dy="0.32em" textAnchor="end" fontSize={11} fill={theme.vars.palette.text.secondary} className="num">
                {formatValue(t, true)}
              </text>
            </g>
          ))}
          {data.map((d, i) =>
            i % showEvery === 0 || i === data.length - 1 ? (
              <text key={d[xKey]} x={x(i)} y={h + 20} textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"} fontSize={11} fill={theme.vars.palette.text.secondary}>
                {d[xKey]}
              </text>
            ) : null
          )}
          <path d={area} fill={`url(#${gradId})`} />
          <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {hv && (
            <>
              <line x1={x(hover)} x2={x(hover)} y1={0} y2={h} stroke={theme.vars.palette.text.disabled} strokeWidth={1} />
              <circle cx={x(hover)} cy={y(hv[yKey])} r={5} fill={color} stroke={theme.vars.palette.background.paper} strokeWidth={2} />
            </>
          )}
          {/* full-height hit area */}
          <rect x={0} y={0} width={w} height={h} fill="transparent" />
        </g>
      </svg>
      {hv && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: Math.min(m.left + x(hover) + 12, width - 140),
            pointerEvents: "none",
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
            borderRadius: "8px",
            boxShadow: 3,
            px: 1.5,
            py: 1,
            minWidth: 120,
          }}
        >
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{hv[xKey]}</Typography>
          <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{formatValue(hv[yKey])}</Typography>
        </Box>
      )}
    </Box>
  );
}
