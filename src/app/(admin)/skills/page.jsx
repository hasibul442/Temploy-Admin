"use client";
import { LuSparkles, LuUsers, LuClipboardCheck, LuCircleCheck } from "react-icons/lu";
import ResourcePage from "@/components/common/ResourcePage";
import { TitleCell, ActiveSwitch, Tag } from "@/components/common/cells";
import { skills, CATEGORY_NAMES } from "@/data/marketplace";
import { formatNumber, formatStat } from "@/helper/format";

export default function SkillsPage() {
  return (
    <ResourcePage
      title="Skills"
      subtitle="Skills freelancers can list on their profile and clients can search by."
      noun="skills"
      rows={skills}
      stats={[
        { label: "Total skills", value: (r) => r.length, icon: <LuSparkles size={20} /> },
        { label: "Active", value: (r) => r.filter((s) => s.active).length, icon: <LuCircleCheck size={20} />, tone: "success" },
        { label: "With skill test", value: (r) => r.filter((s) => s.hasTest).length, icon: <LuClipboardCheck size={20} />, tone: "info" },
        { label: "Freelancers tagged", value: (r) => formatStat(r.reduce((s, x) => s + x.freelancers, 0)), icon: <LuUsers size={20} />, tone: "warning" },
      ]}
      search={{ keys: ["name", "category"], placeholder: "Search skills" }}
      filters={[{ field: "category", label: "Category", options: CATEGORY_NAMES }]}
      minWidth={760}
      columns={[
        { key: "name", label: "Skill", render: (s) => <TitleCell title={s.name} sub={s.id} /> },
        { key: "category", label: "Category" },
        { key: "freelancers", label: "Freelancers", align: "right", render: (s) => <span className="num">{formatNumber(s.freelancers)}</span> },
        { key: "jobs", label: "Jobs", align: "right", render: (s) => <span className="num">{formatNumber(s.jobs)}</span> },
        { key: "hasTest", label: "Skill test", render: (s) => (s.hasTest ? <Tag tone="info">Has test</Tag> : <Tag>No test</Tag>) },
        { key: "active", label: "Active", render: (s, api) => <ActiveSwitch row={s} api={api} entity="Skill" /> },
      ]}
      form={{
        entity: "skill",
        defaults: { freelancers: 0, jobs: 0, hasTest: false, active: true, category: CATEGORY_NAMES[0] },
        fields: [
          { name: "name", label: "Skill name", required: true },
          { name: "category", label: "Category", type: "select", options: CATEGORY_NAMES },
          { name: "hasTest", label: "Has a skill test", type: "switch", half: true },
          { name: "active", label: "Active", type: "switch", half: true },
        ],
      }}
    />
  );
}
