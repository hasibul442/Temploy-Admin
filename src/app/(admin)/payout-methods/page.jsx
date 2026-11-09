"use client";
import { useState } from "react";
import { Box, Button } from "@mui/material";
import { LuLandmark, LuWalletCards, LuBanknote, LuCircleCheck, LuPlus } from "react-icons/lu";
import { toast } from "react-toastify";
import ResourcePage from "@/components/common/ResourcePage";
import StatusChip from "@/components/common/StatusChip";
import FormDialog from "@/components/common/FormDialog";
import { TitleCell, Tag } from "@/components/common/cells";
import { useApiList, ApiListFallback } from "@/components/common/ApiList";
import { getErrorMessage } from "@/utils/services/api/apiError";
import { getPayoutMethods, createPayoutMethod } from "@/utils/services/api/PayoutMethodService";

/*
 * The wallets and banks freelancers can withdraw to (GET admin/payout-methods). Staff can add new ones;
 * the API has no update or delete yet, so rows have no Edit, Delete or on/off switch.
 */

const TITLE = "Payout methods";
const SUBTITLE = "Wallets and banks freelancers can withdraw their earnings to.";
const TYPE_LABEL = { wallet: "Wallet", bank: "Bank" };
const NO_IDENTIFIER = "—";

const fetchMethods = () => getPayoutMethods();

function toRow(m) {
  return {
    id: m.id,
    name: m.name,
    code: m.code,
    type: TYPE_LABEL[m.type] ?? m.type,
    identifier: m.identifierType ?? "",
    provider: m.provider ?? "",
    countries: m.countries ?? [],
    currencies: m.currencies ?? [],
    // Flattened for search and the filters
    countryText: (m.countries ?? []).join(" "),
    currencyText: (m.currencies ?? []).join(" "),
    state: m.isActive ? "Active" : "Inactive",
    sortOrder: m.sortOrder,
  };
}

const FIELDS = [
  { name: "name", label: "Name", required: true, half: true, helperText: "e.g. bKash, Sonali Bank PLC" },
  { name: "code", label: "Code", required: true, half: true, helperText: "Unique, e.g. bkash" },
  { name: "type", label: "Type", type: "select", options: ["Wallet", "Bank"], required: true, half: true },
  { name: "identifier_type", label: "Account identified by", type: "select", options: [NO_IDENTIFIER, "email", "phone"], half: true, helperText: "Wallets only" },
  { name: "provider", label: "Provider", half: true, helperText: "Wallets only, e.g. ssl, adyen" },
  { name: "currencies", label: "Currencies", required: true, half: true, helperText: "Comma-separated, e.g. BDT, USD" },
  { name: "countries", label: "Countries", helperText: "Comma-separated ISO codes, e.g. BD, PT. Leave blank for every country." },
];
const DEFAULTS = { type: "Wallet", identifier_type: "phone", countries: "", currencies: "" };

const codes = (text) => [...new Set(String(text ?? "").split(/[\s,]+/).map((c) => c.trim().toUpperCase()).filter(Boolean))];

function toBody(values) {
  const type = values.type === "Bank" ? "bank" : "wallet";
  const identifier = values.identifier_type === NO_IDENTIFIER ? null : values.identifier_type;
  return {
    type,
    name: values.name.trim(),
    code: values.code.trim(),
    // Banks aren't identified by email/phone and have no provider
    identifier_type: type === "wallet" ? identifier : null,
    provider: type === "wallet" ? values.provider?.trim() || null : null,
    countries: codes(values.countries),
    currencies: codes(values.currencies),
  };
}

/** This endpoint's 422 lists `errors` as [{ field, message }], unlike the other admin endpoints. */
function errorMessage(res) {
  const errors = res?.response?.data?.errors;
  if (Array.isArray(errors) && errors[0]?.message) return errors[0].message;
  return getErrorMessage(res);
}

/** Pills for a list of codes; `empty` when there are none. */
function Codes({ list, empty }) {
  if (!list.length) return <Box component="span" sx={{ color: "text.secondary" }}>{empty}</Box>;
  return (
    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", maxWidth: 260 }}>
      {list.map((c) => <Tag key={c}>{c}</Tag>)}
    </Box>
  );
}

export default function PayoutMethodsPage() {
  const { rows, error, reload } = useApiList(fetchMethods, toRow);
  const [adding, setAdding] = useState(false);
  const [version, setVersion] = useState(0); // remounts the list after a reload (ResourcePage keeps its own copy of rows)

  if (!rows) return <ApiListFallback title={TITLE} subtitle={SUBTITLE} error={error} onRetry={reload} />;

  const add = async (values) => {
    const body = toBody(values);
    if (body.currencies.length === 0) {
      toast.error("Add at least one currency");
      return false;
    }
    const res = await createPayoutMethod(body);
    if (!res?.data) {
      toast.error(errorMessage(res));
      return false;
    }
    toast.success(`${body.name} added`);
    await reload();
    setVersion((v) => v + 1);
    return true;
  };

  return (
    <>
      <ResourcePage
        key={version}
        title={TITLE}
        subtitle={SUBTITLE}
        noun="payout methods"
        rows={rows}
        stats={[
          { label: "Methods", value: (r) => r.length, icon: <LuBanknote size={20} /> },
          { label: "Wallets", value: (r) => r.filter((m) => m.type === "Wallet").length, icon: <LuWalletCards size={20} />, tone: "info" },
          { label: "Banks", value: (r) => r.filter((m) => m.type === "Bank").length, icon: <LuLandmark size={20} />, tone: "warning" },
          { label: "Active", value: (r) => r.filter((m) => m.state === "Active").length, icon: <LuCircleCheck size={20} />, tone: "success" },
        ]}
        tabs={{ field: "type", options: ["All", "Wallet", "Bank"], labels: { All: "All", Wallet: "Wallets", Bank: "Banks" } }}
        search={{ keys: ["name", "code", "provider", "countryText", "currencyText"], placeholder: "Search by name, code, provider, country or currency" }}
        filters={[{ field: "state", label: "Status", options: ["Active", "Inactive"] }]}
        columns={[
          { key: "name", label: "Method", minWidth: 220, render: (m) => <TitleCell title={m.name} sub={m.code} maxWidth={260} /> },
          { key: "type", label: "Type", render: (m) => <Tag tone={m.type === "Bank" ? "warning" : "info"}>{m.type}</Tag> },
          { key: "identifier", label: "Identified by", render: (m) => m.identifier || "—" },
          { key: "provider", label: "Provider", render: (m) => m.provider || "—" },
          { key: "countries", label: "Countries", render: (m) => <Codes list={m.countries} empty="All countries" /> },
          { key: "currencies", label: "Currencies", render: (m) => <Codes list={m.currencies} empty="—" /> },
          { key: "state", label: "Status", render: (m) => <StatusChip status={m.state} /> },
        ]}
        headerActions={
          <Button variant="contained" startIcon={<LuPlus size={16} />} onClick={() => setAdding(true)}>
            Add payout method
          </Button>
        }
        minWidth={1000}
      />

      {adding && (
        <FormDialog
          title="Add payout method"
          submitLabel="Add payout method"
          fields={FIELDS}
          initial={DEFAULTS}
          onSubmit={add}
          onClose={() => setAdding(false)}
        />
      )}
    </>
  );
}
