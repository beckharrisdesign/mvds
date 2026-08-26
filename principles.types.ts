// Types for the MVDS principle manifest. IDE/authoring only — the runner
// (scripts/check-principles.mjs) and the manifest (principles.config.mjs) are
// dependency-free .mjs and reference these via JSDoc `@type` imports. Keeping
// the types here gives typed authoring without adding a build/loader step.

export type Severity = "error" | "warn" | "off"

/** A forbidden Tailwind/utility token in a className (supports an allow-list). */
export interface ForbidClassNameCheck {
  kind: "forbid-classname"
  /** Matched against source lines. Use anchored patterns to avoid substring traps. */
  pattern: RegExp
  /** Exact full tokens that are sanctioned exceptions (e.g. "mx-auto"). */
  allow?: string[]
}

/** A forbidden raw value anywhere in source (hex, rgb()/hsl(), palette colors). */
export interface ForbidSourceCheck {
  kind: "forbid-source"
  pattern: RegExp
}

/** Every file in scope must have a companion file on disk. */
export interface RequireSiblingFileCheck {
  kind: "require-sibling-file"
  /** Maps a subject path (relative, POSIX) to the required companion path. */
  companion: (file: string) => string
}

/**
 * No automated check exists — the principle is upheld by human and agent
 * judgment at design/review time.
 *
 * This is deliberately a first-class member of the union rather than a separate
 * "guidelines" list. A design system's most important rules are often the least
 * mechanisable ones ("match the user's mental model"), and parking those outside
 * the manifest would quietly imply that only what a regex can catch is real.
 * They live in the same record, carry the same provenance, and are simply
 * skipped by the runner.
 */
export interface GuidingCheck {
  kind: "guiding"
}

export type CheckSpec =
  | ForbidClassNameCheck
  | ForbidSourceCheck
  | RequireSiblingFileCheck
  | GuidingCheck
// Seam for a future `kind: "ast"` strategy — add it here without touching the
// manifest schema or the runner's dispatch shape.

/**
 * Where a principle comes from, so the system can show its work.
 *
 * `founder` — authored for MVDS. Authority is the founder's judgment.
 * `external` — adopted from a published, citable body of work. `url` is REQUIRED
 *   for these: a citation nobody can check is not a citation, and the whole point
 *   of naming an outside source is that a reader can go and verify it.
 */
export type PrincipleSource =
  | { kind: "founder"; name: string; url?: string; ref?: string }
  | { kind: "external"; name: string; url: string; ref?: string }

export interface Principle {
  /** Stable slug, e.g. "no-hardcoded-color". */
  id: string
  /**
   * Peer-facing title — what the rule is about in plain language.
   * Shown ahead of `id` in Storybook / docs; `description` stays the
   * machine-oriented one-liner (failure messages, manifests).
   */
  title: string
  /** One-line, human/agent-facing — shown on failure. */
  description: string
  /** The "why", lifted from AGENTS.md golden rules. */
  rationale: string
  severity: Severity
  enabled: boolean
  scope: {
    /** Globs the principle applies to (** , * , {a,b} supported). */
    include: string[]
    /** Globs carved out — vendored ui/, stories, the primitives themselves. */
    exclude: string[]
  }
  check: CheckSpec
  /**
   * Surface-evaluation lens — how the discovery-stage eval (mvds-default
   * schema: 0.5 Eval / 1.5 Eval Delta) judges a RENDERED SURFACE against this
   * principle in its original published sense. Distinct from `rationale`,
   * which is the system-design reading of the same record (same record, two
   * consumers). Presence of this field is what makes a record part of the
   * eval rubric — a context layer or consumer adds rubric items by adding
   * records with a lens, never by editing the schema (openspec:
   * adding-eval-gate). Deliberately NOT rendered in any UI.
   */
  evalLens?: string
  /** Remediation hint shown in the failure report. */
  fix: string
  /** Optional AGENTS.md anchor or URL. */
  docs?: string
  /** Provenance — who says so, and where a reader can verify it. */
  source: PrincipleSource
}

export interface PrincipleManifest {
  /**
   * Manifest SCHEMA version — the *shape* of this object (check kinds, fields),
   * NOT the version of any principle's content. Bumps only on structural changes
   * to the manifest format; principle content rides the package SemVer instead.
   * See docs/VERSIONING.md (the coupling contract).
   */
  version: 1
  principles: Principle[]
}

/** A partial patch keyed by principle id — a context layer overrides only what it names. */
export interface PrincipleOverride {
  id: string
  enabled?: boolean
  severity?: Severity
  scope?: Partial<Principle["scope"]>
  check?: Partial<CheckSpec>
}

/** One layer of the cascade: a company, experiment, or product. */
export interface ContextLayer {
  name: string
  overrides: PrincipleOverride[]
}
