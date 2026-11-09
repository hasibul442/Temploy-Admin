"use client";
import { useState } from "react";
import Link from "next/link";
import { Box, Button, Checkbox, FormControlLabel, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { LuIdCard, LuClock, LuFileCheck, LuFileX, LuCheck, LuX, LuExternalLink, LuFileText, LuImage, LuEye, LuTriangleAlert } from "react-icons/lu";
import ResourcePage, { DetailList } from "@/components/common/ResourcePage";
import FormDialog from "@/components/common/FormDialog";
import StatusChip from "@/components/common/StatusChip";
import { PersonCell, Tag } from "@/components/common/cells";
import { useApiList, ApiListFallback } from "@/components/common/ApiList";
import { formatLocalDate, formatLocalDateTime, humanize } from "@/helper/format";
import { getErrorMessage } from "@/utils/services/api/apiError";
import { getKycDocuments, getKycDocument, approveKyc, rejectKyc } from "@/utils/services/api/KycService";

/*
 * KYC verification queue (GET admin/kyc). Staff open a document, check it against the account and approve it
 * (the user becomes KYC verified) or reject it with a reason. The reason is saved as `reject_note`, and the user
 * sees it on their profile before uploading again. Only pending documents can be reviewed.
 */

const TITLE = "KYC verification";
const SUBTITLE = "Identity documents uploaded by users. Check each one against the account, then approve or reject it.";

const CHECKLIST = [
  "The whole document is visible and readable",
  "The name matches the account name",
  "The document hasn't expired",
  "The photo and details don't look edited",
];
const REJECT_REASONS = [
  "Image is blurry or unreadable",
  "Document is expired",
  "Name doesn't match the account",
  "Document is cropped or incomplete",
  "Document type isn't accepted",
  "Other",
];
const NOTE_MAX = 500; // API limit for the whole note
// document_type values sent by the web app's upload form (Frontend UploadKyc.jsx)
const DOC_TYPES = { passport: "Passport", national_id: "National ID", residence_permit: "Residence permit", driving_license: "Driving licence", other: "Other" };
const ROLE_LABEL = { freelancer: "Freelancer", employer: "Client" };
const STALE_MS = 2 * 86400000; // pending longer than 2 days

/** API document → row. `submitted` is `updatedAt`: a re-upload overwrites the row and restarts the wait. */
function toRow(d) {
  const u = d.user ?? {};
  const name = `${u.fName ?? ""} ${u.lName ?? ""}`.trim() || u.email || `User #${d.userId}`;
  const status = humanize(d.status);
  return {
    id: d.id,
    ref: `KYC-${d.id}`,
    userId: u.id,
    name,
    email: u.email ?? "",
    phone: u.phone,
    role: ROLE_LABEL[u.userRole] ?? "No role",
    country: u.country || "—",
    userActive: u.isActive !== false,
    documentType: DOC_TYPES[d.documentType] ?? humanize(d.documentType),
    documentName: d.documentName,
    documentUrl: d.documentUrl,
    fileKind: /\.pdf(\?|$)/i.test(d.documentUrl ?? "") ? "PDF" : "Image",
    submitted: d.updatedAt,
    // Computed once at load (not during render) so rendering stays pure
    stale: d.status === "PENDING" && Date.now() - new Date(d.updatedAt).getTime() > STALE_MS,
    status,
    rejectNote: d.rejectNote,
    reviewedBy: d.review?.by ? `${d.review.by.fName} ${d.review.by.lName}`.trim() || d.review.by.email : null,
    reviewedAt: d.review?.at ?? null,
  };
}

/** Every document, 100 per request: ResourcePage filters and pages on the client. */
async function fetchAllKyc() {
  const all = [];
  for (let page = 1, pages = 1; page <= pages && page <= 20; page += 1) {
    const res = await getKycDocuments({ page, limit: 100 });
    if (!res?.data) return res;
    all.push(...(res.data.data ?? []));
    pages = res.data.pagination?.total_pages ?? 1;
  }
  return { data: { data: all } };
}

const docLabel = (r) => (r.documentType === "Other" && r.documentName ? `Other · ${r.documentName}` : r.documentType);
const uniqueSorted = (values) => [...new Set(values.filter((v) => v && v !== "—"))].sort((a, b) => a.localeCompare(b));

/** After a 409 (someone else reviewed it first), pull the document's current state into the row. */
async function refreshRow(row, api) {
  const res = await getKycDocument(row.id);
  if (res?.data) api.update(row.id, toRow(res.data.data));
}

export default function KycPage() {
  const { rows, error, reload } = useApiList(fetchAllKyc, toRow);
  const [rejecting, setRejecting] = useState(null); // { row, api }

  if (!rows) return <ApiListFallback title={TITLE} subtitle={SUBTITLE} error={error} onRetry={reload} />;

  const approve = (r, api) =>
    api.confirm({
      title: "Approve this KYC document?",
      body: `${r.name}'s account will be marked as KYC verified and they'll get the verified badge.`,
      confirmLabel: "Approve",
      onConfirm: async () => {
        const res = await approveKyc(r.id);
        if (!res?.data) {
          toast.error(getErrorMessage(res));
          if (res?.response?.status === 409) refreshRow(r, api);
          return;
        }
        api.update(r.id, toRow(res.data.data), `${r.name} is now KYC verified`);
      },
    });

  const reject = async ({ reason, note }) => {
    const extra = note.trim();
    if (reason === "Other" && !extra) {
      toast.error("Write a message to the user when the reason is \"Other\"");
      return false; // keeps the dialog open
    }
    const message = reason === "Other" ? extra : extra ? `${reason}. ${extra}` : reason;
    if (message.length > NOTE_MAX) {
      toast.error(`The message is too long (${message.length}/${NOTE_MAX} characters with the reason)`);
      return false;
    }
    const { row, api } = rejecting;
    const res = await rejectKyc(row.id, message);
    if (!res?.data) {
      toast.error(getErrorMessage(res));
      if (res?.response?.status === 409) {
        refreshRow(row, api);
        return true; // already reviewed: nothing left to do in this dialog
      }
      return false;
    }
    api.update(row.id, toRow(res.data.data), `${row.name}'s document rejected`);
    return true;
  };

  return (
    <>
      <ResourcePage
        title={TITLE}
        subtitle={SUBTITLE}
        noun="documents"
        rows={rows}
        minWidth={920}
        stats={[
          { label: "Waiting for review", value: (rs) => rs.filter((r) => r.status === "Pending").length, icon: <LuIdCard size={20} />, tone: "primary" },
          { label: "Waiting over 2 days", value: (rs) => rs.filter((r) => r.status === "Pending" && r.stale).length, icon: <LuClock size={20} />, tone: "warning" },
          { label: "Approved", value: (rs) => rs.filter((r) => r.status === "Approved").length, icon: <LuFileCheck size={20} />, tone: "success" },
          { label: "Rejected", value: (rs) => rs.filter((r) => r.status === "Rejected").length, icon: <LuFileX size={20} />, tone: "error" },
        ]}
        tabs={{ field: "status", options: ["All", "Pending", "Approved", "Rejected"] }}
        search={{ keys: ["ref", "name", "email"], placeholder: "Search by ID, name or email" }}
        filters={[
          { field: "documentType", label: "Document", options: uniqueSorted(rows.map((r) => r.documentType)) },
          { field: "role", label: "Role", options: ["Freelancer", "Client"] },
          { field: "country", label: "Country", options: uniqueSorted(rows.map((r) => r.country)) },
        ]}
        columns={[
          { key: "name", label: "User", render: (r) => <PersonCell name={r.name} sub={r.email} /> },
          { key: "role", label: "Role", render: (r) => <Tag>{r.role}</Tag> },
          { key: "documentType", label: "Document", render: (r) => <DocCell r={r} /> },
          { key: "country", label: "Country" },
          {
            key: "submitted",
            label: "Submitted",
            render: (r) => (
              <Box component="span" sx={{ whiteSpace: "nowrap", color: r.stale ? "warning.main" : undefined, fontWeight: r.stale ? 600 : undefined }}>
                {formatLocalDate(r.submitted)}
              </Box>
            ),
          },
          { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
        ]}
        rowActions={(r, api) => [
          { label: r.status === "Pending" ? "Review document" : "View details", icon: <LuEye size={15} />, onClick: () => api.openDetail(r) },
          r.status === "Pending" && { label: "Reject", icon: <LuX size={15} />, tone: "error", onClick: () => setRejecting({ row: r, api }) },
        ]}
        detail={{
          title: (r) => r.ref,
          render: (r, api) => <ReviewPanel key={r.id} r={r} onApprove={() => approve(r, api)} onReject={() => setRejecting({ row: r, api })} />,
        }}
      />

      {rejecting && (
        <FormDialog
          title={`Reject ${rejecting.row.name}'s document`}
          submitLabel="Reject document"
          initial={{ reason: REJECT_REASONS[0], note: "" }}
          fields={[
            { name: "reason", label: "Reason", type: "select", options: REJECT_REASONS, required: true },
            {
              name: "note",
              label: "Message to the user",
              type: "textarea",
              helperText: "Shown to the user with the reason, so they know what to upload next. Required for \"Other\".",
            },
          ]}
          onSubmit={reject}
          onClose={() => setRejecting(null)}
        />
      )}
    </>
  );
}

function DocCell({ r }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box component="span" sx={{ display: "inline-flex", color: "text.secondary" }} aria-hidden="true">
        {r.fileKind === "PDF" ? <LuFileText size={16} /> : <LuImage size={16} />}
      </Box>
      <Typography noWrap sx={{ fontSize: 13.5, maxWidth: 200 }}>{docLabel(r)}</Typography>
    </Box>
  );
}

/** Drawer body: document preview, user details, reviewer checklist and the decision buttons. */
function ReviewPanel({ r, onApprove, onReject }) {
  const [checked, setChecked] = useState(() => CHECKLIST.map(() => false));
  const pending = r.status === "Pending";
  const allChecked = checked.every(Boolean);

  return (
    <>
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <StatusChip status={r.status} />
        <Tag>{r.role}</Tag>
        <Tag>{r.fileKind}</Tag>
        {!r.userActive && <Tag tone="error">Account inactive</Tag>}
      </Box>

      <DocumentPreview r={r} />

      <DetailList
        items={[
          { label: "User", value: r.userId ? <Link href={`/users/${r.userId}`}>{r.name}</Link> : r.name },
          { label: "Email", value: r.email || "—" },
          { label: "Phone", value: r.phone || "—" },
          { label: "Country", value: r.country },
          { label: "Document", value: docLabel(r) },
          { label: "Submitted", value: formatLocalDateTime(r.submitted) },
          r.reviewedAt && { label: "Reviewed", value: `${formatLocalDateTime(r.reviewedAt)}${r.reviewedBy ? ` · ${r.reviewedBy}` : ""}` },
        ]}
      />

      {r.status === "Rejected" && r.rejectNote && (
        <Box sx={{ mt: 2, p: 1.75, borderRadius: "12px", bgcolor: "error.light" }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "error.main", mb: 0.25 }}>Reason sent to the user</Typography>
          <Typography sx={{ fontSize: 13.5 }}>{r.rejectNote}</Typography>
        </Box>
      )}

      {pending && (
        <>
          {r.stale && (
            <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1, color: "warning.main", fontSize: 13 }}>
              <LuTriangleAlert size={15} aria-hidden="true" /> Waiting for more than 2 days
            </Box>
          )}
          <Typography sx={{ fontWeight: 600, fontSize: 14, mt: 3, mb: 0.5 }}>Before you approve</Typography>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {CHECKLIST.map((item, i) => (
              <FormControlLabel
                key={item}
                control={
                  <Checkbox
                    size="small"
                    checked={checked[i]}
                    onChange={(e) => setChecked((c) => c.map((v, j) => (j === i ? e.target.checked : v)))}
                  />
                }
                label={<Typography sx={{ fontSize: 13.5 }}>{item}</Typography>}
              />
            ))}
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
            <Button variant="outlined" color="error" fullWidth startIcon={<LuX size={16} />} onClick={onReject}>Reject</Button>
            <Button variant="contained" fullWidth startIcon={<LuCheck size={16} />} disabled={!allChecked} onClick={onApprove}>Approve</Button>
          </Box>
          {!allChecked && (
            <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 1, textAlign: "center" }}>Tick every check to approve.</Typography>
          )}
        </>
      )}
    </>
  );
}

/** Image documents render inline (click for full size); PDFs open in a new tab. */
function DocumentPreview({ r }) {
  const frame = { mb: 2.5, borderRadius: "14px", border: 1, borderColor: "divider", overflow: "hidden", bgcolor: "action.hover" };

  if (!r.documentUrl) {
    return (
      <Box sx={{ ...frame, height: 160, display: "grid", placeItems: "center", textAlign: "center", px: 3, color: "text.secondary" }}>
        <Box>
          <LuIdCard size={34} />
          <Typography sx={{ fontSize: 13, mt: 1 }}>No file was saved with this submission.</Typography>
        </Box>
      </Box>
    );
  }

  if (r.fileKind === "PDF") {
    return (
      <Box sx={{ ...frame, p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
          <LuFileText size={20} />
          <Typography noWrap sx={{ fontSize: 13.5 }}>{docLabel(r)} (PDF)</Typography>
        </Box>
        <Button size="small" href={r.documentUrl} target="_blank" rel="noopener noreferrer" endIcon={<LuExternalLink size={14} />}>Open</Button>
      </Box>
    );
  }

  return (
    <Box sx={frame}>
      <Box component="a" href={r.documentUrl} target="_blank" rel="noopener noreferrer" sx={{ display: "block" }} title="Open full size">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary file, no next/image domain configured */}
        <img src={r.documentUrl} alt={`${docLabel(r)} uploaded by ${r.name}`} style={{ display: "block", width: "100%", maxHeight: 320, objectFit: "contain" }} />
      </Box>
    </Box>
  );
}
