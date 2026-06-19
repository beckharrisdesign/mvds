// Switch → Figma component manifest.
// Axes: size (default / sm) × state (unchecked / checked) — both synthetic.
// No disabled state per sync policy.
// default: h-6 w-10 (24×40), sm: h-4 w-8 (16×32). Thumb: size-4 / size-3.
// Track: unchecked=input, checked=primary. Thumb: bg-background.

export default {
  name: "Switch",
  page: "Components",
  code: { file: "src/components/ui/switch.tsx" },

  axes: [
    {
      name: "size",
      source: { kind: "synthetic" },
      options: ["default", "sm"],
    },
    {
      name: "state",
      source: { kind: "synthetic" },
      options: ["unchecked", "checked"],
    },
  ],
  defaults: { size: "default", state: "unchecked" },

  base: {
    layout: { mode: "HORIZONTAL", counterAlign: "CENTER" },
    cornerRadius: { value: 12 }, // rounded-full (half of h-6=24)
    paddingX: { var: "space-4" }, // px-1 = space-4 (4px = ½×8)
    children: [
      {
        name: "Thumb",
        type: "RECTANGLE",
        fill: { var: "background" },
        cornerRadius: { value: 8 }, // rounded-full
      },
    ],
  },

  perOption: {
    size: {
      default: {
        width: { value: 40 }, // w-10
        height: { value: 24 }, // h-6
        cornerRadius: { value: 12 },
        childOverrides: {
          Thumb: { width: { value: 16 }, height: { value: 16 } }, // size-4
        },
      },
      sm: {
        width: { value: 32 }, // w-8
        height: { value: 16 }, // h-4
        cornerRadius: { value: 8 },
        childOverrides: {
          Thumb: { width: { value: 12 }, height: { value: 12 } }, // size-3
        },
      },
    },
    state: {
      unchecked: { fill: { var: "input" } }, // data-unchecked:bg-input
      checked: { fill: { var: "primary" } },  // data-checked:bg-primary
    },
  },
}
