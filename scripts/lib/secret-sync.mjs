// Secret sync, as pure functions over their inputs.
//
// Ported from experiment-hub's scripts/sync-secrets.sh (secret-sync spec,
// archived 2026-08-21). The model is the hub's: the 1Password `BHD Labs` vault
// holds the only copy of a value anyone edits, and GitHub Actions holds a
// DERIVED copy that the sync overwrites. Values only ever flow outward.
//
// Only the sync half came over. The hub's other half — op:// pointers in
// .env.local, a dev-server preflight, a hook refusing to print env files —
// guards local runtime credentials, and MVDS has none: nothing under src/ reads
// a secret, and there is no .env file to protect.
//
// Everything that touches the world (op, gh, the filesystem) lives in
// scripts/sync-secrets.mjs. What is here decides; it never reads or writes.

import { createHash } from "node:crypto"

/**
 * Strings a vault field can hold that are not values. Pushing one would
 * replace a working credential with nonsense, so they count as unfilled.
 *
 *   PASTE_VALUE_HERE  what a scaffolded 1Password item holds; it will not
 *                     store an empty field, so a fresh item has to hold
 *                     something.
 *   [SENSITIVE]       what `vercel env pull` writes for a Sensitive variable.
 *                     The hub filled five vault fields with it on 2026-08-16
 *                     by migrating from Vercel's copy.
 */
export const NOT_A_VALUE = ["PASTE_VALUE_HERE", "[SENSITIVE]"]

/** GitHub provides this one itself; it is never stored, so never managed. */
export const AUTOMATIC_SECRETS = ["GITHUB_TOKEN"]

const NAME = /^[A-Z][A-Z0-9_]*$/
const TARGET = /^(gh|gh-env:.+)$/

/**
 * Structural errors in the manifest. A malformed record must stop the sync,
 * not be skipped: a skipped record looks exactly like a synced one in the
 * summary line.
 *
 * @param {{ name: string, ref: string, targets: string[] }[]} manifest
 * @returns {string[]}
 */
export function validateManifest(manifest) {
  const errors = []
  const seen = new Set()
  for (const [i, entry] of manifest.entries()) {
    const where = entry?.name ? entry.name : `entry ${i}`
    if (!NAME.test(entry?.name ?? "")) errors.push(`${where}: name must be UPPER_SNAKE_CASE`)
    if (seen.has(entry?.name)) errors.push(`${where}: listed twice`)
    seen.add(entry?.name)
    if (!String(entry?.ref ?? "").startsWith("op://")) errors.push(`${where}: ref must be an op:// reference`)
    if (!Array.isArray(entry?.targets) || entry.targets.length === 0) {
      errors.push(`${where}: needs at least one target`)
    } else {
      for (const t of entry.targets) {
        if (!TARGET.test(t)) errors.push(`${where}: unknown target "${t}" (use gh or gh-env:<environment>)`)
      }
    }
  }
  return errors
}

/**
 * What decides "changed". GitHub secrets are write-only, so a target cannot be
 * read back to compare. Instead the sync records this hash of what it last
 * wrote, and a target is unchanged when the vault still hashes the same.
 */
export function fingerprint(value) {
  return createHash("sha256").update(String(value)).digest("hex")
}

/**
 * The state is kept per secret AND per target: a record says what this sync
 * last wrote to that one place. The first version kept one hash per secret,
 * which cannot tell targets apart, and that showed up three ways (Copilot on
 * #139): a target added to a row was either skipped or overwritten without
 * the replace warning, and a write that failed part-way left the record
 * claiming every target held the old value.
 */
const key = (name, target) => `${name}\t${target}`

/**
 * `NAME<TAB>target<TAB>sha256` per line. Tabs, because an environment name can
 * hold spaces (the hub has "Production – experiment-hub"). Hashes only — the
 * file never holds a value.
 */
export function parseState(text) {
  const state = new Map()
  for (const line of String(text ?? "").split("\n")) {
    const [name, target, hash] = line.split("\t")
    if (name && target && hash) state.set(key(name, target), hash.trim())
  }
  return state
}

export function serializeState(state) {
  return [...state].sort(([a], [b]) => a.localeCompare(b)).map(([k, h]) => `${k}\t${h}`).join("\n") + "\n"
}

/** Names a workflow reads as `secrets.NAME`. */
export function secretsReadBy(workflowText) {
  return new Set([...String(workflowText).matchAll(/secrets\.([A-Z][A-Z0-9_]*)/g)].map((m) => m[1]))
}

/**
 * What one target needs, given what this sync last wrote there and whether the
 * secret is there now.
 *
 *   add      never written here by this sync
 *   update   written before, and the vault value has moved since
 *   restore  written before with this very value, but it is gone from GitHub —
 *            deleted by hand. A record alone would call it unchanged and leave
 *            the workflow without its credential.
 *   null     unchanged
 */
function targetNeeds(prev, hash, present) {
  if (!prev) return "add"
  if (prev !== hash) return "update"
  return present ? null : "restore"
}

/**
 * Decide what a sync would do, without doing it.
 *
 * @param {object} input
 * @param {{ name: string, ref: string, targets: string[] }[]} input.manifest
 * @param {Map<string, string | undefined>} input.values  vault value per name; undefined when unreadable
 * @param {Map<string, string>} input.state               last-written hash per name+target (parseState)
 * @param {Map<string, Set<string>>} input.deployed       secret names present per target ("gh", "gh-env:X")
 * @param {Map<string, string>} input.workflows           workflow path → its text
 */
export function planSync({ manifest, values, state, deployed, workflows }) {
  const readers = new Map() // secret name → workflow paths that read it
  for (const [file, text] of workflows) {
    for (const name of secretsReadBy(text)) {
      if (!readers.has(name)) readers.set(name, [])
      readers.get(name).push(file)
    }
  }

  const rows = manifest.map((entry) => {
    const value = values.get(entry.name)
    const readBy = readers.get(entry.name) ?? []
    const base = { name: entry.name, ref: entry.ref, targets: entry.targets, readBy }
    if (value === undefined || value === "" || NOT_A_VALUE.includes(value)) {
      return { ...base, action: "unfilled", writes: [] }
    }
    const hash = fingerprint(value)
    const writes = []
    for (const target of entry.targets) {
      const present = deployed.get(target)?.has(entry.name) ?? false
      const kind = targetNeeds(state.get(key(entry.name, target)), hash, present)
      // With no record of writing this target, a secret already sitting there
      // was set some other way — by hand, usually. It cannot be read back, so
      // writing over it destroys it for good. Say so before it happens. This
      // holds per target: a row that gains one is a first write THERE.
      if (kind) writes.push({ target, kind, replaces: kind === "add" && present })
    }
    const action =
      writes.length === 0 ? "unchanged"
      : writes.length === entry.targets.length && writes.every((w) => w.kind === "add") ? "added"
      : "updated"
    return { ...base, action, hash, writes }
  })

  // Reported, never deleted: a secret with no manifest row may still be read by
  // something outside the workflow files. The hub's stale OPENAI_API_KEY sat
  // five months in exactly this shape.
  const orphans = []
  for (const [target, names] of deployed) {
    for (const name of names) {
      const managed = manifest.some((e) => e.name === name && e.targets.includes(target))
      if (!managed) orphans.push({ target, name, readBy: readers.get(name) ?? [] })
    }
  }

  // A workflow reading a secret nothing manages is the hub's 2026-08-18 outage
  // from the other side: a value with no master copy goes missing unnoticed.
  const managedNames = new Set(manifest.map((e) => e.name))
  const unmanaged = [...readers]
    .filter(([name]) => !managedNames.has(name) && !AUTOMATIC_SECRETS.includes(name))
    .map(([name, readBy]) => ({ name, readBy }))

  return { rows, orphans, unmanaged }
}

/**
 * Write what the plan says to write. Each target is recorded the moment its
 * write succeeds, and only then, so the state always says what each target
 * actually holds. Stops at the first failure: a failed target keeps its old
 * record and is retried next run, while the targets already written are not
 * written twice.
 *
 * @param {ReturnType<typeof planSync>} plan
 * @param {Map<string, string>} values
 * @param {Map<string, string>} state  not mutated; the new state is returned
 * @param {(name: string, value: string, target: string) => void} setSecret
 */
export function applyPlan(plan, values, state, setSecret) {
  const next = new Map(state)
  const written = []
  for (const row of plan.rows) {
    for (const { target } of row.writes) {
      try {
        setSecret(row.name, values.get(row.name), target)
      } catch (error) {
        return { state: next, written, failed: { name: row.name, target, message: String(error?.message ?? error) } }
      }
      next.set(key(row.name, target), row.hash)
      written.push(`${row.name} → ${target}`)
    }
  }
  return { state: next, written, failed: null }
}

const MARK = { added: "+", updated: "~", unchanged: "=", unfilled: "?" }

/** The report a person reads. Names, refs and targets only — never a value. */
export function formatPlan(plan, { apply }) {
  const lines = [apply ? "== APPLYING ==" : "== PREVIEW (no writes; re-run with --apply) ==", ""]
  for (const row of plan.rows) {
    const detail =
      row.action === "unfilled" ? `not filled in the vault yet (${row.ref})`
      : row.action === "unchanged" ? "unchanged"
      : `${row.action} → ${row.writes.map((w) => w.target).join(", ")}`
    lines.push(`  ${MARK[row.action]} ${row.name} — ${detail}`)
    for (const w of row.writes) {
      if (w.replaces) {
        lines.push(`      ! already set in ${w.target} by something other than this sync — it cannot be read back, so this write replaces it for good`)
      }
      if (w.kind === "restore") lines.push(`      ! missing from ${w.target} although this sync wrote it — restoring`)
    }
    if (row.readBy.length === 0) lines.push("      ! no workflow reads secrets." + row.name + " yet")
  }
  if (plan.orphans.length || plan.unmanaged.length) lines.push("")
  for (const o of plan.orphans) {
    const use = o.readBy.length ? `read by ${o.readBy.join(", ")}` : "no workflow reads it"
    lines.push(`  ! ${o.name} — in ${o.target}, not in the manifest (orphan? ${use})`)
  }
  for (const u of plan.unmanaged) {
    lines.push(`  ! ${u.name} — read by ${u.readBy.join(", ")}, but the manifest does not manage it`)
  }
  const count = (a) => plan.rows.filter((r) => r.action === a).length
  lines.push(
    "",
    `  added ${count("added")} · updated ${count("updated")} · unchanged ${count("unchanged")} · not-in-vault ${count("unfilled")}`,
  )
  if (!apply) lines.push("  Preview only — nothing was written.")
  return lines.join("\n")
}
