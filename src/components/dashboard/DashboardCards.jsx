"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Avatar,
  Chip,
} from "@mui/material";
import { LuArrowRight, LuStar } from "react-icons/lu";
import SectionCard from "@/components/common/SectionCard";
import StatusChip from "@/components/common/StatusChip";
import AreaChart from "@/components/charts/AreaChart";
import BarList from "@/components/charts/BarList";
import { formatCurrency, formatNumber, formatDate, initials } from "@/helper/format";
import { revenueSeries, ordersByCategory, userSplit, recentOrders, topFreelancers, pendingActions } from "@/data/mock";
import { clay, clayRgb } from "@/theme/clay";

/** Small puffy highlight for colored dots and bar segments. */
const PUFF = "inset 0 2px 3px rgba(255,255,255,0.45), inset 0 -2px 3px rgba(0,0,0,0.15)";

const METRICS = {
  gmv: { label: "Gross volume", sub: "Total value of orders placed, monthly" },
  fees: { label: "Platform fees", sub: "Commission earned by Temploy, monthly" },
};

export function RevenueCard() {
  const [metric, setMetric] = useState("gmv");
  const latest = revenueSeries.at(-1)[metric];
  const fmt = (v, axis) => (axis ? `$${v}K` : `$${v.toFixed(1)}K`);
  return (
    <SectionCard
      title={METRICS[metric].label}
      subtitle={METRICS[metric].sub}
      action={
        <ToggleButtonGroup
          size="small"
          exclusive
          value={metric}
          onChange={(_, v) => v && setMetric(v)}
          aria-label="Revenue metric"
          sx={{ "& .MuiToggleButton-root": { px: 1.5, py: 0.6, fontSize: 12.5, textTransform: "none" } }}
        >
          <ToggleButton value="gmv">Gross volume</ToggleButton>
          <ToggleButton value="fees">Fees</ToggleButton>
        </ToggleButtonGroup>
      }
    >
      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>November so far</Typography>
      <Typography sx={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em", mb: 1 }}>{fmt(latest)}</Typography>
      <AreaChart
        data={revenueSeries}
        xKey="month"
        yKey={metric}
        formatValue={fmt}
        ariaLabel={`${METRICS[metric].label} over the last 12 months`}
      />
    </SectionCard>
  );
}

export function CategoryCard() {
  return (
    <SectionCard title="Orders by category" subtitle="Last 30 days">
      <BarList data={ordersByCategory} labelKey="category" valueKey="orders" formatValue={formatNumber} />
    </SectionCard>
  );
}

export function UserSplitCard() {
  const total = userSplit.freelancers + userSplit.clients;
  const parts = [
    { label: "Freelancers", value: userSplit.freelancers, color: "series1" },
    { label: "Clients", value: userSplit.clients, color: "series2" },
  ];
  return (
    <SectionCard title="Registered users" subtitle="All time">
      <Typography sx={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em" }}>{formatNumber(total)}</Typography>
      <Box
        sx={{ display: "flex", gap: "4px", height: 16, my: 2, p: "3px", borderRadius: 999, bgcolor: "background.default", boxShadow: clay.pressed }}
        role="img"
        aria-label={`Freelancers ${userSplit.freelancers}, clients ${userSplit.clients}`}
      >
        {parts.map((p) => (
          <Box key={p.label} sx={(t) => ({ flex: p.value, bgcolor: t.vars.palette.chart[p.color], borderRadius: 999, boxShadow: PUFF })} />
        ))}
      </Box>
      {parts.map((p) => (
        <Box key={p.label} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5, fontSize: 13 }}>
          <Box sx={(t) => ({ width: 12, height: 12, borderRadius: "4px", bgcolor: t.vars.palette.chart[p.color], boxShadow: PUFF })} />
          <Typography sx={{ fontSize: 13, flex: 1 }}>{p.label}</Typography>
          <Typography className="num" sx={{ fontSize: 13, fontWeight: 600 }}>
            {formatNumber(p.value)}
          </Typography>
          <Typography className="num" sx={{ fontSize: 13, color: "text.secondary", width: 40, textAlign: "right" }}>
            {Math.round((p.value / total) * 100)}%
          </Typography>
        </Box>
      ))}
    </SectionCard>
  );
}

export function PendingActionsCard() {
  const toneColor = { error: "error.main", warning: "warning.main", info: "info.main" };
  return (
    <SectionCard title="Needs attention" subtitle="Items waiting on an admin" noPadding>
      <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, px: 1.25, pb: 1.25 }}>
        {pendingActions.map((a) => (
          <li key={a.label}>
            <Box
              component={Link}
              href={a.href}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 1.25,
                py: 1.1,
                borderRadius: "14px",
                transition: "background-color .15s, box-shadow .15s",
                "&:hover": { bgcolor: "background.paper", boxShadow: clay.raised },
                "&:hover .arrow": { opacity: 1, transform: "translateX(0)" },
              }}
            >
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: toneColor[a.tone], boxShadow: PUFF, flexShrink: 0 }} />
              <Typography sx={{ fontSize: 13.5, flex: 1 }}>{a.label}</Typography>
              <Typography className="num" sx={{ fontSize: 13.5, fontWeight: 600 }}>
                {a.count}
              </Typography>
              <Box className="arrow" sx={{ display: "flex", color: "text.secondary", opacity: 0, transform: "translateX(-4px)", transition: "all .15s" }}>
                <LuArrowRight size={15} />
              </Box>
            </Box>
          </li>
        ))}
      </Box>
    </SectionCard>
  );
}

export function RecentOrdersCard() {
  return (
    <SectionCard
      title="Recent orders"
      subtitle="Latest activity across the marketplace"
      noPadding
      // Not inside a grid row, so don't stretch to the parent's height.
      sx={{ height: "auto" }}
      action={
        <Button component={Link} href="/orders" size="small" endIcon={<LuArrowRight size={14} />}>
          View all
        </Button>
      }
    >
      <TableContainer>
        <Table size="small" sx={{ minWidth: 720, "& td, & th": { px: 2.5, py: 1.4 } }}>
          <TableHead>
            <TableRow>
              <TableCell>Order</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Freelancer</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentOrders.map((o) => (
              <TableRow key={o.id} hover sx={{ "&:last-child td": { border: 0 } }}>
                <TableCell>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 500 }}>{o.gig}</Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    {o.id} · {formatDate(o.date)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontSize: 13.5 }}>{o.client}</TableCell>
                <TableCell sx={{ fontSize: 13.5 }}>{o.freelancer}</TableCell>
                <TableCell>
                  <StatusChip status={o.status} />
                </TableCell>
                <TableCell align="right" className="num" sx={{ fontSize: 13.5, fontWeight: 600 }}>
                  {formatCurrency(o.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </SectionCard>
  );
}

export function TopFreelancersCard() {
  return (
    <SectionCard title="Top freelancers" subtitle="By earnings this month" noPadding>
      <Box sx={{ px: 2.5, pb: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        {topFreelancers.map((f) => (
          <Box key={f.name} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{ width: 40, height: 40, fontSize: 13, borderRadius: "14px", bgcolor: "primary.light", color: "primary.main", fontWeight: 600, boxShadow: clay.tinted(clayRgb.primary, 0.2) }}
            >
              {initials(f.name)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 600 }}>
                  {f.name}
                </Typography>
                <Chip label={f.level} size="small" sx={{ height: 18, fontSize: 10.5 }} />
              </Box>
              <Typography noWrap sx={{ fontSize: 12, color: "text.secondary", display: "flex", alignItems: "center", gap: 0.5 }}>
                {f.skill} · <LuStar size={11} aria-hidden="true" /> {f.rating.toFixed(1)}
              </Typography>
            </Box>
            <Typography className="num" sx={{ fontSize: 13.5, fontWeight: 600 }}>
              {formatCurrency(f.earnings)}
            </Typography>
          </Box>
        ))}
      </Box>
    </SectionCard>
  );
}
