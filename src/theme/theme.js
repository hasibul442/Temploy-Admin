"use client";
import { createTheme } from "@mui/material/styles";

/**
 * Temploy admin theme.
 * Light + dark schemes are both hand-picked (dark is not an automatic inversion).
 * Colors are exposed as CSS variables (theme.vars.*) so the toggle doesn't flash.
 */
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#4f46e5", light: "#eef0ff", dark: "#3730a3", contrastText: "#fff" },
        secondary: { main: "#0f172a" },
        success: { main: "#15803d", light: "#e8f6ee" },
        warning: { main: "#b45309", light: "#fdf3e3" },
        error: { main: "#c02626", light: "#fdecec" },
        info: { main: "#0369a1", light: "#e6f3fb" },
        background: { default: "#f5f6f8", paper: "#ffffff" },
        text: { primary: "#0f172a", secondary: "#5b6474", disabled: "#9aa1ad" },
        divider: "#e6e8ec",
        chart: { series1: "#2a78d6", series2: "#eb6834", series3: "#1baf7a", grid: "#eceef1", muted: "#c9cdd4" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#8b85ff", light: "#25234a", dark: "#b5b1ff", contrastText: "#0b0b14" },
        secondary: { main: "#e2e8f0" },
        success: { main: "#4ade80", light: "#173324" },
        warning: { main: "#fbbf24", light: "#3a2c10" },
        error: { main: "#f87171", light: "#3b1a1a" },
        info: { main: "#38bdf8", light: "#10303f" },
        background: { default: "#0e1014", paper: "#16191f" },
        text: { primary: "#eef0f3", secondary: "#a3aab5", disabled: "#6b7280" },
        divider: "#262a32",
        chart: { series1: "#3987e5", series2: "#d95926", series3: "#199e70", grid: "#23272e", muted: "#3a3f48" },
      },
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "var(--font-inter), system-ui, -apple-system, Segoe UI, sans-serif",
    h4: { fontWeight: 700, fontSize: "1.5rem", letterSpacing: "-0.01em" },
    h5: { fontWeight: 700, fontSize: "1.25rem" },
    h6: { fontWeight: 600, fontSize: "1rem" },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
    overline: { fontWeight: 600, letterSpacing: "0.08em", fontSize: "0.68rem" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { WebkitFontSmoothing: "antialiased" } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${theme.vars.palette.divider}`,
          borderRadius: 14,
        }),
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, borderRadius: 6 } },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({ borderColor: theme.vars.palette.divider }),
        head: ({ theme }) => ({
          fontSize: "0.72rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: theme.vars.palette.text.secondary,
          backgroundColor: theme.vars.palette.background.default,
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiTooltip: {
      defaultProps: { arrow: true },
    },
  },
});

export default theme;
