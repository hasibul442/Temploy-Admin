"use client";
import { LuSparkles, LuUsers, LuBriefcase, LuCircleCheck } from "react-icons/lu";
import { toast } from "react-toastify";
import ResourcePage from "@/components/common/ResourcePage";
import StatusChip from "@/components/common/StatusChip";
import { TitleCell, RemoteSwitch } from "@/components/common/cells";
import { useApiList, ApiListFallback } from "@/components/common/ApiList";
import { formatNumber } from "@/helper/format";
import { getErrorMessage } from "@/utils/services/api/apiError";
import { getSkills, createSkill, updateSkill, deleteSkill } from "@/utils/services/api/SkillService";

/*
 * Skills from the API (/admin/skills).
 */

const TITLE = "Skills";
const SUBTITLE = "Skills freelancers can list on their profile and jobs can ask for.";

/** API skill → row. Form field names (snake_case, as the API takes them) match the row keys so Edit pre-fills. */
function toRow(s) {
  return {
    id: s.id,
    name: s.skillName, // shown in ResourcePage's delete confirmation
    skill_name: s.skillName,
    slug: s.slug,
    description: s.description ?? "",
    active: Boolean(s.status),
    state: s.status ? "Active" : "Inactive",
    freelancers: s._count?.profileSkills ?? 0,
    jobs: s._count?.jobSkills ?? 0,
  };
}

function toBody(values) {
  return {
    skill_name: String(values.skill_name ?? "").trim(),
    slug: String(values.slug ?? "").trim(),
    description: String(values.description ?? "").trim(),
    status: Boolean(values.active),
  };
}

async function save(values, id) {
  const res = id == null ? await createSkill(toBody(values)) : await updateSkill(id, toBody(values));
  if (!res?.data) {
    toast.error(getErrorMessage(res));
    return null;
  }
  return toRow(res.data.data);
}

async function toggleActive(row, checked) {
  const res = await updateSkill(row.id, { status: checked });
  if (!res?.data) {
    toast.error(getErrorMessage(res));
    return null;
  }
  toast.success(`${row.skill_name} ${checked ? "enabled" : "disabled"}`);
  return toRow(res.data.data);
}

async function remove(row) {
  const res = await deleteSkill(row.id);
  if (!res?.data) toast.error(getErrorMessage(res));
  return Boolean(res?.data);
}

export default function SkillsPage() {
  const { rows, error, reload } = useApiList(getSkills, toRow);
  if (!rows) return <ApiListFallback title={TITLE} subtitle={SUBTITLE} error={error} onRetry={reload} />;

  return (
    <ResourcePage
      title={TITLE}
      subtitle={SUBTITLE}
      noun="skills"
      rows={rows}
      stats={[
        { label: "Total skills", value: (r) => r.length, icon: <LuSparkles size={20} /> },
        { label: "Active", value: (r) => r.filter((s) => s.active).length, icon: <LuCircleCheck size={20} />, tone: "success" },
        { label: "Freelancers tagged", value: (r) => formatNumber(r.reduce((s, x) => s + x.freelancers, 0)), icon: <LuUsers size={20} />, tone: "warning" },
        { label: "Jobs tagged", value: (r) => formatNumber(r.reduce((s, x) => s + x.jobs, 0)), icon: <LuBriefcase size={20} />, tone: "info" },
      ]}
      tabs={{ field: "state", options: ["All", "Active", "Inactive"] }}
      search={{ keys: ["skill_name", "slug", "description"], placeholder: "Search skills" }}
      minWidth={760}
      columns={[
        { key: "skill_name", label: "Skill", render: (s) => <TitleCell title={s.skill_name} sub={`/${s.slug}`} /> },
        {
          key: "description",
          label: "Description",
          render: (s) => <TitleCell title={<span style={{ fontWeight: 400 }}>{s.description || "—"}</span>} maxWidth={320} />,
        },
        { key: "freelancers", label: "Freelancers", align: "right", render: (s) => <span className="num">{formatNumber(s.freelancers)}</span> },
        { key: "jobs", label: "Jobs", align: "right", render: (s) => <span className="num">{formatNumber(s.jobs)}</span> },
        { key: "state", label: "Status", render: (s) => <StatusChip status={s.state} /> },
        {
          key: "active",
          label: "Active",
          align: "center",
          render: (s, api) => (
            <RemoteSwitch row={s} api={api} label={`${s.skill_name} active`} onToggle={(checked) => toggleActive(s, checked)} />
          ),
        },
      ]}
      form={{
        entity: "skill",
        defaults: { active: true, slug: "", description: "" },
        fields: [
          { name: "skill_name", label: "Skill name", required: true, half: true },
          { name: "slug", label: "Slug", half: true, helperText: "Leave blank to generate from the name" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "active", label: "Active (freelancers and jobs can pick it)", type: "switch" },
        ],
        // Used ones can only be turned off; the API refuses the delete.
        canDelete: (s) => s.freelancers + s.jobs === 0,
        onSave: save,
        onDelete: remove,
      }}
    />
  );
}
