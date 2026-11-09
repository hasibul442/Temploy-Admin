"use client";
import { useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem, Switch, TextField } from "@mui/material";
import { toast } from "react-toastify";
import { RAW_INPUT_SX } from "@/components/common/ResourcePage";
import { getErrorMessage } from "@/utils/services/api/apiError";
import { updateUser } from "@/utils/services/api/UserService";

/** Edit a user's details (PUT admin/users/:id). Sends only the fields that changed;
 * `onSaved(user)` gets the API's user (list fields only). */
export default function EditUserDialog({ user, onClose, onSaved }) {
  const initial = {
    f_name: user.fName ?? "",
    l_name: user.lName ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    country: user.country ?? "",
    user_role: user.userRole ?? "",
    user_type: user.userType ?? "REGULAR",
    is_email_verified: Boolean(user.isEmailVerified),
    is_phone_verified: Boolean(user.isPhoneVerified),
  };
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const save = async () => {
    const body = Object.fromEntries(Object.entries(values).filter(([k, v]) => v !== initial[k]));
    if (Object.keys(body).length === 0) return onClose();
    setSaving(true);
    const res = await updateUser(user.id, body);
    setSaving(false);
    if (!res?.data) return toast.error(getErrorMessage(res));
    toast.success("User updated");
    onSaved(res.data.data);
  };

  const field = (name, label, props = {}) => (
    <TextField label={label} value={values[name]} onChange={set(name)} size="small" fullWidth sx={RAW_INPUT_SX} {...props} />
  );

  return (
    <Dialog open onClose={() => !saving && onClose()} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Edit user</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, pt: 1 }}>
          {field("f_name", "First name", { required: true })}
          {field("l_name", "Last name", { required: true })}
          {field("email", "Email", { required: true, type: "email" })}
          {field("phone", "Phone")}
          {field("country", "Country", { helperText: "ISO code, e.g. BD" })}
          {field("user_role", "Type", {
            select: true,
            children: [
              <MenuItem key="freelancer" value="freelancer">Freelancer</MenuItem>,
              <MenuItem key="employer" value="employer">Client</MenuItem>,
            ],
          })}
          {field("user_type", "Plan", {
            select: true,
            children: [
              <MenuItem key="REGULAR" value="REGULAR">Regular</MenuItem>,
              <MenuItem key="PRO" value="PRO">Pro</MenuItem>,
            ],
          })}
          <Box />
          <FormControlLabel control={<Switch checked={values.is_email_verified} onChange={set("is_email_verified")} />} label="Email verified" />
          <FormControlLabel control={<Switch checked={values.is_phone_verified} onChange={set("is_phone_verified")} />} label="Phone verified" />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button color="inherit" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
      </DialogActions>
    </Dialog>
  );
}
