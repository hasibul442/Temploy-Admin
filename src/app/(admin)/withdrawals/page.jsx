"use client";
import { Box, Button } from "@mui/material";
import { LuHourglass, LuWallet, LuCircleCheck, LuCircleX, LuBanknote } from "react-icons/lu";
import ResourcePage, { DetailList } from "@/components/common/ResourcePage";
import StatusChip from "@/components/common/StatusChip";
import { PersonCell, Money, DateCell } from "@/components/common/cells";
import { withdrawals, WD_METHODS } from "@/data/finance";
import { formatStat } from "@/helper/format";

const total = (rows, pred) => formatStat(rows.filter(pred).reduce((s, w) => s + w.amount, 0), "currency");
const THIS_MONTH = "2026-11";

export default function WithdrawalsPage() {
  const approve = (w, api) => api.update(w.id, { status: "Approved" }, `${w.id} approved`);
  const markPaid = (w, api) => api.update(w.id, { status: "Paid" }, `${w.id} marked as paid`);
  const reject = (w, api) =>
    api.confirm({
      title: "Reject this withdrawal?",
      body: `The ${formatStat(w.amount, "currency")} request from ${w.freelancer} will be rejected and the funds returned to their balance.`,
      confirmLabel: "Reject withdrawal",
      tone: "error",
      onConfirm: () => api.update(w.id, { status: "Rejected" }, `${w.id} rejected`),
    });

  return (
    <ResourcePage
      title="Withdrawals"
      subtitle="Payout requests from freelancers. Approve, then mark as paid once the transfer is sent."
      noun="withdrawals"
      rows={withdrawals}
      stats={[
        { label: "Pending amount", value: (r) => total(r, (w) => w.status === "Pending"), icon: <LuWallet size={20} />, tone: "warning" },
        { label: "Pending requests", value: (r) => r.filter((w) => w.status === "Pending").length, icon: <LuHourglass size={20} />, tone: "info" },
        { label: "Paid this month", value: (r) => total(r, (w) => w.status === "Paid" && w.requested.startsWith(THIS_MONTH)), icon: <LuCircleCheck size={20} />, tone: "success" },
        { label: "Rejected", value: (r) => r.filter((w) => w.status === "Rejected").length, icon: <LuCircleX size={20} />, tone: "error" },
      ]}
      tabs={{ field: "status", options: ["All", "Pending", "Approved", "Paid", "Rejected"] }}
      search={{ keys: ["id", "freelancer", "account"], placeholder: "Search by ID or freelancer" }}
      filters={[{ field: "method", label: "Method", options: WD_METHODS }]}
      columns={[
        { key: "id", label: "Request", render: (w) => <Box sx={{ fontWeight: 600 }}>{w.id}</Box> },
        { key: "freelancer", label: "Freelancer", render: (w) => <PersonCell name={w.freelancer} /> },
        { key: "method", label: "Method", render: (w) => <Box><Box>{w.method}</Box><Box sx={{ fontSize: 12, color: "text.secondary" }}>{w.account}</Box></Box> },
        { key: "requested", label: "Requested", render: (w) => <DateCell value={w.requested} /> },
        { key: "amount", label: "Amount", align: "right", render: (w) => <Money value={w.amount} /> },
        { key: "status", label: "Status", render: (w) => <StatusChip status={w.status} /> },
      ]}
      rowActions={(w, api) => [
        { label: "View details", onClick: () => api.openDetail(w) },
        w.status === "Pending" && { label: "Approve", icon: <LuCircleCheck size={15} />, onClick: () => approve(w, api) },
        w.status === "Approved" && { label: "Mark as paid", icon: <LuBanknote size={15} />, onClick: () => markPaid(w, api) },
        ["Pending", "Approved"].includes(w.status) && { label: "Reject", icon: <LuCircleX size={15} />, tone: "error", onClick: () => reject(w, api) },
      ]}
      detail={{
        title: (w) => `Withdrawal ${w.id}`,
        render: (w, api) => (
          <>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <StatusChip status={w.status} />
              <Box sx={{ fontSize: 24 }}>
                <Money value={w.amount} />
              </Box>
            </Box>
            <DetailList
              items={[
                { label: "Freelancer", value: w.freelancer },
                { label: "Method", value: w.method },
                { label: "Account", value: w.account },
                { label: "Available balance", value: <Money value={w.balance} /> },
                { label: "Requested", value: <DateCell value={w.requested} /> },
              ]}
            />
            {w.status === "Pending" && (
              <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
                <Button variant="contained" fullWidth onClick={() => approve(w, api)}>Approve</Button>
                <Button variant="outlined" color="error" fullWidth onClick={() => reject(w, api)}>Reject</Button>
              </Box>
            )}
            {w.status === "Approved" && (
              <Button variant="contained" fullWidth startIcon={<LuBanknote size={16} />} sx={{ mt: 3 }} onClick={() => markPaid(w, api)}>
                Mark as paid
              </Button>
            )}
          </>
        ),
      }}
    />
  );
}
