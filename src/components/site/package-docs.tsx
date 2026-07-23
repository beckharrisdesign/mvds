import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Grid, Inline, Stack } from "@/components/layout"
import pkg from "../../../package.json"

const REPO_URL = "https://github.com/beckharrisdesign/mvds"
const NPM_URL = "https://www.npmjs.com/package/@beckharrisdesign/mvds"
const STARTER_URL = `${REPO_URL}/tree/main/examples/starter`

/**
 * PackageDocs — the install path, as it actually is: public npm, no auth.
 *
 * Kept to two steps on purpose. The registry moved from GitHub Packages to
 * public npm and these panels once still taught the old PAT dance; the fix is
 * not just correct copy but `npm run verify:consumer`, which installs this
 * exact path in CI so the two cannot drift apart again.
 */
const STEPS = [
  {
    id: "install",
    label: "1 · Install",
    caption: "Public registry — no .npmrc, no login, no token",
    code: `npm install ${pkg.name}`,
  },
  {
    id: "css",
    label: "2 · Wire the CSS",
    caption: "Three lines in your global stylesheet",
    code: `@import "${pkg.name}/styles.css";
@source "../node_modules/${pkg.name}/dist-lib/**/*.js";
@source "../**/*.{ts,tsx}";`,
  },
]

function CodeBlock({ code }: { code: string }) {
  return (
    // tabIndex={0}: scrollable regions must be keyboard-reachable (axe: scrollable-region-focusable)
    <pre
      tabIndex={0}
      className="bg-muted text-small overflow-x-auto rounded px-16 py-12 font-mono whitespace-pre-wrap"
    >
      {code}
    </pre>
  )
}

function PackageDocs() {
  return (
    <Stack gap={32}>
      <Stack gap={8}>
        <Inline gap={8} align="center" wrap>
          <span className="text-h4 font-mono">{pkg.name}</span>
          <Badge variant="neutral">v{pkg.version}</Badge>
          <a
            href={NPM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-caption text-muted-foreground hover:text-foreground"
          >
            npm ↗
          </a>
        </Inline>
        <p className="text-body text-muted-foreground max-w-prose">
          Two steps to a styled app. The second one matters more than it looks:
          without the <code className="font-mono">@source</code> line pointing at{" "}
          <code className="font-mono">dist-lib</code>, Tailwind never generates
          the components’ utilities and they render completely unstyled.
        </p>
      </Stack>

      <Stack gap={16}>
        <Inline gap={8} align="center" justify="between" wrap>
          <h2 className="text-h3">Quick start</h2>
          <a
            href={`${REPO_URL}/blob/main/docs/CONSUMING.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-small text-muted-foreground hover:text-foreground"
          >
            Full install guide →
          </a>
        </Inline>
        <Grid cols={{ base: 1, md: 2 }} gap={16}>
          {STEPS.map((step) => (
            <Stack key={step.id} gap={8}>
              <Stack gap={4}>
                <span className="text-small font-medium">{step.label}</span>
                <span className="text-caption text-muted-foreground">
                  {step.caption}
                </span>
              </Stack>
              <CodeBlock code={step.code} />
            </Stack>
          ))}
        </Grid>
      </Stack>

      <Stack gap={16} className="border-border rounded-lg border p-4">
        <Stack gap={4}>
          <Inline gap={8} align="center" wrap>
            <span className="text-body font-medium">
              Or start from a working app
            </span>
            <Badge variant="success">built in CI</Badge>
          </Inline>
          <p className="text-small text-muted-foreground max-w-prose">
            <code className="font-mono">examples/starter</code> is a complete
            consuming app — dark mode wired, brand override stubbed, and written
            to the same golden rules the principles gate enforces here. CI
            installs the published package into it and builds it on every pull
            request, so it is known-good rather than merely written down.
          </p>
        </Stack>
        <Inline gap={8} wrap>
          <Button variant="outline" size="sm" asChild>
            <a href={STARTER_URL} target="_blank" rel="noopener noreferrer">
              Open the starter →
            </a>
          </Button>
        </Inline>
      </Stack>
    </Stack>
  )
}

export { PackageDocs }
