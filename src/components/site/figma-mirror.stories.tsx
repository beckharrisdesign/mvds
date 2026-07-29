import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { FigmaMirror } from "./figma-mirror"
import { figmaUrl } from "./repo-links"
import type { ManifestSnapshot } from "./manifest-snapshot.types"
import liveSnapshot from "@/generated/manifest-snapshot.json"

const snapshot = liveSnapshot as unknown as ManifestSnapshot

/**
 * FigmaMirror renders the checked-in preview PNGs of the Figma mirror. It only
 * appears when exports are committed, so the story pulls the live snapshot's
 * figmaExports directly — if that is ever null the section is simply absent from
 * the page, never broken.
 */
const meta = {
  title: "Site/FigmaMirror",
  component: FigmaMirror,
  tags: ["autodocs", "!dev"],
  args: {
    figmaExports: snapshot.figmaExports!,
    lock: snapshot.lock,
  },
} satisfies Meta<typeof FigmaMirror>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default — every declared page renders an image with descriptive alt text, and
 * both routes out (checked-in exports, live file) are present as real links.
 */
export const Default: Story = {
  play: async ({ canvas, args }) => {
    await expect(
      canvas.getByRole("heading", { name: "The Figma mirror" })
    ).toBeInTheDocument()

    for (const page of args.figmaExports.pages) {
      const img = canvas.getByAltText(
        `MVDS Figma mirror — the ${page.name} page`
      )
      await expect(img).toBeInTheDocument()
    }

    await expect(
      canvas.getByRole("link", { name: /checked-in exports/ })
    ).toHaveAttribute("href")

    // Public share must open Foundations & Starters (0:1), never Sync Reports (136:2).
    // Live reachability is gated by `npm run verify:figma-share` (CI job figma-share).
    const live = canvas.getByRole("link", { name: /Open MVDS Core in Figma/ })
    await expect(live).toHaveAttribute(
      "href",
      figmaUrl(args.figmaExports.fileKey)
    )
    await expect(live.getAttribute("href")).toMatch(/node-id=0-1/)
    await expect(live.getAttribute("href")).not.toMatch(/node-id=136-2/)
  },
}
