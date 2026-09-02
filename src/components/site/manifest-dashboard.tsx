import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Grid, Stack, Inline } from "@/components/layout"
import { repoFileUrl, repoUrl } from "./repo-links"
import type { ElementEntry, ManifestSnapshot } from "./manifest-snapshot.types"

/**
 * ElementsOfMvds — "Elements of the MVDS" (openspec: improve-manifests-ia).
 * Six peer cards, one per element, each with founder-authored copy, a
 * generated inventory tally, a disclosure that fully lists the inventory, and
 * two Button actions: the toggle and the underlying detail. The section is an
 * ecosystem description; live gate results and sync state render in the
 * Verification and Figma preview sections.
 *
 * The copy below is founder-authored (design.md "Founder copy edits on 15.0")
 * and ships verbatim; only the numbers and lists come from the snapshot.
 */

const INTRO =
  "Six elements make up MVDS, and they work together as one system that can be accessed by human and agent alike."

const COPY: Record<string, string> = {
  principles:
    "The golden rules begin with industry standard accessibility and usability principles by default, and can then be extended by individual users to include development, content, product, and business values. Principles are stored as data alongside the rest of MVDS, and where possible they cascade into implementation through unit tests and other automated checks. Design principle checks can — and should — fail builds.",
  tokens:
    "Colors, type, spacing, and radius live in one CSS file, and every surface in the system reads from it.",
  components: "The primitives and components that consumers compose with.",
  figma:
    "The same tokens, components, variants, and text styles, available in Figma. Design and code always match, so you can iterate in either and hand the result back in a language the code understands. A spec declares which components and variants appear, conventions bind the shared names, and a lock lets each sync update the file in place.",
  schemas:
    "Every change moves through proposal, specs, discovery, design, and tasks, with founder approval between each step. The default schema adds an eval gate: the surface is captured and judged against the principles before and after design. The loop is adapted from the Experiment Hub, which remains the archived reference.",
  skills:
    "Skills give agents repeatable jobs with the house rules built in. Entry points run the workflow. Voice skills carry the writing standards for each artifact. The sync skills push tokens and components into the Figma library when asked.",
}

function actionHref(element: ElementEntry, commit: string): string {
  const action = element.action
  if (action.kind === "anchor") return `#${action.anchor}`
  if (action.kind === "repo-file") return repoFileUrl(commit, action.path)
  return repoUrl(commit, action.path)
}

function ElementList({ element }: { element: ElementEntry }) {
  const plain = element.lists.length === 1 && element.lists[0].label === null
  if (plain) {
    return (
      <Grid cols={{ base: 1, md: 2 }} gap={8}>
        {element.lists[0].items.map((item) => (
          <span key={item} className="text-small">
            {item}
          </span>
        ))}
      </Grid>
    )
  }
  return (
    <Stack gap={8}>
      {element.lists.map((list) => (
        <p key={list.label} className="text-small text-pretty">
          <span className="font-medium">{list.label}: </span>
          {list.items.join(" · ")}
        </p>
      ))}
    </Stack>
  )
}

function ElementCard({
  element,
  commit,
}: {
  element: ElementEntry
  commit: string
}) {
  const [expanded, setExpanded] = useState(false)
  return (
    <Card>
      <CardHeader>
        <CardTitle>{element.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Stack gap={16}>
          <p className="text-small text-muted-foreground text-pretty">
            {COPY[element.id]}
          </p>
          <p className="text-small">
            {element.tally
              .map((t) => `${t.value} ${t.label}`)
              .join(" · ")}
          </p>
          {expanded && <ElementList element={element} />}
          <Inline gap={8}>
            <Button
              variant="outline"
              onClick={() => setExpanded((open) => !open)}
              aria-expanded={expanded}
            >
              {expanded ? "Hide the list" : "Show the full list"}
            </Button>
            <Button variant="outline" asChild>
              <a
                href={actionHref(element, commit)}
                {...(element.action.kind === "anchor"
                  ? {}
                  : { target: "_blank", rel: "noopener noreferrer" })}
              >
                {element.action.label}
              </a>
            </Button>
          </Inline>
        </Stack>
      </CardContent>
    </Card>
  )
}

function ElementsOfMvds({ snapshot }: { snapshot: ManifestSnapshot }) {
  return (
    <Stack gap={32}>
      <Stack gap={16}>
        <h2 className="text-h2 text-balance">Elements of the MVDS</h2>
        <p className="text-body text-muted-foreground text-pretty max-w-prose">
          {INTRO}
        </p>
      </Stack>
      <Stack gap={24}>
        {snapshot.elements.map((element) => (
          <ElementCard
            key={element.id}
            element={element}
            commit={snapshot.commit}
          />
        ))}
      </Stack>
    </Stack>
  )
}

export { ElementsOfMvds }
