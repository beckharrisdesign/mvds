// Field → Figma component manifest. Scaffold for form controls: label + input
// slot + support text (error wins over help). Axis: state (default / error).
// gap-2 (8px) vertical stack. No disabled state per sync policy.

export default {
  name: "Field",
  page: "Components",
  code: { file: "src/components/forms/field.tsx" },

  axes: [
    {
      name: "state",
      source: { kind: "synthetic" },
      options: ["default", "error"],
    },
  ],
  defaults: { state: "default" },

  base: {
    layout: { mode: "VERTICAL" },
    gap: { var: "space-8" }, // gap-2
    width: { value: 280, resizable: true },
    children: [
      {
        name: "Label",
        type: "TEXT",
        content: "Email address",
        textStyle: "Type/Small",
        fontWeight: 500,
        textFill: { var: "foreground" },
      },
      {
        name: "Input",
        layout: { mode: "HORIZONTAL", counterAlign: "CENTER" },
        height: { var: "space-32" }, // h-8
        stroke: { var: "border" }, // border border-input
        cornerRadius: { value: 8 }, // rounded-md
        paddingX: { var: "space-8" }, // px-2
        children: [
          {
            name: "Placeholder",
            type: "TEXT",
            content: "you@example.com",
            textStyle: "Type/Small",
            textFill: { var: "muted-foreground" },
          },
        ],
      },
      {
        name: "Support",
        type: "TEXT",
        content: "Help text goes here.",
        textStyle: "Type/Caption",
        textFill: { var: "muted-foreground" },
      },
    ],
  },

  perOption: {
    state: {
      default: {},
      error: {
        childOverrides: {
          Input: { stroke: { var: "destructive" } }, // aria-invalid:border-destructive
          Support: {
            textFill: { var: "destructive" },
            content: "Enter a valid email address.",
          },
        },
      },
    },
  },
}
