"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  LuArrowLeft,
  LuPencil,
  LuPlus,
  LuTrash2,
  LuRefreshCw,
  LuFolders,
  LuCircleCheck,
  LuBriefcase,
  LuStore,
} from "react-icons/lu";
import { toast } from "react-toastify";
import PageHeader from "@/components/common/PageHeader";
import SectionCard from "@/components/common/SectionCard";
import StatusChip from "@/components/common/StatusChip";
import Facts from "@/components/common/Facts";
import { StatTiles } from "@/components/common/ResourcePage";
import { TitleCell } from "@/components/common/cells";
import {
  categoryToRow,
  categoryBody,
  categoryInUse,
  subCategoryToRow,
  subCategoryBody,
  subCategoryInUse,
  subCategoryFields,
  CATEGORY_FIELDS,
  SUB_CATEGORY_DEFAULTS,
  FormDialog,
  valuesFrom,
  ColorDot,
} from "@/components/categories/categoryForms";
import { formatLocalDateTime, formatNumber } from "@/helper/format";
import { getErrorMessage } from "@/utils/services/api/apiError";
import {
  getCategory,
  updateCategory,
  deleteCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "@/utils/services/api/CategoryService";

/*
 * Category details from GET /admin/categories/:id: the category's fields and usage, and its subcategories,
 * which can be added, edited, turned on/off and deleted here (the parent is fixed to this category).
 */

const SUB_FIELDS = subCategoryFields();

export default function CategoryDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [category, setCategory] = useState(null); // API category (with subCategories)
  const [error, setError] = useState(null);
  const [dialog, setDialog] = useState(null); // { kind: "category" } | { kind: "sub", row? }
  const [confirm, setConfirm] = useState(null); // { title, body, onConfirm }
  const [pendingId, setPendingId] = useState(null); // subcategory whose switch is saving

  const load = useCallback(async () => {
    setError(null);
    const res = await getCategory(id);
    if (res?.data) setCategory(res.data.data);
    else setError(getErrorMessage(res));
  }, [id]);

  useEffect(() => {
    // Fetch on mount; state is set after the await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const back = <Button href="/categories" color="inherit" startIcon={<LuArrowLeft size={16} />}>All categories</Button>;

  if (!category) {
    return (
      <>
        <PageHeader title={`Category #${id}`} actions={back} />
        <Card sx={{ py: 6, textAlign: "center" }}>
          {error ? (
            <>
              <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
              <Button variant="outlined" startIcon={<LuRefreshCw size={15} />} onClick={load}>Try again</Button>
            </>
          ) : (
            <CircularProgress size={28} aria-label="Loading category" />
          )}
        </Card>
      </>
    );
  }

  const row = categoryToRow(category);
  const subs = category.subCategories.map(subCategoryToRow);

  // ---- category ----
  const saveCategory = async (values) => {
    const res = await updateCategory(category.id, categoryBody(values));
    if (!res?.data) {
      toast.error(getErrorMessage(res));
      return false;
    }
    toast.success("Category updated");
    // The update response has no subcategories; keep the ones already loaded.
    setCategory((c) => ({ ...c, ...res.data.data }));
    return true;
  };

  const askDeleteCategory = () =>
    setConfirm({
      title: "Delete category?",
      body: `"${row.cat_name}" will be removed. This can't be undone.`,
      onConfirm: async () => {
        const res = await deleteCategory(category.id);
        if (!res?.data) return toast.error(getErrorMessage(res));
        toast.success("Category deleted");
        router.push("/categories");
      },
    });

  // ---- subcategories ----
  const saveSub = async (values, sub) => {
    const body = subCategoryBody(values, category.id);
    const res = sub ? await updateSubCategory(sub.id, body) : await createSubCategory(body);
    if (!res?.data) {
      toast.error(getErrorMessage(res));
      return false;
    }
    toast.success(sub ? "Subcategory updated" : "Subcategory added");
    load(); // refreshes the list and the category's counts
    return true;
  };

  const toggleSub = async (sub, checked) => {
    setPendingId(sub.id);
    const res = await updateSubCategory(sub.id, { status: checked });
    setPendingId(null);
    if (!res?.data) return toast.error(getErrorMessage(res));
    toast.success(`${sub.sub_cat_name} ${checked ? "enabled" : "disabled"}`);
    setCategory((c) => ({
      ...c,
      subCategories: c.subCategories.map((s) => (s.id === sub.id ? { ...s, status: res.data.data.status } : s)),
    }));
  };

  const askDeleteSub = (sub) =>
    setConfirm({
      title: "Delete subcategory?",
      body: `"${sub.sub_cat_name}" will be removed. This can't be undone.`,
      onConfirm: async () => {
        const res = await deleteSubCategory(sub.id);
        if (!res?.data) return toast.error(getErrorMessage(res));
        toast.success("Subcategory deleted");
        load();
      },
    });

  const addSub = () => setDialog({ kind: "sub" });
  const inUse = categoryInUse(row);

  return (
    <>
      <PageHeader
        title={row.cat_name}
        subtitle={`#${row.id} · /${row.slug} · updated ${formatLocalDateTime(category.updatedAt)}`}
        actions={
          <>
            {back}
            <Tooltip title={inUse ? "Used by subcategories, jobs or gigs. Turn it off instead." : ""}>
              <span>
                <Button color="error" variant="outlined" startIcon={<LuTrash2 size={16} />} onClick={askDeleteCategory} disabled={inUse}>
                  Delete
                </Button>
              </span>
            </Tooltip>
            <Button variant="contained" startIcon={<LuPencil size={16} />} onClick={() => setDialog({ kind: "category" })}>
              Edit category
            </Button>
          </>
        }
      />

      <StatTiles
        rows={[]}
        stats={[
          { label: "Subcategories", value: subs.length, icon: <LuFolders size={20} /> },
          { label: "Active subcategories", value: subs.filter((s) => s.active).length, icon: <LuCircleCheck size={20} />, tone: "success" },
          { label: "Jobs", value: formatNumber(row.jobs), icon: <LuBriefcase size={20} />, tone: "info" },
          { label: "Gigs", value: formatNumber(row.gigs), icon: <LuStore size={20} />, tone: "warning" },
        ]}
      />

      <SectionCard
        title="Category information"
        action={<StatusChip status={row.state} />}
        sx={{ height: "auto", mb: 2.5 }}
      >
        <Facts
          items={[
            { label: "Name", value: row.cat_name },
            { label: "Name (Bangla)", value: row.cat_name_bn || "—" },
            { label: "Name (Portuguese)", value: row.cat_name_pt || "—" },
            { label: "Slug", value: `/${row.slug}` },
            {
              label: "Color",
              value: row.color ? (
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}><ColorDot color={row.color} /> {row.color}</Box>
              ) : "—",
            },
            { label: "Icon name", value: row.icon || "—" },
            { label: "Created", value: `${formatLocalDateTime(category.createdAt)} · ${category.createdBy}` },
            { label: "Last updated", value: `${formatLocalDateTime(category.updatedAt)} · ${category.updatedBy}` },
            row.cat_icon_url && { label: "Icon image", value: row.cat_icon_url, wide: true },
            { label: "Description", value: row.description || "—", wide: true },
            row.description_bn && { label: "Description (Bangla)", value: row.description_bn, wide: true },
            row.description_pt && { label: "Description (Portuguese)", value: row.description_pt, wide: true },
          ]}
        />
      </SectionCard>

      <SectionCard
        title="Subcategories"
        subtitle={subs.length ? `${subs.length} in this category` : "No subcategories yet"}
        action={<Button variant="contained" size="small" startIcon={<LuPlus size={15} />} onClick={addSub}>Add subcategory</Button>}
        noPadding
        sx={{ height: "auto" }}
      >
        {subs.length > 0 && (
          <TableContainer>
            <Table sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Subcategory</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Jobs</TableCell>
                  <TableCell align="right">Gigs</TableCell>
                  <TableCell align="right">Freelancer services</TableCell>
                  <TableCell align="center">Active</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subs.map((s) => {
                  const used = subCategoryInUse(s);
                  return (
                    <TableRow key={s.id} hover>
                      <TableCell><TitleCell title={s.sub_cat_name} sub={`/${s.slug}`} maxWidth={240} /></TableCell>
                      <TableCell>
                        <TitleCell title={<span style={{ fontWeight: 400 }}>{s.description || "—"}</span>} maxWidth={300} />
                      </TableCell>
                      <TableCell align="right" className="num">{formatNumber(s.jobs)}</TableCell>
                      <TableCell align="right" className="num">{formatNumber(s.gigs)}</TableCell>
                      <TableCell align="right" className="num">{formatNumber(s.services)}</TableCell>
                      <TableCell align="center">
                        <Switch
                          size="small"
                          checked={s.active}
                          disabled={pendingId === s.id}
                          onChange={(e) => toggleSub(s, e.target.checked)}
                          slotProps={{ input: { "aria-label": `${s.sub_cat_name} active` } }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <Tooltip title="Edit">
                          <IconButton size="small" aria-label={`Edit ${s.sub_cat_name}`} onClick={() => setDialog({ kind: "sub", row: s })}>
                            <LuPencil size={15} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={used ? "In use: turn it off instead" : "Delete"}>
                          <span>
                            <IconButton size="small" color="error" aria-label={`Delete ${s.sub_cat_name}`} disabled={used} onClick={() => askDeleteSub(s)}>
                              <LuTrash2 size={15} />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionCard>

      {dialog?.kind === "category" && (
        <FormDialog
          title="Edit category"
          submitLabel="Save changes"
          fields={CATEGORY_FIELDS}
          initial={valuesFrom(row, CATEGORY_FIELDS)}
          onSubmit={saveCategory}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === "sub" && (
        <FormDialog
          title={dialog.row ? "Edit subcategory" : `Add subcategory to ${row.cat_name}`}
          submitLabel={dialog.row ? "Save changes" : "Add subcategory"}
          fields={SUB_FIELDS}
          initial={dialog.row ? valuesFrom(dialog.row, SUB_FIELDS) : { ...SUB_CATEGORY_DEFAULTS }}
          onSubmit={(values) => saveSub(values, dialog.row)}
          onClose={() => setDialog(null)}
        />
      )}

      <Dialog open={Boolean(confirm)} onClose={() => setConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{confirm?.title}</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ fontSize: 14 }}>{confirm?.body}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={() => setConfirm(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => { confirm.onConfirm(); setConfirm(null); }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
