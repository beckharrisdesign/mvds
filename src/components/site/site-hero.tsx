import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Inline, Stack } from "@/components/layout"
import pkg from "../../../package.json"

import { starterUrl, REPO_URL } from "./repo-links"

const NPM_URL = "https://www.npmjs.com/package/@beckharrisdesign/mvds"

/** The elements of MVDS — what the system IS, in the founder's order; each is
    expanded as a section further down the page. */
const ELEMENTS = [
  "Principles",
  "Token layer",
  "Component library",
  "Figma library",
  "Openspec schemas",
  "Skills",
]

/**
 * SiteHero — the first screen: headline, supporting copy, then the founder's
 * elements/expressions pair — the checklist names what MVDS is, the button row
 * names where it shows up. "Keep reading" is the first expression and gets no
 * button: the page itself is that expression, which is also why every rendered
 * expression is an equal primary (openspec: site-language-refresh, design 04.0).
 * Copy is the founder's canonical framing — keep it in her words.
 *
 * `storybookHref`, `figmaHref`, and `commit` are injected rather than read from
 * import.meta.env / the snapshot so the story renders deterministically.
 */
function SiteHero({
  storybookHref,
  figmaHref,
  commit,
}: {
  storybookHref: string
  figmaHref: string
  commit: string
}) {
  /** The expressions of MVDS, destination-titled per the founder's link rule
      (no icon glyphs), in her order — after buttonless "keep reading". */
  const expressions = [
    { label: "Starter app", href: starterUrl(commit) },
    { label: "Storybook", href: storybookHref },
    { label: "Figma", href: figmaHref },
    { label: "GitHub", href: REPO_URL },
    { label: "npm", href: NPM_URL },
  ]

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
          MVDS is built for both human and agentic founders. It turns intent
          into reusable primitives and machine-enforced constraints — so every
          new experiment starts with strong principles,{" "}
          <span className="whitespace-nowrap">and stays that way.</span>
        </p>
        {/* The elements, set as a checklist. role/aria: Inline renders a div,
            so restore list semantics for screen readers. */}
        <Inline gap={16} wrap role="list" aria-label="The elements of MVDS">
          {ELEMENTS.map((item) => (
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
        {expressions.map(({ label, href }) => (
          <Button key={label} asChild>
            <a href={href} target="_blank" rel="noopener noreferrer">
              {label}
            </a>
          </Button>
        ))}
      </Inline>
    </Stack>
  )
}

export { SiteHero }
