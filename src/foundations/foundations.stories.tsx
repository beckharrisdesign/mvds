import type { Meta, StoryObj } from "@storybook/react-vite"

/**
 * Foundation specimens — the primitive scales that everything else is built on.
 * These read straight from the token layer in src/index.css.
 */
const meta: Meta = {
  title: "Foundations/Scales",
  parameters: { layout: "padded" },
}
export default meta
type Story = StoryObj

/* ---------------- Spacing ---------------- */
const SPACING: { step: number; px: number }[] = [
  { step: 1, px: 4 },
  { step: 2, px: 8 },
  { step: 3, px: 12 },
  { step: 4, px: 16 },
  { step: 5, px: 20 },
  { step: 6, px: 24 },
  { step: 8, px: 32 },
  { step: 10, px: 40 },
  { step: 12, px: 48 },
  { step: 16, px: 64 },
  { step: 20, px: 80 },
  { step: 24, px: 96 },
]

export const Spacing: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground text-small">
        4px base unit — every <code>p-*</code>, <code>m-*</code>, <code>gap-*</code> is a multiple.
      </p>
      {SPACING.map(({ step, px }) => (
        <div key={step} className="flex items-center gap-4">
          <code className="w-28 shrink-0 text-caption">gap-{step}</code>
          <div className="bg-primary h-4 rounded-sm" style={{ width: px }} />
          <span className="text-muted-foreground text-caption">{px}px</span>
        </div>
      ))}
    </div>
  ),
}

/* ---------------- Typography ---------------- */
const RAMP: { cls: string; name: string; spec: string }[] = [
  { cls: "text-display", name: "Display", spec: "48 / 1.05 / 600" },
  { cls: "text-h1", name: "Heading 1", spec: "36 / 1.1 / 600" },
  { cls: "text-h2", name: "Heading 2", spec: "30 / 1.15 / 600" },
  { cls: "text-h3", name: "Heading 3", spec: "24 / 1.2 / 600" },
  { cls: "text-h4", name: "Heading 4", spec: "20 / 1.3 / 600" },
  { cls: "text-body-lg", name: "Body large", spec: "18 / 1.6 / 400" },
  { cls: "text-body", name: "Body", spec: "16 / 1.6 / 400" },
  { cls: "text-small", name: "Small", spec: "14 / 1.5 / 400" },
  { cls: "text-caption", name: "Caption", spec: "12 / 1.4 / 500" },
]

export const Typography: Story = {
  render: () => (
    <div className="flex flex-col gap-5">
      <p className="text-muted-foreground text-small">
        Semantic ramp — each utility carries size + line-height + weight + tracking.
      </p>
      {RAMP.map(({ cls, name, spec }) => (
        <div key={cls} className="flex flex-col gap-1">
          <div className="text-muted-foreground flex gap-3 text-caption">
            <code className="w-28">{cls}</code>
            <span>{spec}</span>
          </div>
          <span className={cls}>{name} — The quick brown fox</span>
        </div>
      ))}
    </div>
  ),
}

/* ---------------- Breakpoints ---------------- */
const BREAKPOINTS: { name: string; px: number; note: string }[] = [
  { name: "sm", px: 640, note: "large phone / small tablet" },
  { name: "md", px: 768, note: "tablet" },
  { name: "lg", px: 1024, note: "small laptop" },
  { name: "xl", px: 1280, note: "desktop" },
  { name: "2xl", px: 1536, note: "large desktop" },
]

export const Breakpoints: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground text-small">
        Responsive DNA — the Container and <code>@container</code> queries snap to these.
      </p>
      {BREAKPOINTS.map(({ name, px, note }) => (
        <div key={name} className="flex items-center gap-4">
          <code className="w-16 shrink-0 text-caption">{name}</code>
          <code className="w-20 shrink-0 text-caption">{px}px</code>
          <div className="bg-muted h-2 rounded-full" style={{ width: `${(px / 1536) * 100}%` }} />
          <span className="text-muted-foreground text-caption">{note}</span>
        </div>
      ))}
    </div>
  ),
}
