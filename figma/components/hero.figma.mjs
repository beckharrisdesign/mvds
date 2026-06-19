// Hero → Figma component manifest (content block).
// Axis: variant (plain / with-background) — synthetic.
// Full-bleed section: bg-muted py-24. with-background adds a gradient scrim
// (from-background/80 to-background/20) above a placeholder image fill.

export default {
  name: "Hero",
  page: "Components",
  code: { file: "src/components/blocks/hero.tsx" },

  axes: [
    {
      name: "variant",
      source: { kind: "synthetic" },
      options: ["plain", "with-background"],
    },
  ],
  defaults: { variant: "plain" },

  base: {
    layout: { mode: "VERTICAL", primaryAlign: "CENTER", counterAlign: "CENTER" },
    width: { value: 1280, resizable: true }, // full-bleed canvas width
    paddingY: { value: 96 }, // py-24 = 96px
    paddingX: { var: "space-32" }, // Container xl inner gutter
    fill: { var: "muted" }, // bg-muted
    children: [
      {
        name: "Content",
        layout: { mode: "VERTICAL" },
        gap: { var: "space-16" },
        width: { value: 640, resizable: true },
        children: [
          {
            name: "Heading",
            type: "TEXT",
            content: "Section heading",
            textStyle: "Type/Display",
            textFill: { var: "foreground" },
          },
          {
            name: "Body",
            type: "TEXT",
            content: "Supporting copy that sits below the heading.",
            textStyle: "Type/Body Large",
            textFill: { var: "foreground" }, // muted-foreground on bg-muted is disallowed (contrast rule)
          },
        ],
      },
    ],
  },

  perOption: {
    variant: {
      plain: {},
      // with-background: section fill becomes an image placeholder (muted),
      // scrim overlay added as a second fill (foreground/10 gradient stand-in).
      "with-background": {
        fill: { var: "muted" }, // image placeholder; Figma can't express bg-image
        overlayFill: { var: "foreground", opacity: 0.08 }, // scrim stand-in
      },
    },
  },
}
