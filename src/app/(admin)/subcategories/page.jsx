"use client";
import { LuFolders, LuCircleCheck, LuBriefcase } from "react-icons/lu";
import ResourcePage from "@/components/common/ResourcePage";
import { TitleCell, ActiveSwitch, Tag } from "@/components/common/cells";
import { subcategories, CATEGORY_OPTIONS } from "@/data/settings";
import { formatNumber } from "@/helper/format";

const slugify = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function SubcategoriesPage() {
  return (
    <ResourcePage
      title="Subcategories"
      subtitle="Second-level groups inside each category."
      noun="subcategories"
      rows={subcategories}
      stats={[
        { label: "Subcategories", value: (r) => r.length, icon: <LuFolders size={20} /> },
        { label: "Active", value: (r) => r.filter((s) => s.active).length, icon: <LuCircleCheck size={20} />, tone: "success" },
        { label: "Jobs posted", value: (r) => formatNumber(r.reduce((s, c) => s + c.jobs, 0)), icon: <LuBriefcase size={20} />, tone: "info" },
      ]}
      search={{ keys: ["name", "slug"], placeholder: "Search subcategories" }}
      filters={[{ field: "category", label: "Category", options: CATEGORY_OPTIONS }]}
      columns={[
        { key: "name", label: "Subcategory", render: (s) => <TitleCell title={s.name} sub={`/${s.slug}`} /> },
        { key: "category", label: "Category", render: (s) => <Tag>{s.category}</Tag> },
        { key: "jobs", label: "Jobs", align: "right", render: (s) => <span className="num">{formatNumber(s.jobs)}</span> },
        { key: "active", label: "Active", align: "center", render: (s, api) => <ActiveSwitch row={s} api={api} entity="Subcategory" /> },
      ]}
      form={{
        entity: "subcategory",
        defaults: { active: true, jobs: 0, slug: "", category: CATEGORY_OPTIONS[0] },
        fields: [
          { name: "name", label: "Name", required: true, half: true },
          { name: "category", label: "Parent category", type: "select", options: CATEGORY_OPTIONS, required: true, half: true },
          { name: "slug", label: "Slug", helperText: "Leave blank to generate from the name" },
          { name: "active", label: "Active (visible to users)", type: "switch" },
        ],
        toRow: (v) => ({ slug: v.slug?.trim() ? slugify(v.slug) : slugify(v.name) }),
      }}
    />
  );
}
