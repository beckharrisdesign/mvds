import { Stack } from "@/components/layout"

/**
 * Intro → Start here — short technical orient for Storybook readers.
 * Landing stays marketing; this page only points at the three follow-on Intro pages.
 */

function IntroStartHere() {
  return (
    <Stack gap={16} className="max-w-prose">
      <h1 className="text-h1">Start here</h1>
      <p className="text-body text-muted-foreground">
        This gallery is the technical side of MVDS — tokens, primitives, and
        components under test. The Intro pages below are the map; Foundations,
        Blocks, and UI are the specimens.
      </p>
      <Stack gap={8}>
        <p className="text-body text-foreground">
          <span className="font-medium">Design principles</span> are the rules
          themselves — held as data in the principle manifest, with plain-language
          titles and an honest split between machine-enforced and judgment.
        </p>
        <p className="text-body text-foreground">
          <span className="font-medium">How we enforce</span> is when those
          checks show up: while planning, coding, testing, and after the package
          is out in the world.
        </p>
        <p className="text-body text-foreground">
          <span className="font-medium">Get started</span> is install and CSS
          wiring — public npm, no token, and the{" "}
          <code className="font-mono text-small">@source</code> line that keeps
          components from rendering unstyled.
        </p>
      </Stack>
    </Stack>
  )
}

export { IntroStartHere }
