// RadioGroupItem → Figma component manifest (the selectable control, not the
// container). Axis: state (unchecked / checked) — synthetic (data-checked).
// No disabled state per sync policy.
// size-4 (16px) rounded-full border border-input.
// Checked: border-primary bg-primary; inner dot bg-primary-foreground.

export default {
  name: "RadioGroupItem",
  page: "Components",
  code: { file: "src/components/ui/radio-group.tsx" },

  axes: [
    {
      name: "state",
      source: { kind: "synthetic" },
      options: ["unchecked", "checked"],
    },
  ],
  defaults: { state: "unchecked" },

  base: {
    layout: { mode: "HORIZONTAL", primaryAlign: "CENTER", counterAlign: "CENTER" },
    width: { value: 16 },
    height: { value: 16 },
    cornerRadius: { value: 8 }, // rounded-full (half of 16)
    stroke: { var: "input" },
    children: [
      {
        name: "Dot",
        type: "ELLIPSE",
        width: 8,
        height: 8,
        fill: { var: "primary-foreground" },
      },
    ],
  },

  perOption: {
    state: {
      unchecked: {
        fill: null,
        stroke: { var: "input" },
        childVisibility: { Dot: false },
      },
      checked: {
        fill: { var: "primary" },
        stroke: { var: "primary" },
        childVisibility: { Dot: true },
      },
    },
  },
}
