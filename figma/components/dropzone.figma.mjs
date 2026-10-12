// Dropzone → Figma component manifest. MVDS-authored (shadcn ships none).
//
// One axis: `state`. It is `synthetic` rather than `cva`/`prop-union` because
// there is no single code enum to read — the three states come from different
// mechanisms in src/components/forms/dropzone.tsx: `default` is the resting
// style, `dragging` is the `data-[dragging=true]:` variant driven by React
// state, and `disabled` is the `disabled:` variant driven by the prop. A
// Figma variant axis is the right shape for a designer even though no one
// prop spells it.
//
// Adopts the existing Figma set `690:35` by name — never rebuilt.

export default {
  name: "Dropzone",
  page: "Components",
  code: { file: "src/components/forms/dropzone.tsx" },

  axes: [
    {
      name: "state",
      source: { kind: "synthetic" },
      options: ["default", "dragging", "disabled"],
    },
  ],

  defaults: { state: "default" },

  // The zone itself. Selected-file rows render below it and are app state, not
  // a variant — out of the mirror, same as Field's error slot.
  base: {
    layout: {
      mode: "VERTICAL",
      primaryAlign: "CENTER",
      counterAlign: "CENTER",
      gap: { var: "space-4" }, // Stack gap={4}
    },
    width: { value: 320, resizable: true },
    padding: { var: "space-24" }, // p-6
    cornerRadius: { value: 8 }, // rounded-lg
    stroke: { var: "input", style: "DASHED" }, // border border-dashed border-input
    children: [
      {
        name: "Label",
        type: "TEXT",
        content: "Drop files here, paste, or browse",
        textStyle: "Type/Small",
        fontWeight: 500, // font-medium
        textFill: { var: "foreground" },
      },
      {
        name: "Hint",
        type: "TEXT",
        content: "PNG or JPG, up to 5 MB",
        textStyle: "Type/Caption",
        textFill: { var: "muted-foreground" },
      },
    ],
  },

  perOption: {
    state: {
      default: {},
      dragging: {
        // data-[dragging=true]: border-solid border-ring bg-muted
        stroke: { var: "ring", style: "SOLID" },
        fill: { var: "muted" },
        children: [
          { name: "Label", content: "Release to add files" },
          // The hint hides while dragging — muted-foreground is AA on
          // background/card but NOT on bg-muted, so showing it here would
          // ship a contrast failure. Mirrors the code's `hint && !dragActive`.
          { name: "Hint", visible: false },
        ],
      },
      disabled: {
        // disabled:opacity-50 — the whole zone dims; no paint change.
        opacity: 0.5,
      },
    },
  },
}
