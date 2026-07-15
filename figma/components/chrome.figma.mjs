// Chrome → Figma component-set manifest (spatial layout primitive).
// Axes: position × bg = 4 × 5 = 20 variants.
// position mirrors the CHROME_CLASSES map (keyof, not cva/prop-union — the
// extractor can't parse it → manual); bg mirrors SURFACE_BG in
// src/components/layout/scales.ts (outside code.file → manual). Keep both
// option lists in step with their maps by hand.
//
// Dimensions bind the chrome dimension tokens (--chrome-top-height etc. in
// src/index.css) so a rebrand's structural proportions flow into Figma.
// sticky positioning and the z-chrome stacking level are runtime behaviors —
// code-only (Figma stacking = layer order).

export default {
  name: "Chrome",
  page: "Components",
  code: { file: "src/components/layout/chrome.tsx" },

  axes: [
    {
      name: "position",
      source: { kind: "manual" }, // truth: CHROME_CLASSES keys in chrome.tsx
      options: ["top", "bottom", "left", "right"],
    },
    {
      name: "bg",
      source: { kind: "manual" }, // truth: SURFACE_BG keys in layout/scales.ts
      options: ["background", "primary", "secondary", "muted", "card"],
    },
  ],
  // position is a REQUIRED prop in code (no default) — "top" is only the
  // variant picker's starting point. bg=background matches the code default.
  defaults: { position: "top", bg: "background" },

  base: {
    layout: { mode: "HORIZONTAL", primaryAlign: "CENTER", counterAlign: "CENTER" },
    fill: { var: "background" },
    children: [
      {
        // No textFill here — the bg axis owns text color (Button precedent:
        // base children stay colorless, every axis option supplies textFill).
        name: "Label",
        type: "TEXT",
        content: "Chrome",
        textStyle: "Type/Small",
      },
    ],
  },

  perOption: {
    position: {
      // h-[var(--chrome-top-height)] w-full — width is a resizable canvas stand-in
      top: {
        width: { value: 1280, resizable: true },
        height: { var: "chrome-top-height" },
      },
      bottom: {
        width: { value: 1280, resizable: true },
        height: { var: "chrome-bottom-height" },
      },
      // w-[var(--chrome-left-width)] h-full — height is a viewport stand-in
      left: {
        layout: { mode: "VERTICAL", primaryAlign: "CENTER", counterAlign: "CENTER" },
        width: { var: "chrome-left-width" },
        height: { value: 800, resizable: true },
      },
      right: {
        layout: { mode: "VERTICAL", primaryAlign: "CENTER", counterAlign: "CENTER" },
        width: { var: "chrome-right-width" },
        height: { value: 800, resizable: true },
      },
    },
    bg: {
      background: { fill: { var: "background" }, textFill: { var: "foreground" } },
      primary: { fill: { var: "primary" }, textFill: { var: "primary-foreground" } },
      secondary: { fill: { var: "secondary" }, textFill: { var: "secondary-foreground" } },
      // muted-foreground on bg-muted is disallowed (contrast rule) → foreground
      muted: { fill: { var: "muted" }, textFill: { var: "foreground" } },
      card: { fill: { var: "card" }, textFill: { var: "card-foreground" } },
    },
  },
}
