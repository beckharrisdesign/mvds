import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fireEvent, fn, userEvent, waitFor } from "storybook/test"
import { Dropzone } from "./dropzone"
import { Inline } from "@/components/layout"

/**
 * Dropzone — drag / drop / paste / picker file selection, ending at "files
 * selected". The zone is a real button (Tab + Enter/Space work), a polite
 * live region announces every change, and the selected list renders name +
 * size with a per-file remove. Transport, progress, and previews are app
 * concerns — not this component's.
 */
const meta = {
  title: "UI/Dropzone",
  component: Dropzone,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    hint: { control: "text" },
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
    accept: { control: "text" },
  },
  args: {
    hint: "Enter / Space opens the picker",
    multiple: true,
    onFilesSelected: fn(),
  },
} satisfies Meta<typeof Dropzone>

export default meta
type Story = StoryObj<typeof meta>

/** Playground — drive label, hint, multiple, and disabled from Controls. */
export const Playground: Story = {
  render: (args) => <Dropzone {...args} className="w-96" />,
}

/** Idle and disabled side by side. */
export const States: Story = {
  render: (args) => (
    <Inline gap={32} align="start">
      <Dropzone {...args} className="w-96" />
      <Dropzone {...args} disabled className="w-96" />
    </Inline>
  ),
}

/** Dragging — the zone flips to its active treatment while a drag hovers it. */
export const Dragging: Story = {
  render: (args) => <Dropzone {...args} className="w-96" />,
  play: async ({ canvas }) => {
    const zone = canvas.getByRole("button", {
      name: /Drop files here, paste, or browse/,
    })
    fireEvent.dragOver(zone)
    await waitFor(() => expect(zone).toHaveAttribute("data-dragging", "true"))
    await expect(zone).toHaveTextContent("Release to add files")
  },
}

/** Selected — files listed with name + size, each removable. */
export const Selected: Story = {
  render: (args) => <Dropzone {...args} className="w-96" />,
  play: async ({ canvas, canvasElement, args }) => {
    const input = canvasElement.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    await userEvent.upload(input, [
      new File(["a".repeat(1200)], "hero-shot.jpg", { type: "image/jpeg" }),
      new File(["b".repeat(840)], "listing-02.png", { type: "image/png" }),
    ])
    await expect(canvas.getByText("hero-shot.jpg")).toBeInTheDocument()
    await expect(canvas.getByText("listing-02.png")).toBeInTheDocument()
    await expect(args.onFilesSelected).toHaveBeenLastCalledWith(
      expect.arrayContaining([expect.any(File), expect.any(File)])
    )
    await userEvent.click(
      canvas.getByRole("button", { name: "Remove hero-shot.jpg" })
    )
    await expect(canvas.queryByText("hero-shot.jpg")).not.toBeInTheDocument()
    await expect(canvas.getByText("listing-02.png")).toBeInTheDocument()
  },
}

/**
 * KeyboardAndA11y — Tab reaches the zone, the picker path fills the hidden
 * input, and the polite live region announces the selection.
 */
export const KeyboardAndA11y: Story = {
  render: (args) => <Dropzone {...args} className="w-96" />,
  play: async ({ canvas, canvasElement, args }) => {
    await userEvent.tab()
    const zone = canvas.getByRole("button", {
      name: /Drop files here, paste, or browse/,
    })
    await expect(zone).toHaveFocus()
    const input = canvasElement.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    await userEvent.upload(input, [
      new File(["hello"], "notes.txt", { type: "text/plain" }),
    ])
    const status = canvasElement.querySelector('[role="status"]')
    await waitFor(() =>
      expect(status).toHaveTextContent("1 file selected: notes.txt")
    )
    await expect(args.onFilesSelected).toHaveBeenCalled()
  },
}
