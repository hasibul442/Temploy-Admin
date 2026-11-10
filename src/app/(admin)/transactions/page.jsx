"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Typography,
  Drawer,
  IconButton,
} from "@mui/material";
import { LuSearch, LuRefreshCw, LuReceipt, LuArrowDownLeft, LuArrowUpRight, LuPercent, LuX } from "react-icons/lu";
import PageHeader from "@/components/common/PageHeader";
import StatusChip from "@/components/common/StatusChip";
import { StatTiles, DetailList, RAW_INPUT_SX } from "@/components/common/ResourcePage";
import { TitleCell, PersonCell, Tag } from "@/components/common/cells";
import { formatLocalDate, formatLocalDateTime, formatMoney, humanize } from "@/helper/format";
import { getErrorMessage } from "@/utils/services/api/apiError";
import { getTransactions, getTransaction } from "@/utils/services/api/TransactionService";
import { getCurrencies } from "@/utils/services/api/CurrencyService";

/*
 * Transactions (the users' wallet ledger), from the API (/admin/transactions). Search, tabs, filters and pagination
 * run on the server. A row opens a drawer with the full record. Read-only: withdrawals are handled on /withdrawals.
 */

const TABS = [
  { value: "all", label: "All", types: [] },
  { value: "earning", label: "Earnings", types: ["EARNING"] },
  { value: "withdrawal", label: "Withdrawals", types: ["WITHDRAWAL"] },
  { value: "adjustment", label: "Adjustments", types: ["ADJUSTMENT"] },
];
const STATUSES = ["COMPLETED", "PENDING", "APPROVED", "PROCESSING", "PAID", "REJECTED", "FAILED", "CANCELLED"];
const TYPE_TONES = { EARNING: "success", WITHDRAWAL: "info", ADJUSTMENT: undefined };
const SEARCH_DELAY_MS = 350;

const personName = (p) => (p ? `${p.fName ?? ""} ${p.lName ?? ""}`.trim() || p.email : "—");
/** Per-currency totals as one line ("$258 · ৳1,200"); amounts are never converted. */
const moneyLine = (totals, field) => (totals?.length ? totals.map((t) => formatMoney(t[field], t.currency)).join(" · ") : "–");
/** Signed amount from the user's wallet: "+$23.40" / "−৳9". */
const signed = (cents, currency) => `${cents < 0 ? "−" : "+"}${formatMoney(Math.abs(cents), currency)}`;

function Amount({ t }) {
  return (
    <Box component="b" className="num" sx={{ color: t.amountCents < 0 ? "error.main" : "success.main" }}>
      {signed(t.amountCents, t.currency)}
    </Box>
  );
}

// The booking money split, one column each. Only earnings have a booking; other rows show "—".
const SPLIT_COLUMNS = [
  { key: "employerPaysCents", label: "Collected from employer", strong: true },
  { key: "agreedCents", label: "Agreed amount" },
  { key: "employerFeeCents", label: "Employer fee", sign: "+" },
  { key: "commissionCents", label: "Freelancer fee", sign: "−", tone: "error.main" },
  { key: "freelancerGetsCents", label: "Freelancer gets", strong: true },
  { key: "platformEarnsCents", label: "Platform earns", strong: true, tone: "success.main" },
];

/** Where the money went or came from: the booking for earnings, the payout method for withdrawals. */
const sourceOf = (t) => (t.booking ? `${t.booking.title} · #${t.booking.id}` : t.methodLabel || t.description || "—");

function payoutMethodText(m) {
  if (!m) return null;
  const name = m.providerName || m.bankName || humanize(m.type);
  const account = m.accountNumber || m.phone || m.email;
  return [name, m.accountName, account].filter(Boolean).join(" · ");
}

/**
 * One booking money split: employer pays = agreed + employer fee; freelancer gets = agreed − freelancer fee
 * (commission); platform earns = both fees.
 */
function MoneyBreakdown({ split, currency }) {
  const m = (cents) => formatMoney(cents, currency);
  const line = (label, value, { strong, indent, tone } = {}) => (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.75, pl: indent ? 2 : 0, borderTop: strong ? 1 : 0, borderColor: "divider" }}>
      <Typography sx={{ fontSize: 13.5, color: indent ? "text.secondary" : "text.primary", fontWeight: strong ? 600 : 400 }}>{label}</Typography>
      <Box className="num" sx={{ fontSize: 13.5, fontWeight: strong ? 700 : 500, color: tone ? `${tone}.main` : "text.primary", whiteSpace: "nowrap" }}>{value}</Box>
    </Box>
  );
  return (
    <Box>
      {line("Collected from employer", m(split.employerPaysCents), { strong: true })}
      {line("Agreed amount", m(split.agreedCents), { indent: true })}
      {line("Employer platform fee", `+${m(split.employerFeeCents)}`, { indent: true })}
      {line("Freelancer gets", m(split.freelancerGetsCents), { strong: true })}
      {line("Agreed amount", m(split.agreedCents), { indent: true })}
      {line("Freelancer platform fee", `−${m(split.commissionCents)}`, { indent: true, tone: "error" })}
      {line("Platform earns", m(split.platformEarnsCents), { strong: true, tone: "success" })}
      {line("Employer platform fee", m(split.employerFeeCents), { indent: true })}
      {line("Freelancer platform fee", m(split.commissionCents), { indent: true })}
    </Box>
  );
}

function TransactionDrawer({ row, onClose }) {
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!row) return undefined;
    let cancelled = false;
    getTransaction(row.id).then((res) => {
      if (cancelled) return;
      if (res?.data) setDetail(res.data.data);
      else setError(getErrorMessage(res));
    });
    return () => {
      cancelled = true;
      setDetail(null);
      setError(null);
    };
  }, [row]);

  // The list row is shown straight away; the details fill in the rest when they arrive
  const t = detail ?? row;
  return (
    <Drawer anchor="right" open={Boolean(row)} onClose={onClose} slotProps={{ paper: { sx: { width: { xs: "100%", sm: 460 }, bgcolor: "background.paper" } } }}>
      {t && (
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 2.5 }}>
            <Typography variant="h6" component="h2">{humanize(t.type)} · #{t.id}</Typography>
            <IconButton onClick={onClose} aria-label="Close details" size="small"><LuX size={18} /></IconButton>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <StatusChip status={humanize(t.status)} />
            <Box sx={{ fontSize: 24 }}><Amount t={t} /></Box>
          </Box>

          <DetailList
            items={[
              { label: "User", value: t.user ? <Link href={`/users/${t.user.id}`}>{personName(t.user)}</Link> : "—" },
              { label: "Email", value: t.user?.email ?? "—" },
              { label: "Type", value: humanize(t.type) },
              { label: "Currency", value: t.currency },
              t.type === "WITHDRAWAL" && { label: "Fee", value: formatMoney(t.feeCents, t.currency) },
              t.type === "WITHDRAWAL" && { label: "User receives", value: formatMoney(t.netPayoutCents, t.currency) },
              t.booking && { label: "Order", value: <Link href={`/orders/${t.booking.id}`}>{t.booking.title} · #{t.booking.id}</Link> },
              t.booking && { label: "Order status", value: humanize(t.booking.status) },
              t.methodLabel && { label: "Method", value: t.methodLabel },
              detail?.payoutMethod && { label: "Payout method", value: payoutMethodText(detail.payoutMethod) },
              t.payoutReference && { label: "Payout reference", value: t.payoutReference },
              detail?.payoutBatchId && { label: "Payout batch", value: detail.payoutBatchId },
              t.description && { label: "Description", value: t.description },
              t.failureReason && { label: "Failure reason", value: t.failureReason },
              detail?.adminNote && { label: "Admin note", value: detail.adminNote },
              detail?.processedBy && { label: "Processed by", value: personName(detail.processedBy) },
              { label: "Created", value: formatLocalDateTime(t.createdAt) },
              t.approvedAt && { label: "Approved", value: formatLocalDateTime(t.approvedAt) },
              t.paidAt && { label: "Paid", value: formatLocalDateTime(t.paidAt) },
              { label: "Last updated", value: formatLocalDateTime(t.updatedAt) },
            ]}
          />
          {t.type === "EARNING" && t.booking && (
            <Card sx={{ p: 2, mt: 2 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5 }}>Order #{t.booking.id} money breakdown</Typography>
              <MoneyBreakdown split={t.booking} currency={t.booking.currency} />
            </Card>
          )}
          {!detail && !error && <CircularProgress size={18} sx={{ mt: 2 }} aria-label="Loading details" />}
          {error && <Typography color="error" sx={{ mt: 2, fontSize: 13.5 }}>{error}</Typography>}
        </Box>
      )}
    </Drawer>
  );
}

export default function TransactionsPage() {
  const [tab, setTab] = useState("all");
  const [status, setStatus] = useState("");
  const [currency, setCurrency] = useState("");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selected, setSelected] = useState(null);
  const requestId = useRef(0);

  // Send the search after the user stops typing
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(query.trim());
      setPage(0);
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(id);
  }, [query]);

  // Currencies for the filter (once)
  useEffect(() => {
    getCurrencies().then((res) => {
      if (res?.data) setCurrencies(res.data.data ?? []);
    });
  }, []);

  const load = useCallback(async () => {
    const current = ++requestId.current;
    setLoading(true);
    setError(null);
    const res = await getTransactions({
      search,
      type: TABS.find((t) => t.value === tab).types.map((s) => s.toLowerCase()).join(","),
      status,
      currency,
      page: page + 1,
      limit: rowsPerPage,
    });
    if (current !== requestId.current) return; // a newer request has started
    if (res?.data) {
      setRows(res.data.data ?? []);
      setTotal(res.data.pagination?.total ?? 0);
      setSummary(res.data.summary ?? null);
    } else {
      setError(getErrorMessage(res));
    }
    setLoading(false);
  }, [tab, status, currency, search, page, rowsPerPage]);

  useEffect(() => {
    // Fetch when filters or the page change; state is set after the await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load, reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);
  // Tab counts from `summary.byType`, which ignores the selected tab
  const countFor = (t) => {
    if (!summary) return "–";
    const by = summary.byType ?? {};
    const keys = t.types.length ? t.types : Object.keys(by);
    return keys.reduce((s, k) => s + (by[k] ?? 0), 0);
  };
  const resetPage = () => setPage(0);

  return (
    <>
      <PageHeader title="Transactions" subtitle="Every earning, withdrawal and adjustment on users' wallets. Open one to see the full record." />

      <StatTiles
        rows={[]}
        stats={[
          { label: "Transactions", value: countFor(TABS[0]), icon: <LuReceipt size={20} /> },
          { label: "Earnings (listed)", value: moneyLine(summary?.totals, "earningsCents"), icon: <LuArrowDownLeft size={20} />, tone: "success" },
          { label: "Withdrawals (listed)", value: moneyLine(summary?.totals, "withdrawalsCents"), icon: <LuArrowUpRight size={20} />, tone: "info" },
          { label: "Withdrawal fees (listed)", value: moneyLine(summary?.totals, "withdrawalFeesCents"), icon: <LuPercent size={20} /> },
        ]}
      />

      <Card>
        <Tabs
          value={tab}
          onChange={(_, v) => { setTab(v); resetPage(); }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}
        >
          {TABS.map((t) => (
            <Tab
              key={t.value}
              value={t.value}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {t.label}
                  <Box component="span" className="num" sx={{ fontSize: 11.5, px: 0.75, borderRadius: "6px", bgcolor: "action.selected" }}>
                    {countFor(t)}
                  </Box>
                </Box>
              }
            />
          ))}
        </Tabs>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, p: 2, alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Search by user, method, reference or #ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ flex: "1 1 260px", maxWidth: 380 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><LuSearch size={16} /></InputAdornment> } }}
          />
          <TextField select size="small" label="Status" value={status} onChange={(e) => { setStatus(e.target.value); resetPage(); }} sx={{ ...RAW_INPUT_SX, minWidth: 150 }}>
            <MenuItem value="">Any</MenuItem>
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s}>{humanize(s)}{summary?.byStatus?.[s] ? ` (${summary.byStatus[s]})` : ""}</MenuItem>
            ))}
          </TextField>
          <TextField select size="small" label="Currency" value={currency} onChange={(e) => { setCurrency(e.target.value); resetPage(); }} sx={{ ...RAW_INPUT_SX, minWidth: 130 }}>
            <MenuItem value="">Any</MenuItem>
            {currencies.map((c) => <MenuItem key={c.id ?? c.code} value={c.code}>{c.code}</MenuItem>)}
          </TextField>
          {loading && <CircularProgress size={18} aria-label="Loading transactions" />}
          <Typography sx={{ ml: "auto", fontSize: 13, color: "text.secondary" }} className="num">
            {total} {total === 1 ? "transaction" : "transactions"}
          </Typography>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 1600, "& td, & th": { py: 1.25 } }}>
            <TableHead>
              <TableRow>
                <TableCell>Transaction</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Order / method</TableCell>
                <TableCell>Date</TableCell>
                {SPLIT_COLUMNS.map((c) => <TableCell key={c.key} align="right" sx={{ whiteSpace: "nowrap" }}>{c.label}</TableCell>)}
                <TableCell align="right">Wallet amount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((t) => (
                <TableRow key={t.id} hover onClick={() => setSelected(t)} sx={{ cursor: "pointer" }}>
                  <TableCell sx={{ fontSize: 13.5, fontWeight: 600 }} className="num">#{t.id}</TableCell>
                  <TableCell><PersonCell name={personName(t.user)} sub={t.user?.email} /></TableCell>
                  <TableCell><Tag tone={TYPE_TONES[t.type]}>{humanize(t.type)}</Tag></TableCell>
                  <TableCell sx={{ fontSize: 13.5 }}><TitleCell title={sourceOf(t)} maxWidth={280} /></TableCell>
                  <TableCell sx={{ fontSize: 13.5, color: "text.secondary", whiteSpace: "nowrap" }}>{formatLocalDate(t.createdAt)}</TableCell>
                  {SPLIT_COLUMNS.map((c) => (
                    <TableCell key={c.key} align="right" className="num" sx={{ fontSize: 13.5, whiteSpace: "nowrap", fontWeight: c.strong ? 700 : 400, color: t.booking ? c.tone : "text.disabled" }}>
                      {t.booking ? `${c.sign ?? ""}${formatMoney(t.booking[c.key], t.booking.currency)}` : "—"}
                    </TableCell>
                  ))}
                  <TableCell align="right" sx={{ fontSize: 13.5 }}>
                    <Amount t={t} />
                    {t.type === "WITHDRAWAL" && t.feeCents > 0 && (
                      <Box sx={{ fontSize: 12, color: "text.secondary" }}>fee {formatMoney(t.feeCents, t.currency)}</Box>
                    )}
                  </TableCell>
                  <TableCell><StatusChip status={humanize(t.status)} /></TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={7 + SPLIT_COLUMNS.length} sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
                    {error ? (
                      <>
                        <Typography color="error" sx={{ mb: 1.5, fontSize: 14 }}>{error}</Typography>
                        <Button size="small" variant="outlined" startIcon={<LuRefreshCw size={14} />} onClick={reload}>Try again</Button>
                      </>
                    ) : (
                      "No transactions match these filters."
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); resetPage(); }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Card>

      <TransactionDrawer row={selected} onClose={() => setSelected(null)} />
    </>
  );
}
