"use client";
import { Box, LinearProgress } from "@mui/material";
import { LuLanguages, LuCircleCheck, LuStar } from "react-icons/lu";
import ResourcePage from "@/components/common/ResourcePage";
import { TitleCell, ActiveSwitch, Tag } from "@/components/common/cells";
import { languages } from "@/data/settings";

/** Make `row` the only default language (and make sure it's active). */
function setDefault(row, api) {
  api.rows.forEach((r) => {
    if (r.id !== row.id && r.isDefault) api.update(r.id, { isDefault: false });
  });
  api.update(row.id, { isDefault: true, active: true }, `${row.name} is now the default language`);
}

export default function LanguagesPage() {
  return (
    <ResourcePage
      title="Languages"
      subtitle="Interface languages and how much of the app has been translated."
      noun="languages"
      rows={languages}
      stats={[
        { label: "Languages", value: (r) => r.length, icon: <LuLanguages size={20} /> },
        { label: "Active", value: (r) => r.filter((l) => l.active).length, icon: <LuCircleCheck size={20} />, tone: "success" },
        { label: "Default", value: (r) => r.find((l) => l.isDefault)?.name ?? "—", icon: <LuStar size={20} />, tone: "warning" },
      ]}
      search={{ keys: ["name", "nativeName", "code"], placeholder: "Search languages" }}
      filters={[{ field: "direction", label: "Direction", options: ["LTR", "RTL"] }]}
      columns={[
        { key: "name", label: "Language", render: (l) => <TitleCell title={l.name} sub={l.nativeName} /> },
        { key: "code", label: "Code", render: (l) => <span className="num">{l.code}</span> },
        { key: "direction", label: "Direction", render: (l) => <Tag tone={l.direction === "RTL" ? "info" : undefined}>{l.direction}</Tag> },
        {
          key: "progress",
          label: "Translated",
          minWidth: 180,
          render: (l) => (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <LinearProgress variant="determinate" value={l.progress} sx={{ flex: 1 }} aria-label={`${l.name} translated`} />
              <Box component="span" className="num" sx={{ fontSize: 12.5, fontWeight: 600, width: 38, textAlign: "right" }}>
                {l.progress}%
              </Box>
            </Box>
          ),
        },
        { key: "isDefault", label: "Default", render: (l) => (l.isDefault ? <Tag tone="primary">Default</Tag> : null) },
        {
          key: "active",
          label: "Active",
          align: "center",
          render: (l, api) => (l.isDefault ? <Tag>Always on</Tag> : <ActiveSwitch row={l} api={api} entity={l.name} />),
        },
      ]}
      rowActions={(l, api) => [!l.isDefault && { label: "Set as default", icon: <LuStar size={15} />, onClick: () => setDefault(l, api) }]}
      form={{
        entity: "language",
        canDelete: (row) => !row.isDefault, // the default language can't be deleted
        defaults: { active: true, isDefault: false, progress: 0, direction: "LTR" },
        fields: [
          { name: "name", label: "Name", required: true, half: true },
          { name: "nativeName", label: "Native name", half: true },
          { name: "code", label: "Code", required: true, half: true, helperText: "ISO 639-1, e.g. bn" },
          { name: "direction", label: "Text direction", type: "select", options: ["LTR", "RTL"], half: true },
          { name: "active", label: "Active", type: "switch" },
        ],
        toRow: (v) => ({ code: String(v.code).trim().toLowerCase() }),
      }}
    />
  );
}
