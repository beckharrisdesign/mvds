import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"
import { SiteHero } from "./site-hero"

/**
 * SiteHero is the landing page's first screen: headline, supporting copy,
 * proof line, and the three routes a visitor wants (gallery, starter, npm).
 * It reads the live package version, so the badge here is whatever
 * `package.json` says today.
 */
const meta = {
  title: "Site/SiteHero",
  component: SiteHero,
  tags: ["autodocs", "!dev"],
  args: {
    storybookHref: "https://example.com/storybook/",
    commit: "abc1234",
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

    // The proof line is a checklist with real list semantics — five claims,
    // ending on "checks that can fail a build".
    const proof = canvas.getByRole("list", { name: "What MVDS ships" })
    await expect(proof).toBeInTheDocument()
    await expect(within(proof).getAllByRole("listitem")).toHaveLength(5)

    // Each CTA must be a real link with an href — they are the page's only
    // route out to the gallery, the starter, and the registry.
    for (const name of [
      "Browse the system",
      "Start with the starter app",
      "View package on npm",
    ]) {
      const link = canvas.getByRole("link", { name })
      await expect(link).toHaveAttribute("href")
    }
  },
}
