"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { LuPlus, LuLock, LuTrash2, LuUsers, LuPencil, LuRefreshCw } from "react-icons/lu";
import { toast } from "react-toastify";
import PageHeader from "@/components/common/PageHeader";
import FormDialog from "@/components/common/FormDialog";
import TeamNav from "@/components/team/TeamNav";
import { roleTone } from "@/components/team/RoleTag";
import { PERMISSION_ACTIONS } from "@/data/team";
import { clay, clayRgb } from "@/theme/clay";
import { getErrorMessage } from "@/utils/services/api/apiError";
import { createRole, deleteRole, getMyProfile, getPermissionModules, getRoles, updateRole } from "@/utils/services/api/EmployeeService";

/*
 * Roles and their permission matrix from GET /admin/roles. Save replaces the role's permissions (PUT), New role
 * creates one (optionally copying another role's permissions), Delete removes an unused role. The Super admin role is
 * locked. Buttons follow the signed-in employee's `team` permissions; the API enforces the same rules (and refuses
 * permissions you don't hold yourself). The rows come from GET /admin/permission-modules (switched-on modules), so a
 * module added in the database shows up here; actions a module doesn't offer show as "—".
 */

const TITLE = "Employees & roles";
const SUBTITLE = "Decide what each role can see and change. Staff get the permissions of their role.";
const ACTION_LABEL = { view: "View", create: "Create", edit: "Edit", delete: "Delete" };
const toneOf = (r) => roleTone(r) ?? "info";

export default function RolesPage() {
  const [roles, setRoles] = useState(null);
  const [error, setError] = useState(null);
  const [me, setMe] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState({});
  const [creating, setCreating] = useState(null); // { name, description, copyFrom }
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [modules, setModules] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await getRoles();
    if (!res?.data) return setError(getErrorMessage(res));
    const list = res.data.data;
    setRoles(list);
    // Keep the current role selected after a reload; otherwise start on the first editable one.
    setSelectedId((id) => {
      const keep = list.find((r) => r.id === id) ?? list.find((r) => !r.is_system) ?? list[0];
      setDraft(structuredClone(keep?.permissions ?? {}));
      return keep?.id ?? null;
    });
  }, []);

  useEffect(() => {
    // Fetch on mount; state is set after the await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    getMyProfile().then((res) => res?.data && setMe(res.data.data));
    getPermissionModules().then((res) => (res?.data ? setModules(res.data.data) : setError(getErrorMessage(res))));
  }, [load]);

  if (!roles || !modules) {
    return (
      <>
        <PageHeader title={TITLE} subtitle={SUBTITLE} actions={<TeamNav />} />
        <Card sx={{ py: 10, textAlign: "center" }}>
          {error ? (
            <>
              <Typography sx={{ mb: 2 }} color="error">{error}</Typography>
              <Button variant="outlined" startIcon={<LuRefreshCw size={15} />} onClick={load}>Try again</Button>
            </>
          ) : (
            <CircularProgress size={28} aria-label="Loading roles" />
          )}
        </Card>
      </>
    );
  }

  const offers = (mod, act) => Boolean(modules.find((m) => m.key === mod)?.actions.includes(act));
  const total = modules.reduce((n, m) => n + m.actions.length, 0);
  const grantCount = (perms) => modules.reduce((n, m) => n + (perms[m.key] ?? []).filter((a) => m.actions.includes(a)).length, 0);
  const normalize = (perms) =>
    Object.fromEntries(modules.map((m) => [m.key, PERMISSION_ACTIONS.filter((a) => m.actions.includes(a) && (perms?.[m.key] ?? []).includes(a))]));
  const can = (action) => Boolean(me?.role?.is_system || me?.permissions?.team?.includes(action));
  const role = roles.find((r) => r.id === selectedId) ?? roles[0];
  const locked = !role || role.is_system || !can("edit");
  const dirty = role && JSON.stringify(normalize(draft)) !== JSON.stringify(normalize(role.permissions));

  const replaceRole = (updated) => setRoles((rs) => rs.map((r) => (r.id === updated.id ? updated : r)));

  const select = (r) => {
    if (dirty && !window.confirm("Discard unsaved permission changes?")) return;
    setSelectedId(r.id);
    setDraft(structuredClone(r.permissions));
  };

  const has = (mod, act) => (draft[mod] ?? []).includes(act);
  const toggle = (mod, act) =>
    setDraft((d) => {
      const cur = new Set(d[mod] ?? []);
      if (cur.has(act)) {
        cur.delete(act);
        if (act === "view") cur.clear(); // no view → nothing else makes sense
      } else {
        cur.add(act);
        if (offers(mod, "view")) cur.add("view"); // any write permission implies view (the API applies the same rule)
      }
      return { ...d, [mod]: PERMISSION_ACTIONS.filter((a) => cur.has(a)) };
    });
  const toggleRow = (m) => setDraft((d) => ({ ...d, [m.key]: (d[m.key] ?? []).length >= m.actions.length ? [] : [...m.actions] }));
  const toggleColumn = (act) => {
    const offering = modules.filter((m) => m.actions.includes(act));
    const allOn = offering.every((m) => has(m.key, act));
    offering.forEach((m) => {
      if (has(m.key, act) === allOn) toggle(m.key, act);
    });
  };

  const save = async () => {
    setBusy(true);
    const res = await updateRole(role.id, { permissions: normalize(draft) });
    setBusy(false);
    if (!res?.data) return toast.error(getErrorMessage(res));
    replaceRole(res.data.data);
    setDraft(structuredClone(res.data.data.permissions));
    toast.success(`Permissions for ${role.name} saved`);
  };

  const rename = async ({ name, description }) => {
    const res = await updateRole(role.id, { name: name.trim(), description: description.trim() });
    if (!res?.data) {
      toast.error(getErrorMessage(res));
      return false;
    }
    replaceRole(res.data.data);
    toast.success("Role updated");
    return true;
  };

  const create = async () => {
    if (!creating.name.trim()) return toast.error("Role name is required");
    setBusy(true);
    const res = await createRole({
      name: creating.name.trim(),
      description: creating.description.trim() || undefined,
      ...(creating.copyFrom !== "none" && { copy_from_role_id: Number(creating.copyFrom) }),
    });
    setBusy(false);
    if (!res?.data) return toast.error(getErrorMessage(res));
    const created = res.data.data;
    setRoles((rs) => [...rs, created]);
    setSelectedId(created.id);
    setDraft(structuredClone(created.permissions));
    setCreating(null);
    toast.success(`Role "${created.name}" created`);
  };

  const remove = async () => {
    setBusy(true);
    const res = await deleteRole(deleting.id);
    setBusy(false);
    if (!res?.data) return toast.error(getErrorMessage(res));
    const rest = roles.filter((r) => r.id !== deleting.id);
    const fallback = rest.find((r) => !r.is_system) ?? rest[0];
    setRoles(rest);
    setSelectedId(fallback?.id ?? null);
    setDraft(structuredClone(fallback?.permissions ?? {}));
    toast.success(`Role "${deleting.name}" deleted`);
    setDeleting(null);
  };

  const defaultCopy = roles.find((r) => r.slug === "support") ?? roles.find((r) => !r.is_system);

  return (
    <>
      <PageHeader
        title={TITLE}
        subtitle={SUBTITLE}
        actions={
          <>
            <TeamNav />
            {can("create") && (
              <Button
                variant="contained"
                startIcon={<LuPlus size={16} />}
                onClick={() => setCreating({ name: "", description: "", copyFrom: defaultCopy ? String(defaultCopy.id) : "none" })}
              >
                New role
              </Button>
            )}
          </>
        }
      />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "320px 1fr" }, gap: 2.5, alignItems: "start" }}>
        {/* Role list */}
        <Box component="ul" aria-label="Roles" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {roles.map((r) => {
            const active = r.id === role?.id;
            const members = r.employees_count;
            const tone = toneOf(r);
            return (
              <li key={r.id}>
                <Card
                  component="button"
                  type="button"
                  onClick={() => select(r)}
                  aria-pressed={active}
                  sx={(theme) => ({
                    width: "100%",
                    textAlign: "left",
                    font: "inherit",
                    color: "inherit",
                    cursor: "pointer",
                    p: 2,
                    display: "flex",
                    gap: 1.5,
                    alignItems: "flex-start",
                    outline: active ? `2px solid ${theme.vars.palette.primary.main}` : "none",
                    outlineOffset: -2,
                    transition: "transform .15s",
                    "&:hover": { transform: "translateY(-1px)" },
                    "&:focus-visible": { outline: `2px solid ${theme.vars.palette.primary.main}` },
                  })}
                >
                  <Box
                    aria-hidden="true"
                    sx={(theme) => ({
                      width: 40,
                      height: 40,
                      flexShrink: 0,
                      borderRadius: "14px",
                      display: "grid",
                      placeItems: "center",
                      color: theme.vars.palette[tone].main,
                      bgcolor: theme.vars.palette[tone].light,
                      boxShadow: clay.tinted(clayRgb[tone] ?? clayRgb.primary, 0.2),
                    })}
                  >
                    {r.is_system ? <LuLock size={18} /> : <LuUsers size={18} />}
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>{r.name}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 0.25 }}>
                      {members} {members === 1 ? "member" : "members"} · {r.is_system ? total : grantCount(r.permissions)}/{total} permissions
                    </Typography>
                  </Box>
                </Card>
              </li>
            );
          })}
        </Box>

        {/* Permission matrix */}
        {role && (
          <Card>
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 2, p: 2.5 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" component="h2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {role.name}
                  {role.is_system && <LuLock size={16} aria-label="Locked" />}
                </Typography>
                <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.25, maxWidth: 520 }}>
                  {role.description || "No description."}
                </Typography>
              </Box>
              {!role.is_system && (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {can("delete") && (
                    <Button
                      color="error"
                      startIcon={<LuTrash2 size={15} />}
                      onClick={() =>
                        role.employees_count > 0
                          ? toast.error(`Move the ${role.employees_count} member(s) of ${role.name} to another role first`)
                          : setDeleting(role)
                      }
                    >
                      Delete role
                    </Button>
                  )}
                  {can("edit") && (
                    <>
                      <Button color="inherit" startIcon={<LuPencil size={15} />} onClick={() => setRenaming(true)}>
                        Rename
                      </Button>
                      <Button variant="outlined" color="inherit" disabled={!dirty || busy} onClick={() => setDraft(structuredClone(role.permissions))}>
                        Discard
                      </Button>
                      <Button variant="contained" disabled={!dirty || busy} onClick={save}>
                        {busy ? "Saving…" : "Save changes"}
                      </Button>
                    </>
                  )}
                </Box>
              )}
            </Box>

            <TableContainer>
              <Table sx={{ minWidth: 640 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Area</TableCell>
                    {PERMISSION_ACTIONS.map((a) => (
                      <TableCell key={a} align="center" sx={{ width: 96 }}>
                        {locked ? (
                          ACTION_LABEL[a]
                        ) : (
                          <Button size="small" color="inherit" onClick={() => toggleColumn(a)} sx={{ fontSize: "inherit", fontWeight: "inherit", letterSpacing: "inherit", minWidth: 0, px: 1 }} title={`Toggle ${ACTION_LABEL[a]} for all areas`}>
                            {ACTION_LABEL[a]}
                          </Button>
                        )}
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ width: 80 }}>All</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {modules.map((m) => {
                    // The system role passes every check, so show it fully ticked whatever rows it has.
                    const granted = role.is_system ? m.actions.length : (draft[m.key] ?? []).filter((a) => m.actions.includes(a)).length;
                    return (
                      <TableRow key={m.key} hover>
                        <TableCell>
                          <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{m.name}</Typography>
                          {m.description && <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{m.description}</Typography>}
                        </TableCell>
                        {PERMISSION_ACTIONS.map((a) => (
                          <TableCell key={a} align="center">
                            {m.actions.includes(a) ? (
                              <Checkbox
                                size="small"
                                checked={role.is_system || has(m.key, a)}
                                disabled={locked}
                                onChange={() => toggle(m.key, a)}
                                slotProps={{ input: { "aria-label": `${ACTION_LABEL[a]} ${m.name}` } }}
                              />
                            ) : (
                              <Box component="span" aria-label={`${m.name} has no ${ACTION_LABEL[a]} action`} sx={{ color: "text.disabled" }}>—</Box>
                            )}
                          </TableCell>
                        ))}
                        <TableCell align="center">
                          <Checkbox
                            size="small"
                            checked={granted === m.actions.length}
                            indeterminate={granted > 0 && granted < m.actions.length}
                            disabled={locked}
                            onChange={() => toggleRow(m)}
                            slotProps={{ input: { "aria-label": `All permissions for ${m.name}` } }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            {role.is_system && (
              <Typography sx={{ fontSize: 12.5, color: "text.secondary", px: 2.5, py: 2, display: "flex", alignItems: "center", gap: 0.75 }}>
                <LuLock size={13} /> Super admin always has every permission and can&apos;t be changed.
              </Typography>
            )}
            {!role.is_system && !can("edit") && me && (
              <Typography sx={{ fontSize: 12.5, color: "text.secondary", px: 2.5, py: 2 }}>
                You can view roles but not change them.
              </Typography>
            )}
          </Card>
        )}
      </Box>

      {/* New role */}
      <Dialog open={Boolean(creating)} onClose={() => !busy && setCreating(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>New role</DialogTitle>
        <DialogContent>
          {creating && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
              <TextField size="small" label="Role name" required value={creating.name} onChange={(e) => setCreating((c) => ({ ...c, name: e.target.value }))} autoFocus />
              <TextField size="small" label="Description" multiline minRows={2} value={creating.description} onChange={(e) => setCreating((c) => ({ ...c, description: e.target.value }))} />
              <TextField select size="small" label="Start with permissions from" value={creating.copyFrom} onChange={(e) => setCreating((c) => ({ ...c, copyFrom: e.target.value }))}>
                <MenuItem value="none">Nothing (empty role)</MenuItem>
                {roles.map((r) => (
                  <MenuItem key={r.id} value={String(r.id)}>{r.name}</MenuItem>
                ))}
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={() => setCreating(null)} disabled={busy}>Cancel</Button>
          <Button variant="contained" onClick={create} disabled={busy}>{busy ? "Creating…" : "Create role"}</Button>
        </DialogActions>
      </Dialog>

      {/* Rename */}
      {renaming && role && (
        <FormDialog
          title={`Edit ${role.name}`}
          submitLabel="Save"
          fields={[
            { name: "name", label: "Role name", required: true },
            { name: "description", label: "Description", type: "textarea" },
          ]}
          initial={{ name: role.name, description: role.description ?? "" }}
          onSubmit={rename}
          onClose={() => setRenaming(false)}
        />
      )}

      {/* Delete role */}
      <Dialog open={Boolean(deleting)} onClose={() => !busy && setDeleting(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete role?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ fontSize: 14 }}>&quot;{deleting?.name}&quot; will be removed. This can&apos;t be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={() => setDeleting(null)} disabled={busy}>Cancel</Button>
          <Button variant="contained" color="error" onClick={remove} disabled={busy}>{busy ? "Deleting…" : "Delete"}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

