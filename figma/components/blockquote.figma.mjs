// Blockquote → Figma component manifest. No variant axes — single block.
// border-l-4 border-primary pl-6 text-body-lg text-foreground italic.
// Note: italic is a font style (not in the weight ramp); the Figma node uses
// Inter Italic as a raw-fallback — recorded here as fontStyle: "Italic".

export default {
  name: "Blockquote",
  page: "Components",
  code: { file: "src/components/blocks/blockquote.tsx" },

  axes: [],
  defaults: {},

  base: {
    layout: { mode: "VERTICAL" },
    width: { value: 480, resizable: true },
    // border-l-4 border-primary — left stroke only, strokeWeight 4
    stroke: { var: "primary", sides: ["LEFT"], weight: 4 },
    paddingLeft: { var: "space-24" }, // pl-6
    children: [
      {
        name: "Quote",
        type: "TEXT",
        content: "The best design systems are the ones teams actually use.",
        textStyle: "Type/Body Large",
        textFill: { var: "foreground" },
        // italic — raw fallback (not in the ramp's weightToFigmaStyle map)
        fontStyle: "Italic",
      },
    ],
  },

  perOption: {},
}
