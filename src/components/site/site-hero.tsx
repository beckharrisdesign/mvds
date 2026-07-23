import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Inline, Stack } from "@/components/layout"
import pkg from "../../../package.json"

const REPO_URL = "https://github.com/beckharrisdesign/mvds"
const NPM_URL = "https://www.npmjs.com/package/@beckharrisdesign/mvds"

/**
 * SiteHero — the first screen. States what MVDS is, who it is for, and what
 * makes it different, then routes to the two things a visitor actually wants:
 * the gallery (look at it) and the install (use it).
 *
 * `storybookHref` is injected rather than read from import.meta.env so the
 * story can render deterministically.
 */
function SiteHero({ storybookHref }: { storybookHref: string }) {
  return (
    <Stack gap={24} align="start">
      <Inline gap={8} align="center">
        <Badge variant="success">v{pkg.version} on npm</Badge>
        <Badge variant="outline">MIT licensed</Badge>
      </Inline>

      <Stack gap={16}>
        <h1 className="text-display max-w-[20ch]">
          A design system that agents can’t drift from.
        </h1>
        <p className="text-body-lg text-muted-foreground max-w-prose">
          MVDS encodes design intent as data — tokens, an 8-point
          grid, {/* mvds-allow no-raw-flex-grid — prose copy, not a utility class */}
          a semantic type ramp — and then <em>enforces</em> it. The rules are a
          manifest a machine reads, not prose in a wiki that a generated screen
          quietly ignores.
        </p>
      </Stack>

      <Inline gap={8} wrap>
        <Button asChild>
          <a href={storybookHref} target="_blank" rel="noopener noreferrer">
            Browse the gallery
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a
            href={`${REPO_URL}/tree/main/examples/starter`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Copy the starter app
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a href={NPM_URL} target="_blank" rel="noopener noreferrer">
            View on npm
          </a>
        </Button>
      </Inline>
    </Stack>
  )
}

export { SiteHero }
