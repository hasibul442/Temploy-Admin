"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Avatar, Box, Button, Card, CircularProgress, Divider, Typography } from "@mui/material";
import {
  LuArrowLeft,
  LuRefreshCw,
  LuBriefcase,
  LuCheck,
  LuX,
  LuMinus,
  LuCoins,
  LuClock,
  LuCalendarClock,
  LuReceipt,
  LuStar,
} from "react-icons/lu";
import PageHeader from "@/components/common/PageHeader";
import SectionCard from "@/components/common/SectionCard";
import StatusChip from "@/components/common/StatusChip";
import Facts from "@/components/common/Facts";
import BookingTimeline from "@/components/common/BookingTimeline";
import { StatTiles } from "@/components/common/ResourcePage";
import { Tag } from "@/components/common/cells";
import { formatLocalDate, formatLocalDateTime, formatMoney, humanize, initials } from "@/helper/format";
import { getErrorMessage } from "@/utils/services/api/apiError";
import { getOrder } from "@/utils/services/api/OrderService";

/*
 * Order (booking) details from GET /admin/orders/:id: a progress tracker (`tracking`), the money and schedule,
 * both parties, payment, dispute, overtime, reviews and every booking event (`timeline`). Read-only.
 */

const personName = (p) => (p ? `${p.fName ?? ""} ${p.lName ?? ""}`.trim() || p.email || "—" : "—");
const hours = (minutes) => `${Math.round((minutes / 60) * 10) / 10} h`;

function Person({ person, role }) {
  if (!person) return "—";
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
      <Avatar src={person.profileImage || undefined} sx={{ width: 34, height: 34, fontSize: 12, bgcolor: "primary.light", color: "primary.main", fontWeight: 600 }}>
        {initials(personName(person))}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 600 }}>
          <Link href={`/users/${person.id}`}>{personName(person)}</Link>
        </Typography>
        <Typography noWrap sx={{ fontSize: 12, color: "text.secondary" }}>{role} · {person.email}</Typography>
      </Box>
    </Box>
  );
}

const Heading = ({ children, sx }) => <Typography sx={{ fontWeight: 600, fontSize: 13.5, mb: 1, ...sx }}>{children}</Typography>;

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await getOrder(id);
    if (res?.data) setOrder(res.data.data);
    else setError(getErrorMessage(res));
  }, [id]);

  useEffect(() => {
    // Fetch on mount; state is set after the await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const back = <Button href="/orders" color="inherit" startIcon={<LuArrowLeft size={16} />}>All orders</Button>;

  if (!order) {
    return (
      <>
        <PageHeader title={`Order #${id}`} actions={back} />
        <Card sx={{ py: 6, textAlign: "center" }}>
          {error ? (
            <>
              <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
              <Button variant="outlined" startIcon={<LuRefreshCw size={15} />} onClick={load}>Try again</Button>
            </>
          ) : (
            <CircularProgress size={28} aria-label="Loading order" />
          )}
        </Card>
      </>
    );
  }

  const o = order;
  const money = (cents) => <span className="num">{formatMoney(cents, o.currency)}</span>;
  const p = o.payment;

  return (
    <>
      <PageHeader
        title={o.title}
        subtitle={`Order #${o.id} · ${o.source === "gig" ? "Gig" : "Job"} · ${o.category?.catName ?? "—"}${o.job?.subcategory ? ` / ${o.job.subcategory.subCatName}` : ""} · placed ${formatLocalDate(o.createdAt)}`}
        actions={
          <>
            {back}
            {o.job && (
              <Button href={`/jobs/${o.job.id}`} variant="outlined" startIcon={<LuBriefcase size={16} />}>Open job</Button>
            )}
          </>
        }
      />

      <StatTiles
        rows={[]}
        stats={[
          { label: "Order value", value: formatMoney(o.agreedPriceCents, o.currency), icon: <LuReceipt size={20} /> },
          { label: "Platform fees", value: formatMoney(o.commissionCents + o.employerFeeCents, o.currency), icon: <LuCoins size={20} />, tone: "success" },
          { label: "Booked time", value: hours(o.authorizedMinutes), icon: <LuClock size={20} />, tone: "info" },
          { label: "Starts", value: formatLocalDate(o.scheduledStartAt), icon: <LuCalendarClock size={20} />, tone: "warning" },
        ]}
      />

      <SectionCard title="Order tracking" action={<StatusChip status={humanize(o.status)} />} sx={{ height: "auto", mb: 2.5 }}>
        <Tracker steps={o.tracking} />
      </SectionCard>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 3fr) minmax(280px, 2fr)" }, gap: 2.5, alignItems: "start", mb: 2.5 }}>
        <Box sx={{ display: "grid", gap: 2.5 }}>
          <SectionCard title="Order" sx={{ height: "auto" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2 }}>
              <Person person={o.employer} role="Client" />
              <Person person={o.freelancer} role="Freelancer" />
            </Box>
            <Facts
              items={[
                { label: "Scheduled start", value: formatLocalDateTime(o.scheduledStartAt) },
                { label: "Scheduled end", value: formatLocalDateTime(o.scheduledEndAt) },
                { label: "Booked time", value: hours(o.authorizedMinutes) },
                o.checkInAt && { label: "Work started", value: formatLocalDateTime(o.checkInAt) },
                o.checkOutAt && { label: "Marked complete", value: formatLocalDateTime(o.checkOutAt) },
                o.approvedAt && { label: "Approved", value: formatLocalDateTime(o.approvedAt) },
                o.autoReleaseAt && { label: "Auto release", value: formatLocalDateTime(o.autoReleaseAt) },
                o.cancelledAt && { label: "Cancelled", value: `${formatLocalDateTime(o.cancelledAt)}${o.cancelledBy ? ` by ${personName(o.cancelledBy)}` : ""}` },
                { label: "Site", value: o.siteAddress || "—", wide: true },
                o.cancellationReason && { label: "Cancellation reason", value: o.cancellationReason, wide: true },
              ]}
            />
            {o.proposal && (
              <>
                <Divider sx={{ my: 2 }} />
                <Heading>From proposal #{o.proposal.id}</Heading>
                <Facts
                  items={[
                    { label: "Proposed amount", value: money(o.proposal.proposedAmountCents) },
                    { label: "Sent", value: formatLocalDate(o.proposal.createdAt) },
                    o.proposal.coverLetter && { label: "Cover letter", value: o.proposal.coverLetter, wide: true },
                  ]}
                />
              </>
            )}
          </SectionCard>

          {o.dispute && (
            <SectionCard title="Dispute" action={<StatusChip status={humanize(o.dispute.status)} />} sx={{ height: "auto" }}>
              <Facts
                items={[
                  { label: "Opened by", value: `${personName(o.dispute.openedBy)} · ${formatLocalDateTime(o.dispute.createdAt)}` },
                  o.dispute.resolvedAt && { label: "Resolved", value: formatLocalDateTime(o.dispute.resolvedAt) },
                  o.dispute.resolutionAmountCents !== null && { label: "Resolved amount", value: money(o.dispute.resolutionAmountCents) },
                  { label: "Claim", value: o.dispute.claim, wide: true },
                  o.dispute.resolution && { label: "Resolution", value: o.dispute.resolution, wide: true },
                ]}
              />
            </SectionCard>
          )}

          {(o.overtimeRequests.length > 0 || o.reviews.length > 0) && (
            <SectionCard title="Overtime and reviews" sx={{ height: "auto" }}>
              {o.overtimeRequests.length > 0 && (
                <>
                  <Heading>Overtime requests</Heading>
                  <Box sx={{ display: "grid", gap: 0.75, mb: o.reviews.length ? 2 : 0 }}>
                    {o.overtimeRequests.map((r) => (
                      <Box key={r.id} sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", fontSize: 13.5 }}>
                        <StatusChip status={humanize(r.status)} />
                        <span className="num">{r.requestedMinutes} min · +{formatMoney(r.priceDeltaCents, o.currency)}</span>
                        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{formatLocalDateTime(r.createdAt)}</Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              )}
              {o.reviews.length > 0 && (
                <>
                  <Heading>Reviews</Heading>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.25 }}>
                    {o.reviews.map((r) => (
                      <Box key={r.id} sx={{ p: 1.5, borderRadius: "12px", bgcolor: "action.hover" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{personName(r.author)} → {personName(r.subject)}</Typography>
                          {r.rating !== null && (
                            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.25, color: "warning.main", fontSize: 13, fontWeight: 600 }}>
                              <LuStar size={13} aria-hidden="true" /> {r.rating}
                            </Box>
                          )}
                        </Box>
                        {r.comment && <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{r.comment}</Typography>}
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </SectionCard>
          )}
        </Box>

        <Box sx={{ display: "grid", gap: 2.5 }}>
          <SectionCard title="Money" subtitle={`Amounts in ${o.currency}`} sx={{ height: "auto" }}>
            <Facts
              min={140}
              items={[
                { label: "Agreed price", value: money(o.agreedPriceCents) },
                { label: "Employer fee", value: money(o.employerFeeCents) },
                { label: "Commission", value: money(o.commissionCents) },
                { label: "Freelancer net", value: money(o.agreedPriceCents - o.commissionCents) },
                o.preAuthCents !== null && { label: "Pre-authorized", value: money(o.preAuthCents) },
                o.finalTotalCents !== null && { label: "Final total", value: money(o.finalTotalCents) },
              ]}
            />
            <Divider sx={{ my: 2 }} />
            <Heading>Payment</Heading>
            {p ? (
              <Facts
                min={140}
                items={[
                  { label: "Status", value: <StatusChip status={humanize(p.status)} /> },
                  { label: "Captured", value: money(p.capturedCents) },
                  p.refundedCents > 0 && { label: "Refunded", value: money(p.refundedCents) },
                  p.providerNetCents !== null && { label: "Provider net", value: money(p.providerNetCents) },
                  { label: "Payout speed", value: humanize(p.payoutSpeed) },
                  { label: "Paid out", value: p.payoutAt ? formatLocalDateTime(p.payoutAt) : "Not yet" },
                ]}
              />
            ) : (
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>No payment recorded (payments aren&apos;t connected yet).</Typography>
            )}
            {o.walletTransactions.length > 0 && (
              <>
                <Heading sx={{ mt: 2 }}>Freelancer wallet</Heading>
                <Box sx={{ display: "grid", gap: 0.75 }}>
                  {o.walletTransactions.map((w) => (
                    <Box key={w.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, fontSize: 13.5 }}>
                      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <Tag>{humanize(w.type)}</Tag>
                        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{formatLocalDate(w.createdAt)}</Typography>
                      </Box>
                      <b className="num">{formatMoney(w.amountCents, w.currency)}</b>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </SectionCard>

          <SectionCard title="Timeline" subtitle={`${o.timeline.length} event${o.timeline.length === 1 ? "" : "s"}, oldest first`} sx={{ height: "auto" }}>
            <BookingTimeline events={o.timeline} />
          </SectionCard>
        </Box>
      </Box>
    </>
  );
}

// Tracker step look per state
const STEP_STYLE = {
  done: { bg: "success.main", color: "common.white", icon: <LuCheck size={14} /> },
  current: { bg: "primary.main", color: "common.white", icon: null, ring: true },
  upcoming: { bg: "action.selected", color: "text.secondary", icon: null },
  skipped: { bg: "action.selected", color: "text.secondary", icon: <LuMinus size={14} />, note: "Not recorded" },
  cancelled: { bg: "action.hover", color: "text.disabled", icon: <LuX size={13} />, note: "Not reached" },
};
// Extra steps (dispute, refund, cancellation) are shown in red
const ALERT_KEYS = ["dispute_opened", "dispute_resolved", "refunded", "cancelled"];

/** The `tracking` steps as a horizontal tracker (scrolls sideways on narrow screens). */
function Tracker({ steps }) {
  return (
    <Box sx={{ overflowX: "auto", pb: 0.5 }}>
      <Box component="ol" sx={{ display: "flex", listStyle: "none", m: 0, p: 0, minWidth: steps.length * 120 }}>
        {steps.map((s, i) => {
          const style = STEP_STYLE[s.state] ?? STEP_STYLE.upcoming;
          const alert = ALERT_KEYS.includes(s.key) && s.state !== "upcoming";
          const bg = alert ? (s.state === "current" ? "warning.main" : "error.main") : style.bg;
          const reached = ["done", "current"].includes(s.state);
          return (
            <Box component="li" key={s.key} sx={{ flex: 1, minWidth: 110, position: "relative", textAlign: "center", px: 0.5 }}>
              {/* Connector to the previous step */}
              {i > 0 && (
                <Box
                  aria-hidden="true"
                  sx={{ position: "absolute", top: 14, right: "50%", width: "100%", height: 3, bgcolor: reached ? "success.main" : "divider", zIndex: 0 }}
                />
              )}
              <Box
                sx={{
                  position: "relative",
                  zIndex: 1,
                  width: 30,
                  height: 30,
                  mx: "auto",
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: bg,
                  color: alert ? "common.white" : style.color,
                  fontSize: 12,
                  fontWeight: 700,
                  boxShadow: style.ring ? (t) => `0 0 0 4px ${t.vars.palette.primary.light}` : "none",
                }}
              >
                {style.icon ?? i + 1}
              </Box>
              <Typography sx={{ mt: 1, fontSize: 13, fontWeight: s.state === "current" ? 700 : 600, color: s.state === "cancelled" ? "text.disabled" : "text.primary" }}>
                {s.label}
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                {s.at ? formatLocalDateTime(s.at) : s.state === "current" ? "Waiting" : style.note ?? ""}
              </Typography>
              {s.reason && <Typography sx={{ fontSize: 11.5, color: "error.main" }}>{s.reason}</Typography>}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
