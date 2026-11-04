"use client";
import { Box, Button } from "@mui/material";
import { LuPackage, LuClock, LuCircleCheck, LuCircleX, LuStar, LuPause, LuPlay } from "react-icons/lu";
import ResourcePage, { DetailList } from "@/components/common/ResourcePage";
import StatusChip from "@/components/common/StatusChip";
import { TitleCell, PersonCell, DateCell, Money } from "@/components/common/cells";
import { offers, CATEGORY_NAMES } from "@/data/marketplace";

function Rating({ value }) {
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontWeight: 600 }} className="num">
      <Box component="span" sx={{ color: "warning.main", display: "inline-flex" }}><LuStar size={14} fill="currentColor" aria-hidden="true" /></Box>
      {value.toFixed(1)}
    </Box>
  );
}

export default function OffersPage() {
  const approve = (o, api) => api.update(o.id, { status: "Active" }, `${o.id} approved and live`);
  const reject = (o, api) =>
    api.confirm({
      title: "Reject this offer?",
      body: `"${o.title}" will be hidden and the freelancer notified.`,
      confirmLabel: "Reject offer",
      tone: "error",
      onConfirm: () => api.update(o.id, { status: "Rejected" }, `${o.id} rejected`),
    });

  return (
    <ResourcePage
      title="Offers"
      subtitle="Services freelancers sell on the marketplace. New offers are reviewed before going live."
      noun="offers"
      rows={offers}
      stats={[
        { label: "Total offers", value: (r) => r.length, icon: <LuPackage size={20} /> },
        { label: "Pending review", value: (r) => r.filter((o) => o.status === "Pending review").length, icon: <LuClock size={20} />, tone: "warning" },
        { label: "Active", value: (r) => r.filter((o) => o.status === "Active").length, icon: <LuCircleCheck size={20} />, tone: "success" },
        { label: "Avg. rating", value: (r) => (r.reduce((s, o) => s + o.rating, 0) / Math.max(r.length, 1)).toFixed(2), icon: <LuStar size={20} />, tone: "info" },
      ]}
      tabs={{ field: "status", options: ["All", "Active", "Pending review", "Paused", "Rejected"] }}
      search={{ keys: ["title", "freelancer", "id"], placeholder: "Search by title, freelancer or ID" }}
      filters={[{ field: "category", label: "Category", options: CATEGORY_NAMES }]}
      columns={[
        { key: "title", label: "Offer", render: (o) => <TitleCell title={o.title} sub={`${o.id} · ${o.category}`} maxWidth={300} /> },
        { key: "freelancer", label: "Freelancer", render: (o) => <PersonCell name={o.freelancer} /> },
        { key: "price", label: "From", align: "right", render: (o) => <Money value={o.price} /> },
        { key: "orders", label: "Orders", align: "right", render: (o) => <span className="num">{o.orders}</span> },
        { key: "rating", label: "Rating", render: (o) => <Rating value={o.rating} /> },
        { key: "created", label: "Created", render: (o) => <DateCell value={o.created} /> },
        { key: "status", label: "Status", render: (o) => <StatusChip status={o.status} /> },
      ]}
      rowActions={(o, api) => [
        { label: "View details", onClick: () => api.openDetail(o) },
        o.status === "Pending review" && { label: "Approve", icon: <LuCircleCheck size={15} />, onClick: () => approve(o, api) },
        o.status === "Active" && { label: "Pause", icon: <LuPause size={15} />, onClick: () => api.update(o.id, { status: "Paused" }, `${o.id} paused`) },
        o.status === "Paused" && { label: "Resume", icon: <LuPlay size={15} />, onClick: () => api.update(o.id, { status: "Active" }, `${o.id} resumed`) },
        ["Pending review", "Active", "Paused"].includes(o.status) && { label: "Reject", icon: <LuCircleX size={15} />, tone: "error", onClick: () => reject(o, api) },
      ]}
      detail={{
        title: (o) => o.title,
        render: (o, api) => (
          <>
            <Box sx={{ mb: 2 }}>
              <StatusChip status={o.status} />
            </Box>
            <DetailList
              items={[
                { label: "Offer ID", value: o.id },
                { label: "Freelancer", value: o.freelancer },
                { label: "Category", value: o.category },
                { label: "Starting price", value: <Money value={o.price} /> },
                { label: "Orders", value: o.orders },
                { label: "Rating", value: <Rating value={o.rating} /> },
                { label: "Created", value: <DateCell value={o.created} /> },
              ]}
            />
            {o.status === "Pending review" && (
              <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
                <Button variant="contained" fullWidth onClick={() => approve(o, api)}>Approve</Button>
                <Button variant="outlined" color="error" fullWidth onClick={() => reject(o, api)}>Reject</Button>
              </Box>
            )}
          </>
        ),
      }}
    />
  );
}
