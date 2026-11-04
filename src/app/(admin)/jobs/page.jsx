"use client";
import { Box, Button, Typography } from "@mui/material";
import { LuBriefcase, LuClock, LuCircleCheck, LuCircleX, LuMessageSquare } from "react-icons/lu";
import ResourcePage, { DetailList } from "@/components/common/ResourcePage";
import StatusChip from "@/components/common/StatusChip";
import { TitleCell, DateCell, Tag } from "@/components/common/cells";
import { jobs, CATEGORY_NAMES } from "@/data/marketplace";
import { formatCurrency } from "@/helper/format";

const budget = (j) => (j.budgetType === "Hourly" ? `${formatCurrency(j.budget)}/hr` : formatCurrency(j.budget));

export default function JobsPage() {
  const approve = (job, api) => api.update(job.id, { status: "Open" }, `${job.id} approved and published`);
  const reject = (job, api) =>
    api.confirm({
      title: "Reject this job?",
      body: `"${job.title}" will be hidden and the client notified.`,
      confirmLabel: "Reject job",
      tone: "error",
      onConfirm: () => api.update(job.id, { status: "Rejected" }, `${job.id} rejected`),
    });

  return (
    <ResourcePage
      title="Jobs"
      subtitle="Projects posted by clients. New posts wait for approval before going live."
      noun="jobs"
      rows={jobs}
      stats={[
        { label: "Total jobs", value: (r) => r.length, icon: <LuBriefcase size={20} /> },
        { label: "Pending approval", value: (r) => r.filter((j) => j.status === "Pending approval").length, icon: <LuClock size={20} />, tone: "warning" },
        { label: "Open now", value: (r) => r.filter((j) => j.status === "Open").length, icon: <LuCircleCheck size={20} />, tone: "success" },
        { label: "Avg. proposals", value: (r) => Math.round(r.reduce((s, j) => s + j.proposals, 0) / Math.max(r.length, 1)), icon: <LuMessageSquare size={20} />, tone: "info" },
      ]}
      tabs={{ field: "status", options: ["All", "Pending approval", "Open", "In progress", "Closed", "Rejected"] }}
      search={{ keys: ["title", "client", "id"], placeholder: "Search by title, client or ID" }}
      filters={[
        { field: "category", label: "Category", options: CATEGORY_NAMES },
        { field: "budgetType", label: "Budget type", options: ["Fixed", "Hourly"] },
      ]}
      columns={[
        { key: "title", label: "Job", render: (j) => <TitleCell title={j.title} sub={`${j.id} · ${j.category}`} /> },
        { key: "client", label: "Client" },
        { key: "budget", label: "Budget", align: "right", render: (j) => <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", alignItems: "center" }}><Tag>{j.budgetType}</Tag><b className="num">{budget(j)}</b></Box> },
        { key: "proposals", label: "Proposals", align: "right", render: (j) => <span className="num">{j.proposals}</span> },
        { key: "posted", label: "Posted", render: (j) => <DateCell value={j.posted} /> },
        { key: "status", label: "Status", render: (j) => <StatusChip status={j.status} /> },
      ]}
      rowActions={(j, api) => [
        { label: "View details", onClick: () => api.openDetail(j) },
        j.status === "Pending approval" && { label: "Approve", icon: <LuCircleCheck size={15} />, onClick: () => approve(j, api) },
        ["Pending approval", "Open"].includes(j.status) && { label: "Reject", icon: <LuCircleX size={15} />, tone: "error", onClick: () => reject(j, api) },
        j.status === "Open" && { label: "Close job", onClick: () => api.update(j.id, { status: "Closed" }, `${j.id} closed`) },
      ]}
      detail={{
        title: (j) => j.title,
        render: (j, api) => (
          <>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <StatusChip status={j.status} />
              <Tag>{j.budgetType}</Tag>
            </Box>
            <DetailList
              items={[
                { label: "Job ID", value: j.id },
                { label: "Client", value: j.client },
                { label: "Category", value: j.category },
                { label: "Budget", value: budget(j) },
                { label: "Proposals", value: j.proposals },
                { label: "Posted", value: <DateCell value={j.posted} /> },
              ]}
            />
            <Typography sx={{ fontWeight: 600, fontSize: 14, mt: 3, mb: 1 }}>Description</Typography>
            <Typography sx={{ fontSize: 13.5, color: "text.secondary", lineHeight: 1.6 }}>{j.description}</Typography>
            {j.status === "Pending approval" && (
              <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
                <Button variant="contained" fullWidth onClick={() => approve(j, api)}>Approve</Button>
                <Button variant="outlined" color="error" fullWidth onClick={() => reject(j, api)}>Reject</Button>
              </Box>
            )}
          </>
        ),
      }}
    />
  );
}
