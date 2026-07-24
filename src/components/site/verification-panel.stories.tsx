import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { VerificationPanel } from "./verification-panel"
import type { Gate, ManifestSnapshot } from "./manifest-snapshot.types"
import liveSnapshot from "@/generated/manifest-snapshot.json"

/**
 * VerificationPanel renders the gate results recorded in the generated snapshot.
 * `build` gates were executed by the generator for that commit; `ci` gates are
 * required on every pull request. The default story pins a fixture so both kinds
 * — and a failing gate — render deterministically; `Live` shows what the landing
 * page actually ships today.
 */
const FIXTURE: Gate[] = [
  {
    id: "contrast",
    name: "Token contrast",
    detail: "Every foreground/background pairing at WCAG AA 4.5:1, light + dark.",
    command: "npm run check:contrast",
    verifiedAt: "build",
    result: "28 token pairings meet WCAG AA 4.5:1 in light + dark.",
    status: { level: "success", label: "passing" },
  },
  {
    id: "principles",
    name: "Design principles",
    detail: "The golden rules, machine-enforced from the principle manifest.",
    command: "npm run check:principles",
    verifiedAt: "build",
    result: "64 files clear 7 enabled MVDS principles (light + dark).",
    status: { level: "success", label: "passing" },
  },
  {
    id: "consumer",
    name: "Consumer install path",
    detail: "The published package installed with no auth, built, CSS asserted.",
    command: "npm run verify:consumer",
    verifiedAt: "ci",
    result: "Required on every pull request.",
    status: { level: "success", label: "enforced in CI" },
  },
]

const meta = {
  title: "Site/VerificationPanel",
  component: VerificationPanel,
  tags: ["autodocs", "!dev"],
  args: {
    gates: FIXTURE,
    commit: "abc1234",
  },
} satisfies Meta<typeof VerificationPanel>

export default meta
type Story = StoryObj<typeof meta>

/** AllPassing — the healthy state, mixing build-verified and CI-enforced gates. */
export const AllPassing: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("3/3 green")).toBeInTheDocument()
    // The build/CI distinction must stay visible — it is the honesty of the panel.
    await expect(canvas.getAllByText(/ran for this commit/)).toHaveLength(2)
    await expect(canvas.getAllByText(/required to merge/)).toHaveLength(1)
  },
}

/** WithFailure — a red gate must read as red, and the tally must drop. */
export const WithFailure: Story = {
  args: {
    gates: [
      FIXTURE[0],
      {
        ...FIXTURE[1],
        result: "2 files violate 1 enabled MVDS principle.",
        status: { level: "destructive", label: "failing" },
      },
      FIXTURE[2],
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("2/3 green")).toBeInTheDocument()
    await expect(canvas.getByText("failing")).toBeInTheDocument()
  },
}

/** Live — the gates exactly as the deployed landing page renders them. */
export const Live: Story = {
  args: {
    gates: (liveSnapshot as unknown as ManifestSnapshot).gates,
    commit: (liveSnapshot as unknown as ManifestSnapshot).commit,
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: "Verified, not asserted" })
    ).toBeInTheDocument()
  },
}
