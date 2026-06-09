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

export const conventions = {
  // ---- Color utilities → Figma color variables (Tokens collection) ----------
  // Variable names are flat, matching the code token without `--` (the same
  // convention as the token sync): bg-primary → fill bound to `primary`.
  //
  //   bg-X      → frame fill          bound to variable X
  //   text-X    → text-node fill      bound to variable X
  //   border-X  → frame stroke        bound to variable X
  //
  // Opacity-modified utilities (`bg-destructive/10`) bind a DERIVED tint
  // variable named `{token}-tint` whose rgba VALUE carries the alpha per mode
  // (e.g. destructive-tint = destructive @ a0.10 light / a0.20 dark, mirroring
  // `bg-destructive/10 dark:bg-destructive/20`). Alpha lives in the variable —
  // NOT as paint opacity, which Figma drops when instances re-resolve modes
  // (verified 2026-06-09 sync). Derived tints are Figma-only variables in the
  // Tokens collection; their IDs are recorded in figma.lock.json.
  color: {
    fill: "bg-{token} → fill bound to {token}",
    text: "text-{token} → text fill bound to {token}",
    stroke: "border-{token} → stroke bound to {token}",
    tint: "bg-{token}/N → fill bound to derived variable {token}-tint (alpha-in-value per mode)",
  },

  // ---- Spacing utilities → Scales variables ---------------------------------
  // Tailwind unit n = n × 4 px (atomic unit --spacing: 0.25rem). The Scales
  // collection holds the 8-grid: space-4 · 8 · 16 · 24 · 32 · 40 · 48 · 64 ·
  // 80 · 96. Bind paddings / itemSpacing / sizes to `space-{n*4}`:
  //
  //   px-4  → paddingLeft/Right  bound to space-16
  //   py-2  → paddingTop/Bottom  bound to space-8
  //   gap-2 → itemSpacing        bound to space-8
  //   h-8   → height 32          bound to space-32
  //
  // Values with no matching scale variable (e.g. py-0.5 = 2px on Badge) are set
  // raw — they are component-internal metrics, not layout spacing.
  spacing: {
    unitPx: 4,
    variable: "space-{px}",
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

  // ---- Radius ----------------------------------------------------------------
  // Only the BASE radius exists as a variable (`radius` in Tokens, 10px). The
  // other steps are calc() multiples in code, so they sync as raw px values.
  // Radius is a dimension, not spacing — it is exempt from the 8-grid.
  radius: {
    "rounded-sm": { px: 6 },
    "rounded-md": { px: 8 },
    "rounded-lg": { var: "radius" }, // 10px — the one bindable step
    "rounded-xl": { px: 14 },
    "rounded-2xl": { px: 18 },
    "rounded-3xl": { px: 22 },
    "rounded-4xl": { px: 26 },
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
