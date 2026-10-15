// Mechanical code → Figma mapping conventions — DATA, declared once.
//
// The component manifests (figma/components/*.figma.mjs) follow the
// minimum-information principle: they declare only what an agent cannot
// reliably re-derive from code at sync time (axis options, layer trees,
// auto-layout params, the disabled-state representation, binding exceptions).
// Everything mechanical — which Tailwind utility binds to which Figma variable
// or text style — lives here, so the rule is written once and the manifests
// stay structure + exceptions.
//
// Consumed by the `mvds-figma-component-sync` skill (read as guidance for
// use_figma plugin scripts) and by scripts/check-figma-manifest.mjs (token-name
// lint). See docs/SYNC.md.
//
// RULES vs. MAPPINGS — and why the difference is load-bearing.
//
// Some entries here are RULES over an open set: `bg-{token}` binds `Color/{token}`
// for any color token there will ever be. A rule has nothing finite to resolve, so
// it stays prose.
//
// The rest are MAPPINGS over a CLOSED set — the four chrome dimensions, the five
// z-layers, the five tint variables, the four radius steps. Those used to be prose
// too, written as template strings like
//
//   zLayers: "z-{level} → Sizing/z-{level} (Scales, scopes [] — doc-only)"
//
// and NO CODE READ THEM. That is how #124 happened: the code tokens were renamed
// to `--z-index-*` (Tailwind v4 only generates a `z-<name>` utility from that
// prefix), the sentence above kept saying `z-{level}`, every gate stayed green,
// and the mapping pointed at tokens that no longer existed for four months.
//
// So every closed mapping is now a record with a resolvable `source` and `target`:
// a pattern plus its members. check:figma expands them and checks BOTH directions
// (M1-M6 in scripts/lib/figma-gates.mjs) — each member's CSS custom property is
// really declared in src/index.css, each member's Figma variable is really
// recorded in figma.lock.json, and nothing on either side is left undeclared. A
// stale mapping is now a failing gate instead of a sentence.
//
// Keep that property when adding one: if the member list is finite, make it a
// `{ source, target, members }` record, never a sentence describing it.

export const conventions = {
  // ---- Color utilities → Figma color variables (Tokens collection) ----------
  // Variable names use group prefixes (grouped 2026-06-17): the code token
  // without `--`, under its group folder (the same convention as the token
  // sync): bg-primary → fill bound to `Color/primary`.
  //
  //   bg-X      → frame fill          bound to variable Color/X
  //   text-X    → text-node fill      bound to variable Color/X
  //   border-X  → frame stroke        bound to variable Color/X
  //
  // Opacity-modified utilities (`bg-destructive/10`) bind a DERIVED tint
  // variable named `Color/{token}-tint` whose rgba VALUE carries the alpha per mode
  // (e.g. Color/destructive-tint = destructive @ a0.10 light / a0.20 dark, mirroring
  // `bg-destructive/10 dark:bg-destructive/20`). Alpha lives in the variable —
  // NOT as paint opacity, which Figma drops when instances re-resolve modes
  // (verified 2026-06-09 sync). Derived tints are Figma-only variables in the
  // Tokens collection; their IDs are recorded in figma.lock.json.
  color: {
    // RULES — open set (any color token), nothing finite to resolve.
    fill: "bg-{token} → fill bound to Color/{token}",
    text: "text-{token} → text fill bound to Color/{token}",
    stroke: "border-{token} → stroke bound to Color/{token}",

    // MAPPING — closed set. The derived tints are Figma-only variables that
    // exist one per token, so the list is finite and checkable: M2 holds every
    // member to a variable recorded in the lock, M4 fails an orphan tint in the
    // lock that nothing here claims, and M5 fails a `bg-X/N` utility used in
    // src/ whose token is neither a member nor a declared carve-out.
    tints: {
      source: { kind: "utility", pattern: "bg-{name}/{alpha}" },
      target: {
        kind: "figma-variable",
        pattern: "Color/{name}-tint",
        collection: "Tokens",
      },
      members: ["destructive", "success", "neutral", "muted", "foreground"],

      // Tokens used with an alpha in code that deliberately have NO tint
      // variable. A reason is required — this is the three-state census
      // `notMirrored` uses elsewhere, not a silence.
      notMirrored: {
        input:
          "shadcn's dark-mode field fill (dark:bg-input/30, disabled:bg-input/50, dark:disabled:bg-input/80 across input/textarea/select/checkbox/radio). The manifests mirror the LIGHT form, where a field is bg-transparent with a border-input stroke and carries no fill at all — so there is no Figma paint for a tint variable to bind.",
      },
    },
  },

  // ---- Spacing utilities → Scales variables ---------------------------------
  // Tailwind unit n = n × 4 px (atomic unit --spacing: 0.25rem). The Scales
  // collection holds the 8-grid: space-4 · 8 · 16 · 24 · 32 · 40 · 48 · 64 ·
  // 80 · 96. Bind paddings / itemSpacing / sizes to `Spacing/space-{n*4}`:
  //
  //   px-4  → paddingLeft/Right  bound to Spacing/space-16
  //   py-2  → paddingTop/Bottom  bound to Spacing/space-8
  //   gap-2 → itemSpacing        bound to Spacing/space-8
  //   h-8   → height 32          bound to Spacing/space-32
  //
  // Values with no matching scale variable (e.g. py-0.5 = 2px on Badge) are set
  // raw — they are component-internal metrics, not layout spacing.
  // RULE, not a mapping, and deliberately so: the step list below is finite, but
  // the Figma side has no recorded names to resolve against — figma.lock.json
  // records color, radius, spatial and typography variables, never the Spacing/
  // collection. Writing it as a `{ source, target, members }` record would make
  // M2 fail all ten steps for want of a lock entry, i.e. a gate failing because
  // of what we have not recorded rather than what is wrong. Promote it the day a
  // token sync records the Spacing/ variables.
  spacing: {
    unitPx: 4,
    variable: "Spacing/space-{px}",
    scale: [4, 8, 16, 24, 32, 40, 48, 64, 80, 96],
  },

  // ---- Type ramp utilities → Figma text styles -------------------------------
  // The 9-step ramp exists in Figma as text styles (created by the token sync).
  // Apply the STYLE (not raw font properties) so type edits flow from the ramp.
  textStyles: {
    "text-display": "Type/Display",
    "text-h1": "Type/Heading 1",
    "text-h2": "Type/Heading 2",
    "text-h3": "Type/Heading 3",
    "text-h4": "Type/Heading 4",
    "text-body-lg": "Type/Body Large",
    "text-body": "Type/Body",
    "text-small": "Type/Small",
    "text-caption": "Type/Caption",
  },

  // ---- Typography — the font family IS a token --------------------------------
  // The family is recorded here because it CANNOT be derived from code at sync
  // time: code ships the fontsource VARIABLE font ("Inter Variable"), while
  // Figma uses the static Google-Font family ("Inter"). That asymmetry is the
  // reason this record exists — without it, the text styles silently drift
  // (code and Figma disagreed on the family until 2026-06-10 because nothing
  // declared the intent). check:figma enforces all of it: code ↔ this record
  // (the --font-sans family, the @fontsource import + dependency, every ramp
  // weight mappable) and this record ↔ figma.lock.json's recorded reality.
  //
  // In Figma the families live as STRING variables (FONT_FAMILY scope, Tokens
  // collection, same value in both modes), and there are TWO of them, because
  // the ramp has two faces: `Typography/font-sans` and `Typography/font-heading`.
  // Each ramp step binds exactly one of them — see fontTokenByStep. A rebrand is
  // a one- or two-variable change. Per-style weight (fontStyle) is set directly
  // from weightToFigmaStyle; it varies per ramp step, so it is not
  // variable-bound.
  //
  // This record said "bound to every Type/* style" until 2026-10-13, naming only
  // font-sans — but Figma had carried both variables since the 2026-08-23 token
  // sync, with Display + Heading 1-4 on font-heading. The contract was the stale
  // side, and it was the DESTRUCTIVE kind: a sync following it would have rebound
  // all nine styles to font-sans, and because T7 compared only the resolved
  // family ("Inter" either way) nothing would have failed. The damage would have
  // surfaced only once --font-heading pointed at a different face, as headings
  // silently rendering in the body font. Hence fontTokenByStep below, and the
  // per-style boundVariable the gate now checks (T8).
  //
  // GOTCHA: Inter's Figma style names contain a SPACE ("Semi Bold", not
  // "SemiBold" — Geist is the opposite). loadFontAsync fails loudly on the
  // wrong form; take the names from this map, never from memory.
  typography: {
    fontFamily: {
      token: "font-sans", // --font-sans in @theme; --font-heading aliases it
      code: "Inter Variable", // first family in --font-sans (variable font)
      package: "@fontsource-variable/inter", // the @import + package.json dep
      figma: "Inter", // Figma family name (static styles)
      figmaVariable: "Typography/font-sans", // STRING variable, FONT_FAMILY scope, Tokens
    },

    // The HEADING face — the ramp's second font token. `--font-heading` aliases
    // `--font-sans` in src/index.css today, so both resolve to Inter; the whole
    // point of the themeable-typography change is that a brand can repoint the
    // heading face alone. Modelled separately so that override is a supported
    // move rather than a silent divergence from Figma.
    fontHeading: {
      token: "font-heading", // --font-heading in :root
      aliasOf: "font-sans", // today; a brand may give it its own family
      figma: "Inter", // resolved Figma family while the alias holds
      figmaVariable: "Typography/font-heading", // STRING variable, FONT_FAMILY scope, Tokens
    },

    // Which font token each ramp step takes its family from — the binding
    // contract a token sync executes and the gate verifies (T8). Keyed by the
    // code utility, the same key as conventions.textStyles, so step → Figma
    // style → lock entry resolves without a second name list to keep in step.
    fontTokenByStep: {
      "text-display": "font-heading",
      "text-h1": "font-heading",
      "text-h2": "font-heading",
      "text-h3": "font-heading",
      "text-h4": "font-heading",
      "text-body-lg": "font-sans",
      "text-body": "font-sans",
      "text-small": "font-sans",
      "text-caption": "font-sans",
    },

    // code font-weight → Figma font style (the ramp uses exactly these three).
    weightToFigmaStyle: { 400: "Regular", 500: "Medium", 600: "Semi Bold" },
  },

  // ---- Radius ----------------------------------------------------------------
  // MAPPING — closed set. The ramp derives from `--radius` (0.625rem = 10px at a
  // 16px root): `--radius-lg` IS the base, the others are calc() multiples, and
  // all four exist in Figma as CORNER_RADIUS-scoped variables under Sizing/.
  // Radius is a dimension, not spacing — it is exempt from the 8-grid.
  //
  // This record claimed the opposite until 2026-10-15: that "only the BASE radius
  // exists as a variable (`Sizing/radius`)" and the rest synced as raw px. The
  // lock has recorded four Sizing/radius-{sm,md,lg,xl} variables since 2026-06-17
  // and records no `Sizing/radius` at all — a target resolving to nothing, which
  // is what prompted making these mappings resolvable in the first place. The px
  // map also carried rounded-2xl/3xl/4xl at 18/22/26, which no code defines and
  // nothing uses; deleted rather than deprecated (pre-1.0, see AGENTS.md).
  //
  // OPEN, for the next token sync to settle: the mvds-figma-token-sync skill
  // still lists a FIFTH radius variable, a base `Sizing/radius`. CI cannot see
  // Figma, so M2 can only say the lock does not record that name — not that the
  // variable is absent from the file. Whoever runs the next token sync should
  // either record it here as a member (with its own source token) or drop the
  // claim from the skill. Until then the four derived steps are what is mapped.
  //
  // `px` is the raw-value fallback a sync writes where a binding is not possible.
  // M6 recomputes each one from src/index.css, so a rebased --radius fails here
  // instead of shipping a Figma ramp at the old proportions.
  radius: {
    source: { kind: "css-var", pattern: "--radius-{name}" }, // utility: rounded-{name}
    target: {
      kind: "figma-variable",
      pattern: "Sizing/radius-{name}",
      collection: "Tokens",
      scopes: ["CORNER_RADIUS"],
    },
    members: ["sm", "md", "lg", "xl"],
    px: { sm: 6, md: 8, lg: 10, xl: 14 },
  },

  // ---- Spatial tokens — chrome dimensions & z-layers --------------------------
  // Chrome dimension tokens (--chrome-top-height etc.) are FLOAT variables in
  // the Scales collection, Sizing/ group, scoped WIDTH_HEIGHT — Chrome variant
  // heights/widths bind them, so a rebrand's structural proportions flow to
  // Figma. Z-layer tokens (--z-index-chrome … --z-index-toast) also live as
  // Sizing/z-* FLOAT variables but are DOCUMENTATION-ONLY: Figma cannot express
  // stacking (layer order does), so they carry empty scopes ([]) and bind to
  // nothing.
  //
  // The two sides are deliberately ASYMMETRIC, so don't "tidy" them into
  // matching: Tailwind v4 only generates a `z-<name>` utility from the
  // `--z-index-*` prefix, so code must carry it (#93 — the tokens were authored
  // without it and every z-utility silently resolved to `z-index: auto`). Figma
  // has no utility generator, so its variables stay the shorter `Sizing/z-*`
  // the designer reads. Source renamed, target unchanged.
  //
  // MAPPINGS — both closed sets, and the pair that made the case for records:
  // these were two sentences, the z-layer one naming a `z-{level}` source token
  // that had been renamed to `--z-index-{level}` months earlier (#124). M1 now
  // resolves every source against src/index.css and M3 fails any `--chrome-*` /
  // `--z-index-*` token in code that no member claims, so neither side can move
  // alone.
  spatial: {
    chrome: {
      source: { kind: "css-var", pattern: "--chrome-{name}" },
      target: {
        kind: "figma-variable",
        pattern: "Sizing/chrome-{name}",
        collection: "Scales",
        scopes: ["WIDTH_HEIGHT"],
      },
      members: ["top-height", "bottom-height", "left-width", "right-width"],
    },
    zLayers: {
      source: { kind: "css-var", pattern: "--z-index-{name}" },
      target: {
        kind: "figma-variable",
        pattern: "Sizing/z-{name}",
        collection: "Scales",
        scopes: [], // documentation-only: Figma expresses stacking by layer order
      },
      members: ["chrome", "overlay", "float", "modal", "toast"],
    },
  },

  // ---- Layer naming -----------------------------------------------------------
  // Child layers are named after the code subcomponent or role, capitalized:
  // Header, Title, Description, Action, Content, Footer, Label, Icon. Variant
  // components inside a set use Figma property syntax: "variant=default,
  // size=default, state=default".
  layerNames: {
    variantComponent: "{axis}={option}, …  (Figma property syntax)",
    children: ["Header", "Title", "Description", "Action", "Content", "Footer", "Label", "Icon"],
  },

  // ---- States -----------------------------------------------------------------
  // Figma mirrors Default + Disabled only (a synthetic `state` axis where the
  // code has a disabled affordance). Disabled = variant-frame opacity 0.5,
  // matching `disabled:opacity-50`. Hover/focus/active stay code-only — they
  // are interaction styling, looked up in Storybook when needed.
  states: {
    mirrored: ["default", "disabled"],
    disabled: { frameOpacity: 0.5 },
    codeOnly: ["hover", "focus-visible", "active", "aria-*"],
  },
}

export default conventions
