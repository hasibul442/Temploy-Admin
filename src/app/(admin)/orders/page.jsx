"use client";
import { useRouter } from "next/navigation";
import { Box, Button, Typography } from "@mui/material";
import { LuShoppingBag, LuCoins, LuLoader, LuTriangleAlert, LuCircleCheck, LuCircleX, LuScale } from "react-icons/lu";
import ResourcePage, { DetailList } from "@/components/common/ResourcePage";
import StatusChip from "@/components/common/StatusChip";
import { TitleCell, PersonCell, DateCell, Money } from "@/components/common/cells";
import { orders, CATEGORY_NAMES } from "@/data/marketplace";
import { formatStat } from "@/helper/format";

export default function OrdersPage() {
  const router = useRouter();
  const complete = (o, api) => api.update(o.id, { status: "Completed" }, `${o.id} marked completed`);
  const cancel = (o, api) =>
    api.confirm({
      title: "Cancel and refund this order?",
      body: `${o.id} will be cancelled and the client refunded in full.`,
      confirmLabel: "Cancel & refund",
      tone: "error",
      onConfirm: () => api.update(o.id, { status: "Cancelled" }, `${o.id} cancelled and refunded`),
    });

  return (
    <ResourcePage
      title="Orders"
      subtitle="Every purchase between clients and freelancers, from placement to completion."
      noun="orders"
      rows={orders}
      stats={[
        { label: "Total GMV", value: (r) => formatStat(r.reduce((s, o) => s + o.amount, 0), "currency"), icon: <LuShoppingBag size={20} /> },
        { label: "Platform fees", value: (r) => formatStat(r.reduce((s, o) => s + o.fee, 0), "currency"), icon: <LuCoins size={20} />, tone: "success" },
        { label: "In progress", value: (r) => r.filter((o) => o.status === "In progress").length, icon: <LuLoader size={20} />, tone: "info" },
        { label: "Disputed", value: (r) => r.filter((o) => o.status === "Disputed").length, icon: <LuTriangleAlert size={20} />, tone: "error" },
      ]}
      tabs={{ field: "status", options: ["All", "In progress", "Delivered", "Completed", "Disputed", "Cancelled"] }}
      search={{ keys: ["id", "gig", "client", "freelancer"], placeholder: "Search by order ID, gig or person" }}
      filters={[{ field: "category", label: "Category", options: CATEGORY_NAMES }]}
      columns={[
        { key: "gig", label: "Order", render: (o) => <TitleCell title={o.gig} sub={`${o.id} · ${o.category}`} /> },
        { key: "client", label: "Client", render: (o) => <PersonCell name={o.client} tone="info" /> },
        { key: "freelancer", label: "Freelancer", render: (o) => <PersonCell name={o.freelancer} /> },
        { key: "amount", label: "Amount", align: "right", render: (o) => <Money value={o.amount} /> },
        { key: "placed", label: "Placed", render: (o) => <DateCell value={o.placed} /> },
        { key: "due", label: "Due", render: (o) => <DateCell value={o.due} /> },
        { key: "status", label: "Status", render: (o) => <StatusChip status={o.status} /> },
      ]}
      rowActions={(o, api) => [
        { label: "View details", onClick: () => api.openDetail(o) },
        o.status === "Delivered" && { label: "Mark completed", icon: <LuCircleCheck size={15} />, onClick: () => complete(o, api) },
        o.status === "Disputed" && { label: "Open dispute", icon: <LuScale size={15} />, onClick: () => router.push("/disputes") },
        ["In progress", "Delivered", "Disputed"].includes(o.status) && { label: "Cancel & refund", icon: <LuCircleX size={15} />, tone: "error", onClick: () => cancel(o, api) },
      ]}
      detail={{
        title: (o) => o.gig,
        render: (o, api) => (
          <>
            <Box sx={{ mb: 2 }}>
              <StatusChip status={o.status} />
            </Box>
            <DetailList
              items={[
                { label: "Order ID", value: o.id },
                { label: "Client", value: o.client },
                { label: "Freelancer", value: o.freelancer },
                { label: "Category", value: o.category },
                { label: "Placed", value: <DateCell value={o.placed} /> },
                { label: "Due", value: <DateCell value={o.due} /> },
              ]}
            />
            <Typography sx={{ fontWeight: 600, fontSize: 14, mt: 3, mb: 1 }}>Payment breakdown</Typography>
            <DetailList
              items={[
                { label: "Order amount", value: <Money value={o.amount} /> },
                { label: "Platform fee (10%)", value: <Money value={o.fee} /> },
                { label: "Freelancer payout", value: <Money value={o.amount - o.fee} /> },
              ]}
            />
            {["In progress", "Delivered", "Disputed"].includes(o.status) && (
              <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
                {o.status === "Delivered" && <Button variant="contained" fullWidth onClick={() => complete(o, api)}>Mark completed</Button>}
                <Button variant="outlined" color="error" fullWidth onClick={() => cancel(o, api)}>Cancel & refund</Button>
              </Box>
            )}
          </>
        ),
      }}
    />
  );
}
