// Table → Figma component-set manifest (openspec: add-table-component).
// Structure + exceptions only; mechanical bindings follow figma/conventions.mjs.
// Both axes are drift-guarded against src/components/ui/table.tsx: `rules` is
// the prop's TS union, `striped` the boolean prop (prop-boolean → "false"/"true").
//
// Column widths are pinned in the mirror ONLY so hugging cells share one width
// the way `table-layout: auto` does in the browser — the mock is not evidence
// about column behaviour (design.md, fidelity caveat). Pushing this set into
// MVDS Core happens on the founder's explicit ask (docs/SYNC.md), never with
// the code.

const head = (content, width) => ({
  name: "TableHead",
  layout: { mode: "VERTICAL" },
  width: { value: width, resizable: true },
  padding: { var: "space-16" }, // p-4 on every side (D18)
  children: [
    { name: "Label", type: "TEXT", content, textStyle: "Type/Caption", textFill: { var: "muted-foreground" } },
  ],
})

const cell = (content, width) => ({
  name: "TableCell",
  layout: { mode: "VERTICAL" },
  width: { value: width, resizable: true },
  padding: { var: "space-16" },
  children: [{ name: "Value", type: "TEXT", content, textStyle: "Type/Body", textFill: { var: "foreground" } }],
})

const row = (name, cells) => ({
  name,
  layout: { mode: "HORIZONTAL" },
  stroke: { var: "border", sides: ["BOTTOM"] }, // rules=horizontal (default)
  children: cells,
})

export default {
  name: "Table",
  page: "Components",
  code: { file: "src/components/ui/table.tsx" },

  axes: [
    {
      name: "rules",
      source: { kind: "prop-union", prop: "rules" },
      options: ["horizontal", "vertical", "both", "none"],
    },
    {
      name: "striped",
      source: { kind: "prop-boolean", prop: "striped" },
      options: ["false", "true"],
    },
  ],
  defaults: { rules: "horizontal", striped: "false" },

  base: {
    layout: { mode: "VERTICAL" },
    width: { value: 960, resizable: true },
    fill: null, // the table is transparent; only the header paints a surface
    children: [
      {
        name: "TableCaption",
        layout: { mode: "HORIZONTAL" },
        paddingX: { var: "space-16" },
        paddingBottom: { var: "space-16" },
        children: [
          { name: "Caption", type: "TEXT", content: "Records · 3 shown", textStyle: "Type/Small", textFill: { var: "muted-foreground" } },
        ],
      },
      {
        name: "TableHeader",
        layout: { mode: "VERTICAL" },
        fill: { var: "table-surface" }, // sticky top-0 bg-table-surface (D3, D14)
        children: [row("TableRow", [head("ID", 240), head("What it says", 400), head("Enforcement", 160), head("Source", 160)])],
      },
      {
        name: "TableBody",
        layout: { mode: "VERTICAL" },
        children: [
          row("TableRow", [cell("no-raw-flex-grid", 240), cell("No raw flex/grid layout utilities outside the layout primitives.", 400), cell("enforced", 160), cell("MVDS", 160)]),
          row("TableRow", [cell("scale-to-the-data", 240), cell("Any surface that renders a collection must hold up at 0, 1 and far more rows than the design showed.", 400), cell("guiding", 160), cell("MVDS", 160)]),
          row("TableRow", [cell("no-runts", 240), cell("Break lines so no single word is stranded on its own.", 400), cell("guiding", 160), cell("MVDS", 160)]),
        ],
      },
    ],
  },

  perOption: {
    rules: {
      horizontal: {},
      // Column rules: every cell but the last carries a right rule; rows carry none.
      vertical: {
        childOverrides: {
          TableRow: { stroke: null },
          TableHead: { stroke: { var: "border", sides: ["RIGHT"] }, exceptLast: true },
          TableCell: { stroke: { var: "border", sides: ["RIGHT"] }, exceptLast: true },
        },
      },
      both: {
        childOverrides: {
          TableHead: { stroke: { var: "border", sides: ["RIGHT"] }, exceptLast: true },
          TableCell: { stroke: { var: "border", sides: ["RIGHT"] }, exceptLast: true },
        },
      },
      none: { childOverrides: { TableRow: { stroke: null } } },
    },
    striped: {
      false: {},
      // Even body rows in primary-1 (D17); hover (primary-2) is a state Figma
      // does not carry here — it is the story's job, not the mirror's.
      true: { childOverrides: { "TableBody > TableRow:nth-child(even)": { fill: { var: "primary-1" } } } },
    },
  },
}
