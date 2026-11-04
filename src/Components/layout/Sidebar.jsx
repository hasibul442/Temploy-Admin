"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Typography, Tooltip, Chip } from "@mui/material";
import { NAV_SECTIONS, findNavItem } from "@/config/navigation";

export const SIDEBAR_WIDTH = 260;
export const SIDEBAR_COLLAPSED_WIDTH = 76;

function Brand({ collapsed }) {
  return (
    <Box
      component={Link}
      href="/"
      sx={{ display: "flex", alignItems: "center", gap: 1.25, px: collapsed ? 0 : 1, justifyContent: collapsed ? "center" : "flex-start", height: 64 }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "10px",
          bgcolor: "primary.main",
          color: "primary.contrastText",
          display: "grid",
          placeItems: "center",
          fontWeight: 800,
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        T
      </Box>
      {!collapsed && (
        <Box>
          <Typography sx={{ fontWeight: 700, lineHeight: 1.1 }}>Temploy</Typography>
          <Typography variant="caption" color="text.secondary">
            Admin console
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function NavLink({ item, active, collapsed, onNavigate }) {
  const Icon = item.icon;
  const link = (
    <Box
      component={Link}
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      sx={(theme) => ({
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        height: 40,
        px: collapsed ? 0 : 1.5,
        justifyContent: collapsed ? "center" : "flex-start",
        borderRadius: "8px",
        fontSize: 14,
        fontWeight: active ? 600 : 500,
        color: active ? theme.vars.palette.primary.main : theme.vars.palette.text.secondary,
        bgcolor: active ? theme.vars.palette.primary.light : "transparent",
        position: "relative",
        transition: "background-color .15s, color .15s",
        "&:hover": {
          bgcolor: active ? theme.vars.palette.primary.light : theme.vars.palette.action.hover,
          color: active ? theme.vars.palette.primary.main : theme.vars.palette.text.primary,
        },
        "&:focus-visible": { outline: `2px solid ${theme.vars.palette.primary.main}`, outlineOffset: 2 },
      })}
    >
      <Icon size={18} style={{ flexShrink: 0 }} />
      {!collapsed && <Box sx={{ flex: 1, whiteSpace: "nowrap" }}>{item.label}</Box>}
      {!collapsed && item.badge ? (
        <Chip label={item.badge} size="small" sx={{ height: 20, fontSize: 11, bgcolor: "action.selected" }} />
      ) : null}
      {collapsed && item.badge ? (
        <Box sx={{ position: "absolute", top: 8, right: 14, width: 7, height: 7, borderRadius: "50%", bgcolor: "error.main" }} />
      ) : null}
    </Box>
  );
  return collapsed ? (
    <Tooltip title={item.label} placement="right">
      {link}
    </Tooltip>
  ) : (
    link
  );
}

export default function Sidebar({ collapsed = false, onNavigate }) {
  const pathname = usePathname() || "/";
  const activeHref = findNavItem(pathname)?.href;

  return (
    <Box
      component="nav"
      aria-label="Main navigation"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        px: 1.5,
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
      }}
    >
      <Brand collapsed={collapsed} />
      <Box sx={{ flex: 1, overflowY: "auto", pb: 2, mx: -0.5, px: 0.5 }}>
        {NAV_SECTIONS.map((section) => (
          <Box key={section.title} sx={{ mt: 2 }}>
            {collapsed ? (
              <Box sx={{ height: 1, bgcolor: "divider", mx: 1.5, mb: 1 }} />
            ) : (
              <Typography variant="overline" component="div" color="text.disabled" sx={{ px: 1.5, mb: 0.5 }}>
                {section.title}
              </Typography>
            )}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  active={item.href === activeHref}
                  onNavigate={onNavigate}
                />
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
