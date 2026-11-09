"use client";
import { useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  IconButton,
  Menu,
  ListItemIcon,
  Divider,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { LuSearch, LuPlus, LuDownload, LuEllipsisVertical, LuPencil, LuTrash2, LuX } from "react-icons/lu";
import { toast } from "react-toastify";
import PageHeader from "@/components/common/PageHeader";
import { clay, clayRgb } from "@/theme/clay";

/**
 * Config-driven list page used by most admin screens.
 *
 * Data lives in local state (seeded from `rows`), so actions like approve/edit/delete
 * work against mock data until the API exists. Swap `rows` for fetched data and the
 * `api.update/remove/create` calls for requests when wiring the backend.
 *
 * Props
 *  title, subtitle          Page header text.
 *  rows                     Initial rows; each needs a unique `id`.
 *  columns                  [{ key, label, align?, minWidth?, render?(row, api) }]
 *  stats?                   [{ label, value | (rows) => value, icon?: <Icon/>, tone? }]  summary tiles
 *  tabs?                    { field, options: ["All", ...], labels?: { opt: "Label" } }  counts are automatic
 *  search?                  { keys: ["name", ...], placeholder? }
 *  filters?                 [{ field, label, options: [...] }]   ("Any" is added automatically)
 *  rowActions?(row, api)    => [{ label, icon?, onClick, tone?: "error", divider? }]
 *  detail?                  { title?(row), render(row, api) }    row click opens a side drawer
 *  form?                    { entity, fields: [...], defaults, toRow?(values), canDelete?(row), onSave?, onDelete? }  enables Add + Edit + Delete
 *                           field: { name, label, type: text|number|select|switch|textarea, options?, required?, helperText?, half? }
 *                           onSave?(values, id, api)  async; for pages wired to the API. Resolve with the saved row to apply it,
 *                                                     or null to keep the dialog open (show your own error toast). id is null on Add.
 *                           onDelete?(row, api)       async; resolve true to remove the row locally.
 *  headerActions?           Extra nodes for the header (before Export / Add).
 *  minWidth?                Table min width (default 860).
 *  noun?                    Plural noun for empty state / counts (default: title lowercased).
 *
 * api: { rows, update(id, patch, message?), remove(id, message?), create(row, message?),
 *        openEdit(row), openDetail(row), confirm({ title, body, confirmLabel, tone, onConfirm }) }
 */
export default function ResourcePage({
  title,
  subtitle,
  rows: initialRows,
  columns,
  stats,
  tabs,
  search,
  filters = [],
  rowActions,
  detail,
  form,
  headerActions,
  minWidth = 860,
  noun,
}) {
  const [rows, setRows] = useState(initialRows);
  const [tab, setTab] = useState(tabs?.options[0] ?? "All");
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState(() => Object.fromEntries(filters.map((f) => [f.field, "Any"])));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [menu, setMenu] = useState(null); // { anchor, row }
  const [detailRow, setDetailRow] = useState(null);
  const [editing, setEditing] = useState(null); // { values, id? }
  const [confirmState, setConfirmState] = useState(null);
  const [saving, setSaving] = useState(false); // an onSave request is in flight
  const nextId = useRef(0); // ids for rows created locally
  const label = noun || title.toLowerCase();

  // ---- data actions (local state; replace with API calls later) ----
  const api = {
    rows,
    update(id, patch, message) {
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...(typeof patch === "function" ? patch(r) : patch) } : r)));
      setDetailRow((d) => (d && d.id === id ? { ...d, ...(typeof patch === "function" ? patch(d) : patch) } : d));
      if (message) toast.success(message);
    },
    remove(id, message) {
      setRows((rs) => rs.filter((r) => r.id !== id));
      setDetailRow((d) => (d && d.id === id ? null : d));
      if (message) toast.success(message);
    },
    create(row, message) {
      setRows((rs) => [row, ...rs]);
      if (message) toast.success(message);
    },
    openEdit(row) {
      setEditing({ id: row.id, values: Object.fromEntries(form.fields.map((f) => [f.name, row[f.name] ?? form.defaults?.[f.name] ?? ""])) });
    },
    openDetail: (row) => setDetailRow(row),
    confirm: (opts) => setConfirmState(opts),
  };

  // ---- filtering ----
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!tabs || tab === tabs.options[0] || r[tabs.field] === tab) &&
        filters.every((f) => filterValues[f.field] === "Any" || r[f.field] === filterValues[f.field]) &&
        (!q || (search?.keys ?? []).some((k) => String(r[k] ?? "").toLowerCase().includes(q)))
    );
  }, [rows, tab, tabs, filters, filterValues, query, search]);

  const pageRows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const resetPage = () => setPage(0);

  // ---- row actions (custom + automatic edit/delete when a form is configured) ----
  const actionsFor = (row) => {
    const custom = rowActions ? rowActions(row, api).filter(Boolean) : [];
    if (!form) return custom;
    return [
      ...custom,
      { label: "Edit", icon: <LuPencil size={15} />, onClick: () => api.openEdit(row), divider: custom.length > 0 },
      (!form.canDelete || form.canDelete(row)) && {
        label: "Delete",
        icon: <LuTrash2 size={15} />,
        tone: "error",
        onClick: () =>
          api.confirm({
            title: `Delete ${form.entity}?`,
            body: `"${row.name ?? row.title ?? row.id}" will be removed. This can't be undone.`,
            confirmLabel: "Delete",
            tone: "error",
            onConfirm: async () => {
              if (form.onDelete && !(await form.onDelete(row, api))) return;
              api.remove(row.id, `${capitalize(form.entity)} deleted`);
            },
          }),
      },
    ].filter(Boolean);
  };
  const hasActions = Boolean(rowActions || form);

  const saveForm = async () => {
    const missing = form.fields.find((f) => f.required && String(editing.values[f.name] ?? "").trim() === "");
    if (missing) {
      toast.error(`${missing.label} is required`);
      return;
    }
    const values = Object.fromEntries(
      form.fields.map((f) => [f.name, f.type === "number" ? Number(editing.values[f.name]) || 0 : editing.values[f.name]])
    );
    if (form.onSave) {
      setSaving(true);
      try {
        const saved = await form.onSave(values, editing.id ?? null, api);
        if (!saved) return; // request failed: keep the dialog open with the user's input
        if (editing.id != null) api.update(editing.id, saved, `${capitalize(form.entity)} updated`);
        else api.create(saved, `${capitalize(form.entity)} added`);
        setEditing(null);
      } finally {
        setSaving(false);
      }
      return;
    }
    if (editing.id != null) {
      api.update(editing.id, form.toRow ? form.toRow(values, true) : values, `${capitalize(form.entity)} updated`);
    } else {
      nextId.current += 1;
      const base = { id: `new-${nextId.current}`, ...form.defaults, ...values };
      api.create(form.toRow ? { ...base, ...form.toRow(values, false) } : base, `${capitalize(form.entity)} added`);
    }
    setEditing(null);
  };

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <>
            {headerActions}
            <Button variant="outlined" color="inherit" startIcon={<LuDownload size={16} />} onClick={() => toast.info("Export will be available once the API is connected")}>
              Export
            </Button>
            {form && (
              <Button variant="contained" startIcon={<LuPlus size={16} />} onClick={() => setEditing({ values: { ...form.defaults } })}>
                Add {form.entity}
              </Button>
            )}
          </>
        }
      />

      {stats && <StatTiles stats={stats} rows={rows} />}

      <Card>
        {tabs && (
          <Tabs
            value={tab}
            onChange={(_, v) => { setTab(v); resetPage(); }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}
          >
            {tabs.options.map((opt, i) => (
              <Tab
                key={opt}
                value={opt}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {tabs.labels?.[opt] ?? opt}
                    <Box component="span" className="num" sx={{ fontSize: 11.5, px: 0.75, borderRadius: "6px", bgcolor: "action.selected" }}>
                      {i === 0 ? rows.length : rows.filter((r) => r[tabs.field] === opt).length}
                    </Box>
                  </Box>
                }
              />
            ))}
          </Tabs>
        )}

        {(search || filters.length > 0) && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, p: 2, alignItems: "center" }}>
            {search && (
              <TextField
                size="small"
                placeholder={search.placeholder ?? "Search"}
                value={query}
                onChange={(e) => { setQuery(e.target.value); resetPage(); }}
                sx={{ flex: "1 1 260px", maxWidth: 380 }}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><LuSearch size={16} /></InputAdornment> } }}
              />
            )}
            {filters.map((f) => (
              <TextField
                key={f.field}
                select
                size="small"
                label={f.label}
                value={filterValues[f.field]}
                onChange={(e) => { setFilterValues((v) => ({ ...v, [f.field]: e.target.value })); resetPage(); }}
                sx={{ minWidth: 160 }}
              >
                {["Any", ...f.options].map((o) => (
                  <MenuItem key={o} value={o}>{o}</MenuItem>
                ))}
              </TextField>
            ))}
            <Typography sx={{ ml: "auto", fontSize: 13, color: "text.secondary" }} className="num">
              {filtered.length} {filtered.length === 1 ? label.replace(/s$/, "") : label}
            </Typography>
          </Box>
        )}

        <TableContainer>
          <Table sx={{ minWidth, "& td, & th": { py: 1.25 } }}>
            <TableHead>
              <TableRow>
                {columns.map((c) => (
                  <TableCell key={c.key} align={c.align} sx={{ minWidth: c.minWidth, whiteSpace: "nowrap" }}>
                    {c.label}
                  </TableCell>
                ))}
                {hasActions && <TableCell align="right" sx={{ width: 56 }} />}
              </TableRow>
            </TableHead>
            <TableBody>
              {pageRows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  onClick={detail ? () => setDetailRow(row) : undefined}
                  sx={detail ? { cursor: "pointer" } : undefined}
                >
                  {columns.map((c) => (
                    <TableCell key={c.key} align={c.align} sx={{ fontSize: 13.5 }}>
                      {c.render ? c.render(row, api) : row[c.key]}
                    </TableCell>
                  ))}
                  {hasActions && (
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <IconButton size="small" aria-label="Row actions" onClick={(e) => setMenu({ anchor: e.currentTarget, row })}>
                        <LuEllipsisVertical size={16} />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {pageRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
                    No {label} match these filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); resetPage(); }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Card>

      {/* Row action menu */}
      <Menu anchorEl={menu?.anchor} open={Boolean(menu)} onClose={() => setMenu(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
        {menu &&
          actionsFor(menu.row).flatMap((a) => [
            a.divider ? <Divider key={`${a.label}-d`} /> : null,
            <MenuItem
              key={a.label}
              onClick={() => { setMenu(null); a.onClick(); }}
              sx={a.tone ? { color: `${a.tone}.main` } : undefined}
            >
              {/* Always reserve the icon slot so labels line up even when an action has no icon. */}
              <ListItemIcon sx={{ color: "inherit" }}>{a.icon}</ListItemIcon>
              {a.label}
            </MenuItem>,
          ])}
      </Menu>

      {/* Detail drawer */}
      {detail && (
        <Drawer anchor="right" open={Boolean(detailRow)} onClose={() => setDetailRow(null)} slotProps={{ paper: { sx: { width: { xs: "100%", sm: 460 }, bgcolor: "background.paper" } } }}>
          {detailRow && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 2.5 }}>
                <Typography variant="h6" component="h2">{detail.title ? detail.title(detailRow) : detailRow.id}</Typography>
                <IconButton onClick={() => setDetailRow(null)} aria-label="Close details" size="small">
                  <LuX size={18} />
                </IconButton>
              </Box>
              {detail.render(detailRow, api)}
            </Box>
          )}
        </Drawer>
      )}

      {/* Add / edit dialog */}
      {form && (
        <Dialog open={Boolean(editing)} onClose={() => !saving && setEditing(null)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ fontWeight: 700 }}>{editing?.id != null ? `Edit ${form.entity}` : `Add ${form.entity}`}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, pt: 1 }}>
              {editing &&
                form.fields.map((f) => (
                  <FormField
                    key={f.name}
                    field={f}
                    value={editing.values[f.name]}
                    onChange={(v) => setEditing((e) => ({ ...e, values: { ...e.values, [f.name]: v } }))}
                  />
                ))}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button color="inherit" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button>
            <Button variant="contained" onClick={saveForm} disabled={saving}>
              {saving ? "Saving…" : editing?.id != null ? "Save changes" : `Add ${form.entity}`}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Confirm dialog */}
      <Dialog open={Boolean(confirmState)} onClose={() => setConfirmState(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{confirmState?.title}</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ fontSize: 14 }}>{confirmState?.body}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={() => setConfirmState(null)}>Cancel</Button>
          <Button
            variant="contained"
            color={confirmState?.tone === "error" ? "error" : "primary"}
            onClick={() => { confirmState.onConfirm(); setConfirmState(null); }}
          >
            {confirmState?.confirmLabel ?? "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// Add/Edit dialog inputs use plain MUI styling, undoing the theme's clay input overrides (theme.js).
export const RAW_INPUT_SX = {
  "& .MuiOutlinedInput-root": { borderRadius: "4px", backgroundColor: "transparent", boxShadow: "none" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0, 0, 0, 0.23)", borderWidth: 1 },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: "text.primary" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main", borderWidth: 2 },
  "& .MuiInputLabel-root": { fontWeight: 400, color: "text.secondary" },
  "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
};

/** One Add/Edit dialog input (see `form.fields` above). Also used by standalone dialogs. */
export function FormField({ field: f, value, onChange }) {
  const common = { label: f.label, required: f.required, helperText: f.helperText, fullWidth: true, size: "small" };
  const span = { ...RAW_INPUT_SX, ...(f.half ? {} : { gridColumn: "1 / -1" }) };
  if (f.type === "switch") {
    return (
      <FormControlLabel
        sx={{ ...span, m: 0 }}
        control={<Switch checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />}
        label={<Typography sx={{ fontSize: 14 }}>{f.label}</Typography>}
      />
    );
  }
  if (f.type === "select") {
    return (
      <TextField select {...common} value={value ?? ""} onChange={(e) => onChange(e.target.value)} sx={span}>
        {f.options.map((o) => (
          <MenuItem key={o} value={o}>{o}</MenuItem>
        ))}
      </TextField>
    );
  }
  return (
    <TextField
      {...common}
      type={f.type === "number" ? "number" : "text"}
      multiline={f.type === "textarea"}
      minRows={f.type === "textarea" ? 3 : undefined}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      sx={span}
      slotProps={f.type === "number" ? { htmlInput: { step: "any" } } : undefined}
    />
  );
}

/** Row of small clay KPI tiles above a list. `value` may be a function of the current rows. */
export function StatTiles({ stats, rows }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: `repeat(${Math.min(stats.length, 4)}, 1fr)` }, gap: { xs: 2, md: 2.5 }, mb: 2.5 }}>
      {stats.map((s) => {
        const tone = s.tone ?? "primary";
        return (
          <Card key={s.label} sx={{ p: 2.25, display: "flex", alignItems: "center", gap: 1.75 }}>
            {s.icon && (
              <Box
                aria-hidden="true"
                sx={(theme) => ({
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  borderRadius: "15px",
                  display: "grid",
                  placeItems: "center",
                  color: theme.vars.palette[tone].main,
                  bgcolor: theme.vars.palette[tone].light,
                  boxShadow: clay.tinted(clayRgb[tone], 0.2),
                })}
              >
                {s.icon}
              </Box>
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontSize: 12.5, color: "text.secondary", fontWeight: 500 }}>{s.label}</Typography>
              <Typography className="num" sx={{ fontSize: 22, fontWeight: 700, lineHeight: 1.25 }}>
                {typeof s.value === "function" ? s.value(rows) : s.value}
              </Typography>
            </Box>
          </Card>
        );
      })}
    </Box>
  );
}

/** Label / value list for detail drawers. items: [{ label, value }] */
export function DetailList({ items }) {
  return (
    <Card sx={{ p: 0.5 }}>
      {items.filter(Boolean).map((it, i) => (
        <Box key={it.label} sx={{ display: "flex", justifyContent: "space-between", gap: 2, px: 2, py: 1.4, borderTop: i ? 1 : 0, borderColor: "divider" }}>
          <Typography sx={{ fontSize: 13, color: "text.secondary", flexShrink: 0 }}>{it.label}</Typography>
          <Box sx={{ fontSize: 13.5, fontWeight: 500, textAlign: "right", minWidth: 0 }}>{it.value}</Box>
        </Box>
      ))}
    </Card>
  );
}

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
