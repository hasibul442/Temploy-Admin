"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import { LuFolderTree, LuCircleCheck, LuBriefcase, LuEye } from "react-icons/lu";
import { toast } from "react-toastify";
import ResourcePage from "@/components/common/ResourcePage";
import StatusChip from "@/components/common/StatusChip";
import { TitleCell, RemoteSwitch } from "@/components/common/cells";
import { useApiList, ApiListFallback } from "@/components/common/ApiList";
import {
  categoryToRow,
  categoryBody,
  categoryInUse,
  CATEGORY_FIELDS,
  CATEGORY_DEFAULTS,
  ColorDot,
} from "@/components/categories/categoryForms";
import { formatNumber } from "@/helper/format";
import { getErrorMessage } from "@/utils/services/api/apiError";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/utils/services/api/CategoryService";

const TITLE = "Categories";
const SUBTITLE = "Top-level groups for jobs and gigs. Open one to manage its subcategories.";

// Module-level so useApiList doesn't reload on every render.
const fetchCategories = () => getCategories();

async function save(values, id) {
  const body = categoryBody(values);
  const res = id == null ? await createCategory(body) : await updateCategory(id, body);
  if (!res?.data) {
    toast.error(getErrorMessage(res));
    return null;
  }
  return categoryToRow(res.data.data);
}

async function toggleActive(row, checked) {
  const res = await updateCategory(row.id, { status: checked });
  if (!res?.data) {
    toast.error(getErrorMessage(res));
    return null;
  }
  toast.success(`${row.cat_name} ${checked ? "enabled" : "disabled"}`);
  return categoryToRow(res.data.data);
}

async function remove(row) {
  const res = await deleteCategory(row.id);
  if (!res?.data) toast.error(getErrorMessage(res));
  return Boolean(res?.data);
}

export default function CategoriesPage() {
  const router = useRouter();
  const { rows, error, reload } = useApiList(fetchCategories, categoryToRow);
  if (!rows) return <ApiListFallback title={TITLE} subtitle={SUBTITLE} error={error} onRetry={reload} />;

  return (
    <ResourcePage
      title={TITLE}
      subtitle={SUBTITLE}
      noun="categories"
      rows={rows}
      stats={[
        { label: "Categories", value: (r) => r.length, icon: <LuFolderTree size={20} /> },
        { label: "Active", value: (r) => r.filter((c) => c.active).length, icon: <LuCircleCheck size={20} />, tone: "success" },
        { label: "Jobs posted", value: (r) => formatNumber(r.reduce((s, c) => s + c.jobs, 0)), icon: <LuBriefcase size={20} />, tone: "info" },
      ]}
      tabs={{ field: "state", options: ["All", "Active", "Inactive"] }}
      search={{ keys: ["cat_name", "slug", "description"], placeholder: "Search categories" }}
      columns={[
        {
          key: "cat_name",
          label: "Category",
          minWidth: 220,
          render: (c) => (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <ColorDot color={c.color} />
              <Link href={`/categories/${c.id}`} style={{ minWidth: 0 }}>
                <TitleCell title={c.cat_name} sub={`/${c.slug}`} maxWidth={240} />
              </Link>
            </Box>
          ),
        },
        {
          key: "description",
          label: "Description",
          render: (c) => (
            <TitleCell title={<span style={{ fontWeight: 400, color: "inherit" }}>{c.description || "—"}</span>} maxWidth={340} />
          ),
        },
        { key: "subs", label: "Subcategories", align: "right", render: (c) => <span className="num">{c.subs}</span> },
        { key: "jobs", label: "Jobs", align: "right", render: (c) => <span className="num">{formatNumber(c.jobs)}</span> },
        { key: "state", label: "Status", render: (c) => <StatusChip status={c.state} /> },
        {
          key: "active",
          label: "Active",
          align: "center",
          render: (c, api) => (
            <RemoteSwitch row={c} api={api} label={`${c.cat_name} active`} onToggle={(checked) => toggleActive(c, checked)} />
          ),
        },
      ]}
      rowActions={(c) => [{ label: "View details", icon: <LuEye size={15} />, onClick: () => router.push(`/categories/${c.id}`) }]}
      form={{
        entity: "category",
        defaults: CATEGORY_DEFAULTS,
        fields: CATEGORY_FIELDS,
        // Used ones can only be turned off; the API refuses the delete.
        canDelete: (c) => !categoryInUse(c),
        onSave: save,
        onDelete: remove,
      }}
    />
  );
}
