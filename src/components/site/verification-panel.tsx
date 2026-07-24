import { Badge } from "@/components/ui/badge"
import { Grid, Inline, Stack } from "@/components/layout"
import type { Gate } from "./manifest-snapshot.types"

/**
 * VerificationPanel — the gates that keep MVDS honest, with their real results.
 *
 * The distinction between the two kinds of gate is load-bearing and is shown,
 * not hidden: a `build` gate was actually executed by the snapshot generator for
 * this commit, so its result line is a measurement. A `ci` gate is too slow or
 * too impure to run per build (headless Chromium, a live registry install) and
 * is instead required on every pull request. Claiming both were "just verified"
 * would be the easy lie; the footnote is the point.
 */

const VERIFIED_AT_COPY: Record<Gate["verifiedAt"], string> = {
  build: "ran for this commit",
  ci: "required to merge",
}

function GateRow({ gate }: { gate: Gate }) {
  return (
    <Stack gap={8} className="border-border rounded-lg border p-4">
      <Inline gap={8} align="center" justify="between">
        <span className="text-small font-medium">{gate.name}</span>
        <Badge variant={gate.status.level}>{gate.status.label}</Badge>
      </Inline>
      <Stack gap={4}>
        <p className="text-caption text-muted-foreground">{gate.detail}</p>
        <p className="text-caption text-foreground">{gate.result}</p>
      </Stack>
      <Inline gap={8} align="center">
        <code className="text-caption text-muted-foreground font-mono">
          {gate.command}
        </code>
        <span className="text-caption text-muted-foreground">
          · {VERIFIED_AT_COPY[gate.verifiedAt]}
        </span>
      </Inline>
    </Stack>
  )
}

function VerificationPanel({
  gates,
  commit,
}: {
  gates: Gate[]
  commit: string
}) {
  const live = gates.filter((g) => g.verifiedAt === "build")
  const passing = gates.filter((g) => g.status.level === "success").length

  return (
    <Stack gap={24}>
      <Stack gap={8}>
        <Inline gap={8} align="center" justify="between" wrap>
          <h2 className="text-h2">Verified, not asserted</h2>
          <Badge variant={passing === gates.length ? "success" : "destructive"}>
            {passing}/{gates.length} green
          </Badge>
        </Inline>
        <p className="text-body text-muted-foreground max-w-prose">
          Every rule this system claims is checked by something that can fail.{" "}
          {live.length} of these ran against commit{" "}
          <code className="font-mono">{commit}</code> while this page was built —
          their result lines below are the actual output. The rest are required
          on every pull request.
        </p>
      </Stack>
      <Grid cols={{ base: 1, md: 2, lg: 3 }} gap={16}>
        {gates.map((gate) => (
          <GateRow key={gate.id} gate={gate} />
        ))}
      </Grid>
    </Stack>
  )
}

export { VerificationPanel }
