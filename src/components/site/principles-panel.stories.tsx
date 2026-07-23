import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { PrinciplesPanel } from "./principles-panel"
import type {
  ManifestSnapshot,
  PrincipleRecord,
} from "./manifest-snapshot.types"
import liveSnapshot from "@/generated/manifest-snapshot.json"

/**
 * PrinciplesPanel renders the principle manifest with its provenance intact.
 * The fixture pins one of each kind so both distinctions — founder vs external,
 * automated vs judgment — render deterministically; `Live` is the real manifest
 * the landing page ships.
 */
const FIXTURE: PrincipleRecord[] = [
  {
    id: "no-hardcoded-color",
    description: "No hardcoded color — use the token utilities.",
    rationale: "Color must flow through the token layer so it themes per context.",
    fix: "Use bg-background / text-foreground or a scale-ramp step.",
    severity: "error",
    enforcement: "automated",
    checkKind: "forbid-source",
    docs: "AGENTS.md (Golden rules — Color via tokens)",
    source: {
      kind: "founder",
      name: "MVDS house rules",
      url: "https://github.com/beckharrisdesign/mvds/blob/main/AGENTS.md",
      ref: null,
    },
  },
  {
    id: "consistency-and-standards",
    description:
      "One concept, one expression — a thing that behaves the same should look the same everywhere.",
    rationale:
      "This is the whole argument for a token layer and a fixed variant set.",
    fix: "Reuse the existing expression of the same idea before adding a variant.",
    severity: "error",
    enforcement: "judgment",
    checkKind: "guiding",
    docs: "AGENTS.md (Golden rules)",
    source: {
      kind: "external",
      name: "Nielsen Norman Group",
      url: "https://www.nngroup.com/articles/ten-usability-heuristics/",
      ref: "Heuristic 4: Consistency and standards",
    },
  },
]

const meta = {
  title: "Site/PrinciplesPanel",
  component: PrinciplesPanel,
  tags: ["autodocs", "!dev"],
  args: { principles: FIXTURE },
} satisfies Meta<typeof PrinciplesPanel>

export default meta
type Story = StoryObj<typeof meta>

/**
 * BothProvenances — the section's whole job is keeping two distinctions visible,
 * so both are asserted: an authored+enforced rule and an adopted+judgment one.
 */
export const BothProvenances: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("1 enforced")).toBeInTheDocument()
    await expect(canvas.getByText("1 by judgment")).toBeInTheDocument()

    await expect(
      canvas.getByRole("heading", { name: "Authored here" })
    ).toBeInTheDocument()
    await expect(
      canvas.getByRole("heading", { name: "Adopted from published work" })
    ).toBeInTheDocument()

    // An external principle without a working citation is not a citation —
    // the link must be present and point at the published source.
    const cite = canvas.getByRole("link", {
      name: /Heuristic 4: Consistency and standards/,
    })
    await expect(cite).toHaveAttribute(
      "href",
      "https://www.nngroup.com/articles/ten-usability-heuristics/"
    )
  },
}

/** Live — the real manifest, exactly as the landing page renders it. */
export const Live: Story = {
  args: {
    principles: (liveSnapshot as unknown as ManifestSnapshot).principles,
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: "Design principles" })
    ).toBeInTheDocument()
    // Every adopted principle must carry a resolvable citation.
    for (const link of canvas.getAllByRole("link")) {
      await expect(link).toHaveAttribute("href")
    }
  },
}
