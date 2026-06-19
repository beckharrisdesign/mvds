// MediaFrame → Figma component manifest (content block).
// Axis: ratio (video / square / portrait / wide) — synthetic (RATIO map in code).
// w-full overflow-hidden rounded-lg — fixed 320px wide, height varies by ratio.
// video 16:9=180 · square 1:1=320 · portrait 3:4=427 · wide 2.35:1=136.

export default {
  name: "MediaFrame",
  page: "Components",
  code: { file: "src/components/blocks/media-frame.tsx" },

  axes: [
    {
      name: "ratio",
      source: { kind: "synthetic" },
      options: ["video", "square", "portrait", "wide"],
    },
  ],
  defaults: { ratio: "video" },

  base: {
    layout: { mode: "VERTICAL", primaryAlign: "CENTER", counterAlign: "CENTER" },
    width: { value: 320, resizable: true },
    fill: { var: "muted" }, // placeholder fill — real usage is an <img>
    cornerRadius: { value: 8 }, // rounded-lg
    children: [
      {
        name: "Placeholder",
        type: "TEXT",
        content: "Media",
        textStyle: "Type/Small",
        textFill: { var: "foreground" }, // muted-foreground on bg-muted is disallowed (contrast rule)
      },
    ],
  },

  perOption: {
    ratio: {
      video:    { height: { value: 180 } }, // 320 × 9/16
      square:   { height: { value: 320 } }, // 320 × 1
      portrait: { height: { value: 427 } }, // 320 × 4/3
      wide:     { height: { value: 136 } }, // 320 / 2.35
    },
  },
}
