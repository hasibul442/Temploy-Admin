"use client";
import { useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { toast } from "react-toastify";
import { FormField } from "@/components/common/ResourcePage";

/*
 * Shared by the Categories list, the category details page and the Subcategories list.
 * Row keys match the form field names (snake_case, as the API takes them), so Edit pre-fills.
 */

const str = (v) => v ?? "";

/** API category (admin) → row. */
export function categoryToRow(c) {
  return {
    id: c.id,
    name: c.catName, // shown in ResourcePage's delete confirmation
    cat_name: c.catName,
    cat_name_bn: str(c.catNameBn),
    cat_name_pt: str(c.catNamePt),
    slug: c.slug,
    icon: str(c.icon),
    color: str(c.color),
    cat_icon_url: str(c.catIconUrl),
    description: str(c.description),
    description_bn: str(c.descriptionBn),
    description_pt: str(c.descriptionPt),
    active: Boolean(c.status),
    state: c.status ? "Active" : "Inactive",
    subs: c._count?.subCategories ?? 0,
    jobs: c._count?.jobs ?? 0,
    gigs: c._count?.gigs ?? 0,
  };
}

/** API subcategory (admin) → row. `category` is the parent's name (used by the filter and the form select). */
export function subCategoryToRow(s) {
  return {
    id: s.id,
    name: s.subCatName,
    sub_cat_name: s.subCatName,
    cat_id: s.catId,
    category: s.category?.catName ?? "",
    slug: s.slug,
    sub_cat_icon_url: str(s.subCatIconUrl),
    description: str(s.description),
    active: Boolean(s.status),
    state: s.status ? "Active" : "Inactive",
    jobs: s._count?.jobs ?? 0,
    gigs: s._count?.gigs ?? 0,
    services: s._count?.profileServices ?? 0,
  };
}

// Jobs, gigs and subcategories point at a category, so the API refuses to delete a used one (409).
export const categoryInUse = (row) => row.subs + row.jobs + row.gigs > 0;
export const subCategoryInUse = (row) => row.jobs + row.gigs + row.services > 0;

const SLUG_HELP = "Leave blank to generate from the name";

export const CATEGORY_FIELDS = [
  { name: "cat_name", label: "Name", required: true, half: true },
  { name: "slug", label: "Slug", half: true, helperText: SLUG_HELP },
  { name: "cat_name_bn", label: "Name (Bangla)", half: true },
  { name: "cat_name_pt", label: "Name (Portuguese)", half: true },
  { name: "icon", label: "Icon name", half: true, helperText: "Icon the web app shows" },
  { name: "color", label: "Color", half: true, helperText: "e.g. #2F80ED" },
  { name: "cat_icon_url", label: "Icon image URL" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "description_bn", label: "Description (Bangla)", type: "textarea" },
  { name: "description_pt", label: "Description (Portuguese)", type: "textarea" },
  { name: "active", label: "Active (visible to users)", type: "switch" },
];
export const CATEGORY_DEFAULTS = { active: true };

/** `categoryOptions` (parent names) adds the parent select; leave it out when the parent is fixed. */
export function subCategoryFields(categoryOptions) {
  return [
    { name: "sub_cat_name", label: "Name", required: true, half: true },
    categoryOptions
      ? { name: "category", label: "Parent category", type: "select", options: categoryOptions, required: true, half: true }
      : { name: "slug", label: "Slug", half: true, helperText: SLUG_HELP },
    categoryOptions && { name: "slug", label: "Slug", helperText: SLUG_HELP },
    { name: "sub_cat_icon_url", label: "Icon image URL" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "active", label: "Active (visible to users)", type: "switch" },
  ].filter(Boolean);
}
export const SUB_CATEGORY_DEFAULTS = { active: true };

const trimmed = (values, names) => Object.fromEntries(names.map((n) => [n, String(values[n] ?? "").trim()]));

/** Form values → POST/PUT body. Blank text clears the field; a blank slug is generated from the name. */
export function categoryBody(values) {
  const names = CATEGORY_FIELDS.filter((f) => f.type !== "switch").map((f) => f.name);
  return { ...trimmed(values, names), status: Boolean(values.active) };
}

/** `catId` is the parent's id (from the select, or the fixed parent on the details page). */
export function subCategoryBody(values, catId) {
  return {
    ...trimmed(values, ["sub_cat_name", "slug", "sub_cat_icon_url", "description"]),
    cat_id: catId,
    status: Boolean(values.active),
  };
}

/**
 * Add/Edit dialog outside ResourcePage, with the same inputs. `onSubmit(values)` resolves truthy to close,
 * or falsy to keep the dialog open (it shows its own error toast).
 */
export function FormDialog({ title, submitLabel, fields, initial, onSubmit, onClose }) {
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

/** Form values for editing an existing row. */
export const valuesFrom = (row, fields) => Object.fromEntries(fields.map((f) => [f.name, row[f.name] ?? ""]));

/** Small color dot for a category's `color` (blank → nothing). */
export function ColorDot({ color }) {
  if (!color) return null;
  return <Box component="span" aria-hidden="true" sx={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", bgcolor: color, border: 1, borderColor: "divider", flexShrink: 0 }} />;
}
