"use client";
import { useMemo, useState } from "react";
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
} from "@mui/material";
import { LuSearch, LuPlus, LuDownload, LuEllipsisVertical, LuBadgeCheck } from "react-icons/lu";
import PageHeader from "@/components/common/PageHeader";
import StatusChip from "@/components/common/StatusChip";
import { users } from "@/data/mock";
import { formatCurrency, formatDate, initials } from "@/helper/format";

const TYPES = ["All", "Freelancer", "Client"];

export default function UsersPage() {
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("Any");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(
      (u) =>
        (type === "All" || u.type === type) &&
        (status === "Any" || u.status === status) &&
        (!q || u.name.toLowerCase().includes(q) || u.email.includes(q))
    );
  }, [type, status, query]);

  const rows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const counts = TYPES.map((t) => (t === "All" ? users.length : users.filter((u) => u.type === t).length));
  const allOnPage = rows.length > 0 && rows.every((r) => selected.includes(r.id));

  const toggleAll = () =>
    setSelected((s) => (allOnPage ? s.filter((id) => !rows.some((r) => r.id === id)) : [...new Set([...s, ...rows.map((r) => r.id)])]));
  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Freelancers and clients registered on the marketplace."
        actions={
          <>
            <Button variant="outlined" color="inherit" startIcon={<LuDownload size={16} />} sx={{ borderColor: "divider" }}>
              Export
            </Button>
            <Button variant="contained" startIcon={<LuPlus size={16} />}>
              Add user
            </Button>
          </>
        }
      />

      <Card>
        <Tabs
          value={type}
          onChange={(_, v) => { setType(v); setPage(0); }}
          sx={{ px: 2, borderBottom: 1, borderColor: "divider", minHeight: 48, "& .MuiTab-root": { minHeight: 48, textTransform: "none", fontWeight: 600 } }}
        >
          {TYPES.map((t, i) => (
            <Tab
              key={t}
              value={t}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {t === "All" ? "All users" : `${t}s`}
                  <Box component="span" className="num" sx={{ fontSize: 11.5, px: 0.75, borderRadius: "6px", bgcolor: "action.selected" }}>
                    {counts[i]}
                  </Box>
                </Box>
              }
            />
          ))}
        </Tabs>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, p: 2, alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Search by name or email"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0); }}
            sx={{ flex: "1 1 260px", maxWidth: 380 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><LuSearch size={16} /></InputAdornment> } }}
          />
          <TextField select size="small" label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} sx={{ width: 160 }}>
            {["Any", "Active", "Pending", "Suspended"].map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          {selected.length > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: "auto" }}>
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{selected.length} selected</Typography>
              <Button size="small" color="inherit" variant="outlined" sx={{ borderColor: "divider" }}>Send message</Button>
              <Button size="small" color="error" variant="outlined">Suspend</Button>
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
                <TableCell align="right">Earned / spent</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((u) => (
                <TableRow key={u.id} hover selected={selected.includes(u.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox size="small" checked={selected.includes(u.id)} onChange={() => toggle(u.id)} inputProps={{ "aria-label": `Select ${u.name}` }} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{ width: 34, height: 34, fontSize: 12.5, bgcolor: "primary.light", color: "primary.main", fontWeight: 600 }}>
                        {initials(u.name)}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 0.5 }}>
                          {u.name}
                          {u.verified && (
                            <Tooltip title="Identity verified">
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
                  <TableCell sx={{ fontSize: 13.5 }}>{u.type}</TableCell>
                  <TableCell sx={{ fontSize: 13.5 }}>{u.country}</TableCell>
                  <TableCell><StatusChip status={u.status} /></TableCell>
                  <TableCell sx={{ fontSize: 13.5, color: "text.secondary" }}>{formatDate(u.joined)}</TableCell>
                  <TableCell align="right" className="num" sx={{ fontSize: 13.5, fontWeight: 600 }}>{formatCurrency(u.spentOrEarned)}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" aria-label={`Actions for ${u.name}`}>
                      <LuEllipsisVertical size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
                    No users match these filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Card>
    </>
  );
}
