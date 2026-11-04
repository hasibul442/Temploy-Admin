import { Box, Button } from "@mui/material";
import { LuDownload, LuWallet, LuShoppingBag, LuUserPlus, LuScale } from "react-icons/lu";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import {
  RevenueCard,
  CategoryCard,
  UserSplitCard,
  PendingActionsCard,
  RecentOrdersCard,
  TopFreelancersCard,
} from "@/components/dashboard/DashboardCards";
import { kpis } from "@/data/mock";

export const metadata = { title: "Dashboard · Temploy Admin" };

/**
 * Icon + clay color for each KPI card (presentation only, so it lives here, not in the data).
 * Icons are passed as rendered elements: this is a Server Component and StatCard is a
 * Client Component, so component functions can't cross that boundary but elements can.
 */
const KPI_STYLE = {
  revenue: { icon: <LuWallet size={21} />, tone: "primary" },
  orders: { icon: <LuShoppingBag size={21} />, tone: "info" },
  users: { icon: <LuUserPlus size={21} />, tone: "warning" },
  disputes: { icon: <LuScale size={21} />, tone: "error" },
};

const grid =(cols) => ({ display: "grid", gap: { xs: 2, md: 2.5 }, gridTemplateColumns: cols });

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Good morning, Hasibul"
        subtitle="Here's what's happening on Temploy today."
        actions={
          <Button variant="outlined" color="inherit" startIcon={<LuDownload size={16} />}>
            Export report
          </Button>
        }
      />

      <Box sx={{ ...grid({ xs: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }), mb: 2.5 }}>
        {kpis.map(({ key, ...kpi }) => (
          <StatCard key={key} {...kpi} {...KPI_STYLE[key]} />
        ))}
      </Box>

      <Box sx={{ ...grid({ xs: "1fr", lg: "2fr 1fr" }), mb: 2.5 }}>
        <RevenueCard />
        <CategoryCard />
      </Box>

      <Box sx={{ ...grid({ xs: "1fr", md: "repeat(2, 1fr)", lg: "1fr 1fr 1fr" }), mb: 2.5 }}>
        <UserSplitCard />
        <PendingActionsCard />
        <Box sx={{ gridColumn: { md: "1 / -1", lg: "auto" } }}>
          <TopFreelancersCard />
        </Box>
      </Box>

      <RecentOrdersCard />
    </>
  );
}
