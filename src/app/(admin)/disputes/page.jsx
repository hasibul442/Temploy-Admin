"use client";
import { Box, Button, Typography } from "@mui/material";
import { LuScale, LuTriangleAlert, LuCircleCheck, LuUndo2, LuArrowUpRight } from "react-icons/lu";
import ResourcePage, { DetailList } from "@/components/common/ResourcePage";
import StatusChip from "@/components/common/StatusChip";
import { TitleCell, Money, DateCell } from "@/components/common/cells";
import { disputes, PRIORITIES, DISPUTE_REASONS } from "@/data/moderation";
import { formatDate, formatStat } from "@/helper/format";
import { clay } from "@/theme/clay";

const TODAY = "2026-11-04";
const ACTIVE = ["Open", "Under review", "Escalated"];

/** Vertical event timeline: puffy dots joined by a soft line. */
function Timeline({ events }) {
  return (
    <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0 }}>
      {events.map((e, i) => (
        <Box component="li" key={i} sx={{ display: "flex", gap: 1.75 }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 0.5 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                flexShrink: 0,
                bgcolor: i === events.length - 1 ? "primary.main" : "background.paper",
                border: i === events.length - 1 ? 0 : "3px solid",
                borderColor: "text.disabled",
                boxShadow: i === events.length - 1 ? clay.tinted("46, 125, 50", 0.3) : clay.raised,
              }}
            />
            {i < events.length - 1 && <Box sx={{ width: 2, flex: 1, minHeight: 24, my: 0.5, borderRadius: 1, bgcolor: "divider" }} />}
          </Box>
          <Box sx={{ pb: 2.25, minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
              {e.actor}
              <Box component="span" sx={{ fontWeight: 400, color: "text.secondary", ml: 1, fontSize: 12 }}>
                {formatDate(e.date)}
              </Box>
            </Typography>
            <Typography sx={{ fontSize: 13.5, color: "text.secondary", lineHeight: 1.5 }}>{e.text}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export default function DisputesPage() {
  const act = (d, api, status, text, message) =>
    api.update(d.id, (r) => ({ status, timeline: [...r.timeline, { date: TODAY, actor: "You", text }] }), message);

  const refund = (d, api) =>
    api.confirm({
      title: "Refund the client?",
      body: `${formatStat(d.amount, "currency")} will be returned to ${d.client} and the order cancelled.`,
      confirmLabel: "Refund client",
      tone: "error",
      onConfirm: () => act(d, api, "Refunded", "Refunded the client in full.", `${d.id}: client refunded`),
    });
  const release = (d, api) =>
    api.confirm({
      title: "Release payment to freelancer?",
      body: `${formatStat(d.amount, "currency")} will be released to ${d.freelancer} and the dispute closed.`,
      confirmLabel: "Release payment",
      onConfirm: () => act(d, api, "Resolved", "Released payment to the freelancer.", `${d.id}: payment released`),
    });
  const escalate = (d, api) => act(d, api, "Escalated", "Escalated to a senior moderator.", `${d.id} escalated`);
  const review = (d, api) => act(d, api, "Under review", "Started reviewing the order conversation.", `${d.id} moved to review`);

  return (
    <ResourcePage
      title="Disputes"
      subtitle="Order disagreements between clients and freelancers that need an admin decision."
      noun="disputes"
      rows={disputes}
      stats={[
        { label: "Active disputes", value: (r) => r.filter((d) => ACTIVE.includes(d.status)).length, icon: <LuScale size={20} />, tone: "info" },
        { label: "High priority", value: (r) => r.filter((d) => d.priority === "High" && ACTIVE.includes(d.status)).length, icon: <LuTriangleAlert size={20} />, tone: "error" },
        { label: "Amount on hold", value: (r) => formatStat(r.filter((d) => ACTIVE.includes(d.status)).reduce((s, d) => s + d.amount, 0), "currency"), icon: <LuUndo2 size={20} />, tone: "warning" },
        { label: "Closed", value: (r) => r.filter((d) => !ACTIVE.includes(d.status)).length, icon: <LuCircleCheck size={20} />, tone: "success" },
      ]}
      tabs={{ field: "status", options: ["All", "Open", "Under review", "Escalated", "Resolved", "Refunded"] }}
      search={{ keys: ["id", "order", "client", "freelancer"], placeholder: "Search by ID, order or party" }}
      filters={[
        { field: "priority", label: "Priority", options: PRIORITIES },
        { field: "reason", label: "Reason", options: DISPUTE_REASONS },
      ]}
      columns={[
        { key: "id", label: "Dispute", render: (d) => <TitleCell title={d.reason} sub={`${d.id} · ${d.order}`} /> },
        { key: "client", label: "Client" },
        { key: "freelancer", label: "Freelancer" },
        { key: "priority", label: "Priority", render: (d) => <StatusChip status={d.priority} /> },
        { key: "opened", label: "Opened", render: (d) => <DateCell value={d.opened} /> },
        { key: "amount", label: "Amount", align: "right", render: (d) => <Money value={d.amount} /> },
        { key: "status", label: "Status", render: (d) => <StatusChip status={d.status} /> },
      ]}
      rowActions={(d, api) => [
        { label: "View details", onClick: () => api.openDetail(d) },
        d.status === "Open" && { label: "Start review", onClick: () => review(d, api) },
        ACTIVE.includes(d.status) && { label: "Release to freelancer", icon: <LuCircleCheck size={15} />, onClick: () => release(d, api) },
        ACTIVE.includes(d.status) && { label: "Refund client", icon: <LuUndo2 size={15} />, tone: "error", onClick: () => refund(d, api) },
        ["Open", "Under review"].includes(d.status) && { label: "Escalate", icon: <LuArrowUpRight size={15} />, onClick: () => escalate(d, api) },
      ]}
      detail={{
        title: (d) => `Dispute ${d.id}`,
        render: (d, api) => (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <StatusChip status={d.status} />
              <StatusChip status={d.priority} />
              <Box sx={{ ml: "auto", fontSize: 22 }}>
                <Money value={d.amount} />
              </Box>
            </Box>
            <DetailList
              items={[
                { label: "Order", value: d.order },
                { label: "Reason", value: d.reason },
                { label: "Client", value: d.client },
                { label: "Freelancer", value: d.freelancer },
                { label: "Opened", value: <DateCell value={d.opened} /> },
              ]}
            />
            <Typography sx={{ fontWeight: 600, fontSize: 14, mt: 3, mb: 1.5 }}>Timeline</Typography>
            <Timeline events={d.timeline} />
            {ACTIVE.includes(d.status) && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Button variant="contained" fullWidth onClick={() => release(d, api)}>Release to freelancer</Button>
                  <Button variant="outlined" color="error" fullWidth onClick={() => refund(d, api)}>Refund client</Button>
                </Box>
                {d.status !== "Escalated" && (
                  <Button variant="outlined" color="inherit" startIcon={<LuArrowUpRight size={16} />} onClick={() => escalate(d, api)}>
                    Escalate
                  </Button>
                )}
              </Box>
            )}
          </>
        ),
      }}
    />
  );
}
