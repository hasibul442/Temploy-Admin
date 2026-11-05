"use client";
import { Box } from "@mui/material";
import { LuLanguages, LuCircleCheck, LuCircleOff } from "react-icons/lu";
import { toast } from "react-toastify";
import ResourcePage from "@/components/common/ResourcePage";
import StatusChip from "@/components/common/StatusChip";
import { TitleCell, RemoteSwitch, Tag } from "@/components/common/cells";
import { useApiList, ApiListFallback } from "@/components/common/ApiList";
import { getErrorMessage } from "@/utils/services/api/apiError";
import { getLanguages, createLanguage, updateLanguage, setLanguageStatus, deleteLanguage } from "@/utils/services/api/LanguageService";

/*
 * Wired to /admin/languages. Active languages are offered in the web app's language switcher.
 * English is the fallback language, so it can't be turned off or deleted.
 */

const TITLE = "Languages";
const SUBTITLE = "Languages offered in the web app's language switcher. English is the fallback and is always on.";
const FALLBACK = "en";

/** API language → row. Form field names match the row keys so Edit pre-fills. */
function toRow(l) {
  return {
    id: l.id,
    code: l.code,
    name: l.name,
    native_name: l.nativeName ?? "",
    flag: l.flag ?? "",
    active: Boolean(l.status),
    state: l.status ? "Active" : "Inactive",
  };
}

const toBody = (v) => ({
  code: String(v.code ?? "").trim().toLowerCase(),
  name: String(v.name ?? "").trim(),
  native_name: String(v.native_name ?? "").trim(),
  flag: String(v.flag ?? "").trim(),
  status: Boolean(v.active),
});

async function save(values, id) {
  const res = id == null ? await createLanguage(toBody(values)) : await updateLanguage(id, toBody(values));
  if (!res?.data) {
    toast.error(getErrorMessage(res));
    return null;
  }
  return toRow(res.data.data);
}

async function toggleActive(row, checked) {
  const res = await setLanguageStatus(row.id, checked);
  if (!res?.data) {
    toast.error(getErrorMessage(res));
    return null;
  }
  toast.success(`${row.name} ${checked ? "enabled" : "disabled"}`);
  return toRow(res.data.data);
}

async function remove(row) {
  const res = await deleteLanguage(row.id);
  if (!res?.data) toast.error(getErrorMessage(res));
  return Boolean(res?.data);
}

export default function LanguagesPage() {
  const { rows, error, reload } = useApiList(getLanguages, toRow);
  if (!rows) return <ApiListFallback title={TITLE} subtitle={SUBTITLE} error={error} onRetry={reload} />;

  return (
    <ResourcePage
      title={TITLE}
      subtitle={SUBTITLE}
      noun="languages"
      rows={rows}
      stats={[
        { label: "Languages", value: (r) => r.length, icon: <LuLanguages size={20} /> },
        { label: "Active", value: (r) => r.filter((l) => l.active).length, icon: <LuCircleCheck size={20} />, tone: "success" },
        { label: "Inactive", value: (r) => r.filter((l) => !l.active).length, icon: <LuCircleOff size={20} />, tone: "warning" },
      ]}
      tabs={{ field: "state", options: ["All", "Active", "Inactive"] }}
      search={{ keys: ["name", "native_name", "code"], placeholder: "Search by name or code" }}
      columns={[
        {
          key: "name",
          label: "Language",
          minWidth: 220,
          render: (l) => (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Box component="span" aria-hidden="true" sx={{ fontSize: 22, lineHeight: 1, width: 28, textAlign: "center" }}>{l.flag}</Box>
              <TitleCell title={l.name} sub={l.native_name} />
            </Box>
          ),
        },
        { key: "code", label: "Code", render: (l) => <span className="num">{l.code}</span> },
        { key: "fallback", label: "", render: (l) => (l.code === FALLBACK ? <Tag tone="primary">Fallback</Tag> : null) },
        { key: "state", label: "Status", render: (l) => <StatusChip status={l.state} /> },
        {
          key: "active",
          label: "Active",
          align: "center",
          render: (l, api) =>
            l.code === FALLBACK ? (
              <Tag>Always on</Tag>
            ) : (
              <RemoteSwitch row={l} api={api} label={`${l.name} active`} onToggle={(checked) => toggleActive(l, checked)} />
            ),
        },
      ]}
      form={{
        entity: "language",
        canDelete: (l) => l.code !== FALLBACK, // English is the fallback language
        defaults: { code: "", name: "", native_name: "", flag: "", active: false },
        fields: [
          { name: "name", label: "Name", required: true, half: true, helperText: "In English, e.g. Bengali" },
          { name: "native_name", label: "Native name", half: true, helperText: "e.g. বাংলা" },
          { name: "code", label: "Code", required: true, half: true, helperText: "ISO 639-1, e.g. bn" },
          { name: "flag", label: "Flag emoji", half: true, helperText: "e.g. 🇧🇩" },
          { name: "active", label: "Active (offered in the language switcher)", type: "switch" },
        ],
        onSave: save,
        onDelete: remove,
      }}
    />
  );
}
