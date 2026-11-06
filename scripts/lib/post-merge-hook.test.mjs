// Proof for .githooks/post-merge — the worktree half of its cleanup.
//
// The hook said nothing uncommitted could be lost, and two steps failed open
// when a worktree's folder had moved:
//   - `git worktree prune` dropped the registration of every moved worktree, so
//     the folders (with their uncommitted work) stopped being git checkouts.
//   - the dirty check read a failed `git status` as "clean", so a merged
//     worktree nobody could inspect went straight to `git worktree remove`.
//
// Each case below is that bug, run against a real throwaway repo, because what
// is under test is how the hook and git behave together. Assertions read what
// the hook said and what git still has registered, never the exit code: the
// hook exits 0 either way.

import { spawnSync } from "node:child_process"
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

const HOOK = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../.githooks/post-merge",
)

// Isolate from the machine's git config and from any GIT_* a parent git set.
const cleanEnv = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_")),
)
const env = {
  ...cleanEnv,
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_AUTHOR_NAME: "Test",
  GIT_AUTHOR_EMAIL: "test@example.test",
  GIT_COMMITTER_NAME: "Test",
  GIT_COMMITTER_EMAIL: "test@example.test",
}

let root
let repo

function git(cwd, ...args) {
  const result = spawnSync("git", args, { cwd, env, encoding: "utf8" })
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr}`)
  }
  return result.stdout
}

function runHook() {
  const result = spawnSync("sh", [HOOK], { cwd: repo, env, encoding: "utf8" })
  if (result.error) throw result.error
  return result.stderr
}

function commit(cwd, file, message) {
  writeFileSync(join(cwd, file), `${message}\n`)
  git(cwd, "add", ".")
  git(cwd, "commit", "-m", message)
}

/** A worktree on its own branch, with one commit. Returns its folder. */
function addWorktree(name) {
  const folder = join(root, name)
  git(repo, "worktree", "add", "-b", name, folder)
  commit(folder, `${name}.txt`, `work on ${name}`)
  return folder
}

function mergeIntoMain(branch) {
  git(repo, "merge", "--no-ff", "-m", `merge ${branch}`, branch)
}

function registeredBranches() {
  return git(repo, "worktree", "list", "--porcelain")
    .split("\n")
    .filter((line) => line.startsWith("branch refs/heads/"))
    .map((line) => line.replace("branch refs/heads/", ""))
}

beforeEach(() => {
  root = realpathSync(mkdtempSync(join(tmpdir(), "mvds-post-merge-")))
  repo = join(root, "repo")
  spawnSync("mkdir", [repo])
  git(repo, "init", "-b", "main")
  commit(repo, "README.md", "first")
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

describe("post-merge hook: worktrees whose folder moved", () => {
  it("keeps the registration of a moved worktree and says so", () => {
    const folder = addWorktree("moved-open")
    const movedTo = join(root, "elsewhere")
    renameSync(folder, movedTo)
    writeFileSync(join(movedTo, "draft.md"), "uncommitted draft\n")

    const said = runHook()

    expect(registeredBranches()).toContain("moved-open")
    expect(said).toContain(folder)
    expect(said).toContain("git worktree repair")
    expect(readFileSync(join(movedTo, "draft.md"), "utf8")).toBe(
      "uncommitted draft\n",
    )
  })

  it("keeps the registration when the moved worktree's branch is merged", () => {
    const folder = addWorktree("moved-merged")
    mergeIntoMain("moved-merged")
    renameSync(folder, join(root, "elsewhere"))

    const said = runHook()

    expect(registeredBranches()).toContain("moved-merged")
    expect(said).toContain(folder)
    expect(said).not.toContain("removed merged worktree")
  })

  it("lets a moved worktree work again after the repair it recommends", () => {
    const folder = addWorktree("moved-repairable")
    const movedTo = join(root, "elsewhere")
    renameSync(folder, movedTo)

    runHook()
    git(repo, "worktree", "repair", movedTo)

    expect(git(movedTo, "rev-parse", "--abbrev-ref", "HEAD").trim()).toBe(
      "moved-repairable",
    )
  })
})

describe("post-merge hook: the dirty check", () => {
  it("treats a worktree it cannot read as not clean", () => {
    const folder = addWorktree("unreadable")
    mergeIntoMain("unreadable")
    writeFileSync(join(folder, ".git"), "not a gitdir pointer\n")

    const said = runHook()

    expect(existsSync(folder)).toBe(true)
    expect(registeredBranches()).toContain("unreadable")
    expect(said).toContain(`worktree ${folder} (unreadable) is merged`)
    expect(said).not.toContain("removed merged worktree")
  })

  it("warns about a merged worktree with uncommitted changes and keeps it", () => {
    const folder = addWorktree("dirty")
    mergeIntoMain("dirty")
    writeFileSync(join(folder, "draft.md"), "uncommitted draft\n")

    const said = runHook()

    expect(existsSync(join(folder, "draft.md"))).toBe(true)
    expect(registeredBranches()).toContain("dirty")
    expect(said).toContain(`worktree ${folder} (dirty) is merged`)
  })
})

describe("post-merge hook: the cleanup it exists to do", () => {
  it("still removes a clean worktree on a merged branch, and the branch", () => {
    const folder = addWorktree("shipped")
    mergeIntoMain("shipped")

    runHook()

    expect(existsSync(folder)).toBe(false)
    expect(registeredBranches()).not.toContain("shipped")
    expect(git(repo, "branch", "--list", "shipped").trim()).toBe("")
  })

  it("leaves a clean worktree on an unmerged branch alone", () => {
    const folder = addWorktree("in-progress")

    runHook()

    expect(existsSync(folder)).toBe(true)
    expect(registeredBranches()).toContain("in-progress")
  })
})
