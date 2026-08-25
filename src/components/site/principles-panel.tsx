import { Badge } from "@/components/ui/badge"
import { Grid, Inline, Stack } from "@/components/layout"
import type { PrincipleRecord } from "./manifest-snapshot.types"
import { sourceLabel } from "./principle-display"

/**
 * PrinciplesPanel — the design principles, as a first-class section.
 *
 * Two distinctions carry the whole section, and both are read from the manifest
 * rather than styled in by hand:
 *
 *   provenance  — `founder` is MVDS's own assertion and can change when the
 *                 founder changes her mind. `external` was adopted from published
 *                 work and is answerable to it, so it always links its source.
 *                 Showing them identically would let borrowed authority quietly
 *                 launder an in-house opinion.
 *   enforcement — `automated` fails a build. `judgment` does not, and saying so
 *                 plainly is the point: the rules that matter most to a design
 *                 system are usually the ones no regex can catch, and hiding
 *                 them would imply only the mechanisable ones are real.
 *
 * The card is deliberately lean (openspec: adding-eval-gate, founder review of
 * the 02.0 pair): the manifest's `rationale` and `evalLens` are data for their
 * consumers (docs/agents and the discovery eval), not card copy — and the
 * source is a plain link, not chrome dressed as a Badge.
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
  const automated = principle.enforcement === "automated"

  return (
    <Stack gap={8} className="border-border rounded-lg border p-4">
      <Inline gap={8} align="start" justify="between" wrap>
        <span className="text-body font-medium">{principle.title}</span>
        <Badge variant={automated ? "success" : "neutral"}>
          {automated ? "enforced" : "judgment"}
        </Badge>
      </Inline>

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
  const authored = principles.filter((p) => p.source.kind === "founder")
  const adopted = principles.filter((p) => p.source.kind === "external")
  const enforced = principles.filter((p) => p.enforcement === "automated")

  return (
    <Stack gap={32}>
      <Stack gap={8}>
        <Inline gap={8} align="center" justify="between" wrap>
          <h2 className="text-h2">Design principles</h2>
          <Inline gap={4} align="center">
            <Badge variant="success">{enforced.length} enforced</Badge>
            <Badge variant="neutral">
              {principles.length - enforced.length} by judgment
            </Badge>
          </Inline>
        </Inline>
        <p className="text-body text-muted-foreground max-w-prose">
          The rules this system actually applies — held as data in{" "}
          <code className="font-mono">principles.config.mjs</code>, not as prose
          somewhere. Each one says where it came from and whether a machine can
          catch you breaking it. Some MVDS asserts on its own authority; others
          are adopted from published usability work and link back to it.
        </p>
      </Stack>

      <Stack gap={16}>
        <Stack gap={4}>
          <h3 className="text-h4">Authored here</h3>
          <p className="text-small text-muted-foreground max-w-prose">
            MVDS's own rules. Every one is machine-enforced — they exist because
            they could be, and a rule that can fail a build is worth more than a
            rule in a document.
          </p>
        </Stack>
        <Grid cols={{ base: 1, md: 2 }} gap={16}>
          {authored.map((principle) => (
            <PrincipleCard key={principle.id} principle={principle} />
          ))}
        </Grid>
      </Stack>

      <Stack gap={16}>
        <Stack gap={4}>
          <h3 className="text-h4">Adopted from published work</h3>
          <p className="text-small text-muted-foreground max-w-prose">
            Not invented here, and cited so you can check them — every card
            links the original.
          </p>
        </Stack>
        <Grid cols={{ base: 1, md: 2 }} gap={16}>
          {adopted.map((principle) => (
            <PrincipleCard key={principle.id} principle={principle} />
          ))}
        </Grid>
      </Stack>
    </Stack>
  )
}

export { PrinciplesPanel }
