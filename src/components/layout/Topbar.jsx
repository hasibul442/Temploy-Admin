"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Box,
  IconButton,
  InputBase,
  Tooltip,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Typography,
} from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import { LuMenu, LuSearch, LuBell, LuMoon, LuSun, LuMonitor, LuLogOut, LuUser, LuSettings } from "react-icons/lu";

function ThemeToggle() {
  const { mode, setMode } = useColorScheme();
  if (!mode) return <Box sx={{ width: 40 }} />;
  const next = { light: "dark", dark: "system", system: "light" }[mode];
  const Icon = { light: LuSun, dark: LuMoon, system: LuMonitor }[mode];
  return (
    <Tooltip title={`Theme: ${mode} (switch to ${next})`}>
      <IconButton onClick={() => setMode(next)} aria-label="Toggle color theme">
        <Icon size={18} />
      </IconButton>
    </Tooltip>
  );
}

export default function Topbar({ onMenuClick }) {
  const router = useRouter();
  const [anchor, setAnchor] = useState(null);

  const logout = () => {
    Cookies.remove("token");
    router.push("/auth/login");
  };

  return (
    <Box
      component="header"
      sx={(theme) => ({
        position: "sticky",
        top: 0,
        zIndex: theme.zIndex.appBar,
        height: 64,
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: { xs: 2, md: 3 },
        bgcolor: `rgba(${theme.vars.palette.background.defaultChannel} / 0.85)`,
        backdropFilter: "blur(8px)",
        borderBottom: 1,
        borderColor: "divider",
      })}
    >
      <IconButton onClick={onMenuClick} aria-label="Toggle sidebar" edge="start">
        <LuMenu size={20} />
      </IconButton>

      <Box
        sx={{
          display: { xs: "none", sm: "flex" },
          alignItems: "center",
          gap: 1,
          px: 1.5,
          height: 38,
          width: { sm: 260, md: 340 },
          borderRadius: "8px",
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          color: "text.secondary",
          "&:focus-within": { borderColor: "primary.main" },
        }}
      >
        <LuSearch size={16} />
        <InputBase placeholder="Search users, orders, gigs…" sx={{ flex: 1, fontSize: 14 }} inputProps={{ "aria-label": "Search" }} />
        <Typography variant="caption" sx={{ border: 1, borderColor: "divider", borderRadius: "4px", px: 0.75, color: "text.disabled" }}>
          ⌘K
        </Typography>
      </Box>

      <Box sx={{ flex: 1 }} />

      <ThemeToggle />
      <Tooltip title="Notifications">
        <IconButton aria-label="Notifications">
          <Badge color="error" variant="dot" overlap="circular">
            <LuBell size={18} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Box
        component="button"
        onClick={(e) => setAnchor(e.currentTarget)}
        aria-label="Account menu"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          ml: 1,
          pl: 0.5,
          pr: { xs: 0.5, md: 1.5 },
          py: 0.5,
          border: 0,
          bgcolor: "transparent",
          color: "inherit",
          font: "inherit",
          borderRadius: "999px",
          cursor: "pointer",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: "primary.main" }}>HH</Avatar>
        <Box sx={{ display: { xs: "none", md: "block" }, textAlign: "left" }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>Hasibul Hasan</Typography>
          <Typography sx={{ fontSize: 11, color: "text.secondary" }}>Super admin</Typography>
        </Box>
      </Box>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 200, border: 1, borderColor: "divider" } } }}
      >
        <MenuItem onClick={() => setAnchor(null)}>
          <ListItemIcon><LuUser size={16} /></ListItemIcon>Profile
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); router.push("/settings"); }}>
          <ListItemIcon><LuSettings size={16} /></ListItemIcon>Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={logout} sx={{ color: "error.main" }}>
          <ListItemIcon sx={{ color: "inherit" }}><LuLogOut size={16} /></ListItemIcon>Log out
        </MenuItem>
      </Menu>
    </Box>
  );
}
