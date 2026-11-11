"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, FormControlLabel, Switch, Typography } from "@mui/material";
import { LuUsers, LuUserCheck, LuMail, LuShieldAlert, LuBan, LuRotateCcw, LuEye, LuTrash2 } from "react-icons/lu";
import { toast } from "react-toastify";
import ResourcePage from "@/components/common/ResourcePage";
import StatusChip from "@/components/common/StatusChip";
import { PersonCell, Tag } from "@/components/common/cells";
import { useApiList, ApiListFallback } from "@/components/common/ApiList";
import TeamNav from "@/components/team/TeamNav";
import RoleTag, { roleTone } from "@/components/team/RoleTag";
import { formatLocalDateTime, humanize } from "@/helper/format";
import { getErrorMessage } from "@/utils/services/api/apiError";
import { createEmployee, getEmployees, getMyProfile, getRoles, setEmployeeStatus } from "@/utils/services/api/EmployeeService";

/*
 * Staff accounts from GET /admin/employees. Add from the dashboard (POST), activate / suspend (PUT .../status).
 * A row opens /employees/[id]. Staff are few, so one request loads them all (API max 100) and the page filters locally.
 * Super admins can switch to the soft-deleted accounts (`?deleted=true`), read-only.
 */

const TITLE = "Employees & roles";
const SUBTITLE = "Staff accounts with access to this admin console.";

const fetchEmployees = () => getEmployees({ limit: 100 });
const fetchDeleted = () => getEmployees({ limit: 100, deleted: true });

/** API employee → row. `status` is title-cased for the tabs and StatusChip. */
function toRow(e) {
  return {
    ...e,
    status: humanize(e.status),
    roleName: e.role?.name ?? "—",
    lastActive: e.last_active_at ?? e.last_login_at,
  };
}

async function save(values) {
  const res = await createEmployee({
    f_name: values.f_name.trim(),
    l_name: values.l_name.trim(),
    email: values.email.trim(),
    phone: String(values.phone ?? "").trim() || undefined,
    password: values.password,
    role_id: Number(values.role_id),
    status: values.status,
  });
  if (!res?.data) {
    toast.error(getErrorMessage(res));
    return null;
  }
  return toRow(res.data.data);
}

async function changeStatus(e, status, api) {
  const res = await setEmployeeStatus(e.id, status);
  if (!res?.data) return toast.error(getErrorMessage(res));
  api.update(e.id, { status: humanize(status) }, res.data.message ?? `${e.name} updated`);
}

export default function EmployeesPage() {
  const [me, setMe] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    getMyProfile().then((res) => res?.data && setMe(res.data.data));
  }, []);

  const headerActions = (
    <>
      <TeamNav />
      {me?.role?.is_system && (
        <FormControlLabel
          sx={{ m: 0 }}
          control={<Switch size="small" checked={showDeleted} onChange={(ev) => setShowDeleted(ev.target.checked)} />}
          label={<Typography sx={{ fontSize: 13.5 }}>Show deleted</Typography>}
        />
      )}
    </>
  );
  return showDeleted ? <DeletedEmployees headerActions={headerActions} /> : <ActiveEmployees headerActions={headerActions} />;
}

/** Soft-deleted accounts (Super admins only): read-only, most recently deleted first. */
function DeletedEmployees({ headerActions }) {
  const { rows, error, reload } = useApiList(fetchDeleted, toRow);
  const title = "Deleted employees";
  const subtitle = "Accounts removed from the team. They can't sign in; their past actions stay in the records.";
  if (!rows) return <ApiListFallback title={title} subtitle={subtitle} error={error} onRetry={reload} />;

  return (
    <ResourcePage
      title={title}
      subtitle={subtitle}
      noun="deleted employees"
      headerActions={headerActions}
      rows={rows}
      stats={[{ label: "Deleted", value: (r) => r.length, icon: <LuTrash2 size={20} />, tone: "error" }]}
      search={{ keys: ["name", "email", "phone"], placeholder: "Search by name, email or phone" }}
      columns={[
        { key: "name", label: "Employee", minWidth: 220, render: (e) => <PersonCell name={e.name} sub={e.email} tone={roleTone(e.role)} /> },
        { key: "roleName", label: "Role", render: (e) => <RoleTag role={e.role} /> },
        {
          key: "deleted_at",
          label: "Deleted on",
          render: (e) => <Box component="span" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>{formatLocalDateTime(e.deleted_at)}</Box>,
        },
        {
          key: "created_at",
          label: "Added",
          render: (e) => <Box component="span" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>{formatLocalDateTime(e.created_at)}</Box>,
        },
      ]}
    />
  );
}

function ActiveEmployees({ headerActions }) {
  const router = useRouter();
  const { rows, error, reload } = useApiList(fetchEmployees, toRow);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    // Roles feed the role filter and the Add form; the list still works if they fail to load.
    getRoles().then((res) => {
      if (res?.data) setRoles(res.data.data);
      else toast.error(`Roles: ${getErrorMessage(res)}`);
    });
  }, []);

  if (!rows) return <ApiListFallback title={TITLE} subtitle={SUBTITLE} error={error} onRetry={reload} />;

  const roleNames = roles.length ? roles.map((r) => r.name) : [...new Set(rows.map((e) => e.roleName))];
  // The API refuses roles with permissions you don't hold; the list still shows them so the 403 explains why.
  const roleOptions = roles.map((r) => ({ value: String(r.id), label: r.name }));
  const defaultRole = roles.find((r) => r.slug === "support") ?? roles.find((r) => !r.is_system);

  return (
    <ResourcePage
      title={TITLE}
      subtitle={SUBTITLE}
      noun="employees"
      headerActions={headerActions}
      rows={rows}
      onRowClick={(e) => router.push(`/employees/${e.id}`)}
      stats={[
        { label: "Team members", value: (r) => r.length, icon: <LuUsers size={20} /> },
        { label: "Active", value: (r) => r.filter((e) => e.status === "Active").length, icon: <LuUserCheck size={20} />, tone: "success" },
        { label: "Pending", value: (r) => r.filter((e) => e.status === "Pending").length, icon: <LuMail size={20} />, tone: "warning" },
        { label: "Without 2FA", value: (r) => r.filter((e) => !e.two_factor_enabled).length, icon: <LuShieldAlert size={20} />, tone: "error" },
      ]}
      tabs={{ field: "status", options: ["All", "Active", "Pending", "Suspended"] }}
      search={{ keys: ["name", "email", "phone"], placeholder: "Search by name, email or phone" }}
      filters={[{ field: "roleName", label: "Role", options: roleNames }]}
      columns={[
        { key: "name", label: "Employee", minWidth: 220, render: (e) => <PersonCell name={e.name} sub={e.email} tone={roleTone(e.role)} /> },
        {
          key: "roleName",
          label: "Role",
          render: (e) => (
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
              <RoleTag role={e.role} />
              {e.extra_permissions_count > 0 && <Tag>+{e.extra_permissions_count} extra</Tag>}
            </Box>
          ),
        },
        { key: "two_factor_enabled", label: "2FA", render: (e) => (e.two_factor_enabled ? <Tag tone="success">On</Tag> : <Tag tone="error">Off</Tag>) },
        {
          key: "lastActive",
          label: "Last active",
          render: (e) => (
            <Box component="span" sx={{ color: e.lastActive ? "text.secondary" : "text.disabled", whiteSpace: "nowrap" }}>
              {e.lastActive ? formatLocalDateTime(e.lastActive) : "Never"}
            </Box>
          ),
        },
        {
          key: "status",
          label: "Status",
          render: (e) => (
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
              <StatusChip status={e.status} />
              {e.is_locked && <Tag tone="warning">Locked</Tag>}
            </Box>
          ),
        },
      ]}
      rowActions={(e, api) => [
        { label: "View details", icon: <LuEye size={15} />, onClick: () => router.push(`/employees/${e.id}`) },
        e.status === "Active" && {
          label: "Suspend",
          icon: <LuBan size={15} />,
          tone: "error",
          onClick: () =>
            api.confirm({
              title: `Suspend ${e.name}?`,
              body: "They'll be signed out right away and can't sign in until reactivated.",
              confirmLabel: "Suspend",
              tone: "error",
              onConfirm: () => changeStatus(e, "SUSPENDED", api),
            }),
        },
        e.status !== "Active" && {
          label: e.status === "Pending" ? "Activate" : "Reactivate",
          icon: <LuRotateCcw size={15} />,
          onClick: () => changeStatus(e, "ACTIVE", api),
        },
      ]}
      form={{
        entity: "employee",
        defaults: { role_id: defaultRole ? String(defaultRole.id) : "", status: "ACTIVE" },
        fields: [
          { name: "f_name", label: "First name", required: true, half: true },
          { name: "l_name", label: "Last name", required: true, half: true },
          { name: "email", label: "Work email", type: "email", required: true, half: true },
          { name: "phone", label: "Phone", half: true },
          { name: "role_id", label: "Role", type: "select", options: roleOptions, required: true, half: true },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [{ value: "ACTIVE", label: "Active (can sign in)" }, { value: "PENDING", label: "Pending (activate later)" }],
            half: true,
          },
          {
            name: "password",
            label: "Initial password",
            type: "password",
            required: true,
            helperText: "At least 6 characters. Share it with the employee; new devices also need an email code.",
          },
        ],
        // Only adding is supported here: details, status and access are managed per employee.
        canEdit: () => false,
        canDelete: () => false,
        onSave: save,
      }}
    />
  );
}
