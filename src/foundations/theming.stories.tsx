import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Inline, Stack } from "@/components/layout"
// The shipped preset — plain declarations only (see docs/THEMING.md).
import "../themes/terracotta.css"

/**
 * Theming — the scoped-brand demo (openspec: scoped-theming). Two brands on
 * one page: the host (default) strip, and the same composition inside a
 * `data-brand="terracotta"` wrapper. Everything inside the wrapper wears the
 * preset — semantic roles and the authored gradation steps — in both modes
 * (flip the toolbar theme); everything outside keeps the host brand.
 *
 * The play function is the proof: identical utility classes must compute to
 * DIFFERENT colors inside vs. outside the wrapper.
 */
const meta: Meta = {
  title: "Foundations/Theming",
  parameters: { layout: "padded" },
}
export default meta
type Story = StoryObj

function BrandStrip({ idPrefix }: { idPrefix: string }) {
  return (
    <Stack gap={16} align="start">
      <Badge>brand check</Badge>
      <Inline gap={8}>
        <Button data-testid={`${idPrefix}-primary`}>Primary action</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
      </Inline>
      <Inline gap={8}>
        <span
          data-testid={`${idPrefix}-step2`}
          className="bg-primary-2 text-foreground text-caption rounded-md px-2 py-1"
        >
          primary-2
        </span>
        <span className="bg-secondary-2 text-foreground text-caption rounded-md px-2 py-1">
          secondary-2
        </span>
        <span className="text-primary-4 text-caption font-medium">text-primary-4</span>
        <span className="text-primary-5 text-caption font-medium">text-primary-5</span>
      </Inline>
    </Stack>
  )
}

export const ScopedBrand: Story = {
  render: () => (
    <Stack gap={32}>
      <Stack gap={8}>
        <h3 className="text-h4">Host brand</h3>
        <BrandStrip idPrefix="host" />
      </Stack>
      <div data-brand="terracotta">
        <Stack
          gap={8}
          className="border-border bg-background rounded-lg border border-dashed p-4"
        >
          <h3 className="text-h4">
            <code>data-brand=&quot;terracotta&quot;</code>
          </h3>
          <BrandStrip idPrefix="scoped" />
        </Stack>
      </div>
      <p className="text-small text-muted-foreground max-w-prose">
        Same components, same classes — the wrapper&apos;s preset supplies the
        tokens. Steps 1–2 stay tint surfaces, 4–5 stay text-safe; the shared
        contrast gate holds every brand to the same AA pairings.
      </p>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const bgOf = (id: string) =>
      getComputedStyle(canvasElement.querySelector(`[data-testid="${id}"]`)!)
        .backgroundColor
    // Identical classes, different computed brands — the scope is real…
    await expect(bgOf("scoped-primary")).not.toBe(bgOf("host-primary"))
    // …and the authored gradation steps follow the scoped brand too.
    await expect(bgOf("scoped-step2")).not.toBe(bgOf("host-step2"))
  },
}
