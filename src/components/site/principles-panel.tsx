import { Badge } from "@/components/ui/badge"
import { Grid, Inline, Stack } from "@/components/layout"
import type { PrincipleRecord } from "./manifest-snapshot.types"
import { sourceLabel } from "./principle-display"

/**
 * PrinciplesPanel — the design principles, as a first-class section.
 *
 * The manifest gives every record two independent answers, and the section's
 * job is keeping both visible without conflating them (they used to coincide;
 * `no-runts` — founder-authored, judgment-held — broke the coincidence):
 *
 *   enforcement — the GROUPING. `automated` fails a build; `judgment` does
 *                 not, and saying so plainly is the point: the rules that
 *                 matter most to a design system are usually the ones no
 *                 regex can catch, and hiding them would imply only the
 *                 mechanisable ones are real. Judgment records also serve as
 *                 the discovery eval's rubric (openspec: adding-eval-gate).
 *   provenance  — the PER-CARD source line. `founder` is MVDS's own assertion
 *                 and can change when the founder changes her mind. `external`
 *                 was adopted from published work and is answerable to it, so
 *                 it always links its source. Showing them identically would
 *                 let borrowed authority quietly launder an in-house opinion.
 *
 * The card is deliberately lean (openspec: adding-eval-gate, founder review of
 * the 02.0 pair): the manifest's `rationale` and `evalLens` are data for their
 * consumers (docs/agents and the discovery eval), not card copy — and the
 * source is a plain link, not chrome dressed as a Badge. With enforcement
 * carried by the section, the card drops its enforcement Badge too.
 */

function SourceLink({ principle }: { principle: PrincipleRecord }) {
  const label = sourceLabel(principle)
  if (!principle.source.url) {
    return <span className="text-caption text-muted-foreground">{label}</span>
  }
  return (
    <a
      href={principle.source.url}
      target="_blank"
      rel="noopener noreferrer"
      title={principle.source.ref ?? principle.source.name}
      className="text-caption text-muted-foreground hover:text-foreground underline underline-offset-2"
    >
      {label} ↗
    </a>
  )
}

function PrincipleCard({ principle }: { principle: PrincipleRecord }) {
  return (
    <Stack gap={8} className="border-border rounded-lg border p-4">
      <span className="text-body font-medium">{principle.title}</span>

      <p className="text-small text-muted-foreground">{principle.description}</p>

      <Inline gap={8} align="center" justify="between" wrap>
        <code className="text-caption text-muted-foreground font-mono">
          {principle.id}
        </code>
        <SourceLink principle={principle} />
      </Inline>
    </Stack>
  )
}

function PrinciplesPanel({
  principles,
}: {
  principles: PrincipleRecord[]
}) {
  const enforced = principles.filter((p) => p.enforcement === "automated")
  const guiding = principles.filter((p) => p.enforcement !== "automated")

  return (
    <Stack gap={32}>
      <Stack gap={8}>
        <Inline gap={8} align="center" justify="between" wrap>
          <h2 className="text-h2">Design principles</h2>
          <Inline gap={4} align="center">
            <Badge variant="success">{enforced.length} enforced</Badge>
            <Badge variant="neutral">{guiding.length} by judgment</Badge>
          </Inline>
        </Inline>
        <p className="text-body text-muted-foreground max-w-prose">
          The rules this system actually applies — held as data in{" "}
          <code className="font-mono">principles.config.mjs</code>, not as prose
          somewhere. Every record answers two questions about itself: can a
          machine catch you breaking it, and where did it come from — asserted
          here on MVDS’s own authority, or adopted from published usability
          work and cited so you can check it.
        </p>
      </Stack>

      <Stack gap={16}>
        <Stack gap={4}>
          <h3 className="text-h4">Enforced — fails the build</h3>
          <p className="text-small text-muted-foreground max-w-prose">
            Checked mechanically — at the keystroke, on every build, and on
            every pull request. Break one and the gate names the line and the
            fix.
          </p>
        </Stack>
        <Grid cols={{ base: 1, md: 2 }} gap={16}>
          {enforced.map((principle) => (
            <PrincipleCard key={principle.id} principle={principle} />
          ))}
        </Grid>
      </Stack>

      <Stack gap={16}>
        <Stack gap={4}>
          <h3 className="text-h4">Held by judgment</h3>
          <p className="text-small text-muted-foreground max-w-prose">
            No regex can catch these — saying so plainly is the point. Each one
            works twice: as the rationale for how the system is shaped, and as
            the rubric the discovery eval holds new surfaces to.
          </p>
        </Stack>
        <Grid cols={{ base: 1, md: 2 }} gap={16}>
          {guiding.map((principle) => (
            <PrincipleCard key={principle.id} principle={principle} />
          ))}
        </Grid>
      </Stack>
    </Stack>
  )
}

export { PrinciplesPanel }
