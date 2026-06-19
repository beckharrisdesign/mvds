// Label → Figma component manifest. No variant axes — Label is a single text
// element. font-medium (500) overrides the ramp's 400 on Type/Small.

export default {
  name: "Label",
  page: "Components",
  code: { file: "src/components/ui/label.tsx" },

  axes: [],
  defaults: {},

  // text-small font-medium leading-none text-foreground
  base: {
    layout: { mode: "HORIZONTAL", primaryAlign: "CENTER", counterAlign: "CENTER" },
    children: [
      {
        name: "Label",
        type: "TEXT",
        content: "Label text",
        textStyle: "Type/Small",
        fontWeight: 500, // font-medium — overrides ramp's 400
        textFill: { var: "foreground" },
      },
    ],
  },

  perOption: {},
}
