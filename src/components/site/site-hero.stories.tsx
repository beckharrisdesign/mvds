import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"
import { SiteHero } from "./site-hero"

/**
 * SiteHero is the landing page's first screen: headline, supporting copy, and
 * the founder's elements/expressions pair — six checked elements over five
 * primary destination-titled expression buttons ("keep reading" is the first
 * expression and has no button). It reads the live package version, so the
 * badge here is whatever `package.json` says today.
 */
const meta = {
  title: "Site/SiteHero",
  component: SiteHero,
  tags: ["autodocs", "!dev"],
  args: {
    storybookHref: "https://example.com/storybook/",
    figmaHref: "https://example.com/figma/",
    commit: "abc1234",
  },
} satisfies Meta<typeof SiteHero>

export default meta
type Story = StoryObj<typeof meta>

/** Default — the full hero: six elements, five expression links, no icon glyphs. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { level: 1 })
    ).toBeInTheDocument()

    // The elements checklist carries real list semantics — exactly six items,
    // in the founder's order.
    const elements = canvas.getByRole("list", { name: "The elements of MVDS" })
    const items = within(elements).getAllByRole("listitem")
    await expect(items).toHaveLength(6)
    await expect(
      items.map((i) => i.textContent?.replace("✓", "").trim())
    ).toEqual([
      "Principles",
      "Token layer",
      "Component library",
      "Figma library",
      "Openspec schemas",
      "Skills",
    ])

    // The expressions row: five destination-titled links, in the founder's
    // order, each with a real href — and no icon glyphs anywhere (link rule).
    const links = canvas.getAllByRole("link")
    await expect(links.map((l) => l.textContent?.trim())).toEqual([
      "Starter app",
      "Storybook",
      "Figma",
      "GitHub",
      "npm",
    ])
    for (const link of links) {
      await expect(link).toHaveAttribute("href")
      await expect(link.textContent).not.toMatch(/[↗→]/)
    }
  },
}
