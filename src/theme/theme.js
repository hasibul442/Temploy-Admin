"use client";
import { createTheme } from "@mui/material/styles";
import { clay, clayRgb } from "./clay";

/**
 * Temploy admin theme — matches the Temploy marketplace brand (green on white).
 * Fonts are loaded with next/font in app/layout.jsx and exposed as CSS variables.
 * `cssVariables` stays on because layout/chart components read `theme.vars.*`.
 */
const display = 'var(--font-display), Poppins, Lato, system-ui, sans-serif';
const body = 'var(--font-body), Roboto, Poppins, Lato, system-ui, -apple-system, "Segoe UI", sans-serif';

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: { main: "#2e7d32", dark: "#1b5e20", light: "#e8f5e9", contrastText: "#ffffff" },
    secondary: { main: "#173a21", dark: "#0f2716", light: "#eef4ee", contrastText: "#ffffff" },
    success: { main: "#108a5c", light: "#e8f6ef" },
    error: { main: "#d33a3a", light: "#fdecec" },
    warning: { main: "#ffb33e", light: "#fff6e6", contrastText: "#1d1d1f" },
    info: { main: "#2f6fed", light: "#ecf2ff" },
    text: { primary: "#1d1d1f", secondary: "#74767e", disabled: "#a3a5ab" },
    // Claymorphism: cream page, warm-white puffy surfaces (see ./clay.js).
    background: { default: clay.bg, paper: clay.paper },
    divider: "#e9e1d2",
    // Admin-only: data-viz colors used by components/charts and the dashboard.
    chart: { series1: "#2e7d32", series2: "#ffb33e", series3: "#2f6fed", grid: "#ece5d7", muted: "#c9bfae" },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: body,
    h1: { fontFamily: display, fontWeight: 800, letterSpacing: "-0.03em" },
    h2: { fontFamily: display, fontWeight: 800, letterSpacing: "-0.03em" },
    h3: { fontFamily: display, fontWeight: 700, letterSpacing: "-0.02em" },
    h4: { fontFamily: display, fontWeight: 700, letterSpacing: "-0.02em", fontSize: "1.5rem" },
    h5: { fontFamily: display, fontWeight: 700, letterSpacing: "-0.01em", fontSize: "1.25rem" },
    h6: { fontFamily: display, fontWeight: 700, fontSize: "1rem" },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 700 },
    body1: { fontSize: 15 },
    body2: { fontSize: 13.5 },
    overline: { fontWeight: 700, letterSpacing: "0.08em", fontSize: "0.68rem" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { WebkitFontSmoothing: "antialiased" } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 14,
          paddingInline: 18,
          paddingBlock: 9,
          fontWeight: 600,
          fontSize: 14.5,
          lineHeight: 1.3,
          transition: "background-color .15s ease, box-shadow .15s ease, color .15s ease, transform .15s ease",
          "&:active": { transform: "translateY(1px)" },
        },
        sizeLarge: { paddingInline: 24, paddingBlock: 13, fontSize: 15.5, borderRadius: 16 },
        sizeSmall: { paddingInline: 13, paddingBlock: 6, fontSize: 13, borderRadius: 11 },
        // Puffy clay pill in brand green.
        containedPrimary: {
          color: "#ffffff",
          backgroundImage: "linear-gradient(145deg, #43a047 0%, #2e7d32 55%, #1b5e20 100%)",
          boxShadow: clay.tinted(clayRgb.primary),
          "&:hover": {
            backgroundColor: "#1b5e20",
            backgroundImage: "linear-gradient(145deg, #388e3c 0%, #2e7d32 45%, #1b5e20 100%)",
            boxShadow: clay.tinted(clayRgb.primary, 0.42),
          },
          "&:active": { boxShadow: `inset 3px 3px 8px rgba(0,0,0,0.25), inset -2px -2px 6px rgba(255,255,255,0.2)` },
          "&.Mui-disabled": { backgroundImage: "none", boxShadow: "none" },
        },
        containedSecondary: {
          backgroundImage: "linear-gradient(155deg, #2b6b3a 0%, #173a21 55%, #0f2716 100%)",
          boxShadow: clay.tinted(clayRgb.secondary),
          "&:hover": { backgroundColor: "#0f2716", backgroundImage: "none" },
          "&.Mui-disabled": { backgroundImage: "none" },
        },
        // Outlined buttons become white clay pills; the color still comes from the variant.
        outlined: {
          border: "1px solid transparent",
          backgroundColor: clay.paper,
          boxShadow: clay.raised,
          "&:hover": { border: "1px solid transparent", backgroundColor: "#ffffff" },
          "&:active": { boxShadow: clay.pressed },
        },
        outlinedPrimary: {
          color: "#1b5e20",
          "&:hover": { backgroundColor: "#f1f8f1" },
        },
        outlinedSecondary: {
          color: "#1d1d1f",
        },
        text: { paddingInline: 12, "&:hover": { boxShadow: clay.raised, backgroundColor: clay.paper } },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { borderRadius: 12 } },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined", size: "medium" },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        // Clay inputs are pushed-in wells.
        root: {
          borderRadius: 14,
          backgroundColor: "#ffffff",
          boxShadow: `inset 2px 3px 6px rgba(${clay.ink}, 0.10)`,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e3dccd", borderWidth: 1 },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#b8ab93" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2e7d32", borderWidth: 1.5 },
        },
        input: { paddingBlock: 13 },
        // Admin filter bars use size="small"; keep them compact.
        inputSizeSmall: { paddingBlock: 8.5 },
      },
    },
    MuiInputLabel: {
      styleOverrides: { root: { fontWeight: 500, color: "#74767e" } },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 10, height: 28 },
        sizeSmall: { height: 22, borderRadius: 8 },
        outlined: { borderColor: "#e9e1d2" },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: "none" },
        rounded: { borderRadius: 18 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { border: 0, borderRadius: 26, boxShadow: clay.card },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: "#efe9dd" },
        head: {
          fontSize: "0.72rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "#74767e",
          backgroundColor: "rgba(120, 96, 60, 0.05)",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: { border: 0, boxShadow: clay.card, borderRadius: 18, marginTop: 8 },
        list: { padding: 8 },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: { borderRadius: 10, fontWeight: 500, fontSize: 14, paddingBlock: 9 },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: { border: 0, boxShadow: clay.card, borderRadius: 18 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { border: 0, boxShadow: clay.card, borderRadius: 26 },
      },
    },
    MuiDrawer: {
      styleOverrides: { paper: { borderRadius: 0 } },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { height: 3, borderRadius: 3, backgroundColor: "#2e7d32" },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 700,
          fontSize: 14,
          minHeight: 48,
          color: "#74767e",
          "&.Mui-selected": { color: "#1d1d1f" },
        },
      },
    },
    MuiTooltip: {
      defaultProps: { arrow: true },
      styleOverrides: {
        tooltip: { backgroundColor: "#1d1d1f", fontSize: 12.5, fontWeight: 500, borderRadius: 6, padding: "6px 10px" },
        arrow: { color: "#1d1d1f" },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: { color: "#2e7d32", height: 4 },
        track: { border: 0, backgroundImage: "linear-gradient(90deg, #66bb6a 0%, #2e7d32 55%, #1b5e20 100%)" },
        thumb: { width: 18, height: 18, border: "1px solid #c5c6c9", backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(29,29,31,0.2)" },
        rail: { backgroundColor: "#e4e5e7", opacity: 1 },
        valueLabel: { backgroundColor: "#1d1d1f", borderRadius: 6, fontWeight: 600 },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: { "&.Mui-checked": { color: "#fff" }, "&.Mui-checked + .MuiSwitch-track": { backgroundColor: "#2e7d32", opacity: 1 } },
        track: { backgroundColor: "#c5c6c9", opacity: 1 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { height: 8, borderRadius: 999, backgroundColor: "#ece5d7", boxShadow: clay.pressed },
        bar: { borderRadius: 999, backgroundImage: "linear-gradient(90deg, #66bb6a 0%, #2e7d32 55%, #1b5e20 100%)" },
      },
    },
    MuiRating: {
      styleOverrides: {
        iconFilled: { color: "#ffb33e" },
        iconEmpty: { color: "#d8d9db" },
      },
    },
    MuiAvatar: {
      styleOverrides: { root: { fontFamily: display, fontWeight: 700 } },
    },
    MuiBadge: {
      styleOverrides: { badge: { fontWeight: 700, border: "2px solid #fff" } },
    },
    // Clay segmented control: a pressed-in track with a puffy selected pill.
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: { padding: 4, gap: 4, borderRadius: 14, backgroundColor: clay.bg, boxShadow: clay.pressed },
        grouped: { border: "0 !important", borderRadius: "10px !important", margin: "0 !important" },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 10,
          border: 0,
          color: "#74767e",
          transition: "background-color .15s, box-shadow .15s, color .15s",
          "&.Mui-selected": {
            backgroundColor: "#173a21",
            color: "#fff",
            boxShadow: clay.tinted(clayRgb.secondary, 0.3),
            "&:hover": { backgroundColor: "#235c31" },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 16, fontWeight: 500 } },
    },
    MuiSnackbarContent: {
      styleOverrides: { root: { backgroundColor: "#1d1d1f", borderRadius: 16, fontWeight: 500 } },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: { color: "#e4e5e7", "&.Mui-active": { color: "#2e7d32" }, "&.Mui-completed": { color: "#1b5e20" } },
        text: { fill: "#ffffff", fontWeight: 600 },
      },
    },
    MuiPaginationItem: {
      styleOverrides: { root: { borderRadius: 8, fontWeight: 600 } },
    },
  },
});

export default theme;
