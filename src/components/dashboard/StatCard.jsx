"use client";
import { Card, Box, Typography } from "@mui/material";
import { LuTrendingUp, LuTrendingDown } from "react-icons/lu";
import Sparkline from "@/components/charts/Sparkline";
import { formatStat } from "@/helper/format";

export default function StatCard({ label, value, format, delta, upIsGood = true, trend, period = "vs last month" }) {
  const up = delta >= 0;
  const good = up === upIsGood;
  const Arrow = up ? LuTrendingUp : LuTrendingDown;
  return (
    <Card sx={{ p: 2.5, height: "100%" }}>
      <Typography color="text.secondary" sx={{ fontSize: 13, fontWeight: 500 }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 2, mt: 1 }}>
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
              px: 0.75,
              py: 0.25,
              borderRadius: "6px",
              fontWeight: 600,
              color: good ? "success.main" : "error.main",
              bgcolor: good ? "success.light" : "error.light",
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
