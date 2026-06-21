import { Badge } from "@/components/ui/badge"
import { Grid, Inline, Stack } from "@/components/layout"
import pkg from "../../../package.json"

const REGISTRY_URL = "https://npm.pkg.github.com"
const REGISTRY_LABEL = "GitHub Packages"
const REPO_URL = "https://github.com/beckharrisdesign/mvds"

const STEPS = [
  {
    id: "npmrc",
    label: "1 · Configure .npmrc",
    caption: "Commit this file — no secrets",
    code: `@beckharrisdesign:registry=https://npm.pkg.github.com`,
  },
  {
    id: "install",
    label: "2 · Install",
    caption: "Authenticate first with a GitHub PAT (read:packages)",
    code: `npm login --registry=https://npm.pkg.github.com \\
  --scope=@beckharrisdesign

npm install @beckharrisdesign/mvds`,
  },
  {
    id: "css",
    label: "3 · Wire CSS",
    caption: "In your global stylesheet",
    code: `@import "@beckharrisdesign/mvds/styles.css";
@source "../node_modules/@beckharrisdesign/mvds/dist-lib/**/*.js";`,
  },
]

function CodeBlock({ code }: { code: string }) {
  return (
    // tabIndex={0}: scrollable regions must be keyboard-reachable (axe: scrollable-region-focusable)
    <pre tabIndex={0} className="bg-muted rounded text-small font-mono overflow-x-auto whitespace-pre-wrap px-16 py-12">
      {code}
    </pre>
  )
}

function PackageDocs() {
  return (
    <Stack gap={24}>
      <Stack gap={8}>
        <Inline gap={8} align="center">
          <span className="text-h4 font-mono">{pkg.name}</span>
          <Badge variant="neutral">v{pkg.version}</Badge>
          <a
            href={`${REGISTRY_URL}/${pkg.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-caption text-muted-foreground hover:text-foreground"
          >
            {REGISTRY_LABEL} ↗
          </a>
        </Inline>
        <p className="text-body text-muted-foreground">
          Agent-first design system — Vite + React + TS, Tailwind v4, shadcn/ui.
          Code is the source of truth; the Figma file is a generated mirror.
        </p>
      </Stack>

      <Stack gap={8}>
        <Inline gap={8} align="center" justify="between">
          <h2 className="text-h4">Quick start</h2>
          <a
            href={`${REPO_URL}/blob/main/docs/CONSUMING.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-small text-muted-foreground hover:text-foreground"
          >
            Full install guide →
          </a>
        </Inline>
        <Grid cols={{ base: 1, md: 3 }} gap={16}>
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
    </Stack>
  )
}

export { PackageDocs }
