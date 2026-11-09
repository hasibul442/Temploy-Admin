"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  Pagination,
  Typography,
} from "@mui/material";
import { LuArrowLeft, LuPencil, LuUsers, LuUserCheck, LuArmchair, LuCalendarCheck, LuRefreshCw, LuStar } from "react-icons/lu";
import PageHeader from "@/components/common/PageHeader";
import SectionCard from "@/components/common/SectionCard";
import StatusChip from "@/components/common/StatusChip";
import { StatTiles } from "@/components/common/ResourcePage";
import { Tag } from "@/components/common/cells";
import Facts from "@/components/common/Facts";
import BookingTimeline from "@/components/common/BookingTimeline";
import EditJobDialog from "@/components/jobs/EditJobDialog";
import { formatLocalDate, formatLocalDateTime, formatMoney, humanize, initials } from "@/helper/format";
import { getErrorMessage } from "@/utils/services/api/apiError";
import { getJob } from "@/utils/services/api/JobService";

/*
 * Job details from GET /admin/jobs/:id: the job, who applied and who was hired, every proposal, and every
 * booking with its money, payment, dispute, reviews, overtime and event timeline.
 */

const personName = (p) => (p ? `${p.fName ?? ""} ${p.lName ?? ""}`.trim() || p.email || "—" : "—");
const PAYMENT_TIMING = { 1: "Pay now (escrow at posting)", 2: "Pay later (escrow at hiring)" };
const PAYMENT_VERIFIED = { 0: "Failed", 1: "Pending", 2: "Verified" };

function Person({ person, sub }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
      <Avatar src={person?.profileImage || undefined} sx={{ width: 32, height: 32, fontSize: 12, bgcolor: "primary.light", color: "primary.main", fontWeight: 600 }}>
        {initials(personName(person))}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 600 }}>{personName(person)}</Typography>
        <Typography noWrap sx={{ fontSize: 12, color: "text.secondary" }}>{sub ?? person?.email}</Typography>
      </Box>
    </Box>
  );
}

const Heading = ({ children, sx }) => <Typography sx={{ fontWeight: 600, fontSize: 13.5, mb: 1, ...sx }}>{children}</Typography>;

export default function JobDetailsPage() {
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const res = await getJob(id);
    if (res?.data) setDetails(res.data.data);
    else setError(getErrorMessage(res));
  }, [id]);

  useEffect(() => {
    // Fetch on mount; state is set after the await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const back = (
    <Button href="/jobs" color="inherit" startIcon={<LuArrowLeft size={16} />}>All jobs</Button>
  );

  if (!details) {
    return (
      <>
        <PageHeader title={`Job #${id}`} actions={back} />
        <Card sx={{ py: 6, textAlign: "center" }}>
          {error ? (
            <>
              <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
              <Button variant="outlined" startIcon={<LuRefreshCw size={15} />} onClick={load}>Try again</Button>
            </>
          ) : (
            <CircularProgress size={28} aria-label="Loading job" />
          )}
        </Card>
      </>
    );
  }

  const { job, summary, proposals, bookings } = details;
  const budget = job.budgetMaxCents
    ? `${formatMoney(job.budgetCents, job.currency)} – ${formatMoney(job.budgetMaxCents, job.currency)}`
    : formatMoney(job.budgetCents, job.currency);
  const hasSkills = job.skills?.length > 0;
  const hasRequirements = job.requirements?.length > 0;

  return (
    <>
      <PageHeader
        title={job.title}
        subtitle={`#${job.id} · ${job.category?.catName ?? "—"}${job.subcategory ? ` / ${job.subcategory.subCatName}` : ""} · posted ${formatLocalDate(job.createdAt)}`}
        actions={
          <>
            {back}
            <Button variant="contained" startIcon={<LuPencil size={16} />} onClick={() => setEditing(true)}>Edit job</Button>
          </>
        }
      />

      <StatTiles
        rows={[]}
        stats={[
          { label: "Freelancers applied", value: summary.freelancersApplied, icon: <LuUsers size={20} /> },
          { label: "Hired", value: `${summary.hired} / ${summary.workersNeeded}`, icon: <LuUserCheck size={20} />, tone: "success" },
          { label: "Open slots", value: summary.openSlots, icon: <LuArmchair size={20} />, tone: "warning" },
          { label: "Bookings", value: bookings.length, icon: <LuCalendarCheck size={20} />, tone: "info" },
        ]}
      />

      {/* Job information and description in one card */}
      <SectionCard
        title="Job information"
        action={
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <StatusChip status={humanize(job.status)} />
            <Tag>{humanize(job.jobType)}</Tag>
            <Tag>{humanize(job.duration)}</Tag>
            {job.urgency === "URGENT" && <Tag tone="error">Urgent</Tag>}
          </Box>
        }
        sx={{ height: "auto", mb: 2.5 }}
      >
        <Facts
          items={[
            { label: "Client", value: <Person person={job.postedBy} />, wide: true },
            { label: "Budget", value: <span className="num">{job.jobType === "HOURLY" ? `${budget}/hr` : budget}</span> },
            { label: "Workers needed", value: job.workersNeeded },
            { label: "Payment", value: PAYMENT_TIMING[job.paymentTiming] ?? "—" },
            job.paymentTiming === 1 && { label: "Payment status", value: PAYMENT_VERIFIED[job.isPaymentVerified] ?? "—" },
            { label: "Starts", value: formatLocalDateTime(job.scheduledAt) },
            { label: "Estimated duration", value: job.estimatedDuration || "—" },
            { label: "Expires", value: formatLocalDateTime(job.expiresAt) },
            { label: "Last updated", value: formatLocalDateTime(job.updatedAt) },
            { label: "Location", value: [job.address, job.city, job.state, job.country].filter(Boolean).join(", ") || "—", wide: true },
          ]}
        />

        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: hasSkills || hasRequirements ? "2fr 1fr" : "1fr" }, gap: 2.5 }}>
          <Box>
            <Heading>Description</Heading>
            <Typography sx={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-line" }}>{job.description}</Typography>
          </Box>
          {(hasSkills || hasRequirements) && (
            <Box>
              {hasSkills && (
                <>
                  <Heading>Skills</Heading>
                  <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: hasRequirements ? 2 : 0 }}>
                    {job.skills.map((s) => <Tag key={s.id}>{s.skillName}</Tag>)}
                  </Box>
                </>
              )}
              {hasRequirements && (
                <>
                  <Heading>Requirements</Heading>
                  <Box component="ul" sx={{ m: 0, pl: 2.5, fontSize: 13.5, lineHeight: 1.6 }}>
                    {job.requirements.map((r) => <li key={r}>{r}</li>)}
                  </Box>
                </>
              )}
            </Box>
          )}
        </Box>
      </SectionCard>

      <ProposalsSection key={job.id} proposals={proposals} summary={summary} currency={job.currency} />

      {/* Bookings with timelines */}
      {bookings.length === 0 ? (
        <SectionCard title="Bookings" subtitle="No bookings yet" noPadding sx={{ height: "auto" }} />
      ) : (
        <>
          <Typography variant="h6" component="h2" sx={{ mb: 1.5 }}>Bookings</Typography>
          <Box sx={{ display: "grid", gap: 2 }}>
            {bookings.map((b) => <BookingCard key={b.id} booking={b} />)}
          </Box>
        </>
      )}

      {editing && (
        <EditJobDialog
          job={job}
          onClose={() => setEditing(false)}
          onSaved={() => { setEditing(false); load(); }}
        />
      )}
    </>
  );
}

const PROPOSALS_PER_PAGE = 9;

/**
 * Proposals as cards, hired ones first (solid green so they stand out). The API returns them all,
 * so paging happens here.
 */
function ProposalsSection({ proposals, summary, currency }) {
  const [page, setPage] = useState(1);
  // Hired first; otherwise keep the API's order (sort is stable).
  const sorted = useMemo(() => [...proposals].sort((a, b) => Number(b.hired) - Number(a.hired)), [proposals]);
  const pageCount = Math.ceil(sorted.length / PROPOSALS_PER_PAGE);
  const shown = sorted.slice((page - 1) * PROPOSALS_PER_PAGE, page * PROPOSALS_PER_PAGE);

  return (
    <SectionCard
      title="Proposals"
      subtitle={
        proposals.length
          ? `${proposals.length} received · ${summary.hired} of ${summary.workersNeeded} hired (green)`
          : "No proposals yet"
      }
      noPadding={proposals.length === 0}
      sx={{ height: "auto", mb: 2.5 }}
    >
      {proposals.length > 0 && (
        <>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 1.5 }}>
            {shown.map((p) => <ProposalCard key={p.id} proposal={p} currency={currency} />)}
          </Box>
          {pageCount > 1 && (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap", mt: 2 }}>
              <Typography sx={{ fontSize: 13, color: "text.secondary" }} className="num">
                {(page - 1) * PROPOSALS_PER_PAGE + 1}–{(page - 1) * PROPOSALS_PER_PAGE + shown.length} of {sorted.length}
              </Typography>
              <Pagination count={pageCount} page={page} onChange={(_, p) => setPage(p)} size="small" shape="rounded" />
            </Box>
          )}
        </>
      )}
    </SectionCard>
  );
}

/** One proposal. Hired → green card with white text; otherwise a plain white card. */
function ProposalCard({ proposal: p, currency }) {
  const muted = p.hired ? "rgba(255, 255, 255, 0.82)" : "text.secondary";
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: "16px",
        border: 1,
        borderColor: p.hired ? "success.main" : "divider",
        bgcolor: p.hired ? "success.main" : "background.paper",
        color: p.hired ? "common.white" : "text.primary",
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
          <Avatar
            src={p.freelancer?.profileImage || undefined}
            sx={{ width: 32, height: 32, fontSize: 12, fontWeight: 600, bgcolor: p.hired ? "common.white" : "primary.light", color: p.hired ? "success.main" : "primary.main" }}
          >
            {initials(personName(p.freelancer))}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 600 }}>{personName(p.freelancer)}</Typography>
            <Typography noWrap sx={{ fontSize: 12, color: muted }}>{p.freelancer?.email}</Typography>
          </Box>
        </Box>
        {p.hired ? (
          <Box sx={{ px: 1.25, py: 0.25, borderRadius: 99, bgcolor: "common.white", color: "success.main", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
            Hired
          </Box>
        ) : (
          <StatusChip status={humanize(p.status)} />
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
        <Typography className="num" sx={{ fontSize: 16, fontWeight: 700 }}>{formatMoney(p.proposedAmountCents, currency)}</Typography>
        <Typography sx={{ fontSize: 12, color: muted }}>
          Start: {p.proposedStartAt ? formatLocalDateTime(p.proposedStartAt) : humanize(p.availability)}
        </Typography>
      </Box>

      {p.coverLetter && (
        <Typography
          title={p.coverLetter}
          sx={{ fontSize: 13, color: muted, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
        >
          {p.coverLetter}
        </Typography>
      )}

      <Typography sx={{ fontSize: 12, color: muted, mt: "auto" }}>Submitted {formatLocalDate(p.createdAt)}</Typography>
    </Box>
  );
}

function BookingCard({ booking: b }) {
  const money = (cents) => <span className="num">{formatMoney(cents, b.currency)}</span>;
  return (
    <Card sx={{ p: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap", mb: 2 }}>
        <Person person={b.freelancer} sub={`Booking #${b.id} · created ${formatLocalDateTime(b.createdAt)}`} />
        <StatusChip status={humanize(b.status)} />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 3fr) minmax(260px, 2fr)" }, gap: 2.5, alignItems: "start" }}>
        <Box>
          <Heading>Money</Heading>
          <Facts
            min={140}
            items={[
              { label: "Agreed price", value: money(b.agreedPriceCents) },
              { label: "Employer fee", value: money(b.employerFeeCents) },
              { label: "Commission", value: money(b.commissionCents) },
              b.preAuthCents !== null && { label: "Pre-authorized", value: money(b.preAuthCents) },
              b.finalTotalCents !== null && { label: "Final total", value: money(b.finalTotalCents) },
              b.payment && { label: "Payment", value: <StatusChip status={humanize(b.payment.status)} /> },
              b.payment && { label: "Captured", value: money(b.payment.capturedCents) },
              b.payment?.refundedCents > 0 && { label: "Refunded", value: money(b.payment.refundedCents) },
              b.payment?.payoutAt && { label: "Paid out", value: formatLocalDateTime(b.payment.payoutAt) },
            ]}
          />

          <Heading sx={{ mt: 2.5 }}>Schedule</Heading>
          <Facts
            min={140}
            items={[
              { label: "Scheduled start", value: formatLocalDateTime(b.scheduledStartAt) },
              { label: "Booked time", value: `${Math.round((b.authorizedMinutes / 60) * 10) / 10} h` },
              b.checkInAt && { label: "Checked in", value: formatLocalDateTime(b.checkInAt) },
              b.checkOutAt && { label: "Checked out", value: formatLocalDateTime(b.checkOutAt) },
              b.approvedAt && { label: "Approved", value: formatLocalDateTime(b.approvedAt) },
              b.autoReleaseAt && { label: "Auto release", value: formatLocalDateTime(b.autoReleaseAt) },
              b.cancelledAt && { label: "Cancelled", value: `${formatLocalDateTime(b.cancelledAt)} by ${personName(b.cancelledBy)}` },
              { label: "Site", value: b.siteAddress || "—", wide: true },
              b.cancellationReason && { label: "Reason", value: b.cancellationReason, wide: true },
            ]}
          />
        </Box>

        <Box sx={{ p: 2, borderRadius: "14px", bgcolor: "action.hover" }}>
          <Heading>Timeline</Heading>
          <BookingTimeline events={b.timeline} />
        </Box>
      </Box>

      {b.dispute && (
        <>
          <Divider sx={{ my: 2 }} />
          <Heading>Dispute</Heading>
          <Facts
            items={[
              { label: "Status", value: <StatusChip status={humanize(b.dispute.status)} /> },
              { label: "Opened by", value: `${personName(b.dispute.openedBy)} · ${formatLocalDateTime(b.dispute.createdAt)}` },
              b.dispute.resolutionAmountCents !== null && { label: "Resolved amount", value: money(b.dispute.resolutionAmountCents) },
              { label: "Claim", value: b.dispute.claim, wide: true },
              b.dispute.resolution && { label: "Resolution", value: b.dispute.resolution, wide: true },
            ]}
          />
        </>
      )}

      {b.overtimeRequests.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Heading>Overtime requests</Heading>
          <Box sx={{ display: "grid", gap: 0.75 }}>
            {b.overtimeRequests.map((o) => (
              <Box key={o.id} sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", fontSize: 13.5 }}>
                <StatusChip status={humanize(o.status)} />
                <span className="num">{o.requestedMinutes} min · +{formatMoney(o.priceDeltaCents, b.currency)}</span>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{formatLocalDateTime(o.createdAt)}</Typography>
              </Box>
            ))}
          </Box>
        </>
      )}

      {b.reviews.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Heading>Reviews</Heading>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.25 }}>
            {b.reviews.map((r) => (
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
    </Card>
  );
}
