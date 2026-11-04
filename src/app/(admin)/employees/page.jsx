"use client";
import { Box } from "@mui/material";
import { LuUsers, LuUserCheck, LuMail, LuShieldAlert, LuKeyRound, LuBan, LuRotateCcw, LuSend } from "react-icons/lu";
import ResourcePage, { DetailList } from "@/components/common/ResourcePage";
import StatusChip from "@/components/common/StatusChip";
import { PersonCell, DateCell, Tag } from "@/components/common/cells";
import TeamNav from "@/components/team/TeamNav";
import { employees, roles, ROLE_NAMES } from "@/data/team";

const roleTone = Object.fromEntries(roles.map((r) => [r.name, r.tone]));
const RoleTag = ({ role }) => <Tag tone={roleTone[role]}>{role}</Tag>;

export default function EmployeesPage() {
  return (
    <ResourcePage
      title="Employees & roles"
      subtitle="Staff accounts with access to this admin console."
      noun="employees"
      headerActions={<TeamNav />}
      rows={employees}
      stats={[
        { label: "Team members", value: (r) => r.length, icon: <LuUsers size={20} /> },
        { label: "Active", value: (r) => r.filter((e) => e.status === "Active").length, icon: <LuUserCheck size={20} />, tone: "success" },
        { label: "Pending invites", value: (r) => r.filter((e) => e.status === "Pending").length, icon: <LuMail size={20} />, tone: "warning" },
        { label: "Without 2FA", value: (r) => r.filter((e) => !e.twoFactor).length, icon: <LuShieldAlert size={20} />, tone: "error" },
      ]}
      tabs={{ field: "status", options: ["All", "Active", "Pending", "Suspended"], labels: { Pending: "Invited" } }}
      search={{ keys: ["name", "email"], placeholder: "Search by name or email" }}
      filters={[{ field: "role", label: "Role", options: ROLE_NAMES }]}
      columns={[
        { key: "name", label: "Employee", render: (e) => <PersonCell name={e.name} sub={e.email} tone={roleTone[e.role]} /> },
        { key: "role", label: "Role", render: (e) => <RoleTag role={e.role} /> },
        { key: "twoFactor", label: "2FA", render: (e) => (e.twoFactor ? <Tag tone="success">On</Tag> : <Tag tone="error">Off</Tag>) },
        { key: "lastActive", label: "Last active", render: (e) => (e.lastActive ? <DateCell value={e.lastActive} /> : <Box component="span" sx={{ color: "text.disabled" }}>Never</Box>) },
        { key: "status", label: "Status", render: (e) => <StatusChip status={e.status === "Pending" ? "Pending" : e.status} /> },
      ]}
      rowActions={(e, api) => [
        { label: "View details", icon: <LuUsers size={15} />, onClick: () => api.openDetail(e) },
        e.status === "Pending" && { label: "Resend invite", icon: <LuSend size={15} />, onClick: () => api.update(e.id, {}, `Invite re-sent to ${e.email}`) },
        e.status === "Active" && { label: "Reset password", icon: <LuKeyRound size={15} />, onClick: () => api.update(e.id, {}, `Password reset link sent to ${e.email}`) },
        e.status === "Active" &&
          e.role !== "Super admin" && {
            label: "Suspend",
            icon: <LuBan size={15} />,
            tone: "error",
            onClick: () =>
              api.confirm({
                title: `Suspend ${e.name}?`,
                body: "They'll be signed out and lose access until reactivated.",
                confirmLabel: "Suspend",
                tone: "error",
                onConfirm: () => api.update(e.id, { status: "Suspended" }, `${e.name} suspended`),
              }),
          },
        e.status === "Suspended" && { label: "Reactivate", icon: <LuRotateCcw size={15} />, onClick: () => api.update(e.id, { status: "Active" }, `${e.name} reactivated`) },
      ]}
      form={{
        entity: "employee",
        fields: [
          { name: "name", label: "Full name", required: true },
          { name: "email", label: "Work email", required: true, half: true },
          { name: "role", label: "Role", type: "select", options: ROLE_NAMES.filter((r) => r !== "Super admin"), half: true },
        ],
        defaults: { role: "Support agent", status: "Pending", twoFactor: false, lastActive: null, joined: "2026-11-04" },
        canDelete: (e) => e.role !== "Super admin",
      }}
      detail={{
        title: (e) => e.name,
        render: (e) => (
          <>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <StatusChip status={e.status} />
              <RoleTag role={e.role} />
            </Box>
            <DetailList
              items={[
                { label: "Employee ID", value: e.id },
                { label: "Email", value: e.email },
                { label: "Role", value: e.role },
                { label: "Two-factor auth", value: e.twoFactor ? "Enabled" : "Not enabled" },
                { label: "Last active", value: e.lastActive ? <DateCell value={e.lastActive} /> : "Never" },
                { label: "Joined", value: <DateCell value={e.joined} /> },
              ]}
            />
          </>
        ),
      }}
    />
  );
}
