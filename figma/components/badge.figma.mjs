// Badge → Figma component-set manifest. Structure + exceptions only; mechanical
// bindings follow figma/conventions.mjs. Axis options are drift-guarded against
// the cva() in src/components/ui/badge.tsx by `npm run check:figma`.
//
// One `variant` axis, deliberately NOT Button's emphasis ladder: tone options
// are neutral labels/tags, status options are the AGENTS.md semantic triad as
// tints. No `state` axis — Badge has no disabled affordance in code.

export default {
  name: "Badge",
  page: "Components",
  code: { file: "src/components/ui/badge.tsx" },

  axes: [
    {
      name: "variant",
      source: { kind: "cva", export: "badgeVariants", axis: "variant" },
      options: [
        "default",
        "muted",
        // Deprecated alias of `muted` (badge.tsx) — listed so the drift guard's
        // exact-match against code passes, but no Figma variant is built.
        { name: "secondary", skip: true, reason: "deprecated alias of muted — slated for removal" },
        "outline",
        "success",
        "neutral",
        "destructive",
      ],
    },
  ],
  defaults: { variant: "default" },

  // Base cva: inline-flex centered gap-1 rounded-md border px-2 py-0.5
  // text-caption font-medium. py-0.5 = 2px — off the Scales set, raw value
  // (component-internal metric, not layout spacing).
  base: {
    layout: { mode: "HORIZONTAL", primaryAlign: "CENTER", counterAlign: "CENTER" },
    cornerRadius: { value: 8 }, // rounded-md
    paddingX: { var: "space-8" }, // px-2
    paddingY: { value: 2 }, // py-0.5
    gap: { var: "space-4" }, // gap-1
    stroke: null, // border-transparent — `outline` opts in
    children: [
      {
        name: "Label",
        type: "TEXT",
        content: "Badge",
        textStyle: "Type/Caption", // text-caption (ramp weight 500 = font-medium)
      },
    ],
  },

  perOption: {
    variant: {
      // Tone — neutral labels & tags.
      default: { fill: { var: "primary" }, textFill: { var: "primary-foreground" } },
      muted: { fill: { var: "muted" }, textFill: { var: "foreground" } },
      outline: { fill: null, stroke: { var: "border" }, textFill: { var: "foreground" } },
      // Status — the semantic triad as /10 tints (dark-mode /15–/20 shifts ride
      // the bound variable; Figma shows the light-mode tint per mode switch).
      success: { fill: { var: "success", opacity: 0.1 }, textFill: { var: "success" } },
      neutral: { fill: { var: "neutral", opacity: 0.1 }, textFill: { var: "foreground" } },
      destructive: { fill: { var: "destructive", opacity: 0.1 }, textFill: { var: "destructive" } },
    },
  },
}
