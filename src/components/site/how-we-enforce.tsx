import { Stack } from "@/components/layout"

/**
 * Intro → How we enforce — peer-facing tour of when checks run.
 * Agent-readable twin: docs/VERIFICATION.md. Copy aligned to explore Figma 06.0.
 */

const GATES = [
  {
    id: "planning",
    title: "While planning",
    body: "Before UI gets written, we write down what “good” means so people and agents share one picture. The house rules spell out spacing, tokens, and layout primitives. Design principles live as structured records — what each rule is about, where it applies, how to fix a miss — so the system can check the mechanical ones later and leave the judgment calls (like the usability heuristics we adopted) to humans and agents who still have to decide. Color, type, and spacing all start in one token file. If a brand or product change isn’t planned there, it isn’t something the repo can hold you to afterward.",
  },
  {
    id: "coding",
    title: "While coding",
    body: "While the work is still on your machine, we try to catch drift early. When an agent edits a source file, a guard re-scans that file against the golden rules; when someone touches the token layer, contrast is checked right away (and you’re reminded that the Figma mirror is now stale). Before you call a change done, you run the same ship gate CI will run: build and typecheck, token contrast in light and dark, the principle scan, and every Storybook story in real Chromium — again in both themes, with accessibility checks. A small git hook also keeps commits off main so the work rides a branch and a PR. Ordinary linting is still there for JavaScript hygiene; it is not how we enforce the design-system rules.",
  },
  {
    id: "testing",
    title: "While testing",
    body: "Once the branch is on GitHub, the repo runs that spine again — and adds checks that only make sense remotely. Every pull request must build the app and the publishable library, re-check contrast and principles, confirm the Figma component manifest still matches the code, and run the full Storybook suite in Chromium with accessibility. Separate jobs walk the path a newcomer actually takes (install the package into the starter with no special auth and prove the CSS came out right) and ping the public Figma share so a revoked link can’t quietly rot. Chromatic takes visual snapshots for human review; those diffs inform the conversation but don’t block the merge on their own.\n\nWhen we say a principle is “enforced,” we mean the static scan over source — patterns and required story files. Storybook in the browser is the other half: does it look and behave right, with real contrast in the DOM? They catch different kinds of mistakes.",
  },
  {
    id: "world",
    title: "Out in the world",
    body: "Shipping is when strangers meet the package. A version tag publishes to npm; the tag has to match the package version, and packing the release rebuilds the library so the registry never gets a stale build. After it’s out, CI keeps exercising the documented install against what’s actually on npm — so we notice when the two-step “install and wire CSS” path stops working for a real app. The Figma Core file stays a one-way mirror, updated when someone asks, not on every commit; the share check only proves the public URL still opens.",
  },
] as const

function GateSection({ title, body }: { title: string; body: string }) {
  const paragraphs = body.split("\n\n")
  return (
    <Stack gap={8} className="border-border rounded-lg border p-4">
      <h2 className="text-h4">{title}</h2>
      <Stack gap={8}>
        {paragraphs.map((p) => (
          <p key={p.slice(0, 32)} className="text-body text-muted-foreground">
            {p}
          </p>
        ))}
      </Stack>
    </Stack>
  )
}

function HowWeEnforce() {
  return (
    <Stack gap={24} className="max-w-prose">
      <Stack gap={8}>
        <h1 className="text-h1">How we enforce</h1>
        <p className="text-body text-muted-foreground">
          We don’t ask anyone to memorize a style guide and hope for the best.
          The same expectations — tokens, spacing, stories, contrast — show up
          at a few natural points in the work. Miss one, and a later check
          usually catches it. This page is only about when those checks run; the
          rules themselves live in the house docs and the principle manifest.
        </p>
      </Stack>

      <Stack gap={16}>
        {GATES.map((gate) => (
          <GateSection key={gate.id} title={gate.title} body={gate.body} />
        ))}
      </Stack>
    </Stack>
  )
}

export { HowWeEnforce }
