import type { Meta, StoryObj } from "@storybook/react-vite"
import { Container, Stack, Inline, Grid, GridItem, Spacer } from "./index"
import { Button } from "@/components/ui/button"

/**
 * Layout primitives — the "app DNA" beneath components. shadcn ships none of
 * these; they are thin, typed Tailwind wrappers whose props snap to the spacing
 * and breakpoint scales in src/index.css.
 */
const meta: Meta = {
  title: "Foundations/Layout primitives",
  parameters: { layout: "padded" },
}
export default meta
type Story = StoryObj

function Box({ children }: { children?: React.ReactNode }) {
  // text-foreground (not muted-foreground) on bg-muted: muted-foreground only
  // meets AA contrast on background/card, not on the muted surface itself.
  return (
    <div className="bg-muted text-foreground flex min-h-12 items-center justify-center rounded-md border px-3 py-2 text-small">
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
