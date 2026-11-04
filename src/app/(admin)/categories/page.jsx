"use client";
import { LuFolderTree, LuCircleCheck, LuBriefcase } from "react-icons/lu";
import ResourcePage from "@/components/common/ResourcePage";
import { TitleCell, ActiveSwitch } from "@/components/common/cells";
import { categories, subcategories } from "@/data/settings";
import { formatNumber } from "@/helper/format";

const slugify = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const subCount = (name) => subcategories.filter((s) => s.category === name).length;

export default function CategoriesPage() {
  return (
    <ResourcePage
      title="Categories"
      subtitle="Top-level groups used to organise jobs, offers and skills."
      noun="categories"
      rows={categories}
      stats={[
        { label: "Categories", value: (r) => r.length, icon: <LuFolderTree size={20} /> },
        { label: "Active", value: (r) => r.filter((c) => c.active).length, icon: <LuCircleCheck size={20} />, tone: "success" },
        { label: "Jobs posted", value: (r) => formatNumber(r.reduce((s, c) => s + c.jobs, 0)), icon: <LuBriefcase size={20} />, tone: "info" },
      ]}
      search={{ keys: ["name", "slug", "description"], placeholder: "Search categories" }}
      columns={[
        { key: "name", label: "Category", render: (c) => <TitleCell title={c.name} sub={`/${c.slug}`} maxWidth={240} /> },
        {
          key: "description",
          label: "Description",
          render: (c) => (
            <TitleCell title={<span style={{ fontWeight: 400, color: "inherit" }}>{c.description}</span>} maxWidth={340} />
          ),
        },
        { key: "subs", label: "Subcategories", align: "right", render: (c) => <span className="num">{subCount(c.name)}</span> },
        { key: "jobs", label: "Jobs", align: "right", render: (c) => <span className="num">{formatNumber(c.jobs)}</span> },
        { key: "active", label: "Active", align: "center", render: (c, api) => <ActiveSwitch row={c} api={api} entity="Category" /> },
      ]}
      form={{
        entity: "category",
        defaults: { active: true, jobs: 0, slug: "", description: "" },
        fields: [
          { name: "name", label: "Name", required: true, half: true },
          { name: "slug", label: "Slug", half: true, helperText: "Leave blank to generate from the name" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "active", label: "Active (visible to users)", type: "switch" },
        ],
        toRow: (v) => ({ slug: v.slug?.trim() ? slugify(v.slug) : slugify(v.name) }),
      }}
    />
  );
}
