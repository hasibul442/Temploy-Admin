"use client";
import { Box } from "@mui/material";
import { LuCoins, LuCircleCheck, LuTriangleAlert } from "react-icons/lu";
import { toast } from "react-toastify";
import ResourcePage from "@/components/common/ResourcePage";
import StatusChip from "@/components/common/StatusChip";
import { TitleCell, RemoteSwitch, Tag } from "@/components/common/cells";
import { useApiList, ApiListFallback } from "@/components/common/ApiList";
import { formatLocalDate } from "@/helper/format";
import { getErrorMessage } from "@/utils/services/api/apiError";
import { getCurrencies, createCurrency, updateCurrency, setCurrencyStatus } from "@/utils/services/api/CurrencyService";

/*
 * Wired to /admin/currency. Rates are units per 1 USD and only convert prices for display; stored amounts
 * keep their own currency. Active currencies are the ones the web app offers (GET /lang-curr).
 */

const TITLE = "Currencies";
const SUBTITLE = "Currencies users can price and pay in. Rates are against 1 US Dollar and only convert prices for display.";
const BASE = "USD";
const rateFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 });

/** API currency → row. Form field names match the row keys so Edit pre-fills. */
function toRow(c) {
  return {
    id: c.id,
    name: c.name ?? "",
    code: c.code,
    symbol: c.symbol ?? "",
    symbol_native: c.symbolNative ?? "",
    decimal_digits: c.decimalDigits ?? 2,
    rate: Number(c.rate),
    rateUpdatedAt: c.rateUpdatedAt,
    active: Boolean(c.status),
    state: c.status ? "Active" : "Inactive",
  };
}

// Still at the default 1 and never updated: converts 1:1 with USD. (Rates written straight to the
// database have a rate but no `rateUpdatedAt`; those count as set.)
const rateMissing = (c) => c.code !== BASE && !c.rateUpdatedAt && c.rate === 1;

const FORM_FIELDS = ["name", "symbol", "symbol_native", "decimal_digits", "rate"];

/** Only the fields that changed: re-sending an unchanged `rate` would reset its "updated" date. */
function changedFields(values, row) {
  const body = {};
  for (const f of FORM_FIELDS) if (String(values[f] ?? "") !== String(row[f] ?? "")) body[f] = values[f];
  if (values.active !== row.active) body.status = Boolean(values.active);
  return body;
}

async function save(values, id, api) {
  const code = String(values.code).trim().toUpperCase();
  let res;
  if (id == null) {
    res = await createCurrency({
      code,
      name: values.name,
      symbol: values.symbol,
      symbol_native: values.symbol_native,
      decimal_digits: values.decimal_digits,
      rate: values.rate,
      status: Boolean(values.active),
    });
  } else {
    const row = api.rows.find((r) => r.id === id);
    // Jobs, bookings and wallets store the code as text, so the API doesn't allow changing it.
    if (code !== row.code) {
      toast.error("The currency code can't be changed. Add a new currency instead.");
      return null;
    }
    const body = changedFields(values, row);
    if (Object.keys(body).length === 0) return row;
    res = await updateCurrency(id, body);
  }
  if (!res?.data) {
    toast.error(getErrorMessage(res));
    return null;
  }
  return toRow(res.data.data);
}

async function toggleActive(row, checked) {
  const res = await setCurrencyStatus(row.id, checked);
  if (!res?.data) {
    toast.error(getErrorMessage(res));
    return null;
  }
  toast.success(`${row.code} ${checked ? "enabled" : "disabled"}`);
  return toRow(res.data.data);
}

export default function CurrenciesPage() {
  const { rows, error, reload } = useApiList(getCurrencies, toRow);
  if (!rows) return <ApiListFallback title={TITLE} subtitle={SUBTITLE} error={error} onRetry={reload} />;

  return (
    <ResourcePage
      title={TITLE}
      subtitle={SUBTITLE}
      noun="currencies"
      rows={rows}
      stats={[
        { label: "Currencies", value: (r) => r.length, icon: <LuCoins size={20} /> },
        { label: "Active", value: (r) => r.filter((c) => c.active).length, icon: <LuCircleCheck size={20} />, tone: "success" },
        {
          label: "Active, rate not set",
          value: (r) => r.filter((c) => c.active && rateMissing(c)).length,
          icon: <LuTriangleAlert size={20} />,
          tone: "warning",
        },
      ]}
      tabs={{ field: "state", options: ["All", "Active", "Inactive"] }}
      search={{ keys: ["name", "code"], placeholder: "Search by name or code" }}
      columns={[
        { key: "name", label: "Currency", render: (c) => <TitleCell title={c.name} sub={c.code} /> },
        {
          key: "symbol",
          label: "Symbol",
          render: (c) => (
            <Box component="span" sx={{ display: "inline-grid", placeItems: "center", minWidth: 34, height: 28, px: 1, borderRadius: "9px", bgcolor: "action.selected", fontWeight: 700 }}>
              {c.symbol || c.code}
            </Box>
          ),
        },
        { key: "rate", label: "Rate (1 USD =)", align: "right", render: (c) => <span className="num">{rateFmt.format(c.rate)} {c.code}</span> },
        {
          key: "rateUpdatedAt",
          label: "Rate updated",
          render: (c) => {
            if (c.code === BASE) return <Tag tone="primary">Base</Tag>;
            if (rateMissing(c)) return <Tag tone="warning">Not set</Tag>;
            if (!c.rateUpdatedAt) return <Box component="span" sx={{ color: "text.secondary" }} title="Set outside the admin panel">—</Box>;
            return <Box component="span" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>{formatLocalDate(c.rateUpdatedAt)}</Box>;
          },
        },
        { key: "state", label: "Status", render: (c) => <StatusChip status={c.state} /> },
        {
          key: "active",
          label: "Active",
          align: "center",
          render: (c, api) => (
            <RemoteSwitch row={c} api={api} label={`${c.code} active`} onToggle={(checked) => toggleActive(c, checked)} />
          ),
        },
      ]}
      form={{
        entity: "currency",
        canDelete: () => false, // no delete: jobs and wallets keep the code; deactivate instead
        defaults: { name: "", code: "", symbol: "", symbol_native: "", decimal_digits: 2, rate: 1, active: false },
        fields: [
          { name: "name", label: "Name", required: true },
          { name: "code", label: "ISO code", required: true, half: true, helperText: "e.g. BDT. Can't be changed later." },
          { name: "symbol", label: "Symbol", half: true, helperText: "e.g. Tk" },
          { name: "symbol_native", label: "Native symbol", half: true, helperText: "e.g. ৳" },
          { name: "decimal_digits", label: "Decimal digits", type: "number", half: true, helperText: "0 for JPY, 2 for most" },
          { name: "rate", label: "Exchange rate (1 USD =)", type: "number", required: true, helperText: "USD is always 1" },
          { name: "active", label: "Active (offered on the web app)", type: "switch" },
        ],
        onSave: save,
      }}
    />
  );
}
