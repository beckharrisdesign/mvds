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
// The starter app under examples/ is held to the same style rules as the system:
// it is the code a newcomer copies, so it must model the golden rules, not just
// describe them. (Story-coverage principles stay scoped to src/ — the starter is
// a consuming app, not DS surface, so it ships no stories.)
const EXAMPLES = "examples/**/*.{ts,tsx}"
const VENDORED_UI = "src/components/ui/**"
const LAYOUT = "src/components/layout/**"
const STORIES = "src/**/*.stories.tsx"

// --- provenance ----------------------------------------------------------------
// Every principle declares WHERE IT COMES FROM. Two kinds carry very different
// authority and the manifest must not blur them: a rule MVDS authored is the
// founder's call and can change when she changes her mind; a rule adopted from
// published work is answerable to that source, so it carries a URL a reader can
// go and check. `url` is mandatory on external sources for exactly that reason.
/** @type {import('./principles.types').PrincipleSource} */
const FOUNDER = {
  kind: "founder",
  name: "MVDS house rules",
  url: "https://github.com/beckharrisdesign/mvds/blob/main/AGENTS.md",
}

/** Jakob Nielsen's 10 usability heuristics (Nielsen Norman Group). */
const nng = (ref) => ({
  kind: "external",
  name: "Nielsen Norman Group",
  url: "https://www.nngroup.com/articles/ten-usability-heuristics/",
  ref,
})

// Guiding principles apply to design work, not to a file glob, so they carry an
// empty scope. The runner skips them; they exist here so the manifest is the
// WHOLE set of rules rather than only the regex-shaped ones.
const NO_FILES = { include: [], exclude: [] }

/** @type {PrincipleManifest} */
export const baseManifest = {
  // Schema version (the manifest's SHAPE) — not the version of these rules'
  // content, which rides the package SemVer. See docs/VERSIONING.md.
  version: 1,
  principles: [
    {
      id: "no-hardcoded-color",
      title: "Don’t drift from the color tokens",
      description: "No hardcoded color — use the token utilities.",
      rationale:
        "Color must flow through the token layer so it themes per context. AGENTS.md: never a generic Tailwind palette (text-slate-*), hex, or bg-white. The gray/primary/secondary ramps ARE tokens (src/index.css scales), so gray-* passes.",
      severity: "error",
      enabled: true,
      // Stories stay IN scope — a specimen must still source color from tokens.
      // Only vendored ui/ (deliberate oklch()/color-mix()) is carved out.
      scope: { include: [SRC, EXAMPLES], exclude: [VENDORED_UI] },
      check: {
        kind: "forbid-source",
        // hex; Tailwind palette color utilities with a numeric step; bg-white/black;
        // rgb()/hsl(). Semantic `neutral` (no numeric step) is NOT matched.
        // `gray-*` is NOT matched either — it is an MVDS token ramp (src/index.css
        // scales), not the generic Tailwind palette.
        pattern:
          /#[0-9a-fA-F]{3,8}\b|\b(?:text|bg|border|ring|fill|stroke)-(?:slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b|\bbg-(?:white|black)\b|\b(?:rgb|hsl)a?\(/,
      },
      fix: "Use bg-background / text-foreground / text-muted-foreground, the semantic triad (success / neutral / destructive), gray-*, or a gradation step (primary-1…5 / secondary-1…5).",
      docs: "AGENTS.md (Golden rules — Color via tokens)",
      source: FOUNDER,
    },
    {
      id: "step-on-color-gradations",
      title: "Color modulation steps on the gradation scale",
      description:
        "Tints and shades of brand families come from gradation steps (primary-1…5 / secondary-1…5) — not ad-hoc alpha or color-mix.",
      rationale:
        "Stepping between authored values is what makes UI read as done, organized, trustworthy — the same discipline as the 8-grid, applied to color. Founder (2026-08-21): “You should be stepping between values on the ramp by default… A brand could then define their own versions of it, but MVDS should be opinionated about it being there.” Steps carry role contracts (1–2 tint surfaces, 3 decorative, 4–5 text-safe) that check:contrast enforces; an ad-hoc /10 alpha carries no contract at all.",
      severity: "error",
      enabled: true,
      // Vendored ui/ still modulates via alpha (/80 hovers, /10 status tints) —
      // carved out UNTIL the Phase-2 de-alpha change migrates it (see the MVDS
      // vision roadmap). The carve-out is data here, visible and dated, not an
      // invisible exception. Specimen stories stay in scope: a specimen must
      // model the stepped vocabulary too.
      scope: { include: [SRC, EXAMPLES], exclude: [VENDORED_UI] },
      check: {
        kind: "forbid-source",
        // brand-family utility with an alpha suffix (bg-primary/10, from-secondary/20 —
        // `-foreground/` variants don't match: the slash must follow the family name);
        // or color-mix() reaching into a brand base variable.
        pattern:
          /\b(?:bg|text|border|ring|fill|stroke|from|via|to)-(?:primary|secondary)\/\d+\b|color-mix\([^)]*var\(--(?:primary|secondary)\)[^)]*\)/,
      },
      fix: "Pick a gradation step by role: bg-primary-1/-2 for tint surfaces, -3 for decorative borders/gradients, text-primary-4/-5 for text. See the Foundations/Color specimen.",
      docs: "AGENTS.md (Golden rules — Color via tokens; Spacing — the 8 grid for the stepping idea)",
      source: FOUNDER,
    },
    {
      id: "step-on-type-ramp",
      title: "Typography size steps on the semantic ramp",
      description:
        "Type sizes come from the semantic ramp (text-display … text-caption) — never generic size utilities or arbitrary sizes.",
      rationale:
        "The prose golden rule (“never ad-hoc text-2xl font-bold”) becomes data. Each ramp step carries the whole spec (size + line-height + weight + tracking), so stepping keeps hierarchy consistent everywhere an agent or human sets type.",
      severity: "error",
      enabled: true,
      scope: { include: [SRC, EXAMPLES], exclude: [VENDORED_UI] },
      check: {
        kind: "forbid-source",
        // Tailwind's generic size steps and arbitrary lengths. The semantic ramp
        // (text-display/h1..h4/body-lg/body/small/caption) does not match.
        pattern: /\btext-(?:xs|sm|base|lg|xl|[2-9]xl)\b|\btext-\[[0-9.]+(?:px|rem|em)\]/,
      },
      fix: "Use a semantic ramp step: text-display, text-h1…text-h4, text-body-lg, text-body, text-small, or text-caption.",
      docs: "AGENTS.md (Golden rules — Type via the semantic ramp)",
      source: FOUNDER,
    },
    {
      id: "no-margin-spacing",
      title: "Space siblings with gap, not margins",
      description: "No margins for spacing — space siblings via the parent primitive's gap.",
      rationale:
        "Spacing is one number in one place (the parent's gap). AGENTS.md: the only sanctioned margin is mx-auto to center a Container.",
      severity: "error",
      enabled: true,
      scope: { include: [SRC, EXAMPLES], exclude: [VENDORED_UI, STORIES] },
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
      source: FOUNDER,
    },
    {
      id: "no-raw-flex-grid",
      title: "Layout only via Stack / Inline / Grid",
      description: "No raw flex/grid layout utilities outside the layout primitives.",
      rationale:
        "Layout is owned by Stack/Inline/Grid. AGENTS.md: never raw flex/grid utilities for layout.",
      severity: "error",
      enabled: true,
      // Widest carve-out: vendored ui/, the primitives themselves, and specimen stories
      // are all legitimate flex/grid containers.
      scope: { include: [SRC, EXAMPLES], exclude: [VENDORED_UI, LAYOUT, STORIES] },
      check: {
        kind: "forbid-classname",
        // `flex`/`grid` as a DISPLAY utility only. Lookbehind excludes inline-flex/
        // inline-grid; lookahead excludes flex-col/flex-wrap/grid-cols/grid-rows.
        pattern: /(?<![\w-])(?:[a-z0-9]+:)*(?:flex|grid)(?![\w-])/,
      },
      fix: "Use a layout primitive: <Stack>/<Inline> (flex) or <Grid> (grid) from src/components/layout.",
      docs: "AGENTS.md (Golden rules — Never raw flex/grid utilities for layout)",
      source: FOUNDER,
    },
    {
      id: "story-coverage-ui",
      title: "Every UI component has a story",
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
      source: FOUNDER,
    },
    {
      id: "story-coverage-site",
      title: "Every site section has a story",
      description: "Every site section component has a co-located *.stories.tsx.",
      rationale:
        "Storybook is the verification gate for site/ sections (the landing-page surface) exactly as for ui/ components.",
      severity: "error",
      enabled: true,
      scope: {
        include: ["src/components/site/**/*.tsx"],
        exclude: [STORIES],
      },
      check: {
        kind: "require-sibling-file",
        companion: (f) => f.replace(/\.tsx$/, ".stories.tsx"),
      },
      fix: "Add a co-located *.stories.tsx exercising the section in light + dark.",
      docs: "AGENTS.md (Storybook — first-class verification surface)",
      source: FOUNDER,
    },
    {
      id: "story-coverage-layout",
      title: "Layout family covered in one story",
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
      source: FOUNDER,
    },
    {
      id: "story-coverage-blocks",
      title: "Blocks family covered in one story",
      description: "Every content block primitive is covered by the shared blocks story.",
      rationale:
        "AGENTS.md: a cohesive primitive family may share one story (blocks.stories.tsx) rather than one per file.",
      severity: "error",
      enabled: true,
      scope: {
        include: ["src/components/blocks/**/*.tsx"],
        exclude: [STORIES],
      },
      check: {
        kind: "require-sibling-file",
        companion: () => "src/components/blocks/blocks.stories.tsx",
      },
      fix: "Cover the primitive in src/components/blocks/blocks.stories.tsx (the shared family story).",
      docs: "AGENTS.md (Storybook — a cohesive primitive family may share one story)",
      source: FOUNDER,
    },

    // --- Guiding principles ------------------------------------------------------
    // Adopted from published usability work rather than invented here. They are
    // NOT machine-checkable, and pretending otherwise would be the failure mode
    // this manifest exists to avoid — so each states the judgment it asks for and
    // links its source. `description` and `rationale` are MVDS's own words about
    // how the heuristic applies to a design system; the `ref` names the original.
    {
      id: "consistency-and-standards",
      title: "One concept, one expression",
      description:
        "One concept, one expression — a thing that behaves the same should look the same everywhere.",
      rationale:
        "This is the whole argument for a token layer and a fixed variant set. Every ad-hoc value is a second dialect a reader has to learn, and an agent has to guess between. The mechanical half is enforced (no-hardcoded-color, no-raw-flex-grid); the judgment half is deciding when a genuinely new case deserves a new variant instead of a one-off.",
      severity: "error",
      enabled: true,
      scope: NO_FILES,
      check: { kind: "guiding" },
      fix: "Before adding a variant or a bespoke style, find the existing expression of the same idea and reuse it. If none fits, add it to the system rather than to the screen.",
      docs: "AGENTS.md (Golden rules)",
      source: nng("Heuristic 4: Consistency and standards"),
    },
    {
      id: "aesthetic-and-minimalist-design",
      title: "Cut surface that doesn’t earn its place",
      description:
        "Every element competes for attention with every other one — so carry no surface you cannot justify.",
      rationale:
        "Why the component set is deliberately tiny and why pre-1.0 MVDS deletes rather than deprecates. Unused variants are not free: they dilute the signal of the ones that matter and enlarge the space an agent chooses from.",
      severity: "error",
      enabled: true,
      scope: NO_FILES,
      check: { kind: "guiding" },
      fix: "Cut it. If a variant, prop, or export is not earning its place, remove it outright — there are no external consumers to protect yet.",
      docs: "AGENTS.md (Pre-1.0: breaking changes are fine)",
      source: nng("Heuristic 8: Aesthetic and minimalist design"),
    },
    {
      id: "visibility-of-system-status",
      title: "Show real status, don’t claim it in prose",
      description:
        "The system tells you what it knows about itself, in time to matter.",
      rationale:
        "The reason this landing page reports gate results and sync state rather than claiming quality in prose. A drifted mirror or a failing check should be legible at a glance and distinguishable from the expected state — which is why the status triad separates 'trailing by design' from 'genuinely disagrees'.",
      severity: "error",
      enabled: true,
      scope: NO_FILES,
      check: { kind: "guiding" },
      fix: "Surface real state from a generated source. Never hand-write a status that could go stale without anything failing.",
      docs: "AGENTS.md (Storybook — first-class verification surface)",
      source: nng("Heuristic 1: Visibility of system status"),
    },
    {
      id: "error-prevention",
      title: "Make the wrong thing hard to type",
      description:
        "Make the wrong thing impossible to express, rather than catching it later.",
      rationale:
        "Why primitive props are typed to the 8-grid: gap={12} is a compile error, not a review comment. Prevention beats detection beats documentation, in that order — the principles gate and the edit-guard hook exist for the cases the type system cannot reach.",
      severity: "error",
      enabled: true,
      scope: NO_FILES,
      check: { kind: "guiding" },
      fix: "Prefer a narrowed type or a constrained prop over a lint rule; prefer a lint rule over a line in the docs.",
      docs: "AGENTS.md (Spacing — the 8 grid)",
      source: nng("Heuristic 5: Error prevention"),
    },
    {
      id: "recognition-rather-than-recall",
      title: "Names that mean what they say",
      description:
        "Names should say what they mean, so nobody has to hold a mapping in their head.",
      rationale:
        "Why the type ramp is semantic (text-h1, not text-2xl font-bold) and why primitive props take pixels (gap={16}, not gap-4 meaning 16px). A name that must be translated before use is a name that will be used wrongly — by a person at 5pm, and by an agent every time.",
      severity: "error",
      enabled: true,
      scope: NO_FILES,
      check: { kind: "guiding" },
      fix: "Name for the intent, not the implementation. If a value needs a comment to explain what it maps to, the name is wrong.",
      docs: "AGENTS.md (Golden rules — Type via the semantic ramp)",
      source: nng("Heuristic 6: Recognition rather than recall"),
    },
  ],
}

export default baseManifest
