import { Box, Button } from "@mui/material";
import { LuDownload } from "react-icons/lu";
import PageHeader from "@/Components/common/PageHeader";
import StatCard from "@/Components/dashboard/StatCard";
import {
  RevenueCard,
  CategoryCard,
  UserSplitCard,
  PendingActionsCard,
  RecentOrdersCard,
  TopFreelancersCard,
} from "@/Components/dashboard/DashboardCards";
import { kpis } from "@/data/mock";

export const metadata = { title: "Dashboard · Temploy Admin" };

const grid = (cols) => ({ display: "grid", gap: { xs: 2, md: 2.5 }, gridTemplateColumns: cols });

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Good morning, Hasibul"
        subtitle="Here's what's happening on Temploy today."
        actions={
          <Button variant="outlined" color="inherit" startIcon={<LuDownload size={16} />} sx={{ borderColor: "divider" }}>
            Export report
          </Button>
        }
      />

      <Box sx={{ ...grid({ xs: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }), mb: 2.5 }}>
        {kpis.map((k) => (
          <StatCard key={k.key} {...k} />
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
