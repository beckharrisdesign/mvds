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

/* ---------------- Spacing (8-point grid) ---------------- */
const SPACING: { px: number; note?: string }[] = [
  { px: 4, note: "½ × 8" },
  { px: 8 },
  { px: 16 },
  { px: 24 },
  { px: 32 },
  { px: 40 },
  { px: 48 },
  { px: 64 },
  { px: 80 },
  { px: 96 },
]

export const Spacing: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-small">
        Multiples &amp; fractions of 8 — 4 is ½ × 8, the rest are multiples. Better
        pixel density &amp; antialiasing. Primitive props take these px values
        directly: <code>gap={"{16}"}</code>.
      </p>
      {SPACING.map(({ px, note }) => (
        <div key={px} className="flex items-center gap-4">
          <code className="w-16 shrink-0 text-caption">{px}px</code>
          <div className="bg-primary h-4 rounded-sm" style={{ width: px }} />
          {note && <span className="text-muted-foreground text-caption">{note}</span>}
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
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-small">
        Semantic ramp — each utility carries size + line-height + weight + tracking.
      </p>
      {RAMP.map(({ cls, name, spec }) => (
        <div key={cls} className="flex flex-col gap-1">
          <div className="text-muted-foreground flex gap-2 text-caption">
            <code className="w-28">{cls}</code>
            <span>{spec}</span>
          </div>
          <span className={cls}>{name} — The quick brown fox</span>
        </div>
      ))}
    </div>
  ),
}

/* ---------------- Radius ---------------- */
const RADII: { name: string; cls: string; px: number }[] = [
  { name: "sm", cls: "rounded-sm", px: 6 },
  { name: "md", cls: "rounded-md", px: 8 },
  { name: "lg", cls: "rounded-lg", px: 10 },
  { name: "xl", cls: "rounded-xl", px: 14 },
]

export const Radius: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-small">
        One base dimension (<code>--radius</code>, 10px) drives the whole ramp — a
        dimension, not spacing, so it is exempt from the 8-grid. Steps past{" "}
        <code>xl</code> were pruned as unused.
      </p>
      <div className="flex gap-4">
        {RADII.map(({ name, cls, px }) => (
          <div key={name} className="flex flex-col items-center gap-1">
            <div className={`bg-muted border-border size-16 border ${cls}`} />
            <code className="text-caption">{name}</code>
            <span className="text-muted-foreground text-caption">{px}px</span>
          </div>
        ))}
      </div>
    </div>
  ),
}

/* ---------------- Elevation ---------------- */
const ELEVATION: { name: string; cls: string; use: string }[] = [
  { name: "sm", cls: "shadow-sm", use: "cards — subtle lift" },
  { name: "md", cls: "shadow-md", use: "popovers, dropdowns" },
  { name: "lg", cls: "shadow-lg", use: "modals, toasts" },
]

export const Elevation: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-small">
        Three steps, mode-dependent (deeper in dark mode, where raised surfaces
        also separate via lighter fills). Tailwind&apos;s default shadow scale is
        disabled — this ramp is the only shadow vocabulary.
      </p>
      <div className="flex gap-8 p-4">
        {ELEVATION.map(({ name, cls, use }) => (
          <div key={name} className="flex flex-col items-center gap-2">
            <div className={`bg-card size-24 rounded-lg ${cls}`} />
            <code className="text-caption">shadow-{name}</code>
            <span className="text-muted-foreground text-caption">{use}</span>
          </div>
        ))}
      </div>
    </div>
  ),
}

/* ---------------- Motion ---------------- */
const DURATIONS: { name: string; ms: number; use: string }[] = [
  { name: "fast", ms: 150, use: "hovers, fades — also the transition-* default" },
  { name: "base", ms: 250, use: "expand/collapse, slides" },
  { name: "slow", ms: 400, use: "large surfaces — modals, drawers" },
]
const EASINGS: { name: string; curve: string; use: string }[] = [
  { name: "ease-standard", curve: "cubic-bezier(0.2, 0, 0, 1)", use: "most UI" },
  { name: "ease-emphasized", curve: "cubic-bezier(0.05, 0.7, 0.1, 1)", use: "enters, attention" },
]

export const Motion: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-small">
        Durations are plain tokens (<code>duration-(--duration-base)</code>);
        easings ship as utilities. Hover a bar to see duration × standard easing.
      </p>
      {DURATIONS.map(({ name, ms, use }) => (
        <div key={name} className="flex items-center gap-4">
          <code className="w-32 shrink-0 text-caption">--duration-{name}</code>
          <code className="w-16 shrink-0 text-caption">{ms}ms</code>
          <div
            className="bg-primary ease-standard h-4 w-16 rounded-sm transition-transform hover:translate-x-16"
            style={{ transitionDuration: `var(--duration-${name})` }}
          />
          <span className="text-muted-foreground text-caption">{use}</span>
        </div>
      ))}
      {EASINGS.map(({ name, curve, use }) => (
        <div key={name} className="flex items-center gap-4">
          <code className="w-32 shrink-0 text-caption">{name}</code>
          <code className="text-muted-foreground text-caption">{curve}</code>
          <span className="text-muted-foreground text-caption">{use}</span>
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
    <div className="flex flex-col gap-2">
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
