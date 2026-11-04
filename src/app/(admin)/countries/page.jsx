"use client";
import { LuGlobe, LuCircleCheck, LuUsers } from "react-icons/lu";
import ResourcePage from "@/components/common/ResourcePage";
import { TitleCell, ActiveSwitch, Tag } from "@/components/common/cells";
import { countries, CURRENCY_CODES } from "@/data/settings";
import { formatNumber } from "@/helper/format";

export default function CountriesPage() {
  return (
    <ResourcePage
      title="Countries"
      subtitle="Countries users can register from, with their dialing code and local currency."
      noun="countries"
      rows={countries}
      stats={[
        { label: "Countries", value: (r) => r.length, icon: <LuGlobe size={20} /> },
        { label: "Active", value: (r) => r.filter((c) => c.active).length, icon: <LuCircleCheck size={20} />, tone: "success" },
        { label: "Users", value: (r) => formatNumber(r.reduce((s, c) => s + c.users, 0)), icon: <LuUsers size={20} />, tone: "info" },
      ]}
      search={{ keys: ["name", "iso2", "phoneCode"], placeholder: "Search by name, ISO or dial code" }}
      filters={[{ field: "currency", label: "Currency", options: CURRENCY_CODES }]}
      columns={[
        { key: "name", label: "Country", render: (c) => <TitleCell title={c.name} sub={c.iso2} /> },
        { key: "phoneCode", label: "Dial code", render: (c) => <span className="num">{c.phoneCode}</span> },
        { key: "currency", label: "Currency", render: (c) => <Tag>{c.currency}</Tag> },
        { key: "users", label: "Users", align: "right", render: (c) => <span className="num">{formatNumber(c.users)}</span> },
        { key: "active", label: "Active", align: "center", render: (c, api) => <ActiveSwitch row={c} api={api} entity={c.name} /> },
      ]}
      form={{
        entity: "country",
        defaults: { active: true, users: 0, currency: "USD" },
        fields: [
          { name: "name", label: "Name", required: true },
          { name: "iso2", label: "ISO code", required: true, half: true, helperText: "2 letters, e.g. BD" },
          { name: "phoneCode", label: "Dial code", required: true, half: true, helperText: "e.g. +880" },
          { name: "currency", label: "Currency", type: "select", options: CURRENCY_CODES },
          { name: "active", label: "Active", type: "switch" },
        ],
        toRow: (v) => ({ iso2: String(v.iso2).trim().toUpperCase() }),
      }}
    />
  );
}
