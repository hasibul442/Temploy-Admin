"use client";
import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Checkbox,
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
import { LuPlus, LuLock, LuTrash2, LuUsers } from "react-icons/lu";
import { toast } from "react-toastify";
import PageHeader from "@/components/common/PageHeader";
import TeamNav from "@/components/team/TeamNav";
import { roles as initialRoles, employees, PERMISSION_MODULES, PERMISSION_ACTIONS } from "@/data/team";
import { clay, clayRgb } from "@/theme/clay";

const ACTION_LABEL = { view: "View", create: "Create", edit: "Edit", delete: "Delete" };
const memberCount = (roleName) => employees.filter((e) => e.role === roleName).length;
const grantCount = (perms) => Object.values(perms).reduce((n, a) => n + a.length, 0);
const TOTAL = PERMISSION_MODULES.length * PERMISSION_ACTIONS.length;

export default function RolesPage() {
  const [roles, setRoles] = useState(initialRoles);
  const [selectedId, setSelectedId] = useState("moderator");
  const [draft, setDraft] = useState(() => structuredClone(initialRoles.find((r) => r.id === "moderator").permissions));
  const [creating, setCreating] = useState(null); // { name, description, copyFrom }
  const [deleting, setDeleting] = useState(null);

  const role = roles.find((r) => r.id === selectedId);
  const dirty = JSON.stringify(normalize(draft)) !== JSON.stringify(normalize(role.permissions));

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
        cur.add("view"); // any write permission implies view
      }
      return { ...d, [mod]: PERMISSION_ACTIONS.filter((a) => cur.has(a)) };
    });
  const toggleRow = (mod) =>
    setDraft((d) => ({ ...d, [mod]: (d[mod] ?? []).length === PERMISSION_ACTIONS.length ? [] : [...PERMISSION_ACTIONS] }));
  const toggleColumn = (act) => {
    const allOn = PERMISSION_MODULES.every((m) => has(m.key, act));
    PERMISSION_MODULES.forEach((m) => {
      if (has(m.key, act) === allOn) toggle(m.key, act);
    });
  };

  const save = () => {
    setRoles((rs) => rs.map((r) => (r.id === role.id ? { ...r, permissions: structuredClone(draft) } : r)));
    toast.success(`Permissions for ${role.name} saved`);
  };

  const createRole = () => {
    if (!creating.name.trim()) return toast.error("Role name is required");
    const id = creating.name.trim().toLowerCase().replace(/\W+/g, "-");
    if (roles.some((r) => r.id === id)) return toast.error("A role with that name already exists");
    const source = roles.find((r) => r.id === creating.copyFrom);
    const perms = source ? structuredClone(source.permissions) : {};
    setRoles((rs) => [...rs, { id, name: creating.name.trim(), description: creating.description.trim() || "Custom role.", tone: "info", permissions: perms }]);
    setSelectedId(id);
    setDraft(structuredClone(perms));
    setCreating(null);
    toast.success(`Role "${creating.name.trim()}" created`);
  };

  const deleteRole = () => {
    setRoles((rs) => rs.filter((r) => r.id !== deleting.id));
    const fallback = roles.find((r) => r.id !== deleting.id && !r.locked) ?? roles[0];
    setSelectedId(fallback.id);
    setDraft(structuredClone(fallback.permissions));
    toast.success(`Role "${deleting.name}" deleted`);
    setDeleting(null);
  };

  return (
    <>
      <PageHeader
        title="Employees & roles"
        subtitle="Decide what each role can see and change. Staff get the permissions of their role."
        actions={
          <>
            <TeamNav />
            <Button variant="contained" startIcon={<LuPlus size={16} />} onClick={() => setCreating({ name: "", description: "", copyFrom: "support" })}>
              New role
            </Button>
          </>
        }
      />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "320px 1fr" }, gap: 2.5, alignItems: "start" }}>
        {/* Role list */}
        <Box component="ul" aria-label="Roles" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {roles.map((r) => {
            const active = r.id === selectedId;
            const members = memberCount(r.name);
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
                      color: theme.vars.palette[r.tone].main,
                      bgcolor: theme.vars.palette[r.tone].light,
                      boxShadow: clay.tinted(clayRgb[r.tone] ?? clayRgb.primary, 0.2),
                    })}
                  >
                    {r.locked ? <LuLock size={18} /> : <LuUsers size={18} />}
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>{r.name}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 0.25 }}>
                      {members} {members === 1 ? "member" : "members"} · {grantCount(r.permissions)}/{TOTAL} permissions
                    </Typography>
                  </Box>
                </Card>
              </li>
            );
          })}
        </Box>

        {/* Permission matrix */}
        <Card>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 2, p: 2.5 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" component="h2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {role.name}
                {role.locked && <LuLock size={16} aria-label="Locked" />}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.25, maxWidth: 520 }}>{role.description}</Typography>
            </Box>
            {!role.locked && (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  color="error"
                  startIcon={<LuTrash2 size={15} />}
                  onClick={() =>
                    memberCount(role.name) > 0
                      ? toast.error(`Move the ${memberCount(role.name)} member(s) of ${role.name} to another role first`)
                      : setDeleting(role)
                  }
                >
                  Delete role
                </Button>
                <Button variant="outlined" color="inherit" disabled={!dirty} onClick={() => setDraft(structuredClone(role.permissions))}>
                  Discard
                </Button>
                <Button variant="contained" disabled={!dirty} onClick={save}>
                  Save changes
                </Button>
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
                      {role.locked ? (
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
                {PERMISSION_MODULES.map((m) => {
                  const granted = (draft[m.key] ?? []).length;
                  return (
                    <TableRow key={m.key} hover>
                      <TableCell>
                        <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{m.label}</Typography>
                        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{m.hint}</Typography>
                      </TableCell>
                      {PERMISSION_ACTIONS.map((a) => (
                        <TableCell key={a} align="center">
                          <Checkbox
                            size="small"
                            checked={has(m.key, a)}
                            disabled={role.locked}
                            onChange={() => toggle(m.key, a)}
                            slotProps={{ input: { "aria-label": `${ACTION_LABEL[a]} ${m.label}` } }}
                          />
                        </TableCell>
                      ))}
                      <TableCell align="center">
                        <Checkbox
                          size="small"
                          checked={granted === PERMISSION_ACTIONS.length}
                          indeterminate={granted > 0 && granted < PERMISSION_ACTIONS.length}
                          disabled={role.locked}
                          onChange={() => toggleRow(m.key)}
                          slotProps={{ input: { "aria-label": `All permissions for ${m.label}` } }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {role.locked && (
            <Typography sx={{ fontSize: 12.5, color: "text.secondary", px: 2.5, py: 2, display: "flex", alignItems: "center", gap: 0.75 }}>
              <LuLock size={13} /> Super admin always has every permission and can&apos;t be changed.
            </Typography>
          )}
        </Card>
      </Box>

      {/* New role */}
      <Dialog open={Boolean(creating)} onClose={() => setCreating(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>New role</DialogTitle>
        <DialogContent>
          {creating && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
              <TextField size="small" label="Role name" required value={creating.name} onChange={(e) => setCreating((c) => ({ ...c, name: e.target.value }))} autoFocus />
              <TextField size="small" label="Description" multiline minRows={2} value={creating.description} onChange={(e) => setCreating((c) => ({ ...c, description: e.target.value }))} />
              <TextField select size="small" label="Start with permissions from" value={creating.copyFrom} onChange={(e) => setCreating((c) => ({ ...c, copyFrom: e.target.value }))}>
                <MenuItem value="none">Nothing (empty role)</MenuItem>
                {roles.map((r) => (
                  <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                ))}
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={() => setCreating(null)}>Cancel</Button>
          <Button variant="contained" onClick={createRole}>Create role</Button>
        </DialogActions>
      </Dialog>

      {/* Delete role */}
      <Dialog open={Boolean(deleting)} onClose={() => setDeleting(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete role?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ fontSize: 14 }}>&quot;{deleting?.name}&quot; will be removed. This can&apos;t be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={deleteRole}>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/** Stable comparison form: every module present, actions in canonical order. */
function normalize(perms) {
  return Object.fromEntries(PERMISSION_MODULES.map((m) => [m.key, PERMISSION_ACTIONS.filter((a) => (perms[m.key] ?? []).includes(a))]));
}
