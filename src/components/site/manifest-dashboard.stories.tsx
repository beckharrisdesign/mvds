import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { ManifestDashboard } from "./manifest-dashboard"
import type { ManifestSnapshot } from "./manifest-snapshot.types"
import fixture from "./manifest-dashboard.fixture.json"
import liveSnapshot from "@/generated/manifest-snapshot.json"

/**
 * ManifestDashboard renders the generated manifest snapshot
 * (`src/generated/manifest-snapshot.json`, written by
 * `npm run generate:snapshot`) as object cards — one per manifest, with its
 * path, kind, counts, and code-vs-Figma mapping status on the Badge triad:
 * `success` = in-sync, `neutral` = informational / mirror trails (expected,
 * code-first), `destructive` = genuine drift. The default story uses a
 * deterministic fixture so all three levels render; `LiveSnapshot` shows the
 * committed snapshot the landing page actually ships.
 */
const meta = {
  title: "Site/ManifestDashboard",
  component: ManifestDashboard,
  tags: ["autodocs"],
  args: {
    snapshot: fixture as unknown as ManifestSnapshot,
  },
} satisfies Meta<typeof ManifestDashboard>

export default meta
type Story = StoryObj<typeof meta>

/**
 * AllStatuses — the fixture pins one card per status level: token parity
 * (`success`), the trailing lock (`neutral`), and a component drift
 * (`destructive`), plus per-item statuses inside the components card.
 */
export const AllStatuses: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("drift 74/80")).toBeInTheDocument()
    await expect(canvas.getByText("light/dark parity")).toBeInTheDocument()
    await expect(canvas.getByText("10 commits behind")).toBeInTheDocument()
  },
}

/** LiveSnapshot — the committed snapshot, exactly as the landing page renders it. */
export const LiveSnapshot: Story = {
  args: {
    snapshot: liveSnapshot as unknown as ManifestSnapshot,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Manifests")).toBeInTheDocument()
    await expect(canvas.getByText("principles.config.mjs")).toBeInTheDocument()
  },
}
