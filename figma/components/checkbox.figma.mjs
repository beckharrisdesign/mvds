// Checkbox → Figma component manifest.
// Axis: state (unchecked / checked) — synthetic (data-checked attribute, not cva).
// No disabled state per sync policy (hover/focus/disabled are code-only).
// size-4 (16px square) rounded-[4px] border border-input.
// Checked: border-primary bg-primary text-primary-foreground (check icon slot).

export default {
  name: "Checkbox",
  page: "Components",
  code: { file: "src/components/ui/checkbox.tsx" },

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
    cornerRadius: { value: 4 }, // rounded-[4px]
    stroke: { var: "input" }, // border border-input (default)
    children: [
      {
        name: "Indicator",
        type: "TEXT",
        content: "✓",
        textStyle: "Type/Caption",
        textFill: { var: "primary-foreground" },
      },
    ],
  },

  perOption: {
    state: {
      unchecked: {
        fill: null,
        stroke: { var: "input" },
        childVisibility: { Indicator: false },
      },
      checked: {
        fill: { var: "primary" },
        stroke: { var: "primary" },
        childVisibility: { Indicator: true },
      },
    },
  },
}
