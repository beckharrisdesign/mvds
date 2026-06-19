import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Container, Stack, Inline } from "@/components/layout"
import { ManifestDashboard } from "@/components/site/manifest-dashboard"
import type { ManifestSnapshot } from "@/components/site/manifest-snapshot.types"
import snapshotData from "@/generated/manifest-snapshot.json"

const snapshot = snapshotData as unknown as ManifestSnapshot

function App() {
  const [dark, setDark] = useState(false)

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
  }

  return (
    <Stack gap={0} className="bg-background text-foreground min-h-svh">
      <header className="border-b border-border">
        <Container size="xl" className="py-4">
          <Inline gap={8} justify="between" align="center">
            <h1 className="text-h4">MVDS</h1>
            <Inline gap={8}>
              <Button variant="outline" size="sm" onClick={toggleTheme}>
                {dark ? "Light" : "Dark"} mode
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={import.meta.env.DEV ? "http://localhost:6006" : "/storybook/"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Storybook →
                </a>
              </Button>
            </Inline>
          </Inline>
        </Container>
      </header>
      <main>
        <Container size="xl" className="py-8">
          <ManifestDashboard snapshot={snapshot} />
        </Container>
      </main>
    </Stack>
  )
}

export default App
