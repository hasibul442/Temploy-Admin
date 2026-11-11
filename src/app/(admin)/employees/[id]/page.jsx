"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { LuArrowLeft, LuBan, LuRefreshCw, LuRotateCcw, LuCheck, LuPlus, LuPencil, LuTrash2 } from "react-icons/lu";
import { toast } from "react-toastify";
import PageHeader from "@/components/common/PageHeader";
import SectionCard from "@/components/common/SectionCard";
import StatusChip from "@/components/common/StatusChip";
import Facts from "@/components/common/Facts";
import FormDialog from "@/components/common/FormDialog";
import { Tag } from "@/components/common/cells";
import RoleTag from "@/components/team/RoleTag";
import { PERMISSION_ACTIONS } from "@/data/team";
import { formatLocalDate, formatLocalDateTime, humanize, initials } from "@/helper/format";
import { getErrorMessage } from "@/utils/services/api/apiError";
import {
  deleteEmployee,
  getEmployee,
  getMyProfile,
  getPermissionModules,
  getRoles,
  setEmployeeStatus,
  updateEmployee,
} from "@/utils/services/api/EmployeeService";

/*
 * Employee details from GET /admin/employees/:id: account, sign-in security, access (role permissions plus extra
 * grants), verified devices and recent activity. Staff can suspend or (re)activate the account.
 * Super admins also get Edit (details, role, new password) and Delete; the API enforces this too.
 */

const Muted = ({ children }) => <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{children}</Typography>;
const has = (grouped, module, action) => Boolean(grouped?.[module]?.includes(action));

/** One matrix cell: granted by the role, an extra grant for this employee, or nothing. */
function AccessCell({ offered, fromRole, extra, label }) {
  if (!offered) return <Box component="span" aria-label={`${label}: not offered`} sx={{ color: "text.disabled" }}>·</Box>;
  if (fromRole) {
    return (
      <Box component="span" aria-label={`${label}: from role`} sx={{ display: "inline-flex", color: "success.main" }}>
        <LuCheck size={16} />
      </Box>
    );
  }
  if (extra) {
    return (
      <Box
        component="span"
        aria-label={`${label}: extra permission`}
        sx={{ display: "inline-flex", alignItems: "center", gap: 0.25, color: "info.main", fontSize: 12, fontWeight: 600 }}
      >
        <LuPlus size={14} /> Extra
      </Box>
    );
  }
  return <Box component="span" aria-label={`${label}: no access`} sx={{ color: "text.disabled" }}>—</Box>;
}

export default function EmployeeDetailsPage() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState(null);
  const [changing, setChanging] = useState(null); // "ACTIVE" | "SUSPENDED" while the dialog is open
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false); // confirm dialog open
  const [busy, setBusy] = useState(false);
  const [me, setMe] = useState(null); // signed-in employee: decides whether Edit / Delete show
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const router = useRouter();

  useEffect(() => {
    getMyProfile().then((res) => res?.data && setMe(res.data.data));
    getRoles().then((res) => res?.data && setRoles(res.data.data));
    // Rows of the access matrix: switched-on modules from the database.
    getPermissionModules().then((res) => res?.data && setModules(res.data.data));
  }, []);

  const load = useCallback(async () => {
    setError(null);
    const res = await getEmployee(id);
    if (res?.data) setEmployee(res.data.data);
    else setError(getErrorMessage(res));
  }, [id]);

  useEffect(() => {
    // Fetch on mount; state is set after the await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const back = <Button href="/employees" color="inherit" startIcon={<LuArrowLeft size={16} />}>All employees</Button>;

  if (!employee) {
    return (
      <>
        <PageHeader title={`Employee #${id}`} actions={back} />
        <Card sx={{ py: 6, textAlign: "center" }}>
          {error ? (
            <>
              <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
              <Button variant="outlined" startIcon={<LuRefreshCw size={15} />} onClick={load}>Try again</Button>
            </>
          ) : (
            <CircularProgress size={28} aria-label="Loading employee" />
          )}
        </Card>
      </>
    );
  }

  const e = employee;
  const isActive = e.status === "ACTIVE";
  const isSuperAdmin = e.role?.is_system;
  const extraGrouped = {};
  for (const p of e.extra_permissions) (extraGrouped[p.module] ??= []).push(p.action);

  const submitStatus = async ({ reason }) => {
    const res = await setEmployeeStatus(e.id, changing, String(reason ?? "").trim() || undefined);
    if (!res?.data) {
      toast.error(getErrorMessage(res));
      return false;
    }
    toast.success(res.data.message ?? "Status updated");
    await load(); // picks up the new status and the activity entry
    return true;
  };

  const canManage = Boolean(me?.role?.is_system);
  const isSelf = me?.id === e.id;

  // Sends only what changed; an empty password field keeps the current password.
  const submitEdit = async (values) => {
    const body = {};
    for (const key of ["f_name", "l_name", "email", "phone"]) {
      const value = String(values[key] ?? "").trim();
      if (value !== String(e[key] ?? "")) body[key] = value;
    }
    if (values.role_id && Number(values.role_id) !== e.role?.id) body.role_id = Number(values.role_id);
    if (values.password) body.password = values.password;
    if (!Object.keys(body).length) return true;

    const res = await updateEmployee(e.id, body);
    if (!res?.data) {
      toast.error(getErrorMessage(res));
      return false;
    }
    toast.success(body.password ? "Employee updated. They've been signed out." : "Employee updated");
    setEmployee(res.data.data);
    return true;
  };

  const confirmDelete = async () => {
    setBusy(true);
    const res = await deleteEmployee(e.id);
    setBusy(false);
    if (!res?.data) return toast.error(getErrorMessage(res));
    toast.success(`${e.name} deleted`);
    router.push("/employees");
  };

  return (
    <>
      <PageHeader
        title={e.name}
        subtitle={`#${e.id} · ${e.email} · added ${formatLocalDate(e.created_at)}`}
        actions={
          <>
            {back}
            {isActive ? (
              <Button variant="outlined" color="error" startIcon={<LuBan size={16} />} onClick={() => setChanging("SUSPENDED")}>
                Suspend
              </Button>
            ) : (
              <Button variant="contained" startIcon={<LuRotateCcw size={16} />} onClick={() => setChanging("ACTIVE")}>
                {e.status === "PENDING" ? "Activate" : "Reactivate"}
              </Button>
            )}
            {canManage && !isSelf && (
              <Button variant="outlined" color="error" startIcon={<LuTrash2 size={16} />} onClick={() => setDeleting(true)}>
                Delete
              </Button>
            )}
            {canManage && (
              <Button variant="contained" startIcon={<LuPencil size={16} />} onClick={() => setEditing(true)}>
                Edit employee
              </Button>
            )}
          </>
        }
      />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 3fr) minmax(0, 2fr)" }, gap: 2.5, mb: 2.5, alignItems: "start" }}>
        <SectionCard
          title="Account"
          action={
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <StatusChip status={humanize(e.status)} />
              {e.is_locked && <Tag tone="warning">Locked</Tag>}
            </Box>
          }
          sx={{ height: "auto" }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Avatar src={e.profile_image || undefined} sx={{ width: 52, height: 52, fontSize: 17, bgcolor: "primary.light", color: "primary.main", fontWeight: 600 }}>
              {initials(e.name)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600 }}>{e.name}</Typography>
              <Box sx={{ display: "flex", gap: 0.75, mt: 0.5, flexWrap: "wrap" }}>
                <RoleTag role={e.role} />
                {e.extra_permissions.length > 0 && <Tag>+{e.extra_permissions.length} extra</Tag>}
              </Box>
            </Box>
          </Box>
          <Facts
            items={[
              { label: "Email", value: e.email },
              { label: "Phone", value: e.phone || "—" },
              { label: "Role", value: e.role?.name ?? "—" },
              { label: "Added by", value: e.invited_by?.name ?? "—" },
              { label: "Added", value: formatLocalDateTime(e.created_at) },
              { label: "Last updated", value: formatLocalDateTime(e.updated_at) },
            ]}
          />
        </SectionCard>

        <SectionCard title="Sign-in & security" sx={{ height: "auto" }}>
          <Facts
            min={150}
            items={[
              { label: "Two-factor auth", value: e.two_factor_enabled ? "Enabled" : "Not enabled" },
              { label: "Last sign-in", value: formatLocalDateTime(e.last_login_at) },
              { label: "Last sign-in IP", value: e.last_login_ip || "—" },
              { label: "Last active", value: formatLocalDateTime(e.last_active_at) },
              { label: "Failed sign-ins", value: e.failed_login_attempts },
              { label: "Locked until", value: e.is_locked ? formatLocalDateTime(e.locked_until) : "Not locked" },
              { label: "Password changed", value: formatLocalDateTime(e.password_changed_at) },
              { label: "Verified devices", value: e.devices.length },
            ]}
          />
        </SectionCard>
      </Box>

      <SectionCard
        title="Access"
        subtitle={
          isSuperAdmin
            ? "Super admin: full access to everything, including modules added later."
            : `What ${e.role?.name ?? "the role"} allows, plus extra permissions given to this employee only.`
        }
        action={
          !isSuperAdmin && (
            <Box sx={{ display: "flex", gap: 1.5, fontSize: 12, color: "text.secondary", alignItems: "center", flexWrap: "wrap" }}>
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, color: "success.main" }}><LuCheck size={14} /> From role</Box>
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, color: "info.main" }}><LuPlus size={14} /> Extra</Box>
            </Box>
          )
        }
        noPadding
        sx={{ height: "auto", mb: 2.5 }}
      >
        <TableContainer>
          <Table size="small" sx={{ minWidth: 560 }}>
            <TableHead>
              <TableRow>
                <TableCell>Module</TableCell>
                {PERMISSION_ACTIONS.map((a) => (
                  <TableCell key={a} align="center">{humanize(a)}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {modules.map((m) => (
                <TableRow key={m.key}>
                  <TableCell>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 500 }}>{m.name}</Typography>
                    {m.description && <Muted>{m.description}</Muted>}
                  </TableCell>
                  {PERMISSION_ACTIONS.map((a) => (
                    <TableCell key={a} align="center">
                      <AccessCell
                        offered={m.actions.includes(a)}
                        label={`${m.name} ${a}`}
                        fromRole={isSuperAdmin || has(e.role_permissions, m.key, a)}
                        extra={has(extraGrouped, m.key, a)}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {e.extra_permissions.length > 0 && (
          <Box sx={{ px: 2.5, py: 2 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 13.5, mb: 1 }}>Extra permissions</Typography>
            {e.extra_permissions.map((p) => (
              <Muted key={`${p.module}:${p.action}`}>
                {humanize(p.action)} · {modules.find((m) => m.key === p.module)?.name ?? p.module}
                {p.granted_by ? ` — given by ${p.granted_by.name}` : ""} on {formatLocalDate(p.created_at)}
              </Muted>
            ))}
          </Box>
        )}
      </SectionCard>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2.5, alignItems: "start" }}>
        <SectionCard title="Verified devices" subtitle="Signing in from one of these skips the email code." noPadding sx={{ height: "auto" }}>
          {e.devices.length === 0 ? (
            <Box sx={{ px: 2.5, pb: 2.5 }}><Muted>No verified devices yet.</Muted></Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Device</TableCell>
                    <TableCell>Last sign-in</TableCell>
                    <TableCell>IP</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {e.devices.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>
                        <Typography sx={{ fontSize: 13.5 }}>{d.name || "Unknown device"}</Typography>
                        <Muted>Verified {formatLocalDate(d.verified_at)}</Muted>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>{formatLocalDateTime(d.last_login_at)}</TableCell>
                      <TableCell>{d.last_ip || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </SectionCard>

        <SectionCard title="Recent activity" subtitle="The last 20 things this employee did in the console." sx={{ height: "auto" }}>
          {e.recent_activity.length === 0 ? (
            <Muted>No activity yet.</Muted>
          ) : (
            <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none", display: "grid", gap: 1.25 }}>
              {e.recent_activity.map((a) => (
                <Box component="li" key={a.id}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 500 }}>
                    {humanize(a.action.replace(".", " "))}
                    {a.entity_id ? ` · ${a.entity_type} #${a.entity_id}` : ""}
                  </Typography>
                  <Muted>
                    {formatLocalDateTime(a.created_at)}
                    {a.ip_address ? ` · ${a.ip_address}` : ""}
                  </Muted>
                </Box>
              ))}
            </Box>
          )}
        </SectionCard>
      </Box>

      {changing && (
        <FormDialog
          title={changing === "SUSPENDED" ? `Suspend ${e.name}?` : `Activate ${e.name}?`}
          submitLabel={changing === "SUSPENDED" ? "Suspend" : "Activate"}
          fields={[
            {
              name: "reason",
              label: "Reason (optional)",
              type: "textarea",
              helperText:
                changing === "SUSPENDED"
                  ? "They'll be signed out right away. Saved in the activity log."
                  : "They can sign in again. Saved in the activity log.",
            },
          ]}
          initial={{ reason: "" }}
          onSubmit={submitStatus}
          onClose={() => setChanging(null)}
        />
      )}

      {editing && (
        <FormDialog
          title={`Edit ${e.name}`}
          submitLabel="Save changes"
          fields={[
            { name: "f_name", label: "First name", required: true, half: true },
            { name: "l_name", label: "Last name", required: true, half: true },
            { name: "email", label: "Work email", type: "email", required: true, half: true },
            { name: "phone", label: "Phone", half: true },
            // Nobody can change their own role (the API refuses it too).
            !isSelf && {
              name: "role_id",
              label: "Role",
              type: "select",
              options: roles.map((r) => ({ value: String(r.id), label: r.name })),
              required: true,
            },
            {
              name: "password",
              label: "New password",
              type: "password",
              helperText: "Leave empty to keep the current one. A new password signs them out everywhere.",
            },
          ].filter(Boolean)}
          initial={{ f_name: e.f_name, l_name: e.l_name, email: e.email, phone: e.phone ?? "", role_id: String(e.role?.id ?? ""), password: "" }}
          onSubmit={submitEdit}
          onClose={() => setEditing(false)}
        />
      )}

      <Dialog open={deleting} onClose={() => !busy && setDeleting(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete {e.name}?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 14 }}>
            They&apos;ll be signed out and removed from the team list. Their past actions stay in the records, and this email
            can&apos;t be used for a new employee.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={() => setDeleting(false)} disabled={busy}>Cancel</Button>
          <Button variant="contained" color="error" onClick={confirmDelete} disabled={busy}>{busy ? "Deleting…" : "Delete"}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
