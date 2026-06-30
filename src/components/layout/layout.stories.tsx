import type { Meta, StoryObj } from "@storybook/react-vite"
import { Container, Stack, Inline, Grid, GridItem, Spacer, Chrome, Section, Layer } from "./index"
import { Button } from "@/components/ui/button"

/**
 * Layout primitives — the "app DNA" beneath components. shadcn ships none of
 * these; they are thin, typed Tailwind wrappers whose props snap to the spacing
 * and breakpoint scales in src/index.css.
 *
 * The three spatial primitives (Chrome · Section · Layer) encode the structural
 * vocabulary of a platform: what's persistent chrome, what's inline content,
 * and what lives above the layout on the z-axis.
 */
const meta: Meta = {
  title: "Foundations/Layout primitives",
  parameters: { layout: "padded" },
}
export default meta
type Story = StoryObj

function Box({ children }: { children?: React.ReactNode }) {
  // A flat block — NO padding, border, or margin — so the spacing stories show
  // pure "objects + gap": the ONLY space between boxes is the Stack/Grid gap.
  // (text-foreground on bg-muted, since muted-foreground only meets AA on
  // background/card.)
  return (
    <div className="bg-muted text-foreground flex min-h-12 items-center justify-center rounded-md text-small">
      {children}
    </div>
  )
}

/** Stack — vertical rhythm via the `gap` step (px on the 8-pt grid). */
export const StackStory: Story = {
  name: "Stack",
  render: () => (
    <Stack gap={16}>
      <Box>gap = 16px</Box>
      <Box>second</Box>
      <Box>third</Box>
    </Stack>
  ),
}

/** Inline — horizontal cluster that wraps. */
export const InlineStory: Story = {
  name: "Inline",
  render: () => (
    <Inline gap={8}>
      <Button size="sm">One</Button>
      <Button size="sm" variant="secondary">Two</Button>
      <Button size="sm" variant="outline">Three</Button>
      <Button size="sm" variant="ghost">Four</Button>
    </Inline>
  ),
}

/** Grid — responsive columns: 1 → 2 (md) → 3 (lg). Bare children = 1 cell each.
 *  Resize the preview to see the cascade. */
export const GridStory: Story = {
  name: "Grid (responsive cols)",
  render: () => (
    <Grid cols={{ base: 1, md: 2, lg: 3 }} gap={16}>
      {Array.from({ length: 6 }, (_, i) => (
        <Box key={i}>cell {i + 1}</Box>
      ))}
    </Grid>
  ),
}

/**
 * Grid cascade with GridItem spans — the designer's mental model: a 4-col phone
 * grid → 8-col tablet → 12-col desktop, with items spanning different widths at
 * each breakpoint. Resize the preview to watch blocks reflow from stacked →
 * paired → thirds.
 */
export const GridCascade: Story = {
  name: "Grid cascade (span)",
  render: () => (
    <Grid cols={{ base: 4, md: 8, lg: 12 }} gap={16}>
      <GridItem span={{ base: 4, md: 8, lg: 12 }}>
        <Box>Header — spans the full width at every breakpoint</Box>
      </GridItem>
      <GridItem span={{ base: 4, md: 4, lg: 6 }}>
        <Box>Half on tablet & desktop</Box>
      </GridItem>
      <GridItem span={{ base: 4, md: 4, lg: 6 }}>
        <Box>Half on tablet & desktop</Box>
      </GridItem>
      <GridItem span={{ base: 4, md: 8, lg: 4 }}>
        <Box>1/3 on desktop</Box>
      </GridItem>
      <GridItem span={{ base: 4, md: 8, lg: 8 }}>
        <Box>2/3 on desktop</Box>
      </GridItem>
      <GridItem span={{ base: 4, md: 8, lg: 12 }}>
        <Box>Footer — full width</Box>
      </GridItem>
    </Grid>
  ),
}

/** Spacer — fixed gap, and flexible (push-apart) mode inside an Inline. */
export const SpacerStory: Story = {
  name: "Spacer",
  render: () => (
    <Stack gap={24}>
      <div>
        <Box>above</Box>
        <Spacer size={32} />
        <Box>32px below</Box>
      </div>
      <Inline gap={0} className="rounded-md border p-2">
        <Button size="sm">Left</Button>
        <Spacer />
        <Button size="sm" variant="outline">Right (pushed)</Button>
      </Inline>
    </Stack>
  ),
}

/** Container — centered, width-capped, responsive padding. */
export const ContainerStory: Story = {
  name: "Container",
  render: () => (
    <Container size="md" className="bg-muted/40 rounded-lg py-6">
      <Stack gap={8}>
        <Box>Container size=&quot;md&quot; (max 48rem)</Box>
        <Box>centered with responsive px-4 / sm:px-6 / lg:px-8</Box>
      </Stack>
    </Container>
  ),
}

/**
 * Section — full-width content band (the `page.tsx` layer). Background fills
 * edge-to-edge; content is centered inside via an inner Container. All five
 * surface tokens and both vertical rhythm values shown.
 */
export const SectionStory: Story = {
  name: "Section",
  parameters: { layout: "fullscreen" },
  render: () => (
    <Stack gap={0}>
      <Section bg="background" py={24}><Box>bg=background · py=24</Box></Section>
      <Section bg="muted"       py={24}><Box>bg=muted · py=24</Box></Section>
      <Section bg="card"        py={24}><Box>bg=card · py=24</Box></Section>
      <Section bg="primary"     py={24}><Box>bg=primary · py=24</Box></Section>
      <Section bg="secondary"   py={24}><Box>bg=secondary · py=24</Box></Section>
      <Section bg="background"  py={64}><Box>bg=background · py=64 (spacious)</Box></Section>
    </Stack>
  ),
}

/**
 * Chrome — sticky structural regions that claim space from a viewport edge
 * (the `layout.tsx` layer). Dimensions come from the chrome token variables
 * in src/index.css; override those tokens per product to set the proportions.
 *
 * The composition below mirrors the logged-in app pattern from the MVDS
 * spatial DNA diagrams: top chrome + left chrome + inline content.
 */
export const ChromeStory: Story = {
  name: "Chrome",
  parameters: { layout: "fullscreen" },
  render: () => (
    <Stack gap={0} className="h-screen overflow-hidden">
      <Chrome position="top" bg="primary">
        <div className="flex h-full items-center px-4">
          <span className="text-small text-primary-foreground">Top chrome — position=&quot;top&quot; · bg=primary</span>
        </div>
      </Chrome>
      <div className="flex flex-1 overflow-hidden">
        <Chrome position="left" bg="muted">
          <div className="flex h-full flex-col items-center justify-start pt-4">
            <span className="text-caption text-foreground [writing-mode:vertical-lr]">left chrome</span>
          </div>
        </Chrome>
        <div className="flex-1 overflow-y-auto">
          <Section bg="background" py={24}><Box>Section — bg=background</Box></Section>
          <Section bg="muted"      py={24}><Box>Section — bg=muted</Box></Section>
          <Section bg="background" py={64}><Box>Section — py=64 spacious</Box></Section>
        </div>
      </div>
    </Stack>
  ),
}

/**
 * Layer — z-elevated surfaces above the layout entirely (backdrop · float ·
 * modal · toast). Shown here in a contained relative context; in production
 * Layer uses `fixed inset-0` and renders above the full viewport.
 *
 * The z-tokens (--z-overlay … --z-toast) in src/index.css are the shared
 * vocabulary — shadcn Dialog / Sheet / Toast reference these same values.
 */
export const LayerStory: Story = {
  name: "Layer",
  render: () => (
    <Stack gap={16}>
      {(["overlay", "float", "modal", "toast"] as const).map((level) => (
        <div key={level} className="relative h-16 overflow-hidden rounded-md border border-border">
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <span className="text-small text-muted-foreground">content beneath</span>
          </div>
          <Layer level={level} className="absolute inset-0 flex items-center justify-center bg-foreground/10">
            <span className="text-small text-foreground">level=&quot;{level}&quot;</span>
          </Layer>
        </div>
      ))}
    </Stack>
  ),
}
