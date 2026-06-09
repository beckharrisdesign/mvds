// The MVDS principle manifest — the base layer. Each record encodes one golden
// rule from AGENTS.md as DATA (id, severity, scope, a check spec, a fix hint) so
// the rules are machine-enforced, not just prose. This is the spine: a later
// context layer (company/experiment/product) overrides these per `resolveManifest`
// to vary which principles apply — principles that "theme like CSS".
//
// Round one is deliberately a small, high-value set. Detection is regex over
// source lines; correctness rests on TIGHT SCOPE (carving out vendored ui/, the
// layout primitives, and specimen stories) more than on clever patterns.

/** @typedef {import('./principles.types').PrincipleManifest} PrincipleManifest */

// Reusable scope globs.
const SRC = "src/**/*.{ts,tsx}"
const VENDORED_UI = "src/components/ui/**"
const LAYOUT = "src/components/layout/**"
const STORIES = "src/**/*.stories.tsx"

/** @type {PrincipleManifest} */
export const baseManifest = {
  // Schema version (the manifest's SHAPE) — not the version of these rules'
  // content, which rides the package SemVer. See docs/VERSIONING.md.
  version: 1,
  principles: [
    {
      id: "no-hardcoded-color",
      description: "No hardcoded color — use the token utilities.",
      rationale:
        "Color must flow through the token layer so it themes per context. AGENTS.md: never text-gray-*, hex, or bg-white.",
      severity: "error",
      enabled: true,
      // Stories stay IN scope — a specimen must still source color from tokens.
      // Only vendored ui/ (deliberate oklch()/color-mix()) is carved out.
      scope: { include: [SRC], exclude: [VENDORED_UI] },
      check: {
        kind: "forbid-source",
        // hex; Tailwind palette color utilities with a numeric step; bg-white/black;
        // rgb()/hsl(). Semantic `neutral` (no numeric step) is NOT matched.
        pattern:
          /#[0-9a-fA-F]{3,8}\b|\b(?:text|bg|border|ring|fill|stroke)-(?:gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b|\bbg-(?:white|black)\b|\b(?:rgb|hsl)a?\(/,
      },
      fix: "Use bg-background / text-foreground / text-muted-foreground or the semantic triad (success / neutral / destructive).",
      docs: "AGENTS.md (Golden rules — Color via tokens)",
    },
    {
      id: "no-margin-spacing",
      description: "No margins for spacing — space siblings via the parent primitive's gap.",
      rationale:
        "Spacing is one number in one place (the parent's gap). AGENTS.md: the only sanctioned margin is mx-auto to center a Container.",
      severity: "error",
      enabled: true,
      scope: { include: [SRC], exclude: [VENDORED_UI, STORIES] },
      check: {
        kind: "forbid-classname",
        // m / mt / mr / mb / ml / mx / my followed by a VALUE (digit, px, or [arb]),
        // with optional responsive/state prefixes and optional negative. Requiring a
        // value char after the dash avoids "max-w", "transform", "from-", "item".
        pattern: /(?<![\w-])(?:[a-z0-9]+:)*-?m[trblxy]?-(?:auto|px\b|\d+(?:\.\d+)?|\[[^\]]+\])\b/,
        allow: ["mx-auto"],
      },
      fix: "Remove the margin; wrap siblings in <Stack gap> / <Inline gap> / <Grid gap>. To center a Container, mx-auto is allowed.",
      docs: "AGENTS.md (Golden rules — Gap is the ONLY way to space siblings)",
    },
    {
      id: "no-raw-flex-grid",
      description: "No raw flex/grid layout utilities outside the layout primitives.",
      rationale:
        "Layout is owned by Stack/Inline/Grid. AGENTS.md: never raw flex/grid utilities for layout.",
      severity: "error",
      enabled: true,
      // Widest carve-out: vendored ui/, the primitives themselves, and specimen stories
      // are all legitimate flex/grid containers.
      scope: { include: [SRC], exclude: [VENDORED_UI, LAYOUT, STORIES] },
      check: {
        kind: "forbid-classname",
        // `flex`/`grid` as a DISPLAY utility only. Lookbehind excludes inline-flex/
        // inline-grid; lookahead excludes flex-col/flex-wrap/grid-cols/grid-rows.
        pattern: /(?<![\w-])(?:[a-z0-9]+:)*(?:flex|grid)(?![\w-])/,
      },
      fix: "Use a layout primitive: <Stack>/<Inline> (flex) or <Grid> (grid) from src/components/layout.",
      docs: "AGENTS.md (Golden rules — Never raw flex/grid utilities for layout)",
    },
    {
      id: "story-coverage-ui",
      description: "Every UI component has a co-located *.stories.tsx.",
      rationale:
        "Storybook is the verification gate. AGENTS.md: one story file per UI component.",
      severity: "error",
      enabled: true,
      scope: {
        include: ["src/components/ui/**/*.tsx"],
        exclude: [STORIES],
      },
      check: {
        kind: "require-sibling-file",
        companion: (f) => f.replace(/\.tsx$/, ".stories.tsx"),
      },
      fix: "Add a co-located *.stories.tsx enumerating every variant/state in light + dark.",
      docs: "AGENTS.md (Storybook — first-class verification surface)",
    },
    {
      id: "story-coverage-layout",
      description: "Every layout primitive is covered by the shared layout story.",
      rationale:
        "AGENTS.md: a cohesive primitive family may share one story (layout.stories.tsx) rather than one per file.",
      severity: "error",
      enabled: true,
      scope: {
        include: ["src/components/layout/**/*.tsx"],
        exclude: [STORIES],
      },
      check: {
        kind: "require-sibling-file",
        // The whole family is satisfied by the single shared story.
        companion: () => "src/components/layout/layout.stories.tsx",
      },
      fix: "Cover the primitive in src/components/layout/layout.stories.tsx (the shared family story).",
      docs: "AGENTS.md (Storybook — a cohesive primitive family may share one story)",
    },
  ],
}

export default baseManifest
