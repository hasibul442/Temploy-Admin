"use client";
import { useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { toast } from "react-toastify";
import { FormField } from "@/components/common/ResourcePage";

/**
 * Add/Edit dialog outside ResourcePage, with the same inputs. `onSubmit(values)` resolves truthy to close,
 * or falsy to keep the dialog open (it shows its own error toast).
 */
export default function FormDialog({ title, submitLabel, fields, initial, onSubmit, onClose }) {
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const missing = fields.find((f) => f.required && String(values[f.name] ?? "").trim() === "");
    if (missing) return toast.error(`${missing.label} is required`);
    setSaving(true);
    try {
      if (await onSubmit(values)) onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onClose={() => !saving && onClose()} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, pt: 1 }}>
          {fields.map((f) => (
            <FormField key={f.name} field={f} value={values[f.name]} onChange={(v) => setValues((s) => ({ ...s, [f.name]: v }))} />
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button color="inherit" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={saving}>{saving ? "Saving…" : submitLabel}</Button>
      </DialogActions>
    </Dialog>
  );
}
