import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { SiteHero } from "./site-hero"

/**
 * SiteHero is the landing page's first screen: the claim, the differentiator,
 * and the two routes a visitor wants (gallery, install). It reads the live
 * package version, so the badge here is whatever `package.json` says today.
 */
const meta = {
  title: "Site/SiteHero",
  component: SiteHero,
  tags: ["autodocs", "!dev"],
  args: {
    storybookHref: "https://example.com/storybook/",
  },
} satisfies Meta<typeof SiteHero>

export default meta
type Story = StoryObj<typeof meta>

/** Default — the full hero, with all three calls to action reachable as links. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { level: 1 })
    ).toBeInTheDocument()

    // Each CTA must be a real link with an href — they are the page's only
    // route out to the gallery, the starter, and the registry.
    for (const name of [
      "Browse the gallery",
      "Copy the starter app",
      "View on npm",
    ]) {
      const link = canvas.getByRole("link", { name })
      await expect(link).toHaveAttribute("href")
    }
  },
}
