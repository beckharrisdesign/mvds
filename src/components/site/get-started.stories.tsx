import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { Stack } from "@/components/layout"
import { PackageDocs } from "./package-docs"
import type { ManifestSnapshot } from "./manifest-snapshot.types"
import liveSnapshot from "@/generated/manifest-snapshot.json"

/**
 * Intro → Get started — install path for technical Storybook readers.
 * Reuses PackageDocs (same two steps as the landing / Site specimen).
 */

function GetStartedPage({ commit }: { commit: string }) {
  return (
    <Stack gap={24}>
      <Stack gap={8} className="max-w-prose">
        <h1 className="text-h1">Get started</h1>
        <p className="text-body text-muted-foreground">
          Public npm — no .npmrc, no token. Without{" "}
          <code className="font-mono text-small">@source</code> on{" "}
          <code className="font-mono text-small">dist-lib</code>, components
          render unstyled.
        </p>
      </Stack>
      <PackageDocs commit={commit} />
    </Stack>
  )
}

const meta = {
  title: "Intro/Get started",
  component: GetStartedPage,
  tags: ["autodocs"],
  args: {
    commit: (liveSnapshot as ManifestSnapshot).commit || "main",
  },
} satisfies Meta<typeof GetStartedPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: "Get started" })
    ).toBeInTheDocument()
    await expect(canvas.getByText("1 · Install")).toBeInTheDocument()
    await expect(canvas.getByText("2 · Wire the CSS")).toBeInTheDocument()
    await expect(canvas.queryByText(/npm\.pkg\.github\.com/)).toBeNull()
  },
}
