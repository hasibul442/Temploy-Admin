"use client";
import { useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from "@mui/material";
import { toast } from "react-toastify";
import { RAW_INPUT_SX } from "@/components/common/ResourcePage";
import { getErrorMessage } from "@/utils/services/api/apiError";
import { updateJob } from "@/utils/services/api/JobService";

// API status/urgency (UPPER_CASE) ↔ request value (lower_case)
export const JOB_STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "closed", label: "Closed" },
  { value: "expired", label: "Expired" },
];
const URGENCY_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "urgent", label: "Urgent" },
];

// <input type="datetime-local"> works in the viewer's zone: ISO UTC → local "YYYY-MM-DDTHH:mm", and back.
const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const fromLocalInput = (value) => (value ? new Date(value).toISOString() : undefined);

/**
 * Edit a job's moderation fields (PUT admin/jobs/:id). `job` is a job from the API (list row or details).
 * Sends only the fields that changed; `onSaved(updatedJob)` gets the API's job.
 */
export default function EditJobDialog({ job, onClose, onSaved }) {
  const initial = {
    title: job.title ?? "",
    description: job.description ?? "",
    status: String(job.status ?? "OPEN").toLowerCase(),
    urgency: String(job.urgency ?? "NORMAL").toLowerCase(),
    expires_at: toLocalInput(job.expiresAt),
  };
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }));
  // List rows don't carry the description; only send it when the dialog had it to begin with.
  const hasDescription = job.description !== undefined;

  const save = async () => {
    const body = {};
    for (const key of ["title", "status", "urgency"]) if (values[key] !== initial[key]) body[key] = values[key];
    if (hasDescription && values.description !== initial.description) body.description = values.description;
    if (values.expires_at !== initial.expires_at) body.expires_at = fromLocalInput(values.expires_at);
    if (Object.keys(body).length === 0) return onClose();

    setSaving(true);
    const res = await updateJob(job.id, body);
    setSaving(false);
    if (!res?.data) return toast.error(getErrorMessage(res));
    toast.success("Job updated");
    onSaved(res.data.data);
  };

  return (
    <Dialog open onClose={() => !saving && onClose()} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Edit job</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, pt: 1 }}>
          <TextField label="Title" value={values.title} onChange={set("title")} size="small" fullWidth required sx={{ ...RAW_INPUT_SX, gridColumn: "1 / -1" }} helperText="8–120 characters" />
          {hasDescription && (
            <TextField label="Description" value={values.description} onChange={set("description")} size="small" fullWidth required multiline minRows={4} sx={{ ...RAW_INPUT_SX, gridColumn: "1 / -1" }} helperText="At least 40 characters" />
          )}
          <TextField select label="Status" value={values.status} onChange={set("status")} size="small" fullWidth sx={RAW_INPUT_SX}>
            {JOB_STATUS_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
          <TextField select label="Urgency" value={values.urgency} onChange={set("urgency")} size="small" fullWidth sx={RAW_INPUT_SX}>
            {URGENCY_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
          <TextField
            label="Expires"
            type="datetime-local"
            value={values.expires_at}
            onChange={set("expires_at")}
            size="small"
            fullWidth
            sx={{ ...RAW_INPUT_SX, gridColumn: "1 / -1" }}
            helperText="Your local time"
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button color="inherit" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
      </DialogActions>
    </Dialog>
  );
}
