// Textarea → Figma component manifest. No variant axes (no cva, no size prop).
// Single component showing the placeholder state.
// border border-input rounded-lg px-2 py-2 text-small bg-transparent min-h-16.

export default {
  name: "Textarea",
  page: "Components",
  code: { file: "src/components/ui/textarea.tsx" },

  axes: [],
  defaults: {},

  base: {
    layout: { mode: "VERTICAL" },
    width: { value: 280, resizable: true },
    height: { value: 80 }, // representative min-h-16 (64px) + comfortable padding
    stroke: { var: "border" }, // border border-input
    cornerRadius: { value: 8 }, // rounded-lg
    paddingX: { var: "space-8" }, // px-2
    paddingY: { var: "space-8" }, // py-2
    children: [
      {
        name: "Placeholder",
        type: "TEXT",
        content: "Enter text…",
        textStyle: "Type/Small",
        textFill: { var: "muted-foreground" },
      },
    ],
  },

  perOption: {},
}
