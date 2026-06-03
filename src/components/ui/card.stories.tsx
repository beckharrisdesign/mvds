import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button } from "./button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "./card"

/**
 * Card is the composite molecule. The "WithButton" story deliberately nests a
 * Button inside a Card — this is the composition test: it proves component
 * composition (atom inside molecule) survives the round trip into Figma.
 */
const meta = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

/** Full anatomy: header, title, description, content, footer. */
export const Default: Story = {
  render: () => (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>A short supporting description.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Card content sits here. Everything is themed by the same token layer
          as the rest of the system.
        </p>
      </CardContent>
      <CardFooter>
        <p className="text-muted-foreground text-xs">Footer</p>
      </CardFooter>
    </Card>
  ),
}

/** Composition test — actions live in the footer (the action bar), not the content. */
export const WithButton: Story = {
  render: () => (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Foundation</CardTitle>
        <CardDescription>Button + Card, one token layer.</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm">
            Action
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-small">
          Card body content. Actions belong in the footer below — not here.
        </p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline">Outline</Button>
        <Button>Primary</Button>
      </CardFooter>
    </Card>
  ),
}
