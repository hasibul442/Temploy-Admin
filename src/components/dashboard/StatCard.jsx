"use client";
import { Card, Box, Typography } from "@mui/material";
import { LuTrendingUp, LuTrendingDown } from "react-icons/lu";
import Sparkline from "@/components/charts/Sparkline";
import { formatStat } from "@/helper/format";
import { clay, clayRgb } from "@/theme/clay";

export default function StatCard({ label, value, format, delta, upIsGood = true, trend, period = "vs last month", icon, tone = "primary" }) {
  const up = delta >= 0;
  const good = up === upIsGood;
  const Arrow = up ? LuTrendingUp : LuTrendingDown;
  return (
    <Card sx={{ p: 2.5, height: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {icon && (
          // Puffy pastel clay blob holding the metric icon.
          <Box
            aria-hidden="true"
            sx={(theme) => ({
              width: 46,
              height: 46,
              flexShrink: 0,
              borderRadius: "16px",
              display: "grid",
              placeItems: "center",
              color: theme.vars.palette[tone].main,
              bgcolor: theme.vars.palette[tone].light,
              boxShadow: clay.tinted(clayRgb[tone], 0.22),
            })}
          >
            {icon}
          </Box>
        )}
        <Typography color="text.secondary" sx={{ fontSize: 13.5, fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 2, mt: 2 }}>
        <Typography sx={{ fontSize: 28, fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          {formatStat(value, format)}
        </Typography>
        {trend && <Sparkline data={trend} />}
      </Box>
      {delta !== undefined && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1.5, fontSize: 12.5 }}>
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              px: 1,
              py: 0.35,
              borderRadius: "10px",
              fontWeight: 600,
              color: good ? "success.main" : "error.main",
              bgcolor: good ? "success.light" : "error.light",
              boxShadow: clay.tinted(good ? clayRgb.success : clayRgb.error, 0.14),
            }}
          >
            <Arrow size={13} aria-hidden="true" />
            {up ? "+" : "−"}
            {Math.abs(delta).toFixed(1)}%
          </Box>
          <Typography component="span" color="text.secondary" sx={{ fontSize: 12.5 }}>
            {period}
          </Typography>
        </Box>
      )}
    </Card>
  );
}
