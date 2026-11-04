"use client";
import { Box } from "@mui/material";
import { LuCoins, LuCircleCheck, LuStar } from "react-icons/lu";
import ResourcePage from "@/components/common/ResourcePage";
import { TitleCell, ActiveSwitch, DateCell, Tag } from "@/components/common/cells";
import { currencies } from "@/data/settings";
import { daysAgo } from "@/data/marketplace";

const rateFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 });

/** Make `row` the only default currency (and make sure it's active). */
function setDefault(row, api) {
  api.rows.forEach((r) => {
    if (r.id !== row.id && r.isDefault) api.update(r.id, { isDefault: false });
  });
  api.update(row.id, { isDefault: true, active: true }, `${row.code} is now the default currency`);
}

export default function CurrenciesPage() {
  return (
    <ResourcePage
      title="Currencies"
      subtitle="Currencies users can price and pay in. Rates are against 1 US Dollar."
      noun="currencies"
      rows={currencies}
      stats={[
        { label: "Currencies", value: (r) => r.length, icon: <LuCoins size={20} /> },
        { label: "Active", value: (r) => r.filter((c) => c.active).length, icon: <LuCircleCheck size={20} />, tone: "success" },
        { label: "Default", value: (r) => r.find((c) => c.isDefault)?.code ?? "—", icon: <LuStar size={20} />, tone: "warning" },
      ]}
      search={{ keys: ["name", "code"], placeholder: "Search by name or code" }}
      columns={[
        { key: "name", label: "Currency", render: (c) => <TitleCell title={c.name} sub={c.code} /> },
        {
          key: "symbol",
          label: "Symbol",
          render: (c) => (
            <Box component="span" sx={{ display: "inline-grid", placeItems: "center", minWidth: 34, height: 28, px: 1, borderRadius: "9px", bgcolor: "action.selected", fontWeight: 700 }}>
              {c.symbol}
            </Box>
          ),
        },
        { key: "rate", label: "Rate (1 USD =)", align: "right", render: (c) => <span className="num">{rateFmt.format(c.rate)} {c.code}</span> },
        { key: "isDefault", label: "Default", render: (c) => (c.isDefault ? <Tag tone="primary">Default</Tag> : null) },
        { key: "updated", label: "Rate updated", render: (c) => <DateCell value={c.updated} /> },
        {
          key: "active",
          label: "Active",
          align: "center",
          render: (c, api) =>
            c.isDefault ? <Tag>Always on</Tag> : <ActiveSwitch row={c} api={api} entity={c.code} />,
        },
      ]}
      rowActions={(c, api) => [!c.isDefault && { label: "Set as default", icon: <LuStar size={15} />, onClick: () => setDefault(c, api) }]}
      form={{
        entity: "currency",
        canDelete: (row) => !row.isDefault, // the default currency can't be deleted
        defaults: { active: true, isDefault: false, rate: 1, symbol: "", updated: daysAgo(0) },
        fields: [
          { name: "name", label: "Name", required: true },
          { name: "code", label: "ISO code", required: true, half: true, helperText: "e.g. BDT" },
          { name: "symbol", label: "Symbol", required: true, half: true },
          { name: "rate", label: "Exchange rate (1 USD =)", type: "number", required: true },
          { name: "active", label: "Active", type: "switch" },
        ],
        toRow: (v) => ({ code: String(v.code).trim().toUpperCase(), updated: daysAgo(0) }),
      }}
    />
  );
}
