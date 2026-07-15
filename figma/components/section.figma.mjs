// Section → Figma component-set manifest (spatial layout primitive).
// Axes: bg × py = 5 × 2 = 10 variants.
// bg mirrors SURFACE_BG and py mirrors SECTION_PY, both maps in
// src/components/layout/scales.ts (outside code.file → manual). Keep the
// option lists in step with their maps by hand.
//
// The innerSize axis (7 Container sizes) is PINNED to the code default (xl)
// — founder decision 2026-07-15: mirroring it would explode the matrix to 70
// variants (the Button lesson), and the breakpoint-consistency rule means a
// mockup uses one container size throughout anyway.

export default {
  name: "Section",
  page: "Components",
  code: { file: "src/components/layout/section.tsx" },

  axes: [
    {
      name: "bg",
      source: { kind: "manual" }, // truth: SURFACE_BG keys in layout/scales.ts
      options: ["background", "primary", "secondary", "muted", "card"],
    },
    {
      name: "py",
      source: { kind: "manual" }, // truth: SECTION_PY keys in layout/scales.ts
      options: ["24", "64"],
    },
  ],
  defaults: { bg: "background", py: "24" },

  base: {
    layout: { mode: "VERTICAL", primaryAlign: "MIN", counterAlign: "CENTER" },
    width: { value: 1280, resizable: true }, // full-bleed band
    paddingX: { var: "space-32" }, // Container xl inner gutter (lg:px-8)
    fill: { var: "background" },
    children: [
      {
        name: "Content",
        layout: { mode: "VERTICAL" },
        gap: { var: "space-16" },
        width: { value: 640, resizable: true },
        children: [
          // No textFill on either text node — the bg axis owns text color
          // (Button precedent: base children stay colorless, every axis
          // option supplies textFill).
          {
            name: "Heading",
            type: "TEXT",
            content: "Section heading",
            textStyle: "Type/Heading 2",
          },
          {
            name: "Body",
            type: "TEXT",
            content: "Content band copy — Sections stack top-to-bottom to build a page.",
            textStyle: "Type/Body",
          },
        ],
      },
    ],
  },

  perOption: {
    py: {
      24: { paddingY: { var: "space-24" } }, // py-6
      64: { paddingY: { var: "space-64" } }, // py-16
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
