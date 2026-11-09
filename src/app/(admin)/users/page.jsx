"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
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
  Avatar,
  Typography,
  IconButton,
  Tooltip,
  Checkbox,
  Menu,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  CircularProgress,
} from "@mui/material";
import { LuSearch, LuDownload, LuEllipsisVertical, LuBadgeCheck, LuPencil, LuUserX, LuUserCheck, LuRefreshCw, LuEye } from "react-icons/lu";
import { toast } from "react-toastify";
import PageHeader from "@/components/common/PageHeader";
import StatusChip from "@/components/common/StatusChip";
import { RAW_INPUT_SX } from "@/components/common/ResourcePage";
import { formatLocalDate, initials } from "@/helper/format";
import { getErrorMessage } from "@/utils/services/api/apiError";
import { getUsers, setUserStatus } from "@/utils/services/api/UserService";
import EditUserDialog from "@/components/users/EditUserDialog";

/*
 * Marketplace users, from the API (/admin/users). Search, filters and pagination run on the server.
 * A name (or "View details") opens /users/[id].
 * Deactivating a user blocks every request they make.
 */

// Tab → API `role`
const TYPES = [
  { value: "All", label: "All users", role: undefined },
  { value: "Freelancer", label: "Freelancers", role: "freelancer" },
  { value: "Client", label: "Clients", role: "employer" },
];
const STATUSES = { Any: undefined, Active: "active", Inactive: "inactive" };
const ROLE_LABEL = { freelancer: "Freelancer", employer: "Client" };
const SEARCH_DELAY_MS = 350;

const fullName = (u) => `${u.fName ?? ""} ${u.lName ?? ""}`.trim() || u.email;

export default function UsersPage() {
  const router = useRouter();
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("Any");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState(""); // `query` after the typing pause
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const requestId = useRef(0);

  const [menu, setMenu] = useState(null); // { anchor, user }
  const [editing, setEditing] = useState(null); // user being edited
  const [confirm, setConfirm] = useState(null); // { users, active }

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
    const filters = { search, status: STATUSES[status] };
    const [list, ...tabTotals] = await Promise.all([
      getUsers({ ...filters, role: TYPES.find((t) => t.value === type).role, page: page + 1, limit: rowsPerPage }),
      // Tab counts for the current search/status (limit 1: only `pagination.total` is used)
      ...TYPES.map((t) => getUsers({ ...filters, role: t.role, limit: 1 })),
    ]);
    if (current !== requestId.current) return; // a newer request has started
    if (list?.data) {
      setRows(list.data.data ?? []);
      setTotal(list.data.pagination?.total ?? 0);
      setCounts(Object.fromEntries(TYPES.map((t, i) => [t.value, tabTotals[i]?.data?.pagination?.total ?? 0])));
    } else {
      setError(getErrorMessage(list));
    }
    setLoading(false);
  }, [type, status, search, page, rowsPerPage]);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);
  const replaceRow = (user) => setRows((rs) => rs.map((r) => (r.id === user.id ? user : r)));

  const allOnPage = rows.length > 0 && rows.every((r) => selected.includes(r.id));
  const toggleAll = () =>
    setSelected((s) => (allOnPage ? s.filter((id) => !rows.some((r) => r.id === id)) : [...new Set([...s, ...rows.map((r) => r.id)])]));
  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  /** Activate or deactivate one or more users, then refresh the list. */
  const applyStatus = async (users, active) => {
    const results = await Promise.all(users.map((u) => setUserStatus(u.id, active)));
    const failed = results.filter((r) => !r?.data);
    if (failed.length) toast.error(getErrorMessage(failed[0]));
    const done = results.length - failed.length;
    if (done) toast.success(`${done} user${done === 1 ? "" : "s"} ${active ? "activated" : "deactivated"}`);
    setSelected([]);
    reload();
  };

  const selectedUsers = rows.filter((r) => selected.includes(r.id));

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Freelancers and clients registered on the marketplace."
        actions={
          <Button variant="outlined" color="inherit" startIcon={<LuDownload size={16} />} sx={{ borderColor: "divider" }}>
            Export
          </Button>
        }
      />

      <Card>
        <Tabs
          value={type}
          onChange={(_, v) => { setType(v); setPage(0); }}
          sx={{ px: 2, borderBottom: 1, borderColor: "divider", minHeight: 48, "& .MuiTab-root": { minHeight: 48, textTransform: "none", fontWeight: 600 } }}
        >
          {TYPES.map((t) => (
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
            placeholder="Search by name, email or phone"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ flex: "1 1 260px", maxWidth: 380 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><LuSearch size={16} /></InputAdornment> } }}
          />
          <TextField select size="small" label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} sx={{ width: 160 }}>
            {Object.keys(STATUSES).map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          {loading && <CircularProgress size={18} aria-label="Loading users" />}
          {selected.length > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: "auto" }}>
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{selected.length} selected</Typography>
              <Button size="small" color="error" variant="outlined" onClick={() => setConfirm({ users: selectedUsers, active: false })}>
                Suspend
              </Button>
            </Box>
          )}
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 860, "& td, & th": { py: 1.25 } }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox size="small" checked={allOnPage} indeterminate={!allOnPage && rows.some((r) => selected.includes(r.id))} onChange={toggleAll} inputProps={{ "aria-label": "Select all on page" }} />
                </TableCell>
                <TableCell>User</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((u) => (
                <TableRow key={u.id} hover selected={selected.includes(u.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox size="small" checked={selected.includes(u.id)} onChange={() => toggle(u.id)} inputProps={{ "aria-label": `Select ${fullName(u)}` }} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar src={u.profileImage || undefined} sx={{ width: 34, height: 34, fontSize: 12.5, bgcolor: "primary.light", color: "primary.main", fontWeight: 600 }}>
                        {initials(fullName(u))}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Link href={`/users/${u.id}`}>{fullName(u)}</Link>
                          {u.isKycVerified && (
                            <Tooltip title="Identity verified (KYC)">
                              <Box component="span" sx={{ display: "inline-flex", color: "info.main" }}>
                                <LuBadgeCheck size={14} aria-label="Verified" />
                              </Box>
                            </Tooltip>
                          )}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{u.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: 13.5 }}>{ROLE_LABEL[u.userRole] ?? "—"}</TableCell>
                  <TableCell sx={{ fontSize: 13.5 }}>{u.country ?? "—"}</TableCell>
                  <TableCell><StatusChip status={u.isActive ? "Active" : "Inactive"} /></TableCell>
                  <TableCell sx={{ fontSize: 13.5, color: "text.secondary" }}>{formatLocalDate(u.createdAt)}</TableCell>
                  <TableCell sx={{ fontSize: 13.5 }}>{u.userType === "PRO" ? "Pro" : "Regular"}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" aria-label={`Actions for ${fullName(u)}`} onClick={(e) => setMenu({ anchor: e.currentTarget, user: u })}>
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
                      "No users match these filters."
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

      {/* Row actions */}
      <Menu anchorEl={menu?.anchor} open={Boolean(menu)} onClose={() => setMenu(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
        <MenuItem onClick={() => { router.push(`/users/${menu.user.id}`); setMenu(null); }}>
          <ListItemIcon sx={{ color: "inherit" }}><LuEye size={15} /></ListItemIcon>
          View details
        </MenuItem>
        <MenuItem onClick={() => { setEditing(menu.user); setMenu(null); }}>
          <ListItemIcon sx={{ color: "inherit" }}><LuPencil size={15} /></ListItemIcon>
          Edit
        </MenuItem>
        {menu?.user.isActive ? (
          <MenuItem sx={{ color: "error.main" }} onClick={() => { setConfirm({ users: [menu.user], active: false }); setMenu(null); }}>
            <ListItemIcon sx={{ color: "inherit" }}><LuUserX size={15} /></ListItemIcon>
            Deactivate
          </MenuItem>
        ) : (
          <MenuItem onClick={() => { setConfirm({ users: [menu.user], active: true }); setMenu(null); }}>
            <ListItemIcon sx={{ color: "inherit" }}><LuUserCheck size={15} /></ListItemIcon>
            Activate
          </MenuItem>
        )}
      </Menu>

      {editing && <EditUserDialog user={editing} onClose={() => setEditing(null)} onSaved={(u) => { replaceRow(u); setEditing(null); }} />}

      {/* Activate / deactivate confirmation */}
      <Dialog open={Boolean(confirm)} onClose={() => setConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {confirm?.active ? "Activate" : "Deactivate"} {confirm?.users.length === 1 ? fullName(confirm.users[0]) : `${confirm?.users.length} users`}?
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ fontSize: 14 }}>
            {confirm?.active
              ? "They'll be able to use the marketplace again."
              : "They'll be signed out and blocked from the marketplace until reactivated."}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={() => setConfirm(null)}>Cancel</Button>
          <Button
            variant="contained"
            color={confirm?.active ? "primary" : "error"}
            onClick={() => { applyStatus(confirm.users, confirm.active); setConfirm(null); }}
          >
            {confirm?.active ? "Activate" : "Deactivate"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
