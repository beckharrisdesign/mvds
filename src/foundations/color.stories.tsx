import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { Stack, Inline, Grid } from "@/components/layout"
import { cn } from "@/lib/utils"

/**
 * Color — the canonical specimen for the token palette. Every color token in
 * src/index.css is rendered here as a swatch (light + dark via the toolbar
 * theme), making this story the single VISIBLE source of truth for color and
 * the surface Chromatic snapshots for color-regression diffs. Before this
 * story, tokens like `success`, `neutral`, `accent` and the charts were defined
 * but rendered in no story at all — invisible to both docs and Chromatic.
 *
 * Pairs render their foreground ON their fill, so the story doubles as a
 * contrast check. `muted` intentionally pairs with `foreground` (not
 * `muted-foreground`, which only meets AA on background/card — see AGENTS.md).
 */
const meta: Meta = {
  title: "Foundations/Color",
  parameters: {
    layout: "padded",
    // A palette specimen documents every token as data — including pairings not
    // meant as body text (borders, muted, low-contrast fills). Contrast is
    // enforced in COMPONENT stories, in real usage context, not on this reference
    // board — so axe color-contrast is scoped off here. NOTE: this is NOT hiding a
    // real finding — `success` + `success-foreground` is 3.54:1 (below AA) and is
    // tracked as a token fix, not silenced by this rule being off.
    a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } },
  },
}
export default meta
type Story = StoryObj

type Swatch = { name: string; bg: string; fg?: string }

// Every class is a COMPLETE literal string — never built as `bg-${name}`.
// Tailwind only emits classes it can find spelled out in source (the same
// purge rule scales.ts is built around), so dynamic construction would yield
// colorless swatches. The Palette play guard catches exactly that regression.
const SECTIONS: { title: string; swatches: Swatch[] }[] = [
  {
    title: "Surfaces",
    swatches: [
      { name: "background", bg: "bg-background", fg: "text-foreground" },
      { name: "card", bg: "bg-card", fg: "text-card-foreground" },
      { name: "popover", bg: "bg-popover", fg: "text-popover-foreground" },
      // muted pairs with foreground — muted-foreground is NOT AA on muted.
      { name: "muted", bg: "bg-muted", fg: "text-foreground" },
    ],
  },
  {
    title: "Brand & actions",
    swatches: [
      { name: "primary", bg: "bg-primary", fg: "text-primary-foreground" },
      { name: "secondary", bg: "bg-secondary", fg: "text-secondary-foreground" },
      { name: "accent", bg: "bg-accent", fg: "text-accent-foreground" },
    ],
  },
  {
    title: "Status — semantic triad (good · neutral · bad)",
    swatches: [
      { name: "success", bg: "bg-success", fg: "text-success-foreground" },
      { name: "neutral", bg: "bg-neutral", fg: "text-neutral-foreground" },
      { name: "destructive", bg: "bg-destructive", fg: "text-destructive-foreground" },
    ],
  },
  {
    title: "Lines & focus",
    swatches: [
      { name: "border", bg: "bg-border" },
      { name: "input", bg: "bg-input" },
      { name: "ring", bg: "bg-ring" },
    ],
  },
]

// gray — the fixed 11-step black↔white ladder (semantic tokens sit on these
// rungs). Every class is a complete literal for the purge reason above.
const GRAY_STEPS: { step: string; bg: string }[] = [
  { step: "50", bg: "bg-gray-50" },
  { step: "100", bg: "bg-gray-100" },
  { step: "200", bg: "bg-gray-200" },
  { step: "300", bg: "bg-gray-300" },
  { step: "400", bg: "bg-gray-400" },
  { step: "500", bg: "bg-gray-500" },
  { step: "600", bg: "bg-gray-600" },
  { step: "700", bg: "bg-gray-700" },
  { step: "800", bg: "bg-gray-800" },
  { step: "900", bg: "bg-gray-900" },
  { step: "950", bg: "bg-gray-950" },
]

// The gradation scale — five AUTHORED steps per brand family, per mode.
// 1 is the faintest tint against the mode's background, 5 the strongest.
// Roles are contract, enforced by check:contrast: 1–2 tint surfaces
// (foreground reads on them), 3 decorative (no text contract), 4–5 text-safe
// on background/card. Stepping between these is the step-on-color-gradations
// principle. A brand authors its own five (docs/THEMING.md).
type GradStep = { step: string; bg: string; role: string; fgOn?: boolean }
const GRADATIONS: { name: string; text4: string; text5: string; steps: GradStep[] }[] = [
  {
    name: "primary",
    text4: "text-primary-4",
    text5: "text-primary-5",
    steps: [
      { step: "1", bg: "bg-primary-1", role: "tint surface", fgOn: true },
      { step: "2", bg: "bg-primary-2", role: "tint surface", fgOn: true },
      { step: "3", bg: "bg-primary-3", role: "decorative" },
      { step: "4", bg: "bg-primary-4", role: "text-safe" },
      { step: "5", bg: "bg-primary-5", role: "text-safe" },
    ],
  },
  {
    name: "secondary",
    text4: "text-secondary-4",
    text5: "text-secondary-5",
    steps: [
      { step: "1", bg: "bg-secondary-1", role: "tint surface", fgOn: true },
      { step: "2", bg: "bg-secondary-2", role: "tint surface", fgOn: true },
      { step: "3", bg: "bg-secondary-3", role: "decorative" },
      { step: "4", bg: "bg-secondary-4", role: "text-safe" },
      { step: "5", bg: "bg-secondary-5", role: "text-safe" },
    ],
  },
]

function SwatchChip({ name, bg, fg }: Swatch) {
  return (
    <Stack gap={4}>
      <div
        data-token={name}
        className={cn(
          bg,
          fg,
          "border-border flex h-20 items-end rounded-lg border p-2"
        )}
      >
        {fg && <span className="text-caption font-medium">Aa</span>}
      </div>
      <code className="text-muted-foreground text-caption">{name}</code>
    </Stack>
  )
}

export const Palette: Story = {
  render: () => (
    <Stack gap={32}>
      <p className="text-muted-foreground text-small">
        Every color token in <code>src/index.css</code>, rendered from the
        Tailwind utilities. Flip the toolbar theme to see the dark-mode values.
        Pairs show their foreground on their fill (a built-in contrast check);
        the token names below are themselves the <code>muted-foreground</code>{" "}
        specimen on <code>background</code>.
      </p>
      {SECTIONS.map((section) => (
        <Stack key={section.title} gap={8}>
          <h3 className="text-h4">{section.title}</h3>
          <Grid cols={{ base: 2, sm: 3, md: 4 }} gap={16}>
            {section.swatches.map((sw) => (
              <SwatchChip key={sw.name} {...sw} />
            ))}
          </Grid>
        </Stack>
      ))}
      <Stack gap={16}>
        <h3 className="text-h4">Scales — gray ladder</h3>
        <Stack gap={4}>
          <code className="text-muted-foreground text-caption">gray</code>
          <Inline gap={4}>
            {GRAY_STEPS.map((s) => (
              <Stack key={s.step} gap={4}>
                <div
                  data-token={`gray-${s.step}`}
                  className={cn(s.bg, "border-border h-8 w-8 rounded-md border")}
                />
                <code className="text-muted-foreground text-caption">{s.step}</code>
              </Stack>
            ))}
          </Inline>
        </Stack>
      </Stack>
      <Stack gap={16}>
        <h3 className="text-h4">Gradation scale — five authored steps, roles as contract</h3>
        <p className="text-muted-foreground text-small">
          1 is the faintest tint against this mode&apos;s background, 5 the
          strongest. 1–2 carry <code>foreground</code> text, 3 is decorative
          (no text contract), 4–5 are text-safe on background/card — every
          pairing shown is enforced by <code>check:contrast</code>. Step between
          these by default (<code>step-on-color-gradations</code>); a brand
          authors its own five per family.
        </p>
        {GRADATIONS.map((fam) => (
          <Stack key={fam.name} gap={4}>
            <code className="text-muted-foreground text-caption">{fam.name}</code>
            <Inline gap={8}>
              {fam.steps.map((s) => (
                <Stack key={s.step} gap={4}>
                  <div
                    data-token={`${fam.name}-${s.step}`}
                    className={cn(
                      s.bg,
                      "border-border flex h-12 w-24 items-center justify-center rounded-md border"
                    )}
                  >
                    {s.fgOn && (
                      <span className="text-foreground text-caption font-medium">Aa</span>
                    )}
                  </div>
                  <code className="text-muted-foreground text-caption">
                    {s.step} · {s.role}
                  </code>
                </Stack>
              ))}
            </Inline>
            <p className="text-small">
              As text on background:{" "}
              <span className={cn(fam.text4, "font-medium")}>Aa step 4</span>{" "}
              <span className={cn(fam.text5, "font-medium")}>Aa step 5</span>
            </p>
          </Stack>
        ))}
      </Stack>
    </Stack>
  ),
  // Guard: tokens that no other story renders (the triad's success/neutral,
  // a gray rung, and one authored gradation step per family) must resolve to a
  // real, non-transparent fill — i.e. the tokens are wired, not just named.
  // Catches a deleted/renamed token that would otherwise be invisible.
  play: async ({ canvasElement }) => {
    for (const token of ["success", "neutral", "gray-500", "primary-3", "secondary-3"]) {
      const el = canvasElement.querySelector(`[data-token="${token}"]`)!
      await expect(getComputedStyle(el).backgroundColor).not.toBe(
        "rgba(0, 0, 0, 0)" // mvds-allow no-hardcoded-color — transparent sentinel read back from the browser, not an authored color
      )
    }
  },
}
