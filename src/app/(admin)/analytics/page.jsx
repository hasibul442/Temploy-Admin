"use client";
import { useState } from "react";
import { Box, Button, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material";
import { LuDownload, LuWallet, LuShoppingBag, LuUserPlus, LuTarget } from "react-icons/lu";
import { toast } from "react-toastify";
import PageHeader from "@/components/common/PageHeader";
import SectionCard from "@/components/common/SectionCard";
import StatCard from "@/components/dashboard/StatCard";
import AreaChart from "@/components/charts/AreaChart";
import BarList from "@/components/charts/BarList";
import { series, kpisByRange, funnel, topCategories, topCountries, paymentMix, hourlyActivity } from "@/data/analytics";
import { formatCurrency, formatNumber, formatStat } from "@/helper/format";
import { clay } from "@/theme/clay";

const RANGES = { "7d": "Last 7 days", "30d": "Last 30 days", "12m": "Last 12 months" };
const KPI_STYLE = {
  gmv: { icon: <LuWallet size={21} />, tone: "primary" },
  orders: { icon: <LuShoppingBag size={21} />, tone: "info" },
  users: { icon: <LuUserPlus size={21} />, tone: "warning" },
  conv: { icon: <LuTarget size={21} />, tone: "success" },
};
const METRICS = {
  gmv: { label: "Gross volume", format: (v, axis) => (axis ? formatStat(v, "currency") : formatCurrency(v)) },
  orders: { label: "Orders", format: (v) => formatNumber(v) },
  users: { label: "New users", format: (v) => formatNumber(v) },
};
const PUFF = "inset 0 2px 3px rgba(255,255,255,0.45), inset 0 -2px 3px rgba(0,0,0,0.12)";
const grid = (cols) => ({ display: "grid", gap: { xs: 2, md: 2.5 }, gridTemplateColumns: cols });

function Segmented({ value, onChange, options, label }) {
  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={value}
      onChange={(_, v) => v && onChange(v)}
      aria-label={label}
      sx={{ "& .MuiToggleButton-root": { px: 1.5, py: 0.6, fontSize: 12.5 } }}
    >
      {Object.entries(options).map(([k, l]) => (
        <ToggleButton key={k} value={k}>{l}</ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState("30d");
  const [metric, setMetric] = useState("gmv");
  const data = series[range];

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="How the marketplace is growing: volume, users and conversion."
        actions={
          <>
            <Segmented value={range} onChange={setRange} options={{ "7d": "7D", "30d": "30D", "12m": "12M" }} label="Date range" />
            <Button variant="outlined" color="inherit" startIcon={<LuDownload size={16} />} onClick={() => toast.info("Export will be available once the API is connected")}>
              Export
            </Button>
          </>
        }
      />

      <Box sx={{ ...grid({ xs: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }), mb: 2.5 }}>
        {kpisByRange[range].map(({ key, ...k }) => (
          <StatCard key={key} {...k} {...KPI_STYLE[key]} period={`vs previous ${range === "12m" ? "year" : "period"}`} />
        ))}
      </Box>

      <Box sx={{ mb: 2.5 }}>
        <SectionCard
          title={`${METRICS[metric].label} over time`}
          subtitle={RANGES[range]}
          action={<Segmented value={metric} onChange={setMetric} options={{ gmv: "Volume", orders: "Orders", users: "Users" }} label="Metric" />}
        >
          <AreaChart
            data={data}
            xKey="label"
            yKey={metric}
            height={300}
            formatValue={METRICS[metric].format}
            ariaLabel={`${METRICS[metric].label}, ${RANGES[range].toLowerCase()}`}
          />
        </SectionCard>
      </Box>

      <Box sx={{ ...grid({ xs: "1fr", lg: "1.4fr 1fr" }), mb: 2.5 }}>
        <SectionCard title="Conversion funnel" subtitle="Last 30 days, visitor to completed order">
          <Funnel steps={funnel} />
        </SectionCard>
        <SectionCard title="Payment methods" subtitle="Share of gross volume">
          <PaymentMix parts={paymentMix} />
        </SectionCard>
      </Box>

      <Box sx={{ ...grid({ xs: "1fr", md: "1fr 1fr" }), mb: 2.5 }}>
        <SectionCard title="Top categories" subtitle="By gross volume, last 30 days">
          <BarList data={topCategories} labelKey="category" valueKey="gmv" formatValue={formatCurrency} />
        </SectionCard>
        <SectionCard title="Top countries" subtitle="Registered users">
          <BarList data={topCountries} labelKey="country" valueKey="users" formatValue={formatNumber} />
        </SectionCard>
      </Box>

      <SectionCard title="When orders are placed" subtitle="Average orders per hour of day (Asia/Dhaka)" sx={{ height: "auto" }}>
        <HourStrip values={hourlyActivity} />
      </SectionCard>
    </>
  );
}

/** Each step as a puffy bar sized relative to the first step, with step-to-step conversion. */
function Funnel({ steps }) {
  const top = steps[0].value;
  return (
    <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
      {steps.map((s, i) => {
        const pctOfTop = (s.value / top) * 100;
        const stepConv = i ? (s.value / steps[i - 1].value) * 100 : null;
        return (
          <Box component="li" key={s.step} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "130px 1fr 92px" }, alignItems: "center", gap: { xs: 0.5, sm: 2 } }}>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{s.step}</Typography>
              <Typography className="num" sx={{ fontSize: 12, color: "text.secondary" }}>{formatNumber(s.value)}</Typography>
            </Box>
            <Box sx={{ height: 26, borderRadius: "10px", bgcolor: "chart.grid", boxShadow: clay.pressed, overflow: "hidden" }}>
              <Box
                sx={{
                  height: "100%",
                  // Visitors dwarf later steps; a small floor keeps tiny steps visible.
                  width: `${Math.max(pctOfTop, 3)}%`,
                  borderRadius: "10px",
                  backgroundImage: "linear-gradient(180deg, #4caf50 0%, #2e7d32 100%)",
                  boxShadow: PUFF,
                  opacity: 1 - i * 0.12,
                }}
              />
            </Box>
            <Typography className="num" sx={{ fontSize: 12.5, color: "text.secondary", textAlign: { sm: "right" } }}>
              {stepConv === null ? "100%" : `${stepConv.toFixed(1)}% of prev.`}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

function PaymentMix({ parts }) {
  return (
    <>
      <Box
        role="img"
        aria-label={parts.map((p) => `${p.method} ${p.share}%`).join(", ")}
        sx={{ display: "flex", gap: "4px", height: 22, p: "3px", borderRadius: 999, bgcolor: "background.default", boxShadow: clay.pressed, mb: 2.5 }}
      >
        {parts.map((p) => (
          <Tooltip key={p.method} title={`${p.method}: ${p.share}%`}>
            <Box sx={(t) => ({ flex: p.share, borderRadius: 999, bgcolor: t.vars.palette.chart[p.color], boxShadow: PUFF })} />
          </Tooltip>
        ))}
      </Box>
      {parts.map((p) => (
        <Box key={p.method} sx={{ display: "flex", alignItems: "center", gap: 1.25, py: 0.75 }}>
          <Box sx={(t) => ({ width: 12, height: 12, borderRadius: "4px", bgcolor: t.vars.palette.chart[p.color], boxShadow: PUFF })} />
          <Typography sx={{ fontSize: 13.5, flex: 1 }}>{p.method}</Typography>
          <Typography className="num" sx={{ fontSize: 13.5, fontWeight: 600 }}>{p.share}%</Typography>
        </Box>
      ))}
    </>
  );
}

/** 24 cells, green intensity = activity. Labels every 3 hours. */
function HourStrip({ values }) {
  const max = Math.max(...values);
  const fmtHour = (h) => (h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`);
  return (
    <Box sx={{ overflowX: "auto" }}>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(24, minmax(22px, 1fr))", gap: 0.75, minWidth: 600 }}>
        {values.map((v, h) => (
          <Tooltip key={h} title={`${fmtHour(h)}: ~${v} orders`}>
            <Box
              sx={{
                height: 44,
                borderRadius: "10px",
                bgcolor: `rgba(46, 125, 50, ${0.08 + (v / max) * 0.85})`,
                boxShadow: PUFF,
              }}
            />
          </Tooltip>
        ))}
        {values.map((_, h) => (
          <Typography key={`l${h}`} sx={{ fontSize: 11, color: "text.secondary", textAlign: "center" }}>
            {h % 3 === 0 ? fmtHour(h) : ""}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}
