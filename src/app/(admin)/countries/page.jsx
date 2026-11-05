"use client";
import { Box } from "@mui/material";
import { LuGlobe, LuCircleCheck, LuMap } from "react-icons/lu";
import { toast } from "react-toastify";
import ResourcePage from "@/components/common/ResourcePage";
import StatusChip from "@/components/common/StatusChip";
import { TitleCell, RemoteSwitch, Tag } from "@/components/common/cells";
import { useApiList, ApiListFallback } from "@/components/common/ApiList";
import { getErrorMessage } from "@/utils/services/api/apiError";
import { getCountries, createCountry, updateCountry, deleteCountry } from "@/utils/services/api/CountryService";


const TITLE = "Countries";
const SUBTITLE = "Countries users can sign up from, with their dialing code and local currency.";
const CONTINENTS = ["Africa", "Asia", "Europe", "North America", "Oceania", "South America", "Antarctica"];

/** API country → row. Form field names (snake_case, as the API takes them) match the row keys so Edit pre-fills. */
function toRow(c) {
  return {
    id: c.id,
    name: c.country, // shown in ResourcePage's delete confirmation
    country: c.country,
    abbreviation: c.abbreviation,
    calling_code: c.callingCode,
    capital: c.capital,
    continent: c.continent,
    currency_code: c.currencyCode,
    currency_name: c.currencyName,
    flag: c.flag ?? "",
    active: Boolean(c.isActive),
    state: c.isActive ? "Active" : "Inactive",
  };
}

const FORM_FIELDS = ["country", "abbreviation", "calling_code", "capital", "continent", "currency_code", "currency_name", "flag"];

function toBody(values) {
  const body = Object.fromEntries(FORM_FIELDS.map((f) => [f, String(values[f] ?? "").trim()]));
  body.abbreviation = body.abbreviation.toUpperCase();
  body.currency_code = body.currency_code.toUpperCase();
  body.is_active = Boolean(values.active);
  return body;
}

async function save(values, id) {
  const res = id == null ? await createCountry(toBody(values)) : await updateCountry(id, toBody(values));
  if (!res?.data) {
    toast.error(getErrorMessage(res));
    return null;
  }
  return toRow(res.data.data);
}

async function toggleActive(row, checked) {
  const res = await updateCountry(row.id, { is_active: checked });
  if (!res?.data) {
    toast.error(getErrorMessage(res));
    return null;
  }
  toast.success(`${row.country} ${checked ? "enabled" : "disabled"}`);
  return toRow(res.data.data);
}

async function remove(row) {
  const res = await deleteCountry(row.id);
  if (!res?.data) toast.error(getErrorMessage(res));
  return Boolean(res?.data);
}

export default function CountriesPage() {
  const { rows, error, reload } = useApiList(getCountries, toRow);
  if (!rows) return <ApiListFallback title={TITLE} subtitle={SUBTITLE} error={error} onRetry={reload} />;

  // Continents from the data, plus the standard list for the filter and the form
  const continents = [...new Set([...CONTINENTS, ...rows.map((c) => c.continent)])].sort((a, b) => a.localeCompare(b));

  return (
    <ResourcePage
      title={TITLE}
      subtitle={SUBTITLE}
      noun="countries"
      rows={rows}
      stats={[
        { label: "Countries", value: (r) => r.length, icon: <LuGlobe size={20} /> },
        { label: "Active", value: (r) => r.filter((c) => c.active).length, icon: <LuCircleCheck size={20} />, tone: "success" },
        { label: "Continents", value: (r) => new Set(r.map((c) => c.continent)).size, icon: <LuMap size={20} />, tone: "info" },
      ]}
      tabs={{ field: "state", options: ["All", "Active", "Inactive"] }}
      search={{ keys: ["country", "abbreviation", "calling_code", "capital", "currency_code"], placeholder: "Search by name, ISO, dial code or currency" }}
      filters={[{ field: "continent", label: "Continent", options: continents }]}
      columns={[
        {
          key: "country",
          label: "Country",
          minWidth: 220,
          render: (c) => (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Box component="span" aria-hidden="true" sx={{ fontSize: 22, lineHeight: 1, width: 28, textAlign: "center" }}>{c.flag}</Box>
              <TitleCell title={c.country} sub={c.abbreviation} />
            </Box>
          ),
        },
        { key: "calling_code", label: "Dial code", render: (c) => <span className="num">{c.calling_code}</span> },
        { key: "capital", label: "Capital" },
        { key: "continent", label: "Continent", render: (c) => <Tag>{c.continent}</Tag> },
        { key: "currency_code", label: "Currency", render: (c) => <TitleCell title={c.currency_code} sub={c.currency_name} maxWidth={180} /> },
        { key: "state", label: "Status", render: (c) => <StatusChip status={c.state} /> },
        {
          key: "active",
          label: "Active",
          align: "center",
          render: (c, api) => (
            <RemoteSwitch row={c} api={api} label={`${c.country} active`} onToggle={(checked) => toggleActive(c, checked)} />
          ),
        },
      ]}
      form={{
        entity: "country",
        defaults: { continent: "Asia", flag: "", active: true },
        fields: [
          { name: "country", label: "Name", required: true },
          { name: "abbreviation", label: "ISO code", required: true, half: true, helperText: "2 letters, e.g. BD" },
          { name: "calling_code", label: "Dial code", required: true, half: true, helperText: "e.g. +880" },
          { name: "capital", label: "Capital", required: true, half: true },
          { name: "continent", label: "Continent", type: "select", options: continents, required: true, half: true },
          { name: "currency_code", label: "Currency code", required: true, half: true, helperText: "3 letters, e.g. BDT" },
          { name: "currency_name", label: "Currency name", required: true, half: true },
          { name: "flag", label: "Flag emoji", half: true, helperText: "e.g. 🇧🇩" },
          { name: "active", label: "Active (offered at sign-up)", type: "switch" },
        ],
        onSave: save,
        onDelete: remove,
      }}
    />
  );
}
