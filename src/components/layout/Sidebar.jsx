"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Typography, Chip, Collapse } from "@mui/material";
import { LuChevronRight } from "react-icons/lu";
import { NAV_SECTIONS, findNavItem } from "@/config/navigation";

export const SIDEBAR_WIDTH = 260;

function Brand() {
  return (
    <Box component={Link} href="/" sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 1, height: 64, flexShrink: 0 }}>
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
      <Box>
        <Typography sx={{ fontWeight: 700, lineHeight: 1.1 }}>Temploy</Typography>
        <Typography variant="caption" color="text.secondary">
          Admin console
        </Typography>
      </Box>
    </Box>
  );
}

/** Shared look for top-level links and group toggles. */
const rowSx = (active) => (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  width: "100%",
  height: 40,
  px: 1.5,
  border: 0,
  borderRadius: "8px",
  font: "inherit",
  fontSize: 14,
  fontWeight: active ? 600 : 500,
  textAlign: "left",
  cursor: "pointer",
  color: active ? theme.vars.palette.primary.main : theme.vars.palette.text.secondary,
  bgcolor: active ? theme.vars.palette.primary.light : "transparent",
  transition: "background-color .15s, color .15s",
  "&:hover": {
    bgcolor: active ? theme.vars.palette.primary.light : theme.vars.palette.action.hover,
    color: active ? theme.vars.palette.primary.main : theme.vars.palette.text.primary,
  },
  "&:focus-visible": { outline: `2px solid ${theme.vars.palette.primary.main}`, outlineOffset: 2 },
});

function Badge({ value }) {
  return value ? <Chip label={value} size="small" sx={{ height: 20, fontSize: 11, bgcolor: "action.selected" }} /> : null;
}

function NavLink({ item, active, onNavigate }) {
  const Icon = item.icon;
  return (
    <Box component={Link} href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} sx={rowSx(active)}>
      <Icon size={18} style={{ flexShrink: 0 }} />
      <Box sx={{ flex: 1, whiteSpace: "nowrap" }}>{item.label}</Box>
      <Badge value={item.badge} />
    </Box>
  );
}

function NavGroup({ item, activeHref, onNavigate }) {
  const Icon = item.icon;
  const containsActive = item.children.some((c) => c.href === activeHref);
  const [open, setOpen] = useState(containsActive);
  // Re-open when navigation lands on one of this group's pages.
  const [prevContains, setPrevContains] = useState(containsActive);
  if (containsActive !== prevContains) {
    setPrevContains(containsActive);
    if (containsActive) setOpen(true);
  }

  const total = item.children.reduce((n, c) => n + (c.badge || 0), 0);
  const id = `nav-group-${item.label.toLowerCase().replace(/\W+/g, "-")}`;

  return (
    <Box>
      <Box
        component="button"
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        sx={(theme) => ({
          ...rowSx(false)(theme),
          ...(containsActive && { color: theme.vars.palette.text.primary, fontWeight: 600 }),
        })}
      >
        <Icon size={18} style={{ flexShrink: 0 }} />
        <Box sx={{ flex: 1, whiteSpace: "nowrap" }}>{item.label}</Box>
        {!open && <Badge value={total} />}
        <LuChevronRight
          size={16}
          style={{ flexShrink: 0, transition: "transform .2s", transform: open ? "rotate(90deg)" : "none" }}
        />
      </Box>
      <Collapse in={open} timeout={200} unmountOnExit={false}>
        <Box
          id={id}
          component="ul"
          sx={{ listStyle: "none", m: 0, p: 0, pl: "26px", py: 0.25, display: "flex", flexDirection: "column", gap: 0.25 }}
        >
          {item.children.map((child) => {
            const active = child.href === activeHref;
            return (
              <Box component="li" key={child.href}>
                <Box
                  component={Link}
                  href={child.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  sx={(theme) => ({
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    height: 34,
                    pl: 2,
                    pr: 1.5,
                    borderLeft: `2px solid ${active ? theme.vars.palette.primary.main : theme.vars.palette.divider}`,
                    fontSize: 13.5,
                    fontWeight: active ? 600 : 400,
                    color: active ? theme.vars.palette.primary.main : theme.vars.palette.text.secondary,
                    transition: "color .15s, border-color .15s",
                    "&:hover": { color: active ? theme.vars.palette.primary.main : theme.vars.palette.text.primary },
                    "&:focus-visible": { outline: `2px solid ${theme.vars.palette.primary.main}`, outlineOffset: -2 },
                  })}
                >
                  <Box sx={{ flex: 1, whiteSpace: "nowrap" }}>{child.label}</Box>
                  <Badge value={child.badge} />
                </Box>
              </Box>
            );
          })}
        </Box>
      </Collapse>
    </Box>
  );
}

export default function Sidebar({ onNavigate }) {
  const pathname = usePathname() || "/";
  const activeHref = findNavItem(pathname)?.href;

  return (
    <Box
      component="nav"
      aria-label="Main navigation"
      sx={{
        width: SIDEBAR_WIDTH,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        px: 1.5,
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
      }}
    >
      <Brand />
      <Box sx={{ flex: 1, overflowY: "auto", pb: 2, mx: -0.5, px: 0.5 }}>
        {NAV_SECTIONS.map((section) => (
          <Box key={section.title} sx={{ mt: 2 }}>
            <Typography variant="overline" component="div" color="text.disabled" sx={{ px: 1.5, mb: 0.5 }}>
              {section.title}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
              {section.items.map((item) =>
                item.children ? (
                  <NavGroup key={item.label} item={item} activeHref={activeHref} onNavigate={onNavigate} />
                ) : (
                  <NavLink key={item.href} item={item} active={item.href === activeHref} onNavigate={onNavigate} />
                )
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
