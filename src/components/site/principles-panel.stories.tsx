import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { PrinciplesPanel } from "./principles-panel"
import type {
  ManifestSnapshot,
  PrincipleRecord,
} from "./manifest-snapshot.types"
import liveSnapshot from "@/generated/manifest-snapshot.json"

/**
 * PrinciplesPanel groups by enforcement (the manifest's own IA) and keeps
 * provenance as a per-card source line. The fixture pins the three cases that
 * exist in the manifest — founder+enforced, external+judgment, and the
 * axis-crossing founder+judgment (`no-runts`) that made the two independent —
 * so the grouping renders deterministically; `Live` is the real manifest the
 * landing page ships.
 */
const FIXTURE: PrincipleRecord[] = [
  {
    id: "no-hardcoded-color",
    title: "Don’t drift from the color tokens",
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
    title: "One concept, one expression",
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
  {
    id: "no-runts",
    title: "No runt stands alone",
    description:
      "Break lines so no single word or short phrase is stranded on its own — no runts, and no widowed or orphaned lines at a break.",
    rationale: "A runt snaps the reading rhythm and reads as unconsidered.",
    fix: "Rebreak the line, or use balanced wrapping so no word stands alone.",
    severity: "error",
    enforcement: "judgment",
    checkKind: "guiding",
    docs: "AGENTS.md (Type via the semantic ramp)",
    source: {
      kind: "founder",
      name: "MVDS house rules",
      url: "https://github.com/beckharrisdesign/mvds/blob/main/AGENTS.md",
      ref: null,
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
 * AxesIndependent — enforcement is the grouping, provenance is the per-card
 * source line, and neither implies the other. The founder+judgment record
 * must land in the judgment section (the case the old provenance-first layout
 * could not place honestly).
 */
export const AxesIndependent: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("1 enforced")).toBeInTheDocument()
    await expect(canvas.getByText("2 by judgment")).toBeInTheDocument()

    await expect(
      canvas.getByRole("heading", { name: "Enforced — fails the build" })
    ).toBeInTheDocument()
    await expect(
      canvas.getByRole("heading", { name: "Held by judgment" })
    ).toBeInTheDocument()

    // The axis-crossing card renders alongside the adopted heuristic in the
    // judgment section, carrying its founder source line.
    await expect(
      canvas.getByText("No runt stands alone")
    ).toBeInTheDocument()

    // An external principle without a working citation is not a citation —
    // the link must be present and point at the published source. The lean
    // card shows the short label (NN/g H4); the full ref rides the title attr.
    const cite = canvas.getByRole("link", { name: /NN\/g H4/ })
    await expect(cite).toHaveAttribute(
      "href",
      "https://www.nngroup.com/articles/ten-usability-heuristics/"
    )
    await expect(cite).toHaveAttribute(
      "title",
      "Heuristic 4: Consistency and standards"
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
