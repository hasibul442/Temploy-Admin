"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LuFolders, LuCircleCheck, LuBriefcase, LuFolderTree } from "react-icons/lu";
import { toast } from "react-toastify";
import ResourcePage from "@/components/common/ResourcePage";
import StatusChip from "@/components/common/StatusChip";
import { TitleCell, RemoteSwitch, Tag } from "@/components/common/cells";
import { useApiList, ApiListFallback } from "@/components/common/ApiList";
import {
  categoryToRow,
  subCategoryToRow,
  subCategoryBody,
  subCategoryInUse,
  subCategoryFields,
  SUB_CATEGORY_DEFAULTS,
} from "@/components/categories/categoryForms";
import { formatNumber } from "@/helper/format";
import { getErrorMessage } from "@/utils/services/api/apiError";
import {
  getCategories,
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "@/utils/services/api/CategoryService";

const TITLE = "Subcategories";
const SUBTITLE = "Second-level groups inside each category.";

// Module-level so useApiList doesn't reload on every render.
const fetchSubCategories = () => getSubCategories();
const fetchCategories = () => getCategories();

async function toggleActive(row, checked) {
  const res = await updateSubCategory(row.id, { status: checked });
  if (!res?.data) {
    toast.error(getErrorMessage(res));
    return null;
  }
  toast.success(`${row.sub_cat_name} ${checked ? "enabled" : "disabled"}`);
  return subCategoryToRow(res.data.data);
}

async function remove(row) {
  const res = await deleteSubCategory(row.id);
  if (!res?.data) toast.error(getErrorMessage(res));
  return Boolean(res?.data);
}

export default function SubcategoriesPage() {
  const router = useRouter();
  const subs = useApiList(fetchSubCategories, subCategoryToRow);
  const cats = useApiList(fetchCategories, categoryToRow);

  if (!subs.rows || !cats.rows) {
    const error = subs.error || cats.error;
    const retry = () => {
      if (subs.error) subs.reload();
      if (cats.error) cats.reload();
    };
    return <ApiListFallback title={TITLE} subtitle={SUBTITLE} error={error} onRetry={retry} />;
  }

  // The form's parent select works by name (names are unique); map it back to the id on save.
  const categoryOptions = cats.rows.map((c) => c.cat_name);
  const idByName = Object.fromEntries(cats.rows.map((c) => [c.cat_name, c.id]));

  const save = async (values, id) => {
    const body = subCategoryBody(values, idByName[values.category]);
    const res = id == null ? await createSubCategory(body) : await updateSubCategory(id, body);
    if (!res?.data) {
      toast.error(getErrorMessage(res));
      return null;
    }
    return subCategoryToRow(res.data.data);
  };

  return (
    <ResourcePage
      title={TITLE}
      subtitle={SUBTITLE}
      noun="subcategories"
      rows={subs.rows}
      stats={[
        { label: "Subcategories", value: (r) => r.length, icon: <LuFolders size={20} /> },
        { label: "Active", value: (r) => r.filter((s) => s.active).length, icon: <LuCircleCheck size={20} />, tone: "success" },
        { label: "Jobs posted", value: (r) => formatNumber(r.reduce((s, c) => s + c.jobs, 0)), icon: <LuBriefcase size={20} />, tone: "info" },
      ]}
      tabs={{ field: "state", options: ["All", "Active", "Inactive"] }}
      search={{ keys: ["sub_cat_name", "slug", "category"], placeholder: "Search subcategories" }}
      filters={[{ field: "category", label: "Category", options: categoryOptions }]}
      columns={[
        { key: "sub_cat_name", label: "Subcategory", render: (s) => <TitleCell title={s.sub_cat_name} sub={`/${s.slug}`} /> },
        {
          key: "category",
          label: "Category",
          render: (s) => <Link href={`/categories/${s.cat_id}`}><Tag>{s.category}</Tag></Link>,
        },
        { key: "jobs", label: "Jobs", align: "right", render: (s) => <span className="num">{formatNumber(s.jobs)}</span> },
        { key: "gigs", label: "Gigs", align: "right", render: (s) => <span className="num">{formatNumber(s.gigs)}</span> },
        { key: "state", label: "Status", render: (s) => <StatusChip status={s.state} /> },
        {
          key: "active",
          label: "Active",
          align: "center",
          render: (s, api) => (
            <RemoteSwitch row={s} api={api} label={`${s.sub_cat_name} active`} onToggle={(checked) => toggleActive(s, checked)} />
          ),
        },
      ]}
      rowActions={(s) => [{ label: "Open category", icon: <LuFolderTree size={15} />, onClick: () => router.push(`/categories/${s.cat_id}`) }]}
      form={{
        entity: "subcategory",
        defaults: { ...SUB_CATEGORY_DEFAULTS, category: categoryOptions[0] ?? "" },
        fields: subCategoryFields(categoryOptions),
        // Used ones can only be turned off; the API refuses the delete.
        canDelete: (s) => !subCategoryInUse(s),
        onSave: save,
        onDelete: remove,
      }}
    />
  );
}
