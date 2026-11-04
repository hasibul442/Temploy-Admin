"use client";
import { Box, Button, Typography } from "@mui/material";
import { LuFlag, LuEye, LuShieldCheck, LuBan, LuCircleSlash } from "react-icons/lu";
import ResourcePage, { DetailList } from "@/components/common/ResourcePage";
import StatusChip from "@/components/common/StatusChip";
import { TitleCell, DateCell, Tag } from "@/components/common/cells";
import { reports, REPORT_TYPES, REPORT_REASONS } from "@/data/moderation";

export default function ReportsPage() {
  const review = (r, api) => api.update(r.id, { status: "Under review" }, `${r.id} moved to review`);
  const resolve = (r, api) =>
    api.confirm({
      title: "Take down and resolve?",
      body: `The reported ${r.type.toLowerCase()} "${r.target}" will be taken down and the report marked resolved.`,
      confirmLabel: "Take down",
      tone: "error",
      onConfirm: () => api.update(r.id, { status: "Resolved" }, `${r.id} resolved, content taken down`),
    });
  const dismiss = (r, api) =>
    api.confirm({
      title: "Dismiss this report?",
      body: "No action will be taken against the reported content. The reporter won't be notified.",
      confirmLabel: "Dismiss",
      onConfirm: () => api.update(r.id, { status: "Dismissed" }, `${r.id} dismissed`),
    });
  const isOpen = (r) => ["Open", "Under review"].includes(r.status);

  return (
    <ResourcePage
      title="Reports"
      subtitle="Content and users flagged by the community. Review each one and take action."
      noun="reports"
      rows={reports}
      stats={[
        { label: "Open", value: (rs) => rs.filter((r) => r.status === "Open").length, icon: <LuFlag size={20} />, tone: "error" },
        { label: "Under review", value: (rs) => rs.filter((r) => r.status === "Under review").length, icon: <LuEye size={20} />, tone: "info" },
        { label: "Resolved", value: (rs) => rs.filter((r) => r.status === "Resolved").length, icon: <LuShieldCheck size={20} />, tone: "success" },
        { label: "Dismissed", value: (rs) => rs.filter((r) => r.status === "Dismissed").length, icon: <LuCircleSlash size={20} />, tone: "warning" },
      ]}
      tabs={{ field: "status", options: ["All", "Open", "Under review", "Resolved", "Dismissed"] }}
      search={{ keys: ["id", "target", "reporter"], placeholder: "Search by ID, content or reporter" }}
      filters={[
        { field: "type", label: "Type", options: REPORT_TYPES },
        { field: "reason", label: "Reason", options: REPORT_REASONS },
      ]}
      columns={[
        { key: "target", label: "Reported item", render: (r) => <TitleCell title={r.target} sub={r.id} /> },
        { key: "type", label: "Type", render: (r) => <Tag>{r.type}</Tag> },
        { key: "reason", label: "Reason" },
        { key: "reporter", label: "Reporter" },
        { key: "date", label: "Reported", render: (r) => <DateCell value={r.date} /> },
        { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
      ]}
      rowActions={(r, api) => [
        { label: "View details", onClick: () => api.openDetail(r) },
        r.status === "Open" && { label: "Start review", icon: <LuEye size={15} />, onClick: () => review(r, api) },
        isOpen(r) && { label: "Take down & resolve", icon: <LuBan size={15} />, tone: "error", onClick: () => resolve(r, api) },
        isOpen(r) && { label: "Dismiss", icon: <LuCircleSlash size={15} />, onClick: () => dismiss(r, api) },
      ]}
      detail={{
        title: (r) => `Report ${r.id}`,
        render: (r, api) => (
          <>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <StatusChip status={r.status} />
              <Tag>{r.type}</Tag>
            </Box>
            <DetailList
              items={[
                { label: "Reported item", value: r.target },
                { label: "Reason", value: r.reason },
                { label: "Reporter", value: r.reporter },
                { label: "Reported", value: <DateCell value={r.date} /> },
              ]}
            />
            <Typography sx={{ fontWeight: 600, fontSize: 14, mt: 3, mb: 1 }}>Notes</Typography>
            <Typography sx={{ fontSize: 13.5, color: "text.secondary", lineHeight: 1.6 }}>{r.notes}</Typography>
            {isOpen(r) && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 3 }}>
                {r.status === "Open" && (
                  <Button variant="contained" startIcon={<LuEye size={16} />} onClick={() => review(r, api)}>Start review</Button>
                )}
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Button variant="outlined" color="error" fullWidth onClick={() => resolve(r, api)}>Take down</Button>
                  <Button variant="outlined" color="inherit" fullWidth onClick={() => dismiss(r, api)}>Dismiss</Button>
                </Box>
              </Box>
            )}
          </>
        ),
      }}
    />
  );
}
