"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "@mui/material";
import { LuSearch, LuRefreshCw, LuShoppingBag, LuCoins, LuLoader, LuTriangleAlert } from "react-icons/lu";
import PageHeader from "@/components/common/PageHeader";
import StatusChip from "@/components/common/StatusChip";
import { StatTiles, RAW_INPUT_SX } from "@/components/common/ResourcePage";
import { TitleCell, PersonCell, Tag } from "@/components/common/cells";
import { formatLocalDate, formatLocalDateTime, formatMoney, humanize } from "@/helper/format";
import { getErrorMessage } from "@/utils/services/api/apiError";
import { getOrders } from "@/utils/services/api/OrderService";
import { getCategories } from "@/utils/services/api/CategoryService";

/*
 * Orders (bookings), from the API (/admin/orders). Search, tabs, filters and pagination run on the server.
 * A row opens the order details page (/orders/[id]) with its tracker and timeline. Read-only.
 */

// Tab → the booking statuses it covers
const TABS = [
  { value: "all", label: "All", statuses: [] },
  { value: "upcoming", label: "Upcoming", statuses: ["CONFIRMED", "PAID_ESCROW", "SCHEDULED"] },
  { value: "in_progress", label: "In progress", statuses: ["CHECKED_IN", "IN_PROGRESS", "OVERTIME_PENDING"] },
  { value: "awaiting", label: "Awaiting approval", statuses: ["PROVIDER_COMPLETED", "AUTO_CLOSED"] },
  { value: "completed", label: "Completed", statuses: ["APPROVED", "FUNDS_RELEASED", "CLOSED"] },
  { value: "disputed", label: "Disputed", statuses: ["DISPUTED"] },
  { value: "cancelled", label: "Cancelled", statuses: ["CANCELLED", "REFUNDED"] },
];
const SOURCES = { Any: undefined, Jobs: "job", Gigs: "gig" };
const SEARCH_DELAY_MS = 350;

const personName = (p) => (p ? `${p.fName ?? ""} ${p.lName ?? ""}`.trim() || p.email : "—");
/** Per-currency totals as one line ("$258 · ৳1,200"); amounts are never converted. */
const moneyLine = (totals, field) => (totals?.length ? totals.map((t) => formatMoney(t[field], t.currency)).join(" · ") : "–");

export default function OrdersPage() {
  const router = useRouter();
  const [tab, setTab] = useState("all");
  const [source, setSource] = useState("Any");
  const [categoryId, setCategoryId] = useState("");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const requestId = useRef(0);

  // Send the search after the user stops typing
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(query.trim());
      setPage(0);
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(id);
  }, [query]);

  // Categories for the filter (once)
  useEffect(() => {
    getCategories().then((res) => {
      if (res?.data) setCategories(res.data.data ?? []);
    });
  }, []);

  const load = useCallback(async () => {
    const current = ++requestId.current;
    setLoading(true);
    setError(null);
    const statuses = TABS.find((t) => t.value === tab).statuses;
    const res = await getOrders({
      search,
      status: statuses.map((s) => s.toLowerCase()).join(","),
      source: SOURCES[source],
      category_id: categoryId,
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
  }, [tab, source, categoryId, search, page, rowsPerPage]);

  useEffect(() => {
    // Fetch when filters or the page change; state is set after the await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load, reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);
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
      <PageHeader title="Orders" subtitle="Every booking between clients and freelancers. Open one to track its progress and timeline." />

      <StatTiles
        rows={[]}
        stats={[
          { label: "Orders", value: countFor(TABS[0]), icon: <LuShoppingBag size={20} /> },
          { label: "In progress", value: countFor(TABS[2]), icon: <LuLoader size={20} />, tone: "info" },
          { label: "Disputed", value: countFor(TABS[5]), icon: <LuTriangleAlert size={20} />, tone: "error" },
          { label: "Platform fees (listed)", value: moneyLine(summary?.totals, "platformFeesCents"), icon: <LuCoins size={20} />, tone: "success" },
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
            placeholder="Search by title, client, freelancer or #order"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ flex: "1 1 260px", maxWidth: 380 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><LuSearch size={16} /></InputAdornment> } }}
          />
          <TextField select size="small" label="Type" value={source} onChange={(e) => { setSource(e.target.value); resetPage(); }} sx={{ ...RAW_INPUT_SX, minWidth: 120 }}>
            {Object.keys(SOURCES).map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Category" value={categoryId} onChange={(e) => { setCategoryId(e.target.value); resetPage(); }} sx={{ ...RAW_INPUT_SX, minWidth: 180 }}>
            <MenuItem value="">Any</MenuItem>
            {categories.map((c) => <MenuItem key={c.id} value={String(c.id)}>{c.catName}</MenuItem>)}
          </TextField>
          {loading && <CircularProgress size={18} aria-label="Loading orders" />}
          <Typography sx={{ ml: "auto", fontSize: 13, color: "text.secondary" }} className="num">
            {total} {total === 1 ? "order" : "orders"} · {moneyLine(summary?.totals, "orderValueCents")}
          </Typography>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 1000, "& td, & th": { py: 1.25 } }}>
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Freelancer</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Scheduled</TableCell>
                <TableCell>Placed</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((o) => (
                <TableRow key={o.id} hover onClick={() => router.push(`/orders/${o.id}`)} sx={{ cursor: "pointer" }}>
                  <TableCell sx={{ fontSize: 13.5 }}>
                    <TitleCell title={o.title} sub={`#${o.id} · ${o.source === "gig" ? "Gig" : "Job"} · ${o.category?.catName ?? "—"}`} maxWidth={320} />
                  </TableCell>
                  <TableCell><PersonCell name={personName(o.employer)} sub={o.employer?.email} tone="info" /></TableCell>
                  <TableCell><PersonCell name={personName(o.freelancer)} sub={o.freelancer?.email} /></TableCell>
                  <TableCell align="right" sx={{ fontSize: 13.5 }}>
                    <b className="num">{formatMoney(o.agreedPriceCents, o.currency)}</b>
                  </TableCell>
                  <TableCell sx={{ fontSize: 13.5, whiteSpace: "nowrap" }}>{formatLocalDateTime(o.scheduledStartAt)}</TableCell>
                  <TableCell sx={{ fontSize: 13.5, color: "text.secondary", whiteSpace: "nowrap" }}>{formatLocalDate(o.createdAt)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.75, alignItems: "center" }}>
                      <StatusChip status={humanize(o.status)} />
                      {o.dispute && o.status !== "DISPUTED" && <Tag tone="error">Dispute</Tag>}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
                    {error ? (
                      <>
                        <Typography color="error" sx={{ mb: 1.5, fontSize: 14 }}>{error}</Typography>
                        <Button size="small" variant="outlined" startIcon={<LuRefreshCw size={14} />} onClick={reload}>Try again</Button>
                      </>
                    ) : (
                      "No orders match these filters."
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
    </>
  );
}
