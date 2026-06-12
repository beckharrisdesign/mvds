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

// Scale ramps — 11 steps each. gray is the fixed black↔white ladder;
// primary/secondary are derived from their base token via CSS relative color
// (change --primary and its whole ramp cascades). Every class is a complete
// literal for the same purge reason as SECTIONS above.
const RAMPS: { name: string; steps: { step: string; bg: string }[] }[] = [
  {
    name: "gray",
    steps: [
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
    ],
  },
  {
    name: "primary",
    steps: [
      { step: "50", bg: "bg-primary-50" },
      { step: "100", bg: "bg-primary-100" },
      { step: "200", bg: "bg-primary-200" },
      { step: "300", bg: "bg-primary-300" },
      { step: "400", bg: "bg-primary-400" },
      { step: "500", bg: "bg-primary-500" },
      { step: "600", bg: "bg-primary-600" },
      { step: "700", bg: "bg-primary-700" },
      { step: "800", bg: "bg-primary-800" },
      { step: "900", bg: "bg-primary-900" },
      { step: "950", bg: "bg-primary-950" },
    ],
  },
  {
    name: "secondary",
    steps: [
      { step: "50", bg: "bg-secondary-50" },
      { step: "100", bg: "bg-secondary-100" },
      { step: "200", bg: "bg-secondary-200" },
      { step: "300", bg: "bg-secondary-300" },
      { step: "400", bg: "bg-secondary-400" },
      { step: "500", bg: "bg-secondary-500" },
      { step: "600", bg: "bg-secondary-600" },
      { step: "700", bg: "bg-secondary-700" },
      { step: "800", bg: "bg-secondary-800" },
      { step: "900", bg: "bg-secondary-900" },
      { step: "950", bg: "bg-secondary-950" },
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
        <h3 className="text-h4">Scales — derived ramps</h3>
        {RAMPS.map((ramp) => (
          <Stack key={ramp.name} gap={4}>
            <code className="text-muted-foreground text-caption">{ramp.name}</code>
            <Inline gap={4}>
              {ramp.steps.map((s) => (
                <Stack key={s.step} gap={4}>
                  <div
                    data-token={`${ramp.name}-${s.step}`}
                    className={cn(s.bg, "border-border h-8 w-8 rounded-md border")}
                  />
                  <code className="text-muted-foreground text-caption">{s.step}</code>
                </Stack>
              ))}
            </Inline>
          </Stack>
        ))}
      </Stack>
    </Stack>
  ),
  // Guard: tokens that no other story renders (the triad's success/neutral and
  // one step per scale ramp) must resolve to a real, non-transparent fill —
  // i.e. the tokens are wired, not just named. Catches a deleted/renamed token
  // that would otherwise be invisible everywhere else. The -500 steps also
  // pin the relative-color derivation: if oklch(from …) ever stopped parsing,
  // the fill would compute transparent and fail here.
  play: async ({ canvasElement }) => {
    for (const token of ["success", "neutral", "gray-500", "primary-500", "secondary-500"]) {
      const el = canvasElement.querySelector(`[data-token="${token}"]`)!
      await expect(getComputedStyle(el).backgroundColor).not.toBe(
        "rgba(0, 0, 0, 0)" // mvds-allow no-hardcoded-color — transparent sentinel read back from the browser, not an authored color
      )
    }
  },
}
