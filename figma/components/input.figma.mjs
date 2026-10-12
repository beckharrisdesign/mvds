// Input → Figma component manifest. One axis: `size`, extracted from the cva in
// src/components/ui/input.tsx — the same size vocabulary as Button, so an input
// beside a button aligns by construction.
//
// Heights are the MVDS tuning, not shadcn's: 24 / 32 / 40 (h-6 / h-8 / h-10)
// against shadcn's off-grid h-9=36. Padding px-2=8 on sm/default, px-4=16 on lg.
// Type steps on the semantic ramp (Type/Caption, Type/Small) — never a generic
// text-sm.
//
// Adopts the existing Figma set `690:25` by name — never rebuilt (rebuilding
// breaks every downstream instance).

export default {
  name: "Input",
  page: "Components",
  code: { file: "src/components/ui/input.tsx" },

  axes: [
    {
      name: "size",
      source: { kind: "cva", export: "inputVariants", axis: "size" },
      options: ["sm", "default", "lg"],
    },
  ],

  defaults: { size: "default" },

  base: {
    layout: { mode: "HORIZONTAL", primaryAlign: "MIN", counterAlign: "CENTER" },
    width: { value: 280, resizable: true },
    stroke: { var: "input" }, // border-input (--input, not --border)
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

  perOption: {
    size: {
      sm: {
        height: { var: "space-24" }, // h-6
        cornerRadius: { value: 12 }, // rounded-[min(var(--radius-md),12px)]
        paddingX: { var: "space-8" }, // px-2
        children: [{ name: "Placeholder", textStyle: "Type/Caption" }],
      },
      default: {
        height: { var: "space-32" }, // h-8
        cornerRadius: { value: 8 }, // rounded-lg
        paddingX: { var: "space-8" }, // px-2
      },
      lg: {
        height: { var: "space-40" }, // h-10
        cornerRadius: { value: 8 }, // rounded-lg
        paddingX: { var: "space-16" }, // px-4
      },
    },
  },
}
