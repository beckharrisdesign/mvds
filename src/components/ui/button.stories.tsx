import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { Button } from "./button"
import { Inline } from "@/components/layout"

/**
 * Button is the canonical variant-driven atom. Its `variant` and `size` props
 * (CVA variants) are exactly what the Figma generate-library flow turns into
 * component properties — making this the cleanest proof of the code → Figma link.
 */
const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "outline",
        "ghost",
        "destructive",
        "link",
      ],
    },
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
    },
    disabled: { control: "boolean" },
  },
  args: {
    children: "Button",
    variant: "default",
    size: "default",
    disabled: false,
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

/** Playground — drive every prop from the Controls panel. */
export const Playground: Story = {}

/** Every variant side by side (the set Figma maps to a `variant` property). */
export const Variants: Story = {
  render: () => (
    <Inline gap={8}>
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </Inline>
  ),
}

/** Every size (maps to a `size` property in Figma) — heights 24 / 32 / 40px. */
export const Sizes: Story = {
  render: () => (
    <Inline gap={8}>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </Inline>
  ),
}

/** Disabled state across variants. */
export const Disabled: Story = {
  render: () => (
    <Inline gap={8}>
      <Button disabled>Default</Button>
      <Button variant="secondary" disabled>
        Secondary
      </Button>
      <Button variant="outline" disabled>
        Outline
      </Button>
      <Button variant="destructive" disabled>
        Destructive
      </Button>
    </Inline>
  ),
}

/**
 * CssCheck — proves the token layer (`src/index.css`) actually loaded in
 * Storybook. `toBeVisible` would pass on an unstyled button; this asserts a
 * concrete token value instead. If `preview.tsx` failed to import the tokens,
 * `--primary` would be empty and the default Button would have no fill — both
 * assertions would fail. (Default = light mode via the preview theme decorator.)
 */
export const CssCheck: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: /button/i })
    const root = document.documentElement
    const isDark = root.classList.contains("dark")
    // The token layer loaded AND the active mode applied: --primary resolves to
    // its light- or dark-mode value depending on the `.dark` class.
    const primary = getComputedStyle(root).getPropertyValue("--primary").trim()
    await expect(primary).toBe(isDark ? "oklch(0.922 0 0)" : "oklch(0.205 0 0)")
    // ...and the default Button actually consumes it (non-transparent fill).
    await expect(getComputedStyle(button).backgroundColor).not.toBe(
      "rgba(0, 0, 0, 0)"
    )
  },
}
