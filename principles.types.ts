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

export type CheckSpec =
  | ForbidClassNameCheck
  | ForbidSourceCheck
  | RequireSiblingFileCheck
// Seam for a future `kind: "ast"` strategy — add it here without touching the
// manifest schema or the runner's dispatch shape.

export interface Principle {
  /** Stable slug, e.g. "no-hardcoded-color". */
  id: string
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
  /** Remediation hint shown in the failure report. */
  fix: string
  /** Optional AGENTS.md anchor or URL. */
  docs?: string
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
