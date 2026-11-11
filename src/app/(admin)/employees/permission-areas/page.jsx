"use client";
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { LuLayoutGrid, LuCircleCheck, LuCircleOff } from "react-icons/lu";
import { toast } from "react-toastify";
import ResourcePage from "@/components/common/ResourcePage";
import StatusChip from "@/components/common/StatusChip";
import { RemoteSwitch, Tag, TitleCell } from "@/components/common/cells";
import { useApiList, ApiListFallback } from "@/components/common/ApiList";
import TeamNav from "@/components/team/TeamNav";
import { PERMISSION_ACTIONS } from "@/data/team";
import { humanize } from "@/helper/format";
import { getErrorMessage } from "@/utils/services/api/apiError";
import {
  createPermissionModule,
  deletePermissionModule,
  getMyProfile,
  getPermissionModules,
  updatePermissionModule,
} from "@/utils/services/api/EmployeeService";

/*
 * Permission areas (GET /admin/permission-modules?usage=true): the rows of every permission matrix. A new feature
 * (e.g. a blog) gets an area here; the gateway's routes for it check the area's key. Super admins add, edit, switch off
 * and delete areas; everyone else with team.view sees the list.
 */

const TITLE = "Employees & roles";
const SUBTITLE = "Areas of the console that roles and employees get permissions on.";

const fetchAreas = () => getPermissionModules({ usage: true });

/** API area → row. One switch per action, named action_<x>, so the Add / Edit form pre-fills. */
function toRow(m) {
  return {
    ...m,
    ...Object.fromEntries(PERMISSION_ACTIONS.map((a) => [`action_${a}`, m.actions.includes(a)])),
    state: m.is_active ? "Active" : "Inactive",
    usedBy: m.usage.roles + m.usage.employees,
  };
}

function toBody(values) {
  return {
    name: String(values.name ?? "").trim(),
    description: String(values.description ?? "").trim(),
    actions: PERMISSION_ACTIONS.filter((a) => values[`action_${a}`]),
    sort_order: Number(values.sort_order) || 0,
    is_active: Boolean(values.is_active),
  };
}

async function save(values, id) {
  const body = toBody(values);
  if (!body.actions.length) {
    toast.error("Pick at least one action");
    return null;
  }
  // The key is set once: the gateway's routes check it.
  const res = id == null
    ? await createPermissionModule({ ...body, key: String(values.key ?? "").trim().toLowerCase() })
    : await updatePermissionModule(id, body);
  if (!res?.data) {
    toast.error(getErrorMessage(res));
    return null;
  }
  return toRow(res.data.data);
}

async function toggleActive(row, checked) {
  const res = await updatePermissionModule(row.id, { is_active: checked });
  if (!res?.data) {
    toast.error(getErrorMessage(res));
    return null;
  }
  toast.success(`${row.name} switched ${checked ? "on" : "off"}`);
  return toRow(res.data.data);
}

async function remove(row) {
  const res = await deletePermissionModule(row.id);
  if (!res?.data) toast.error(getErrorMessage(res));
  return Boolean(res?.data);
}

export default function PermissionAreasPage() {
  const { rows, error, reload } = useApiList(fetchAreas, toRow);
  const [me, setMe] = useState(null);

  useEffect(() => {
    getMyProfile().then((res) => res?.data && setMe(res.data.data));
  }, []);

  if (!rows) return <ApiListFallback title={TITLE} subtitle={SUBTITLE} error={error} onRetry={reload} />;

  const isSuperAdmin = Boolean(me?.role?.is_system);
  const nextOrder = Math.max(0, ...rows.map((r) => r.sort_order)) + 10;

  return (
    <ResourcePage
      title={TITLE}
      subtitle={SUBTITLE}
      noun="permission areas"
      headerActions={<TeamNav />}
      rows={rows}
      stats={[
        { label: "Areas", value: (r) => r.length, icon: <LuLayoutGrid size={20} /> },
        { label: "Switched on", value: (r) => r.filter((m) => m.is_active).length, icon: <LuCircleCheck size={20} />, tone: "success" },
        { label: "Switched off", value: (r) => r.filter((m) => !m.is_active).length, icon: <LuCircleOff size={20} />, tone: "warning" },
      ]}
      tabs={{ field: "state", options: ["All", "Active", "Inactive"], labels: { Active: "On", Inactive: "Off" } }}
      search={{ keys: ["name", "key", "description"], placeholder: "Search by name, key or description" }}
      columns={[
        { key: "name", label: "Area", minWidth: 220, render: (m) => <TitleCell title={m.name} sub={m.description || "—"} /> },
        {
          key: "key",
          label: "Key",
          render: (m) => (
            <Box component="code" sx={{ fontSize: 12.5, px: 0.75, py: 0.25, borderRadius: 1, bgcolor: "action.hover" }}>{m.key}</Box>
          ),
        },
        {
          key: "actions",
          label: "Actions",
          render: (m) => (
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {m.actions.map((a) => <Tag key={a}>{humanize(a)}</Tag>)}
            </Box>
          ),
        },
        {
          key: "usedBy",
          label: "Used by",
          render: (m) => (
            <Typography sx={{ fontSize: 13, color: m.usedBy ? "text.primary" : "text.disabled" }}>
              {m.usage.roles} {m.usage.roles === 1 ? "role" : "roles"}
              {m.usage.employees ? ` · ${m.usage.employees} employee${m.usage.employees === 1 ? "" : "s"}` : ""}
            </Typography>
          ),
        },
        { key: "sort_order", label: "Order", align: "center", render: (m) => <span className="num">{m.sort_order}</span> },
        isSuperAdmin
          ? {
              key: "is_active",
              label: "On",
              align: "center",
              render: (m, api) => (
                <RemoteSwitch row={m} api={api} field="is_active" label={`${m.name} on`} onToggle={(checked) => toggleActive(m, checked)} />
              ),
            }
          : { key: "state", label: "Status", render: (m) => <StatusChip status={m.state} /> },
      ]}
      form={
        isSuperAdmin
          ? {
              entity: "permission area",
              defaults: {
                ...Object.fromEntries(PERMISSION_ACTIONS.map((a) => [`action_${a}`, true])),
                is_active: true,
                sort_order: nextOrder,
              },
              fields: [
                {
                  name: "key",
                  label: "Key",
                  required: true,
                  half: true,
                  helperText: "e.g. blog. Lowercase, numbers and _. Can't be changed later: the API's routes check it.",
                },
                { name: "name", label: "Name", required: true, half: true, helperText: "Shown in the permission lists, e.g. Blog" },
                { name: "description", label: "Description", type: "textarea", helperText: "What this area covers, e.g. Posts and comments" },
                ...PERMISSION_ACTIONS.map((a) => ({ name: `action_${a}`, label: `${humanize(a)} action`, type: "switch", half: true })),
                { name: "sort_order", label: "Order", type: "number", half: true, helperText: "Lower numbers come first" },
                { name: "is_active", label: "Switched on", type: "switch", half: true },
              ],
              // Deleting an area someone has permissions on is refused (switch it off instead).
              canDelete: (m) => m.usage.grants === 0,
              onSave: save,
              onDelete: remove,
            }
          : undefined
      }
    />
  );
}
