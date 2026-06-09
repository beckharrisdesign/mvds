import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { Badge } from "./badge"
import { Inline } from "@/components/layout"

/**
 * Badge is a small variant-driven atom for labels, tags, and statuses. Unlike
 * Button — whose variants are an *action-emphasis* ladder — a Badge takes no
 * action, so its variants encode *meaning*: a **tone** for neutral labels
 * (`default`, `muted`, `outline`) and the **semantic status triad** as tints
 * (`success` / `neutral` / `destructive` — good / in-progress / bad). The
 * `variant` prop (a CVA variant) is what the Figma generate-library flow turns
 * into a component property.
 */
const meta = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "muted",
        "outline",
        "success",
        "neutral",
        "destructive",
      ],
    },
  },
  args: {
    children: "Badge",
    variant: "default",
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

/** Playground — drive every prop from the Controls panel. */
export const Playground: Story = {}

/** Tone — neutral labels & tags, carrying no status meaning. */
export const Tone: Story = {
  render: () => (
    <Inline gap={8}>
      <Badge variant="default">Default</Badge>
      <Badge variant="muted">Muted</Badge>
      <Badge variant="outline">Outline</Badge>
    </Inline>
  ),
}

/**
 * Status — the semantic triad as tints: `success` (good), `neutral`
 * (in-progress / informational), `destructive` (bad). This is where a Badge
 * earns its keep — communicating state, not emphasis.
 */
export const Status: Story = {
  render: () => (
    <Inline gap={8}>
      <Badge variant="success">Active</Badge>
      <Badge variant="neutral">Pending</Badge>
      <Badge variant="destructive">Failed</Badge>
    </Inline>
  ),
}

/**
 * CssCheck — proves the token layer (`src/index.css`) loaded in Storybook and
 * the default Badge consumes `--primary` (non-transparent fill). Mirrors the
 * Button CssCheck so the same token assertion guards this atom too.
 */
export const CssCheck: Story = {
  play: async ({ canvas }) => {
    const badge = canvas.getByText("Badge")
    await expect(getComputedStyle(badge).backgroundColor).not.toBe(
      "rgba(0, 0, 0, 0)"
    )
  },
}
