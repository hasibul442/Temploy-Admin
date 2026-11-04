"use client";
import { useTheme } from "@mui/material/styles";

/** 12-point trend in a de-emphasis tone; the current period dot in the accent. */
export default function Sparkline({ data, width = 96, height = 32 }) {
  const theme = useTheme();
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pad = 3;
  const x = (i) => pad + (i / (data.length - 1)) * (width - pad * 2);
  const y = (v) => pad + (1 - (v - min) / (max - min || 1)) * (height - pad * 2);
  const d = data.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const last = data.length - 1;
  return (
    <svg width={width} height={height} aria-hidden="true" style={{ display: "block", overflow: "visible" }}>
      <path d={d} fill="none" stroke={theme.vars.palette.chart.muted} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(last)} cy={y(data[last])} r={3.5} fill={theme.vars.palette.chart.series1} stroke={theme.vars.palette.background.paper} strokeWidth={2} />
    </svg>
  );
}
