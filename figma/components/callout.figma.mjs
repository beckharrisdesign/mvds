// Callout → Figma component manifest (content block).
// Axis: variant (default / with-icon) — synthetic (icon? prop).
// bg-muted rounded-lg p-4. Content: text-body text-foreground.
// with-icon: Inline layout with an icon placeholder preceding content.

export default {
  name: "Callout",
  page: "Components",
  code: { file: "src/components/blocks/callout.tsx" },

  axes: [
    {
      name: "variant",
      source: { kind: "synthetic" },
      options: ["default", "with-icon"],
    },
  ],
  defaults: { variant: "default" },

  base: {
    layout: { mode: "VERTICAL" },
    width: { value: 480, resizable: true },
    fill: { var: "muted" }, // bg-muted
    cornerRadius: { value: 8 }, // rounded-lg
    padding: { var: "space-16" }, // p-4
    children: [
      {
        name: "Content",
        type: "TEXT",
        content: "This is a callout with useful information for the reader.",
        textStyle: "Type/Body",
        textFill: { var: "foreground" },
      },
    ],
  },

  perOption: {
    variant: {
      default: {},
      "with-icon": {
        layout: { mode: "HORIZONTAL", counterAlign: "MIN" },
        gap: { var: "space-8" }, // gap-2
        // Icon slot precedes content — rendered as a small text placeholder
        prependChildren: [
          {
            name: "Icon",
            type: "TEXT",
            content: "ℹ",
            textStyle: "Type/Body",
            textFill: { var: "foreground" },
          },
        ],
      },
    },
  },
}
