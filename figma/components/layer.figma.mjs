// Layer → Figma component-set manifest (spatial layout primitive).
// Axis: level (overlay / float / modal / toast) — mirrors the LAYER_Z map
// (keyof, not cva/prop-union → manual). Keep options in step by hand.
//
// Layer is pure stacking vocabulary: code differs per level ONLY by z-index
// (--z-overlay … --z-toast), which Figma cannot express (stacking = layer
// order). The variants are therefore visually identical, transparent frames —
// their value in a mockup is the NAMED level, so a design says "this sits at
// modal" the same way code does. The frame itself is a viewport stand-in for
// `fixed inset-0`; it deliberately has NO fill (code Layer owns no background
// — a scrim is content you put inside it).

export default {
  name: "Layer",
  page: "Components",
  code: { file: "src/components/layout/layer.tsx" },

  axes: [
    {
      name: "level",
      source: { kind: "manual" }, // truth: LAYER_Z keys in layer.tsx
      options: ["overlay", "float", "modal", "toast"],
    },
  ],
  defaults: { level: "modal" }, // code default

  base: {
    layout: { mode: "VERTICAL", primaryAlign: "CENTER", counterAlign: "CENTER" },
    width: { value: 1280, resizable: true }, // fixed inset-0 viewport stand-in
    height: { value: 800, resizable: true },
    fill: null, // transparent — Layer positions, it does not paint
    children: [
      {
        name: "Label",
        type: "TEXT",
        content: "Layer",
        textStyle: "Type/Small",
        textFill: { var: "foreground" },
      },
    ],
  },

  perOption: {
    // z-index is not representable in Figma — every level is the same frame;
    // the variant name carries the meaning.
    level: {
      overlay: {},
      float: {},
      modal: {},
      toast: {},
    },
  },
}
