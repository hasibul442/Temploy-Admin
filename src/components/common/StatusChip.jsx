import { Chip } from "@mui/material";

const TONES = {
  Completed: "success",
  Active: "success",
  Delivered: "info",
  "In progress": "primary",
  Pending: "warning",
  Disputed: "error",
  Suspended: "error",
  Cancelled: "default",
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
