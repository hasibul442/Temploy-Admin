/**
 * Claymorphism tokens. A clay surface = soft outer drop shadow (depth)
 * + white inner highlight top-left + tinted inner shade bottom-right (puffiness).
 * Shadows are tinted with a warm brown that matches the cream page, instead of black,
 * so they read as soft clay rather than grey smudges.
 */
const ink = "120, 96, 60"; // rgb of the warm brown used for all shading

export const clay = {
  /** rgb triplet for one-off shadows that should match the clay shading. */
  ink,
  /** Page background: warm cream so white clay surfaces stand out. */
  bg: "#F5F0E6",
  /** Warm white for cards and raised surfaces. */
  paper: "#fffdf9",
  /** Large surfaces: cards, menus, dialogs. */
  card: [
    `10px 12px 28px rgba(${ink}, 0.12)`,
    `-8px -8px 22px rgba(255, 255, 255, 0.75)`,
    `inset 3px 3px 6px rgba(255, 255, 255, 0.95)`,
    `inset -4px -5px 10px rgba(${ink}, 0.07)`,
  ].join(", "),
  /** Small raised elements: pills, icon buttons, selected nav item. */
  raised: [
    `5px 6px 14px rgba(${ink}, 0.14)`,
    `-4px -4px 10px rgba(255, 255, 255, 0.8)`,
    `inset 2px 2px 4px rgba(255, 255, 255, 0.95)`,
    `inset -2px -3px 6px rgba(${ink}, 0.08)`,
  ].join(", "),
  /** Pushed-in wells: inputs, toggle tracks, progress tracks. */
  pressed: `inset 3px 3px 7px rgba(${ink}, 0.13), inset -3px -3px 7px rgba(255, 255, 255, 0.9)`,
  /** Puffy filled element in a given color (rgb triplet), e.g. primary buttons, icon blobs. */
  tinted: (rgb, strength = 0.32) =>
    [
      `5px 8px 16px rgba(${rgb}, ${strength})`,
      `inset 3px 3px 6px rgba(255, 255, 255, 0.45)`,
      `inset -3px -4px 8px rgba(0, 0, 0, 0.14)`,
    ].join(", "),
};

/** rgb triplets for tinted clay, matching the theme palette. */
export const clayRgb = {
  primary: "46, 125, 50",
  secondary: "23, 58, 33",
  success: "16, 138, 92",
  info: "47, 111, 237",
  warning: "230, 150, 30",
  error: "211, 58, 58",
};
