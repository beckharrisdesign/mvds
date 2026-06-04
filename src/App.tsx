import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Stack, Inline } from "@/components/layout"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

function App() {
  const [dark, setDark] = useState(false)

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
  }

  return (
    <main>
      <Stack
        gap={32}
        align="center"
        justify="center"
        className="bg-background text-foreground min-h-svh p-8"
      >
        <Stack gap={8} align="center" className="text-center">
          <h1 className="text-h2">MVDS</h1>
          <p className="text-muted-foreground text-small">
            Minimum Viable Design System — agent-first foundations for startup
            prototyping
          </p>
          <Button variant="outline" size="sm" onClick={toggleTheme}>
            Toggle {dark ? "light" : "dark"} mode
          </Button>
        </Stack>

        {/* Card containing a Button — proves composition reaches Figma */}
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Foundation</CardTitle>
            <CardDescription>
              Button + Card, themed by the same token layer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-small">
              Toggle the mode above — every token flips. Actions live in the
              footer; the full variant set is in Storybook.
            </p>
          </CardContent>
          <CardFooter>
            <Inline gap={8} justify="end" className="w-full">
              <Button variant="outline">Outline</Button>
              <Button>Primary</Button>
            </Inline>
          </CardFooter>
        </Card>
      </Stack>
    </main>
  )
}

export default App
