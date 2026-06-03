import { useState } from "react"
import { Button } from "@/components/ui/button"
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
    <main className="bg-background text-foreground flex min-h-svh flex-col items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          figma-blank-space
        </h1>
        <p className="text-muted-foreground text-sm">
          MVP design system · code is the source of truth · synced to Figma
        </p>
        <Button variant="outline" size="sm" onClick={toggleTheme}>
          Toggle {dark ? "light" : "dark"} mode
        </Button>
      </div>

      {/* Card containing a Button — proves composition reaches Figma */}
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Foundation</CardTitle>
          <CardDescription>
            Button + Card, themed by the same token layer.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </CardContent>
        <CardFooter>
          <Button variant="link" className="px-0">
            Edit tokens in src/index.css
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}

export default App
