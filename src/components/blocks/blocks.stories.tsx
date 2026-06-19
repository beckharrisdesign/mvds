import type { Meta, StoryObj } from "@storybook/react-vite"
import { Info, AlertTriangle, CheckCircle2 } from "lucide-react"
import { MediaFrame } from "./media-frame"
import { Blockquote } from "./blockquote"
import { Callout } from "./callout"
import { Hero } from "./hero"
import { Stack, Grid } from "@/components/layout"

/**
 * Content block primitives — the four layout atoms that headless-CMS consumers
 * (Notion, MDX, etc.) need before they can render real pages. Each maps to a
 * recurring content pattern: contained media, pull quotes, callout blocks, and
 * hero banners.
 */
const meta: Meta = {
  title: "Blocks/Content primitives",
  parameters: { layout: "padded" },
}
export default meta
type Story = StoryObj

/**
 * MediaFrame — enforces an aspect ratio with overflow clipping. Drop any
 * embed, `img`, `video`, or iframe inside; the frame contains and clips it.
 * `ratio` prop: `"video"` (16:9, default) · `"square"` · `"portrait"` (3:4) ·
 * `"wide"` (2.35:1).
 */
export const MediaFrameStory: Story = {
  name: "MediaFrame — ratios",
  render: () => (
    <Stack gap={16}>
      <Grid cols={{ base: 1, md: 2 }} gap={16}>
        <MediaFrame ratio="video">
          <div className="flex h-full items-center justify-center bg-muted text-small text-foreground">
            video — 16:9
          </div>
        </MediaFrame>
        <MediaFrame ratio="square">
          <div className="flex h-full items-center justify-center bg-muted text-small text-foreground">
            square — 1:1
          </div>
        </MediaFrame>
        <MediaFrame ratio="portrait">
          <div className="flex h-full items-center justify-center bg-muted text-small text-foreground">
            portrait — 3:4
          </div>
        </MediaFrame>
        <MediaFrame ratio="wide">
          <div className="flex h-full items-center justify-center bg-muted text-small text-foreground">
            wide — 2.35:1
          </div>
        </MediaFrame>
      </Grid>
    </Stack>
  ),
}

/**
 * Blockquote — semantic `<blockquote>` with a 4px `border-primary` left accent
 * and `text-body-lg italic` typography. Pure typographic; no interactivity.
 * Place a `<p className="not-italic">` child for attribution (breaks out of the
 * italic inherited from the parent) — avoid `<footer>`, which is a `contentinfo` landmark.
 */
export const BlockquoteStory: Story = {
  name: "Blockquote",
  render: () => (
    <Stack gap={24}>
      <Blockquote>
        <p>Design is not just what it looks like and feels like. Design is how it works.</p>
        <p className="text-small text-foreground not-italic">— Steve Jobs</p>
      </Blockquote>
      <Blockquote>
        <p>Make it work, make it right, make it fast.</p>
        <p className="text-small text-foreground not-italic">— Kent Beck</p>
      </Blockquote>
    </Stack>
  ),
}

/**
 * Callout — muted-background box for asides, notes, and warnings. The `icon`
 * prop accepts any ReactNode (Lucide icon, emoji string, etc.); omit it for a
 * plain text aside. `children` accepts arbitrary block content — not just a
 * single string.
 */
export const CalloutStory: Story = {
  name: "Callout",
  render: () => (
    <Stack gap={8}>
      <Callout>
        Plain callout — no icon. Accepts any children, including{" "}
        <strong>inline markup</strong> or nested blocks.
      </Callout>
      <Callout icon={<Info className="size-4" />}>
        Informational note. Use for context or additional details that support the main content.
      </Callout>
      <Callout icon={<AlertTriangle className="size-4" />}>
        Warning. Something the reader should check before proceeding.
      </Callout>
      <Callout icon={<CheckCircle2 className="size-4" />}>
        Success. The action completed or a prerequisite was met.
      </Callout>
    </Stack>
  ),
}

/**
 * Hero — full-bleed `<section>` with optional background image + gradient scrim
 * and children constrained to a `<Container>`. Pass `backgroundImage` (a URL
 * string) to activate the `bg-gradient-to-t from-background/80` scrim;
 * `containerSize` (default `"xl"`) controls the inner Container width. Vertical
 * padding defaults to `py-24` (96px) and is overridable via `className`.
 */
export const HeroStory: Story = {
  name: "Hero",
  parameters: { layout: "fullscreen" },
  render: () => (
    <Hero>
      <Stack gap={8} align="center" className="text-center">
        <h1 className="text-h1 text-foreground">Minimum Viable Hero</h1>
        <p className="text-body-lg text-foreground">
          Full-bleed section · Container-constrained content.
          Add <code>backgroundImage</code> for a photo with a gradient scrim.
        </p>
      </Stack>
    </Hero>
  ),
}
