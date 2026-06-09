// Card → Figma component-set manifest. Structure + exceptions only; mechanical
// bindings follow figma/conventions.mjs. The `size` axis is drift-guarded
// against the TS prop union in src/components/ui/card.tsx (`size?: "default" |
// "sm"`) — Card is plain classes + data-attributes, not cva.
//
// Composite: the layer tree mirrors the code subcomponents (CardHeader/Title/
// Description/Content/Footer), and the Footer nests a Button INSTANCE to prove
// composition survives the mirror. No `state` axis (no disabled affordance).

export default {
  name: "Card",
  page: "Components",
  code: { file: "src/components/ui/card.tsx" },

  axes: [
    {
      name: "size",
      source: { kind: "prop-union", prop: "size" },
      options: ["default", "sm"],
    },
  ],
  defaults: { size: "default" },

  // Code is fluid-width; the Figma component gets a fixed canvas width with
  // horizontal-resize allowed on instances.
  base: {
    layout: { mode: "VERTICAL" },
    width: { value: 320, resizable: true },
    fill: { var: "card" },
    textFill: { var: "card-foreground" },
    stroke: { var: "foreground", opacity: 0.1 }, // ring-1 ring-foreground/10
    cornerRadius: { value: 14 }, // rounded-xl
    paddingY: { var: "space-16" }, // py-4 (pb-0 when footer present — Footer sits flush)
    paddingBottom: { value: 0 }, // has-data-[slot=card-footer]:pb-0
    gap: { var: "space-16" }, // gap-4
    children: [
      {
        name: "Header",
        layout: { mode: "VERTICAL" },
        paddingX: { var: "space-16" }, // px-4
        gap: { var: "space-4" }, // gap-1
        children: [
          { name: "Title", type: "TEXT", content: "Card title", textStyle: "Type/Heading 4" },
          {
            name: "Description",
            type: "TEXT",
            content: "Card description",
            textStyle: "Type/Small",
            textFill: { var: "muted-foreground" },
          },
        ],
      },
      {
        name: "Content",
        layout: { mode: "VERTICAL" },
        paddingX: { var: "space-16" }, // px-4
        children: [
          { name: "Body", type: "TEXT", content: "Card content", textStyle: "Type/Small" },
        ],
      },
      {
        name: "Footer",
        layout: { mode: "HORIZONTAL", counterAlign: "CENTER" },
        padding: { var: "space-16" }, // p-4
        fill: { var: "muted", opacity: 0.5 }, // bg-muted/50
        stroke: { var: "border", sides: ["TOP"] }, // border-t
        children: [
          // Nested instance — resolved via figma/figma.lock.json at sync time.
          {
            name: "Action",
            type: "INSTANCE",
            of: "Button",
            props: { variant: "default", size: "default", state: "default" },
          },
        ],
      },
    ],
  },

  perOption: {
    size: {
      default: {},
      // data-[size=sm]: gap-2 py-2; children px-2 / p-2 via group-data cascade.
      sm: {
        paddingY: { var: "space-8" },
        gap: { var: "space-8" },
        childOverrides: {
          Header: { paddingX: { var: "space-8" } },
          Content: { paddingX: { var: "space-8" } },
          Footer: { padding: { var: "space-8" } },
        },
      },
    },
  },
}
