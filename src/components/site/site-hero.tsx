import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Inline, Stack } from "@/components/layout"
import pkg from "../../../package.json"

import { starterUrl } from "./repo-links"

const NPM_URL = "https://www.npmjs.com/package/@beckharrisdesign/mvds"

/** The proof line as items — the founder's list, in her order. */
const PROOF_ITEMS = [
  "Tokens",
  "Semantic type",
  "Layout primitives",
  "Component manifests",
  "Checks that can fail a build",
]

/**
 * SiteHero — the first screen: headline, supporting copy, proof line, then the
 * three routes a visitor actually wants (browse it, start from it, install it).
 * Copy is the founder's canonical MVDS framing — keep it in her words.
 *
 * `storybookHref` and `commit` are injected rather than read from
 * import.meta.env / the snapshot so the story renders deterministically.
 */
function SiteHero({
  storybookHref,
  commit,
}: {
  storybookHref: string
  commit: string
}) {
  return (
    <Stack gap={24} align="start">
      <Inline gap={8} align="center">
        <Badge variant="success">v{pkg.version} on npm</Badge>
        <Badge variant="outline">MIT licensed</Badge>
      </Inline>

      <Stack gap={16}>
        {/* The deliberate break (no-runts): "that doesn’t drift." is kept
            unbreakable so the clause always lands whole — one line when it
            fits, else after "system" — never stranding "drift." */}
        <h1 className="text-display max-w-[29ch]">
          An opinionated design system{" "}
          <span className="whitespace-nowrap">that doesn’t drift.</span>
        </h1>
        <p className="text-body-lg text-muted-foreground max-w-prose text-pretty">
          MVDS is built for products made with people and AI agents. It turns
          design intent into reusable primitives and machine-enforced
          constraints—so every new experiment starts coherent,{" "}
          <span className="whitespace-nowrap">and stays that way.</span>
        </p>
        {/* The proof line, set as a checklist — each claim a checked item, in
            the founder's order, ending on the punch. role/aria: Inline renders
            a div, so restore list semantics for screen readers. */}
        <Inline gap={16} wrap role="list" aria-label="What MVDS ships">
          {PROOF_ITEMS.map((item) => (
            <Inline key={item} gap={4} align="center" role="listitem">
              <span aria-hidden="true" className="text-success">
                ✓
              </span>
              <span className="text-small font-medium">{item}</span>
            </Inline>
          ))}
        </Inline>
      </Stack>

      <Inline gap={8} wrap>
        <Button asChild>
          <a href={storybookHref} target="_blank" rel="noopener noreferrer">
            Browse the system
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a href={starterUrl(commit)} target="_blank" rel="noopener noreferrer">
            Start with the starter app
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a href={NPM_URL} target="_blank" rel="noopener noreferrer">
            View package on npm
          </a>
        </Button>
      </Inline>
    </Stack>
  )
}

export { SiteHero }
