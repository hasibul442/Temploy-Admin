"use client";
import { Box, Button } from "@mui/material";
import { LuArrowDownLeft, LuArrowUpRight, LuPercent, LuTriangleAlert, LuRotateCw } from "react-icons/lu";
import ResourcePage, { DetailList } from "@/components/common/ResourcePage";
import StatusChip from "@/components/common/StatusChip";
import { PersonCell, Money, DateCell, Tag } from "@/components/common/cells";
import { transactions, TXN_TYPES, TXN_METHODS } from "@/data/finance";
import { formatStat } from "@/helper/format";

const sum = (rows, pred) => rows.filter(pred).reduce((s, t) => s + Math.abs(t.amount), 0);
const money = (v) => formatStat(v, "currency");

export default function TransactionsPage() {
  const retry = (t, api) => api.update(t.id, { status: "Pending" }, `${t.id} queued for retry`);

  return (
    <ResourcePage
      title="Transactions"
      subtitle="Every payment, payout, refund and fee that moved through the platform."
      noun="transactions"
      rows={transactions}
      stats={[
        { label: "Volume in", value: (r) => money(sum(r, (t) => t.amount > 0 && t.type !== "Fee" && t.status === "Completed")), icon: <LuArrowDownLeft size={20} />, tone: "success" },
        { label: "Refunds out", value: (r) => money(sum(r, (t) => t.type === "Refund" && t.status === "Completed")), icon: <LuArrowUpRight size={20} />, tone: "error" },
        { label: "Fees earned", value: (r) => money(sum(r, (t) => t.type === "Fee" && t.status === "Completed")), icon: <LuPercent size={20} /> },
        { label: "Failed", value: (r) => r.filter((t) => t.status === "Failed").length, icon: <LuTriangleAlert size={20} />, tone: "warning" },
      ]}
      tabs={{ field: "type", options: ["All", ...TXN_TYPES], labels: { All: "All", Payment: "Payments", Payout: "Payouts", Refund: "Refunds", Fee: "Fees", Deposit: "Deposits" } }}
      search={{ keys: ["id", "user", "reference"], placeholder: "Search by ID, user or order" }}
      filters={[
        { field: "status", label: "Status", options: ["Completed", "Pending", "Failed"] },
        { field: "method", label: "Method", options: TXN_METHODS },
      ]}
      columns={[
        { key: "id", label: "Transaction", render: (t) => <Box sx={{ fontWeight: 600 }}>{t.id}</Box> },
        { key: "user", label: "User", render: (t) => <PersonCell name={t.user} /> },
        { key: "type", label: "Type", render: (t) => <Tag>{t.type}</Tag> },
        { key: "method", label: "Method" },
        { key: "reference", label: "Reference", render: (t) => <Box component="span" sx={{ color: "text.secondary" }}>{t.reference}</Box> },
        { key: "date", label: "Date", render: (t) => <DateCell value={t.date} /> },
        { key: "amount", label: "Amount", align: "right", render: (t) => <Money value={t.amount} signed /> },
        { key: "status", label: "Status", render: (t) => <StatusChip status={t.status} /> },
      ]}
      rowActions={(t, api) => [
        { label: "View details", onClick: () => api.openDetail(t) },
        t.status === "Failed" && { label: "Retry", icon: <LuRotateCw size={15} />, onClick: () => retry(t, api) },
      ]}
      detail={{
        title: (t) => `${t.type} · ${t.id}`,
        render: (t, api) => (
          <>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <StatusChip status={t.status} />
              <Box sx={{ fontSize: 24 }}>
                <Money value={t.amount} signed />
              </Box>
            </Box>
            <DetailList
              items={[
                { label: "Transaction ID", value: t.id },
                { label: "User", value: t.user },
                { label: "Type", value: t.type },
                { label: "Method", value: t.method },
                { label: "Reference", value: t.reference },
                { label: "Date", value: <DateCell value={t.date} /> },
              ]}
            />
            {t.status === "Failed" && (
              <Button variant="contained" fullWidth startIcon={<LuRotateCw size={16} />} sx={{ mt: 3 }} onClick={() => retry(t, api)}>
                Retry transaction
              </Button>
            )}
          </>
        ),
      }}
    />
  );
}
