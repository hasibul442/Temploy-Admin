"use client";
import { useState } from "react";
import { Box, Drawer, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Sidebar, { SIDEBAR_WIDTH } from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminShell({ children }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"), { noSsr: true });
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = () => (isDesktop ? setDesktopOpen((o) => !o) : setMobileOpen((o) => !o));

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Desktop: persistent sidebar that slides fully out when toggled */}
      <Box
        sx={{
          display: { xs: "none", lg: "block" },
          width: desktopOpen ? SIDEBAR_WIDTH : 0,
          flexShrink: 0,
          transition: "width .25s ease",
        }}
      >
        <Box
          aria-hidden={!desktopOpen}
          inert={!desktopOpen}
          sx={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            width: SIDEBAR_WIDTH,
            zIndex: (t) => t.zIndex.appBar + 1,
            transform: desktopOpen ? "none" : `translateX(-${SIDEBAR_WIDTH}px)`,
            transition: "transform .25s ease",
          }}
        >
          <Sidebar />
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
        <Topbar onMenuClick={toggle} />
        <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 }, maxWidth: 1480, width: "100%", mx: "auto" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
