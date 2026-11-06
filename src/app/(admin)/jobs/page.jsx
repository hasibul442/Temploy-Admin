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
  IconButton,
  Menu,
  ListItemIcon,
  CircularProgress,
  Typography,
} from "@mui/material";
import { LuSearch, LuEllipsisVertical, LuEye, LuPencil, LuCircleX, LuRotateCcw, LuRefreshCw, LuBriefcase, LuCircleCheck, LuLoader } from "react-icons/lu";
import { toast } from "react-toastify";
import PageHeader from "@/components/common/PageHeader";
import StatusChip from "@/components/common/StatusChip";
import { StatTiles } from "@/components/common/ResourcePage";
import { TitleCell, Tag } from "@/components/common/cells";
import EditJobDialog from "@/components/jobs/EditJobDialog";
import { formatLocalDate, formatMoney, humanize } from "@/helper/format";
import { getErrorMessage } from "@/utils/services/api/apiError";
import { getJobs, updateJob } from "@/utils/services/api/JobService";

/*
 * Jobs, from the API (/admin/jobs). Search, status tabs and pagination run on the server.
 * A row opens the job details page (/jobs/[id]).
 */

// Tab → API `status`
const TABS = [
  { value: "all", label: "All", status: undefined },
  { value: "open", label: "Open", status: "open" },
  { value: "in_progress", label: "In progress", status: "in_progress" },
  { value: "completed", label: "Completed", status: "completed" },
  { value: "closed", label: "Closed", status: "closed" },
  { value: "expired", label: "Expired", status: "expired" },
];
const SEARCH_DELAY_MS = 350;

const posterName = (j) => `${j.postedBy?.fName ?? ""} ${j.postedBy?.lName ?? ""}`.trim() || j.postedBy?.email || "—";
const budget = (j) => {
  const min = formatMoney(j.budgetCents, j.currency);
  const range = j.budgetMaxCents ? `${min} – ${formatMoney(j.budgetMaxCents, j.currency)}` : min;
  return j.jobType === "HOURLY" ? `${range}/hr` : range;
};

export default function JobsPage() {
  const router = useRouter();
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const requestId = useRef(0);

  const [menu, setMenu] = useState(null); // { anchor, job }
  const [editing, setEditing] = useState(null);

  // Send the search after the user stops typing
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(query.trim());
      setPage(0);
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(id);
  }, [query]);

  const load = useCallback(async () => {
    const current = ++requestId.current;
    setLoading(true);
    setError(null);
    const [list, ...tabTotals] = await Promise.all([
      getJobs({ search, status: TABS.find((t) => t.value === tab).status, page: page + 1, limit: rowsPerPage }),
      // Tab counts for the current search (limit 1: only `pagination.total` is used)
      ...TABS.map((t) => getJobs({ search, status: t.status, limit: 1 })),
    ]);
    if (current !== requestId.current) return; // a newer request has started
    if (list?.data) {
      setRows(list.data.data ?? []);
      setTotal(list.data.pagination?.total ?? 0);
      setCounts(Object.fromEntries(TABS.map((t, i) => [t.value, tabTotals[i]?.data?.pagination?.total ?? 0])));
    } else {
      setError(getErrorMessage(list));
    }
    setLoading(false);
  }, [tab, search, page, rowsPerPage]);

  useEffect(() => {
    // Fetch when the tab, search or page changes; state is set after the await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load, reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);

  const setStatus = async (job, status) => {
    const res = await updateJob(job.id, { status });
    if (!res?.data) return toast.error(getErrorMessage(res));
    toast.success(`Job #${job.id} ${status === "closed" ? "closed" : "reopened"}`);
    reload();
  };

  const openDetails = (job) => router.push(`/jobs/${job.id}`);

  return (
    <>
      <PageHeader title="Jobs" subtitle="Jobs posted by clients. Open one to see its proposals, hires and booking timelines." />

      <StatTiles
        rows={[]}
        stats={[
          { label: "Total jobs", value: counts.all ?? "–", icon: <LuBriefcase size={20} /> },
          { label: "Open", value: counts.open ?? "–", icon: <LuCircleCheck size={20} />, tone: "success" },
          { label: "In progress", value: counts.in_progress ?? "–", icon: <LuLoader size={20} />, tone: "info" },
          { label: "Completed", value: counts.completed ?? "–", icon: <LuCircleCheck size={20} />, tone: "warning" },
        ]}
      />

      <Card>
        <Tabs
          value={tab}
          onChange={(_, v) => { setTab(v); setPage(0); }}
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
                    {counts[t.value] ?? "–"}
                  </Box>
                </Box>
              }
            />
          ))}
        </Tabs>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, p: 2, alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Search by title or description"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ flex: "1 1 260px", maxWidth: 380 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><LuSearch size={16} /></InputAdornment> } }}
          />
          {loading && <CircularProgress size={18} aria-label="Loading jobs" />}
          <Typography sx={{ ml: "auto", fontSize: 13, color: "text.secondary" }} className="num">
            {total} {total === 1 ? "job" : "jobs"}
          </Typography>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 960, "& td, & th": { py: 1.25 } }}>
            <TableHead>
              <TableRow>
                <TableCell>Job</TableCell>
                <TableCell>Client</TableCell>
                <TableCell align="right">Budget</TableCell>
                <TableCell align="right">Proposals</TableCell>
                <TableCell align="right">Hired</TableCell>
                <TableCell>Posted</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right" sx={{ width: 56 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((j) => (
                <TableRow key={j.id} hover onClick={() => openDetails(j)} sx={{ cursor: "pointer" }}>
                  <TableCell sx={{ fontSize: 13.5 }}>
                    <TitleCell title={j.title} sub={`#${j.id} · ${j.category?.catName ?? "—"}${j.city ? ` · ${j.city}` : ""}`} maxWidth={340} />
                  </TableCell>
                  <TableCell sx={{ fontSize: 13.5 }}>{posterName(j)}</TableCell>
                  <TableCell align="right" sx={{ fontSize: 13.5 }}>
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", alignItems: "center" }}>
                      <Tag>{humanize(j.jobType)}</Tag>
                      <b className="num">{budget(j)}</b>
                    </Box>
                  </TableCell>
                  <TableCell align="right" className="num" sx={{ fontSize: 13.5 }}>{j._count?.proposals ?? 0}</TableCell>
                  <TableCell align="right" className="num" sx={{ fontSize: 13.5 }}>{j._count?.bookings ?? 0} / {j.workersNeeded}</TableCell>
                  <TableCell sx={{ fontSize: 13.5, color: "text.secondary", whiteSpace: "nowrap" }}>{formatLocalDate(j.createdAt)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.75, alignItems: "center" }}>
                      <StatusChip status={humanize(j.status)} />
                      {j.urgency === "URGENT" && <Tag tone="error">Urgent</Tag>}
                    </Box>
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <IconButton size="small" aria-label={`Actions for job ${j.id}`} onClick={(e) => setMenu({ anchor: e.currentTarget, job: j })}>
                      <LuEllipsisVertical size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={8} sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
                    {error ? (
                      <>
                        <Typography color="error" sx={{ mb: 1.5, fontSize: 14 }}>{error}</Typography>
                        <Button size="small" variant="outlined" startIcon={<LuRefreshCw size={14} />} onClick={reload}>Try again</Button>
                      </>
                    ) : (
                      "No jobs match these filters."
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
          onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Card>

      <Menu anchorEl={menu?.anchor} open={Boolean(menu)} onClose={() => setMenu(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
        <MenuItem onClick={() => { openDetails(menu.job); setMenu(null); }}>
          <ListItemIcon sx={{ color: "inherit" }}><LuEye size={15} /></ListItemIcon>
          View details
        </MenuItem>
        <MenuItem onClick={() => { setEditing(menu.job); setMenu(null); }}>
          <ListItemIcon sx={{ color: "inherit" }}><LuPencil size={15} /></ListItemIcon>
          Edit
        </MenuItem>
        {menu?.job.status === "OPEN" && (
          <MenuItem sx={{ color: "error.main" }} onClick={() => { setStatus(menu.job, "closed"); setMenu(null); }}>
            <ListItemIcon sx={{ color: "inherit" }}><LuCircleX size={15} /></ListItemIcon>
            Close job
          </MenuItem>
        )}
        {["CLOSED", "EXPIRED"].includes(menu?.job.status) && (
          <MenuItem onClick={() => { setStatus(menu.job, "open"); setMenu(null); }}>
            <ListItemIcon sx={{ color: "inherit" }}><LuRotateCcw size={15} /></ListItemIcon>
            Reopen
          </MenuItem>
        )}
      </Menu>

      {editing && <EditJobDialog job={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
    </>
  );
}
