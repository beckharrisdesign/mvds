// The registry of every secret MVDS's GitHub Actions uses, and where its master
// copy lives. Read by scripts/sync-secrets.mjs; rotation steps per vendor are in
// docs/SECRETS_RUNBOOK.md.
//
// A record per secret, never a sentence (AGENTS.md): the sync validates every
// row and refuses a malformed one rather than skipping it.
//
//   name     the Actions secret, as workflows read it (`secrets.NAME`)
//   ref      its op:// reference in the 1Password vault — the only copy edited
//   targets  where it is written: `gh` (repo secret) or `gh-env:<environment>`
//
// Not here, on purpose:
//   GITHUB_TOKEN  GitHub mints it per run; it is never stored.
//   NPM_TOKEN     still set in the repo (2026-07-15), but publish.yml has used
//                 OIDC trusted publishing since and strips the token. The sync
//                 reports it as an orphan until someone deletes it.

/** The repository the sync writes to — explicit, so a run from a fork or a
 *  stray directory cannot write somewhere else. */
export const REPO = "beckharrisdesign/mvds"

/** Shared with experiment-hub. Items are per-project (`Vercel mvds`, not the
 *  hub's `Vercel`): the two sites are separate Vercel projects, and separate
 *  tokens can be rotated without breaking the other.
 *
 *  Items are 1Password's API Credential type, so the secret itself sits in the
 *  template's `credential` field — the hub's convention too
 *  (`op://BHD Labs/OpenAI/credential`). Anything else is a custom field. */
export const VAULT = "BHD Labs"

export const SECRETS = [
  {
    // Visual regression (.github/workflows/chromatic.yml).
    name: "CHROMATIC_PROJECT_TOKEN",
    ref: "op://BHD Labs/Chromatic mvds/credential",
    targets: ["gh"],
  },
  // The Vercel deploy (.github/workflows/deploy-site.yml, PR #133). Org and
  // project ids are not secret — #133's comments print them — but GitHub only
  // passes them to a workflow as secrets, and the vault is the master copy of
  // deploy config, not only of credentials (hub runbook, "Why some non-secrets
  // live in the vault").
  {
    name: "VERCEL_TOKEN",
    ref: "op://BHD Labs/Vercel mvds/credential",
    targets: ["gh"],
  },
  {
    name: "VERCEL_ORG_ID",
    ref: "op://BHD Labs/Vercel mvds/org id",
    targets: ["gh"],
  },
  {
    name: "VERCEL_PROJECT_ID",
    ref: "op://BHD Labs/Vercel mvds/project id",
    targets: ["gh"],
  },
]
