import { Chip } from "@mui/material";

/** Maps every status label used across the admin to a palette tone. */
const TONES = {
  // positive / finished
  Completed: "success",
  Active: "success",
  Approved: "success",
  Paid: "success",
  Resolved: "success",
  Open: "info",
  Published: "success",
  // in flight
  Delivered: "info",
  "In progress": "primary",
  "Under review": "info",
  Processing: "info",
  Hiring: "info",
  // proposals and bookings (API enums through humanize())
  Accepted: "success",
  "Funds released": "success",
  Viewed: "info",
  Shortlisted: "info",
  Interviewing: "info",
  Confirmed: "info",
  "Paid escrow": "info",
  // Payment statuses (order details)
  "Requires auth": "warning",
  "Pre authorized": "info",
  Captured: "success",
  "Partially captured": "info",
  Released: "success",
  "Partially refunded": "warning",
  Scheduled: "info",
  "Checked in": "primary",
  "Overtime pending": "warning",
  "Provider completed": "warning",
  "Auto closed": "warning",
  Withdrawn: "default",
  // needs attention
  Pending: "warning",
  "Pending approval": "warning",
  "Pending review": "warning",
  Paused: "warning",
  Escalated: "warning",
  High: "error",
  Medium: "warning",
  Low: "default",
  // negative
  Disputed: "error",
  Suspended: "error",
  Rejected: "error",
  Failed: "error",
  Refunded: "error",
  // neutral
  Cancelled: "default",
  Closed: "default",
  Dismissed: "default",
  Inactive: "default",
  Draft: "default",
  Expired: "default",
};

/** Status is always shown as a text label + tone, never color alone. */
export default function StatusChip({ status }) {
  const tone = TONES[status] || "default";
  return (
    <Chip
      size="small"
      label={status}
      sx={(theme) =>
        tone === "default"
          ? { bgcolor: theme.vars.palette.action.selected, color: theme.vars.palette.text.secondary }
          : {
              bgcolor: theme.vars.palette[tone].light,
              color: tone === "primary" ? theme.vars.palette.primary.main : theme.vars.palette[tone].main,
              "&::before": {
                content: '""',
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: "currentColor",
                ml: 1,
              },
            }
      }
    />
  );
}
