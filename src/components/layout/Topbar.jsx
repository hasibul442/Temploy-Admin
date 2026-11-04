"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Box,
  IconButton,
  Tooltip,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Typography,
} from "@mui/material";
import { LuMenu, LuBell, LuLogOut, LuUser, LuSettings } from "react-icons/lu";
import { clay } from "@/theme/clay";

/** Raised white clay square for the topbar's icon buttons; pushes in when pressed. */
const clayButtonSx = {
  width: 42,
  height: 42,
  borderRadius: "14px",
  bgcolor: "background.paper",
  boxShadow: clay.raised,
  "&:hover": { bgcolor: "#ffffff" },
  "&:active": { boxShadow: clay.pressed },
};

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
        height: 72,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: { xs: 2, md: 3 },
        // White bar over the cream page, separated by a soft shadow.
        bgcolor: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(8px)",
        boxShadow: `0 6px 20px rgba(${clay.ink}, 0.08)`,
      })}
    >
      <IconButton onClick={onMenuClick} aria-label="Toggle sidebar" sx={clayButtonSx}>
        <LuMenu size={20} />
      </IconButton>

      <Box sx={{ flex: 1 }} />

      <Tooltip title="Notifications">
        <IconButton aria-label="Notifications" sx={clayButtonSx}>
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
        slotProps={{ paper: { sx: { mt: 1, minWidth: 200 } } }}
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
