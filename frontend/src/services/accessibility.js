export const A11Y_KEYS = {
  motion: "devdoc-reduce-motion",
  scale: "devdoc-text-scale",
  focus: "devdoc-focus-visible",
  contrast: "devdoc-high-contrast",
};

export function readBool(key, fallback = false) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value === "true";
  } catch {
    return fallback;
  }
}

export function readScale() {
  try {
    return localStorage.getItem(A11Y_KEYS.scale) || "default";
  } catch {
    return "default";
  }
}

export function applyA11yPrefs() {
  const root = document.documentElement;
  root.setAttribute("data-reduce-motion", String(readBool(A11Y_KEYS.motion)));
  root.setAttribute("data-focus-visible", String(readBool(A11Y_KEYS.focus, true)));
  root.setAttribute("data-high-contrast", String(readBool(A11Y_KEYS.contrast)));
  root.setAttribute("data-text-scale", readScale());
}
