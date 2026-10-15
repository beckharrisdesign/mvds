// Decide whether a push needs a Vercel build — pure, so it can be fed crafted
// inputs (see vercel-ignore.test.mjs). scripts/vercel-ignore.mjs is the thin
// wrapper that reads git + the environment and exits 0 (skip) / 1 (build).
//
// The OpenSpec loop commits once per artifact, so most pushes to a PR branch
// touch only markdown under openspec/changes/. The site (`npm run build:site`)
// never reads those, so building a preview for them is pure waste.
//
// BUILD_INPUTS is the list of everything the site build reads, as data. Each
// record names the reader so the list can be checked against the build:
//   scripts/build-site.mjs → generate-manifest-snapshot.mjs → vite build →
//   storybook build, plus the three live gates the snapshot executes
//   (check-contrast, check-principles, check-figma-manifest).
// A path ending in "/" is a directory prefix; anything else is one exact file.
// The test fails if an entry resolves to nothing on disk, so a rename cannot
// leave a dead entry silently under-matching.

export const BUILD_INPUTS = [
  { path: "src/", reader: "vite build + storybook stories + snapshot (index.css, components/*, themes/*)" },
  { path: "public/", reader: "vite build (static assets, favicon)" },
  { path: "index.html", reader: "vite build (entry)" },
  { path: ".storybook/", reader: "storybook build (main, preview, manager)" },
  { path: "figma/", reader: "snapshot (figma.lock.json, conventions, components.config, exports) + check:figma + the exported PNGs imported by src/components/site/figma-mirror.tsx" },
  { path: "scripts/", reader: "build-site.mjs, the snapshot generator and its lib/, and the gate scripts it runs" },
  { path: "examples/", reader: "check:principles (scans src and examples)" },
  { path: "rules/", reader: "snapshot (rule inventory: readdir rules/*.mdc)" },
  { path: "skills/", reader: "snapshot (voice-skill inventory: readdir skills/*.md)" },
  { path: ".claude/skills/", reader: "snapshot (opsx-* and mvds-* skill inventory)" },
  { path: "openspec/schemas/", reader: "snapshot (workflow-schema inventory). Not openspec/changes/ or openspec/specs/" },
  { path: "principles.config.mjs", reader: "snapshot + check:principles" },
  { path: "principles.resolve.mjs", reader: "snapshot + check:principles" },
  { path: "package.json", reader: "dependency install, the build scripts, and src/components/site (imports name/version)" },
  { path: "package-lock.json", reader: "dependency install" },
  { path: "vite.config.ts", reader: "vite build" },
  { path: "tsconfig.json", reader: "vite/esbuild config resolution" },
  { path: "tsconfig.app.json", reader: "vite/esbuild config resolution" },
  { path: "tsconfig.node.json", reader: "vite/esbuild config resolution" },
  { path: "vercel.json", reader: "the build command, output directory and this ignore step itself" },
]

export const isBuildInput = (file) =>
  BUILD_INPUTS.some(({ path }) =>
    path.endsWith("/") ? file.startsWith(path) : file === path
  )

/**
 * @param {{ base: string | null | undefined, changedFiles: string[] | null }} input
 *   base         the commit last deployed (VERCEL_GIT_PREVIOUS_SHA); falsy when
 *                this branch has never deployed.
 *   changedFiles repo-relative paths changed between base and HEAD, or null when
 *                git could not produce the list (ref missing from a shallow clone).
 * @returns {{ action: "build" | "skip", reason: string, triggers: string[] }}
 *
 * Every doubt resolves to "build": a skipped deploy cannot be told from a
 * healthy one by looking at the PR, so it must only happen when we KNOW the
 * diff touched nothing the site reads.
 */
export function decideDeploy({ base, changedFiles }) {
  if (!base) {
    return {
      action: "build",
      reason: "no previous deployed commit (first deploy of this branch), so there is nothing to compare against",
      triggers: [],
    }
  }
  if (changedFiles === null || changedFiles === undefined) {
    return {
      action: "build",
      reason: `could not diff ${base}..HEAD (ref unavailable in this clone)`,
      triggers: [],
    }
  }
  const triggers = changedFiles.filter(isBuildInput)
  if (triggers.length > 0) {
    return {
      action: "build",
      reason: `${triggers.length} changed file(s) are inputs to the site build`,
      triggers,
    }
  }
  return {
    action: "skip",
    reason: `${changedFiles.length} changed file(s), none of them read by the site build`,
    triggers: [],
  }
}
