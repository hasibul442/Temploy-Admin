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
import { toast } from "react-toastify";
import { LuSearch, LuRefreshCw, LuHourglass, LuWallet, LuPercent, LuBanknote, LuCircleCheck, LuCircleX, LuTriangleAlert, LuX } from "react-icons/lu";
import PageHeader from "@/components/common/PageHeader";
import StatusChip from "@/components/common/StatusChip";
import FormDialog from "@/components/common/FormDialog";
import { StatTiles, DetailList, RAW_INPUT_SX } from "@/components/common/ResourcePage";
import { PersonCell, Tag } from "@/components/common/cells";
import { formatLocalDate, formatLocalDateTime, formatMoney, humanize } from "@/helper/format";
import { getErrorMessage } from "@/utils/services/api/apiError";
import {
  getWithdrawals,
  getWithdrawal,
  approveWithdrawal,
  rejectWithdrawal,
  markWithdrawalPaid,
  markWithdrawalFailed,
} from "@/utils/services/api/WithdrawalService";
import { getCurrencies } from "@/utils/services/api/CurrencyService";

/*
 * Withdrawals, from the API (/admin/withdrawals). Search, tabs, filters and pagination run on the server.
 * Pending requests can be approved or rejected from the list or the details drawer; approved ones are marked paid
 * (or failed) once the money has been sent. Rejected and failed requests give the amount back to the user's balance.
 */

// Tab → the statuses it covers. The first tab is the queue (oldest first on the server).
const TABS = [
  { value: "pending", label: "Pending", statuses: ["PENDING"] },
  { value: "approved", label: "Approved", statuses: ["APPROVED", "PROCESSING"] },
  { value: "paid", label: "Paid", statuses: ["PAID"] },
  { value: "rejected", label: "Rejected", statuses: ["REJECTED"] },
  { value: "failed", label: "Failed", statuses: ["FAILED"] },
  { value: "cancelled", label: "Cancelled", statuses: ["CANCELLED"] },
  { value: "all", label: "All", statuses: [] },
];
const METHODS = { Any: "", Bank: "bank", Wallet: "wallet" };
const SEARCH_DELAY_MS = 350;

const personName = (p) => (p ? `${p.fName ?? ""} ${p.lName ?? ""}`.trim() || p.email : "—");
/** Per-currency totals as one line ("$258 · ৳1,200"); amounts are never converted. */
const moneyLine = (totals, field) => (totals?.length ? totals.map((t) => formatMoney(t[field], t.currency)).join(" · ") : "–");
const requested = (w) => formatMoney(-w.amountCents, w.currency);

// The dialog each action opens. `field` is the optional/required text sent with it.
const ACTIONS = {
  approve: {
    title: "Approve withdrawal",
    submit: "Approve",
    field: { name: "text", label: "Note (optional)", type: "textarea", helperText: "Kept with the request and shown to the user." },
    run: (id, text) => approveWithdrawal(id, text),
    done: "Withdrawal approved",
  },
  reject: {
    title: "Reject withdrawal",
    submit: "Reject",
    field: { name: "text", label: "Reason for the user", type: "textarea", required: true, helperText: "Required (at least 3 characters). The amount goes back to their balance." },
    run: (id, text) => rejectWithdrawal(id, text),
    done: "Withdrawal rejected",
  },
  paid: {
    title: "Mark as paid",
    submit: "Mark as paid",
    field: { name: "text", label: "Transfer reference (optional)", helperText: "The bank or wallet transaction ID." },
    run: (id, text) => markWithdrawalPaid(id, text),
    done: "Withdrawal marked as paid",
  },
  failed: {
    title: "Mark as failed",
    submit: "Mark as failed",
    field: { name: "text", label: "Reason (optional)", type: "textarea", helperText: "The amount goes back to the user's balance." },
    run: (id, text) => markWithdrawalFailed(id, text),
    done: "Withdrawal marked as failed",
  },
};

function ActionButtons({ w, onAction, size = "small", full = false }) {
  const a = w.actions ?? {};
  const btn = (key, label, props) =>
    a[key] && (
      <Button key={key} size={size} fullWidth={full} onClick={(e) => { e.stopPropagation(); onAction(w, key); }} {...props}>
        {label}
      </Button>
    );
  const buttons = [
    btn("approve", "Approve", { variant: "contained", color: "success", startIcon: <LuCircleCheck size={15} /> }),
    btn("paid", "Mark as paid", { variant: "contained", startIcon: <LuBanknote size={15} /> }),
    btn("reject", "Reject", { variant: "outlined", color: "error", startIcon: <LuCircleX size={15} /> }),
    btn("failed", "Mark as failed", { variant: "outlined", color: "warning", startIcon: <LuTriangleAlert size={15} /> }),
  ].filter(Boolean);
  if (!buttons.length) return null;
  return <Box sx={{ display: "flex", gap: 1, flexWrap: full ? "wrap" : "nowrap" }}>{buttons}</Box>;
}

/** The payout account in full: staff send the money by hand from these details. */
function payoutItems(m) {
  if (!m) return [{ label: "Payout method", value: "Deleted by the user" }];
  const rows = m.type === "bank"
    ? [
      ["Bank", m.bankName], ["Branch", m.branchName], ["Account name", m.accountName], ["Account number", m.accountNumber],
      ["Routing number", m.routingNumber], ["SWIFT", m.swiftCode], ["Bank code", m.bankCode], ["Transfer type", m.transferType],
    ]
    : [["Provider", m.providerName || m.provider], ["Account name", m.accountName], [m.identifierType === "email" ? "Email" : "Phone", m.identifierType === "email" ? m.email : m.phone]];
  return [
    ...rows.filter(([, v]) => v).map(([label, value]) => ({ label, value })),
    { label: "Country / currency", value: [m.country, m.currency].filter(Boolean).join(" · ") || "—" },
    m.status !== "ACTIVE" && { label: "Method status", value: humanize(m.status) },
  ];
}

const HISTORY_LABELS = {
  "withdrawal.approved": "Approved",
  "withdrawal.rejected": "Rejected",
  "withdrawal.paid": "Marked as paid",
  "withdrawal.failed": "Marked as failed",
};

function WithdrawalDrawer({ row, detail, error, onClose, onAction }) {
  const w = detail ?? row;
  return (
    <Drawer anchor="right" open={Boolean(row)} onClose={onClose} slotProps={{ paper: { sx: { width: { xs: "100%", sm: 480 }, bgcolor: "background.paper" } } }}>
      {w && (
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 2.5 }}>
            <Typography variant="h6" component="h2">Withdrawal #{w.id}</Typography>
            <IconButton onClick={onClose} aria-label="Close details" size="small"><LuX size={18} /></IconButton>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <StatusChip status={humanize(w.status)} />
            <Box sx={{ fontSize: 24, fontWeight: 700 }} className="num">{requested(w)}</Box>
          </Box>

          <Box sx={{ mb: 2 }}><ActionButtons w={w} onAction={onAction} size="medium" full /></Box>

          <DetailList
            items={[
              { label: "Freelancer", value: w.user ? <Link href={`/users/${w.user.id}`}>{personName(w.user)}</Link> : "—" },
              { label: "Email", value: w.user?.email ?? "—" },
              { label: "KYC", value: w.user?.isKycVerified ? <Tag tone="success">Verified</Tag> : <Tag tone="warning">Not verified</Tag> },
              detail?.balances && {
                label: "Available balance",
                value: detail.balances.length ? detail.balances.map((b) => formatMoney(b.availableCents, b.currency)).join(" · ") : "—",
              },
              { label: "Requested", value: requested(w) },
              { label: "Fee", value: formatMoney(w.feeCents, w.currency) },
              { label: "User receives", value: <b>{formatMoney(w.netPayoutCents, w.currency)}</b> },
              { label: "Method", value: w.methodLabel || humanize(w.methodType) },
              { label: "Requested at", value: formatLocalDateTime(w.createdAt) },
              w.approvedAt && { label: "Approved at", value: formatLocalDateTime(w.approvedAt) },
              w.paidAt && { label: "Paid at", value: formatLocalDateTime(w.paidAt) },
              w.processedBy && { label: "Processed by", value: personName(w.processedBy) },
              w.adminNote && { label: "Note", value: w.adminNote },
              w.payoutReference && { label: "Transfer reference", value: w.payoutReference },
              w.failureReason && { label: "Failure reason", value: w.failureReason },
            ]}
          />

          {detail && (
            <>
              <Typography sx={{ fontSize: 13, fontWeight: 600, mt: 3, mb: 1 }}>Send the money to</Typography>
              <DetailList items={payoutItems(detail.payoutMethod)} />

              <Typography sx={{ fontSize: 13, fontWeight: 600, mt: 3, mb: 1 }}>History</Typography>
              <DetailList
                items={[
                  { label: "Requested", value: formatLocalDateTime(w.createdAt) },
                  ...detail.history.map((h) => ({
                    label: `${HISTORY_LABELS[h.action] ?? h.action} · ${personName(h.employee)}`,
                    value: (
                      <Box>
                        <Box>{formatLocalDateTime(h.createdAt)}</Box>
                        {(h.meta?.note || h.meta?.reason || h.meta?.reference) && (
                          <Box sx={{ fontSize: 12.5, color: "text.secondary", fontWeight: 400 }}>{h.meta.note || h.meta.reason || h.meta.reference}</Box>
                        )}
                      </Box>
                    ),
                  })),
                ].map((item, i) => ({ ...item, label: `${i + 1}. ${item.label}` }))}
              />
            </>
          )}
          {!detail && !error && <CircularProgress size={18} sx={{ mt: 2 }} aria-label="Loading details" />}
          {error && <Typography color="error" sx={{ mt: 2, fontSize: 13.5 }}>{error}</Typography>}
        </Box>
      )}
    </Drawer>
  );
}

export default function WithdrawalsPage() {
  const [tab, setTab] = useState("pending");
  const [method, setMethod] = useState("Any");
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
  const requestId = useRef(0);

  // Drawer: the clicked row shows straight away, the details fill in when loaded
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailError, setDetailError] = useState(null);
  // { row, key } while an action dialog is open
  const [acting, setActing] = useState(null);

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
    const res = await getWithdrawals({
      search,
      status: TABS.find((t) => t.value === tab).statuses.join(","),
      method_type: METHODS[method],
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
  }, [tab, method, currency, search, page, rowsPerPage]);

  useEffect(() => {
    // Fetch when filters or the page change; state is set after the await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load, reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);

  const detailId = useRef(null);
  const openDetail = async (w) => {
    detailId.current = w.id;
    setSelected(w);
    setDetail(null);
    setDetailError(null);
    const res = await getWithdrawal(w.id);
    if (detailId.current !== w.id) return; // another row was opened meanwhile
    if (res?.data) setDetail(res.data.data);
    else setDetailError(getErrorMessage(res));
  };
  const closeDetail = () => {
    detailId.current = null;
    setSelected(null);
    setDetail(null);
  };

  // Runs the action from its dialog. Resolves true to close the dialog.
  const runAction = async (values) => {
    const { row, key } = acting;
    const res = await ACTIONS[key].run(row.id, String(values.text ?? "").trim() || undefined);
    if (!res?.data) {
      toast.error(getErrorMessage(res));
      // 409: someone else acted first; show the current state
      if (res?.response?.status === 409) reload();
      return false;
    }
    toast.success(ACTIONS[key].done);
    if (selected?.id === row.id) setDetail(res.data.data);
    reload();
    return true;
  };

  // Tab counts from `summary.byStatus`, which ignores the selected tab
  const countFor = (t) => {
    if (!summary) return "–";
    const by = summary.byStatus ?? {};
    const keys = t.statuses.length ? t.statuses : Object.keys(by);
    return keys.reduce((s, k) => s + (by[k] ?? 0), 0);
  };
  const resetPage = () => setPage(0);

  return (
    <>
      <PageHeader title="Withdrawals" subtitle="Payout requests from freelancers. Approve or reject, then mark as paid once the money is sent." />

      <StatTiles
        rows={[]}
        stats={[
          { label: "Pending requests", value: countFor(TABS[0]), icon: <LuHourglass size={20} />, tone: "warning" },
          { label: "Requested (listed)", value: moneyLine(summary?.totals, "amountCents"), icon: <LuWallet size={20} /> },
          { label: "Fees (listed)", value: moneyLine(summary?.totals, "feeCents"), icon: <LuPercent size={20} /> },
          { label: "Users receive (listed)", value: moneyLine(summary?.totals, "netPayoutCents"), icon: <LuBanknote size={20} />, tone: "success" },
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
            placeholder="Search by freelancer, method, reference or #ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ flex: "1 1 260px", maxWidth: 380 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><LuSearch size={16} /></InputAdornment> } }}
          />
          <TextField select size="small" label="Method" value={method} onChange={(e) => { setMethod(e.target.value); resetPage(); }} sx={{ ...RAW_INPUT_SX, minWidth: 120 }}>
            {Object.keys(METHODS).map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Currency" value={currency} onChange={(e) => { setCurrency(e.target.value); resetPage(); }} sx={{ ...RAW_INPUT_SX, minWidth: 130 }}>
            <MenuItem value="">Any</MenuItem>
            {currencies.map((c) => <MenuItem key={c.id ?? c.code} value={c.code}>{c.code}</MenuItem>)}
          </TextField>
          {loading && <CircularProgress size={18} aria-label="Loading withdrawals" />}
          <Typography sx={{ ml: "auto", fontSize: 13, color: "text.secondary" }} className="num">
            {total} {total === 1 ? "request" : "requests"}
          </Typography>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 1150, "& td, & th": { py: 1.25 } }}>
            <TableHead>
              <TableRow>
                <TableCell>Request</TableCell>
                <TableCell>Freelancer</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Requested</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Fee</TableCell>
                <TableCell align="right">User receives</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((w) => (
                <TableRow key={w.id} hover onClick={() => openDetail(w)} sx={{ cursor: "pointer" }}>
                  <TableCell sx={{ fontSize: 13.5, fontWeight: 600 }} className="num">#{w.id}</TableCell>
                  <TableCell>
                    <PersonCell name={personName(w.user)} sub={w.user?.email} />
                    {w.user && !w.user.isKycVerified && <Box sx={{ mt: 0.5 }}><Tag tone="warning">KYC not verified</Tag></Box>}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13.5 }}>
                    <Box>{w.methodLabel || "—"}</Box>
                    <Box sx={{ fontSize: 12, color: "text.secondary" }}>{humanize(w.methodType)}</Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: 13.5, color: "text.secondary", whiteSpace: "nowrap" }}>{formatLocalDate(w.createdAt)}</TableCell>
                  <TableCell align="right" sx={{ fontSize: 13.5 }}><b className="num">{requested(w)}</b></TableCell>
                  <TableCell align="right" sx={{ fontSize: 13.5, color: "text.secondary" }} className="num">{formatMoney(w.feeCents, w.currency)}</TableCell>
                  <TableCell align="right" sx={{ fontSize: 13.5 }} className="num">{formatMoney(w.netPayoutCents, w.currency)}</TableCell>
                  <TableCell><StatusChip status={humanize(w.status)} /></TableCell>
                  <TableCell>
                    <ActionButtons w={w} onAction={(row, key) => setActing({ row, key })} />
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={9} sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
                    {error ? (
                      <>
                        <Typography color="error" sx={{ mb: 1.5, fontSize: 14 }}>{error}</Typography>
                        <Button size="small" variant="outlined" startIcon={<LuRefreshCw size={14} />} onClick={reload}>Try again</Button>
                      </>
                    ) : (
                      "No withdrawals match these filters."
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

      <WithdrawalDrawer
        row={selected}
        detail={detail}
        error={detailError}
        onClose={closeDetail}
        onAction={(row, key) => setActing({ row, key })}
      />

      {acting && (
        <FormDialog
          key={`${acting.row.id}-${acting.key}`}
          title={`${ACTIONS[acting.key].title} #${acting.row.id} · ${requested(acting.row)} to ${personName(acting.row.user)}`}
          submitLabel={ACTIONS[acting.key].submit}
          initial={{ text: "" }}
          fields={[ACTIONS[acting.key].field]}
          onSubmit={runAction}
          onClose={() => setActing(null)}
        />
      )}
    </>
  );
}
