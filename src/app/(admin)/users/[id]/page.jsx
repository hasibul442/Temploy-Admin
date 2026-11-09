"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  LuArrowLeft,
  LuPencil,
  LuUserX,
  LuUserCheck,
  LuRefreshCw,
  LuBadgeCheck,
  LuBriefcase,
  LuSend,
  LuCalendarCheck,
  LuStar,
  LuWallet,
  LuExternalLink,
} from "react-icons/lu";
import { toast } from "react-toastify";
import PageHeader from "@/components/common/PageHeader";
import SectionCard from "@/components/common/SectionCard";
import StatusChip from "@/components/common/StatusChip";
import Facts from "@/components/common/Facts";
import { StatTiles } from "@/components/common/ResourcePage";
import { Tag } from "@/components/common/cells";
import EditUserDialog from "@/components/users/EditUserDialog";
import { formatLocalDate, formatLocalDateTime, formatMoney, humanize, initials } from "@/helper/format";
import { getErrorMessage } from "@/utils/services/api/apiError";
import { getUser, setUserStatus } from "@/utils/services/api/UserService";

/*
 * User details from GET /admin/users/:id: account, profile, skills and services, wallet, payout methods (masked),
 * KYC documents and recent jobs, proposals and bookings. Staff can edit the account and activate/deactivate it.
 */

const ROLE_LABEL = { freelancer: "Freelancer", employer: "Client" };
const fullName = (u) => (u ? `${u.fName ?? ""} ${u.lName ?? ""}`.trim() || u.email : "—");
const address = (...parts) => parts.filter(Boolean).join(", ") || "—";

/** "Yes · Nov 5, 2026" / "No" */
const verified = (flag, at) => (flag ? `Yes${at ? ` · ${formatLocalDate(at)}` : ""}` : "No");

const Heading = ({ children, sx }) => <Typography sx={{ fontWeight: 600, fontSize: 13.5, mb: 1, ...sx }}>{children}</Typography>;
const Muted = ({ children }) => <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{children}</Typography>;

export default function UserDetailsPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const res = await getUser(id);
    if (res?.data) setUser(res.data.data);
    else setError(getErrorMessage(res));
  }, [id]);

  useEffect(() => {
    // Fetch on mount; state is set after the await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const back = <Button href="/users" color="inherit" startIcon={<LuArrowLeft size={16} />}>All users</Button>;

  if (!user) {
    return (
      <>
        <PageHeader title={`User #${id}`} actions={back} />
        <Card sx={{ py: 6, textAlign: "center" }}>
          {error ? (
            <>
              <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
              <Button variant="outlined" startIcon={<LuRefreshCw size={15} />} onClick={load}>Try again</Button>
            </>
          ) : (
            <CircularProgress size={28} aria-label="Loading user" />
          )}
        </Card>
      </>
    );
  }

  const toggleActive = async () => {
    const next = !user.isActive;
    const res = await setUserStatus(user.id, next);
    if (!res?.data) return toast.error(getErrorMessage(res));
    toast.success(`${fullName(user)} ${next ? "activated" : "deactivated"}`);
    setUser((u) => ({ ...u, isActive: next }));
  };

  const { profile, wallet, rating, _count: counts } = user;
  const isFreelancer = user.userRole === "freelancer";
  const money = (cents) => <span className="num">{formatMoney(cents, wallet.currency)}</span>;
  const bookingsTotal = counts.employerBookings + counts.freelancerBookings;

  return (
    <>
      <PageHeader
        title={fullName(user)}
        subtitle={`#${user.id} · ${user.email} · joined ${formatLocalDate(user.createdAt)}`}
        actions={
          <>
            {back}
            <Button
              variant="outlined"
              color={user.isActive ? "error" : "primary"}
              startIcon={user.isActive ? <LuUserX size={16} /> : <LuUserCheck size={16} />}
              onClick={() => setConfirming(true)}
            >
              {user.isActive ? "Deactivate" : "Activate"}
            </Button>
            <Button variant="contained" startIcon={<LuPencil size={16} />} onClick={() => setEditing(true)}>Edit user</Button>
          </>
        }
      />

      <StatTiles
        rows={[]}
        stats={
          isFreelancer
            ? [
                { label: "Available balance", value: formatMoney(wallet.availableCents, wallet.currency), icon: <LuWallet size={20} />, tone: "success" },
                { label: "Proposals sent", value: counts.proposals, icon: <LuSend size={20} /> },
                { label: "Bookings", value: bookingsTotal, icon: <LuCalendarCheck size={20} />, tone: "info" },
                { label: "Rating", value: rating.average === null ? "—" : `${rating.average} (${rating.count})`, icon: <LuStar size={20} />, tone: "warning" },
              ]
            : [
                { label: "Jobs posted", value: counts.jobsPosted, icon: <LuBriefcase size={20} /> },
                { label: "Bookings", value: bookingsTotal, icon: <LuCalendarCheck size={20} />, tone: "info" },
                { label: "Reviews received", value: counts.reviewsReceived, icon: <LuStar size={20} />, tone: "warning" },
                { label: "Rating", value: rating.average === null ? "—" : rating.average, icon: <LuStar size={20} />, tone: "success" },
              ]
        }
      />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 3fr) minmax(0, 2fr)" }, gap: 2.5, mb: 2.5, alignItems: "start" }}>
        {/* Account */}
        <SectionCard
          title="Account"
          action={
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <StatusChip status={user.isActive ? "Active" : "Inactive"} />
              {user.isKycVerified && <Tag tone="info">KYC verified</Tag>}
              {user.userType === "PRO" && <Tag tone="success">Pro</Tag>}
            </Box>
          }
          sx={{ height: "auto" }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Avatar src={user.profileImage || undefined} sx={{ width: 52, height: 52, fontSize: 17, bgcolor: "primary.light", color: "primary.main", fontWeight: 600 }}>
              {initials(fullName(user))}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 0.5 }}>
                {fullName(user)}
                {user.isKycVerified && <Box component="span" sx={{ display: "inline-flex", color: "info.main" }}><LuBadgeCheck size={15} aria-label="Verified" /></Box>}
              </Typography>
              <Muted>{ROLE_LABEL[user.userRole] ?? "No role yet"} · {user.userType === "PRO" ? "Pro" : "Regular"} plan</Muted>
            </Box>
          </Box>
          <Facts
            items={[
              { label: "Email", value: user.email },
              { label: "Phone", value: user.phone || "—" },
              { label: "Country", value: user.country || "—" },
              { label: "Availability", value: humanize(user.availability) },
              { label: "Email verified", value: verified(user.isEmailVerified, user.emailVerifiedAt) },
              { label: "Phone verified", value: verified(user.isPhoneVerified, user.phoneVerifiedAt) },
              { label: "KYC verified", value: verified(user.isKycVerified, user.kycVerifiedAt) },
              { label: "Joined", value: formatLocalDateTime(user.createdAt) },
              { label: "Last updated", value: formatLocalDateTime(user.updatedAt) },
            ]}
          />
        </SectionCard>

        {/* Wallet */}
        <SectionCard title="Wallet" subtitle={`Amounts in ${wallet.currency}`} sx={{ height: "auto" }}>
          <Facts
            min={140}
            items={[
              { label: "Available", value: money(wallet.availableCents) },
              { label: "Withdrawing", value: money(wallet.withdrawingCents) },
              { label: "Paid out", value: money(wallet.paidOutCents) },
              { label: "Earned (lifetime)", value: money(wallet.earnedCents) },
              { label: "Completed jobs", value: wallet.completedJobs },
              { label: "This month", value: money(wallet.thisMonthCents) },
              { label: "Awaiting approval", value: <>{money(wallet.awaitingApproval.cents)} · {wallet.awaitingApproval.jobs} jobs</> },
              { label: "Upcoming", value: <>{money(wallet.upcoming.cents)} · {wallet.upcoming.jobs} jobs</> },
            ]}
          />
          <Divider sx={{ my: 2 }} />
          <Heading>Payout methods</Heading>
          {user.payoutMethods.length === 0 ? (
            <Muted>None added.</Muted>
          ) : (
            <Box sx={{ display: "grid", gap: 1 }}>
              {user.payoutMethods.map((m) => (
                <Box key={m.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, p: 1.25, borderRadius: "12px", bgcolor: "action.hover" }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 600 }}>
                      {m.type === "bank"
                        ? `${m.bankName || "Bank account"} ${m.accountNumber ?? ""}`
                        : `${m.providerName || m.provider || "Wallet"} · ${m.identifierType === "email" ? m.email : m.phone}`}
                    </Typography>
                    <Typography noWrap sx={{ fontSize: 12, color: "text.secondary" }}>
                      {m.accountName} · {[m.country, m.currency].filter(Boolean).join(" · ") || humanize(m.type)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 0.75, flexShrink: 0 }}>
                    {m.isPrimary && <Tag tone="success">Primary</Tag>}
                    <StatusChip status={humanize(m.status)} />
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </SectionCard>
      </Box>

      {/* Profile */}
      <SectionCard title="Profile" sx={{ height: "auto", mb: 2.5 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 3fr) minmax(0, 2fr)" }, gap: 2.5 }}>
          <Box>
            <Heading>About</Heading>
            <Typography sx={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-line", mb: 2 }}>{profile?.about || "—"}</Typography>
            <Facts
              items={[
                isFreelancer && { label: "Hourly rate", value: profile?.hourlyRateCents ? <span className="num">{(profile.hourlyRateCents / 100).toFixed(2)} / hr</span> : "—" },
                { label: "Languages", value: profile?.languages || "—" },
                { label: "Present address", value: address(profile?.addressLine1, profile?.addressLine2, profile?.city, profile?.state, profile?.postalCode, profile?.country), wide: true },
                { label: "Permanent address", value: address(profile?.permanentAddressLine1, profile?.permanentAddressLine2, profile?.permanentCity, profile?.permanentState, profile?.permanentPostalCode, profile?.permanentCountry), wide: true },
              ]}
            />
          </Box>
          <Box>
            <Heading>Skills</Heading>
            <TagList items={user.skills.map((s) => ({ key: s.id, label: s.skillName }))} empty="No skills" />
            <Heading sx={{ mt: 2 }}>Services</Heading>
            <TagList items={user.services.map((s) => ({ key: s.id, label: `${s.category?.catName ?? "—"} / ${s.subCatName}` }))} empty="No services" />
            {user.socialLinks.length > 0 && (
              <>
                <Heading sx={{ mt: 2 }}>Social links</Heading>
                <Box sx={{ display: "grid", gap: 0.5 }}>
                  {user.socialLinks.map((l) => (
                    <ExternalLink key={l.id} href={l.url}>{humanize(l.platform)}</ExternalLink>
                  ))}
                </Box>
              </>
            )}
            {user.certifications.length > 0 && (
              <>
                <Heading sx={{ mt: 2 }}>Certifications</Heading>
                <Box sx={{ display: "grid", gap: 1 }}>
                  {user.certifications.map((c) => (
                    <Box key={c.id}>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
                        {c.credentialUrl ? <ExternalLink href={c.credentialUrl}>{c.certificationName || "Certification"}</ExternalLink> : c.certificationName || "Certification"}
                      </Typography>
                      <Muted>
                        {[c.issuingOrganization, c.issueDate && `issued ${formatLocalDate(c.issueDate)}`, c.expirationDate && `expires ${formatLocalDate(c.expirationDate)}`].filter(Boolean).join(" · ") || "—"}
                      </Muted>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </Box>
        </Box>
      </SectionCard>

      {/* KYC */}
      <SectionCard title="KYC documents" subtitle={user.kycDocuments.length ? undefined : "None uploaded"} noPadding={!user.kycDocuments.length} sx={{ height: "auto", mb: 2.5 }}>
        {user.kycDocuments.length > 0 && (
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 1.5 }}>
            {user.kycDocuments.map((d) => (
              <Box key={d.id} sx={{ p: 1.75, borderRadius: "14px", border: 1, borderColor: "divider" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 600 }}>{humanize(d.documentType)}</Typography>
                  <StatusChip status={humanize(d.status)} />
                </Box>
                <Muted>{d.documentName || "—"} · uploaded {formatLocalDate(d.createdAt)}</Muted>
                {d.rejectNote && <Typography sx={{ fontSize: 12.5, color: "error.main", mt: 0.5 }}>{d.rejectNote}</Typography>}
                <Box sx={{ mt: 1 }}><ExternalLink href={d.documentUrl}>Open document</ExternalLink></Box>
              </Box>
            ))}
          </Box>
        )}
      </SectionCard>

      {/* Activity */}
      <ActivityTable
        title="Recent bookings"
        total={bookingsTotal}
        empty="No bookings yet"
        head={["Booking", "Job", "As", "Other party", "Price", "Scheduled", "Status"]}
        rows={user.recentBookings.map((b) => {
          const other = b.role === "employer" ? b.freelancer : b.employer;
          return {
            key: b.id,
            cells: [
              <span key="id" className="num">#{b.id}</span>,
              b.job ? <Link key="job" href={`/jobs/${b.job.id}`}>{b.job.title}</Link> : "—",
              b.role === "employer" ? "Client" : "Freelancer",
              other ? <Link key="other" href={`/users/${other.id}`}>{fullName(other)}</Link> : "—",
              <span key="price" className="num">{formatMoney(b.agreedPriceCents, b.currency)}</span>,
              formatLocalDateTime(b.scheduledStartAt),
              <StatusChip key="status" status={humanize(b.status)} />,
            ],
          };
        })}
      />
      {(counts.jobsPosted > 0 || !isFreelancer) && (
        <ActivityTable
          title="Recent jobs posted"
          total={counts.jobsPosted}
          empty="No jobs posted"
          head={["Job", "Budget", "Proposals", "Posted", "Status"]}
          rows={user.jobsPosted.map((j) => ({
            key: j.id,
            cells: [
              <Link key="job" href={`/jobs/${j.id}`}>{j.title}</Link>,
              <span key="budget" className="num">
                {formatMoney(j.budgetCents, j.currency)}{j.budgetMaxCents ? ` – ${formatMoney(j.budgetMaxCents, j.currency)}` : ""}
              </span>,
              <span key="p" className="num">{j._count.proposals}</span>,
              formatLocalDate(j.createdAt),
              <StatusChip key="status" status={humanize(j.status)} />,
            ],
          }))}
        />
      )}
      {(counts.proposals > 0 || isFreelancer) && (
        <ActivityTable
          title="Recent proposals"
          total={counts.proposals}
          empty="No proposals sent"
          head={["Job", "Amount", "Sent", "Status"]}
          rows={user.proposals.map((p) => ({
            key: p.id,
            cells: [
              p.job ? <Link key="job" href={`/jobs/${p.job.id}`}>{p.job.title}</Link> : "—",
              <span key="amount" className="num">{formatMoney(p.proposedAmountCents, p.job?.currency)}</span>,
              formatLocalDate(p.createdAt),
              <StatusChip key="status" status={humanize(p.status)} />,
            ],
          }))}
        />
      )}

      {editing && (
        <EditUserDialog
          user={user}
          onClose={() => setEditing(false)}
          // The update returns list fields only; keep the details already loaded.
          onSaved={(u) => { setUser((cur) => ({ ...cur, ...u })); setEditing(false); }}
        />
      )}

      <Dialog open={confirming} onClose={() => setConfirming(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{user.isActive ? "Deactivate user?" : "Activate user?"}</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ fontSize: 14 }}>
            {user.isActive
              ? `${fullName(user)} will be signed out and every request they make will be refused until you activate them again.`
              : `${fullName(user)} will be able to sign in and use the marketplace again.`}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={() => setConfirming(false)}>Cancel</Button>
          <Button variant="contained" color={user.isActive ? "error" : "primary"} onClick={() => { setConfirming(false); toggleActive(); }}>
            {user.isActive ? "Deactivate" : "Activate"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function TagList({ items, empty }) {
  if (!items.length) return <Muted>{empty}</Muted>;
  return (
    <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
      {items.map((i) => <Tag key={i.key}>{i.label}</Tag>)}
    </Box>
  );
}

function ExternalLink({ href, children }) {
  return (
    <Box component="a" href={href} target="_blank" rel="noopener noreferrer" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: 13.5, color: "primary.main", fontWeight: 500 }}>
      {children} <LuExternalLink size={13} aria-hidden="true" />
    </Box>
  );
}

/** A section with a small table of the latest items. `total` is the user's full count (the API sends the latest few). */
function ActivityTable({ title, total, empty, head, rows }) {
  return (
    <SectionCard
      title={title}
      subtitle={rows.length ? (total > rows.length ? `Latest ${rows.length} of ${total}` : `${total} in total`) : empty}
      noPadding
      sx={{ height: "auto", mb: 2.5 }}
    >
      {rows.length > 0 && (
        <TableContainer>
          <Table sx={{ minWidth: 640 }}>
            <TableHead>
              <TableRow>{head.map((h) => <TableCell key={h}>{h}</TableCell>)}</TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.key} hover>
                  {r.cells.map((c, i) => <TableCell key={head[i]} sx={{ fontSize: 13.5 }}>{c}</TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </SectionCard>
  );
}
