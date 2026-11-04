"use client";
import { useState } from "react";
import { Box, Drawer, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Sidebar, { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminShell({ children }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"), { noSsr: true });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const width = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Desktop: persistent, collapsible rail */}
      <Box
        sx={{
          display: { xs: "none", lg: "block" },
          width,
          flexShrink: 0,
          transition: "width .2s ease",
        }}
      >
        <Box sx={{ position: "fixed", top: 0, bottom: 0, width, transition: "width .2s ease" }}>
          <Sidebar collapsed={collapsed} />
        </Box>
      </Box>

      {/* Mobile / tablet: temporary drawer */}
      <Drawer
        open={mobileOpen && !isDesktop}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { lg: "none" }, "& .MuiDrawer-paper": { width: SIDEBAR_WIDTH, border: 0 } }}
      >
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Topbar onMenuClick={() => (isDesktop ? setCollapsed((c) => !c) : setMobileOpen(true))} />
        <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 }, maxWidth: 1480, width: "100%", mx: "auto" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
