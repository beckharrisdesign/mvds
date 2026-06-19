// Select → Figma component manifest.
// Axis: size (default / sm) — synthetic (data-[size=…] attribute).
// No disabled state per sync policy.
// Trigger: inline-flex border border-input rounded-lg text-small pl-2 pr-2.
// default: h-8 (32px), sm: h-6 (24px) rounded-[min(radius-md,10px)] = 8px.

export default {
  name: "Select",
  page: "Components",
  code: { file: "src/components/ui/select.tsx" },

  axes: [
    {
      name: "size",
      source: { kind: "synthetic" },
      options: ["default", "sm"],
    },
  ],
  defaults: { size: "default" },

  base: {
    layout: { mode: "HORIZONTAL", primaryAlign: "CENTER", counterAlign: "SPACE_BETWEEN" },
    width: { value: 160, resizable: true },
    cornerRadius: { var: "radius" }, // rounded-lg
    stroke: { var: "border" }, // border border-input
    paddingX: { var: "space-8" }, // pl-2 pr-2
    gap: { var: "space-8" }, // gap-2
    children: [
      {
        name: "Value",
        type: "TEXT",
        content: "Select option",
        textStyle: "Type/Small",
        textFill: { var: "foreground" },
      },
      {
        name: "Icon",
        type: "TEXT",
        content: "⌄",
        textStyle: "Type/Small",
        textFill: { var: "muted-foreground" },
      },
    ],
  },

  perOption: {
    size: {
      default: {
        height: { var: "space-32" }, // h-8
        cornerRadius: { var: "radius" },
      },
      sm: {
        height: { var: "space-24" }, // h-6
        cornerRadius: { value: 8 }, // rounded-[min(radius-md,10px)]
      },
    },
  },
}
