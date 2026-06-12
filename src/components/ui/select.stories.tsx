import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select"
import { Label } from "./label"
import { Stack } from "@/components/layout"
import { Inline } from "@/components/layout"

/**
 * Select — one choice from a list too long for radios (~5+ options). The
 * trigger sits on the control grid (32px default, 24px `sm`); the dropdown
 * panel is the first consumer of the Phase-0 elevation ramp (`shadow-md` —
 * the popover/dropdown step) and the motion duration tokens. Label it via
 * `htmlFor` pointing at the trigger's `id`.
 */
const meta = {
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

const Fruits = () => (
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Orchard</SelectLabel>
      <SelectItem value="apple">Apple</SelectItem>
      <SelectItem value="pear">Pear</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>Tropical</SelectLabel>
      <SelectItem value="mango">Mango</SelectItem>
      <SelectItem value="papaya" disabled>
        Papaya (out of season)
      </SelectItem>
    </SelectGroup>
  </SelectContent>
)

/** Full anatomy: groups, labels, separator, disabled item. */
export const Playground: Story = {
  render: () => (
    <Select defaultValue="apple">
      <SelectTrigger aria-label="Fruit">
        <SelectValue placeholder="Pick a fruit" />
      </SelectTrigger>
      <Fruits />
    </Select>
  ),
}

/** Trigger sizes and states: default (32px), sm (24px), disabled, invalid. */
export const States: Story = {
  render: () => (
    <Stack gap={16}>
      <Inline gap={16} align="center">
        <Select>
          <SelectTrigger aria-label="Default size">
            <SelectValue placeholder="Default (32px)" />
          </SelectTrigger>
          <Fruits />
        </Select>
        <Select>
          <SelectTrigger size="sm" aria-label="Small size">
            <SelectValue placeholder="Small (24px)" />
          </SelectTrigger>
          <Fruits />
        </Select>
      </Inline>
      <Inline gap={16} align="center">
        <Select disabled>
          <SelectTrigger aria-label="Disabled">
            <SelectValue placeholder="Disabled" />
          </SelectTrigger>
          <Fruits />
        </Select>
        <Select>
          <SelectTrigger aria-invalid aria-label="Invalid">
            <SelectValue placeholder="Invalid" />
          </SelectTrigger>
          <Fruits />
        </Select>
      </Inline>
    </Stack>
  ),
}

/** Labelled — htmlFor pairs a Label with the trigger via its id. */
export const Labelled: Story = {
  render: () => (
    <Stack gap={8}>
      <Label htmlFor="select-fruit">Favorite fruit</Label>
      <Select>
        <SelectTrigger id="select-fruit">
          <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
        <Fruits />
      </Select>
    </Stack>
  ),
}

/** Opens on click, selects an option, and reflects it in the trigger. */
export const Interaction: Story = {
  render: () => (
    <Select>
      <SelectTrigger aria-label="Fruit picker">
        <SelectValue placeholder="Pick a fruit" />
      </SelectTrigger>
      <Fruits />
    </Select>
  ),
  play: async ({ canvas, canvasElement }) => {
    const trigger = canvas.getByRole("combobox", { name: "Fruit picker" })
    await userEvent.click(trigger)
    // The dropdown renders in a portal outside the story canvas.
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(await body.findByRole("option", { name: "Mango" }))
    await expect(trigger).toHaveTextContent("Mango")
  },
}
