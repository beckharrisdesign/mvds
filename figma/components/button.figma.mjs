// Button → Figma component-set manifest — DATA, not a second implementation.
// Declares structure + exceptions only; mechanical bindings follow
// figma/conventions.mjs. Axis options are drift-guarded against the cva()
// definition in src/components/ui/button.tsx by `npm run check:figma`.
//
// Binding spec shapes: { var: "x" } = bind Figma variable x · { value: n } =
// raw value · { var, opacity } = bind color variable + paint opacity (a tint).

export default {
  name: "Button",
  page: "Components",
  code: { file: "src/components/ui/button.tsx" },

  // Option ORDER here = property-value order in the Figma variant picker.
  axes: [
    {
      name: "variant",
      source: { kind: "cva", export: "buttonVariants", axis: "variant" },
      options: ["default", "outline", "secondary", "ghost", "destructive", "link"],
    },
    {
      name: "size",
      source: { kind: "cva", export: "buttonVariants", axis: "size" },
      options: ["sm", "default", "lg", "icon", "icon-sm", "icon-lg"],
    },
    {
      // Synthetic Figma-only axis — code styles disabled via `disabled:opacity-50`.
      name: "state",
      source: { kind: "synthetic" },
      options: ["default", "disabled"],
    },
  ],
  defaults: { variant: "default", size: "default", state: "default" },

  // The variant frame every option modifies. Base cva: inline-flex centered,
  // rounded-lg, border border-transparent, text-small font-medium.
  base: {
    layout: { mode: "HORIZONTAL", primaryAlign: "CENTER", counterAlign: "CENTER" },
    cornerRadius: { var: "radius" }, // rounded-lg
    stroke: null, // border-transparent — variants opt in (outline)
    children: [
      {
        name: "Label",
        type: "TEXT",
        content: "Button",
        textStyle: "Type/Small",
        fontWeight: 500, // font-medium overrides the ramp's 400
      },
    ],
  },

  // Per-axis-option deltas applied onto base.
  perOption: {
    size: {
      // h-6 gap-1 px-2 text-caption, radius capped: rounded-[min(var(--radius-md),12px)] = 8px
      sm: {
        height: { var: "space-24" },
        paddingX: { var: "space-8" },
        gap: { var: "space-4" },
        cornerRadius: { value: 8 },
        textStyle: "Type/Caption",
      },
      // h-8 gap-2 px-4
      default: {
        height: { var: "space-32" },
        paddingX: { var: "space-16" },
        gap: { var: "space-8" },
      },
      // h-10 gap-2 px-6
      lg: {
        height: { var: "space-40" },
        paddingX: { var: "space-24" },
        gap: { var: "space-8" },
      },
      // Icon sizes: square (size-8/6/10), Label swapped for an icon placeholder.
      // Icon GLYPH px are dimensions (svg size-4 = 16, sm size-3.5 = 14) — raw.
      icon: {
        width: { var: "space-32" },
        height: { var: "space-32" },
        paddingX: { value: 0 },
        replaceChildren: [{ name: "Icon", type: "ICON", size: 16 }],
      },
      "icon-sm": {
        width: { var: "space-24" },
        height: { var: "space-24" },
        paddingX: { value: 0 },
        cornerRadius: { value: 8 },
        replaceChildren: [{ name: "Icon", type: "ICON", size: 14 }],
      },
      "icon-lg": {
        width: { var: "space-40" },
        height: { var: "space-40" },
        paddingX: { value: 0 },
        replaceChildren: [{ name: "Icon", type: "ICON", size: 16 }],
      },
    },
    variant: {
      // bg-primary text-primary-foreground
      default: { fill: { var: "primary" }, textFill: { var: "primary-foreground" } },
      // border-border bg-background (hover bg-muted is code-only)
      outline: {
        fill: { var: "background" },
        stroke: { var: "border" },
        textFill: { var: "foreground" },
      },
      // bg-secondary text-secondary-foreground
      secondary: { fill: { var: "secondary" }, textFill: { var: "secondary-foreground" } },
      // transparent at rest; hover bg-muted is code-only
      ghost: { fill: null, textFill: { var: "foreground" } },
      // bg-destructive/10 text-destructive — a TINT, not a solid
      destructive: {
        fill: { var: "destructive", opacity: 0.1 },
        textFill: { var: "destructive" },
      },
      // text-primary; underline is hover-only → code-only
      link: { fill: null, textFill: { var: "primary" } },
    },
    state: {
      default: {},
      disabled: { opacity: 0.5 }, // disabled:opacity-50 → variant-frame opacity
    },
  },
}
