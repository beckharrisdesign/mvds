import { useState } from "react"
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Chrome,
  Container,
  Field,
  Grid,
  Inline,
  Section,
  Stack,
  Textarea,
} from "@beckharrisdesign/mvds"

/**
 * The starter composition. Everything here is MVDS primitives obeying the
 * golden rules, so it is a safe thing to copy and keep extending:
 *
 *   · spacing only ever comes from a parent's `gap` (8-grid px values)
 *   · layout only ever comes from Stack / Inline / Grid / Section / Container
 *   · type only ever comes from the semantic ramp (text-h1 … text-caption)
 *   · color only ever comes from tokens (bg-background, text-muted-foreground)
 *
 * Delete the sections you do not need and build your experiment in their place.
 */

const IDEAS = [
  {
    title: "Tokens, not values",
    body: "Every color, size, and type step resolves through the token layer, so re-branding is a cascade override — not a find-and-replace.",
    tag: "foundation",
  },
  {
    title: "One number, one place",
    body: "Siblings are spaced by their parent's gap. No component owns an outer margin, so spacing is always readable at the point it is declared.",
    tag: "layout",
  },
  {
    title: "Light and dark, always",
    body: "Both modes are part of the contract. Every pairing clears WCAG AA in both, checked at the token level and again on every story.",
    tag: "a11y",
  },
]

function App() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  )
  const [note, setNote] = useState("")

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
  }

  return (
    <Stack gap={0} className="min-h-svh bg-background text-foreground">
      <Chrome position="top" bg="background" className="border-b border-border">
        <Container size="lg" className="h-full">
          <Inline gap={8} justify="between" align="center" className="h-full">
            <span className="text-h4">Your experiment</span>
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              {dark ? "Light" : "Dark"} mode
            </Button>
          </Inline>
        </Container>
      </Chrome>

      <main>
        <Section py={64} innerSize="lg">
          <Stack gap={24} align="start">
            <Badge variant="success">MVDS wired up</Badge>
            <Stack gap={16}>
              <h1 className="text-display">Start here.</h1>
              <p className="text-body-lg text-muted-foreground max-w-prose">
                This page is rendering from the published package — tokens,
                type ramp, layout primitives and components all arrived from one
                install and three lines of CSS. Replace it with your own thing.
              </p>
            </Stack>
            <Inline gap={8}>
              <Button>Primary action</Button>
              <Button variant="outline">Secondary</Button>
            </Inline>
          </Stack>
        </Section>

        <Section bg="card" py={64} innerSize="lg">
          <Stack gap={32}>
            <Stack gap={8}>
              <h2 className="text-h2">What you inherited</h2>
              <p className="text-body text-muted-foreground max-w-prose">
                Three rules do most of the work. They hold whether a person or
                an agent writes the next screen.
              </p>
            </Stack>
            <Grid cols={{ base: 1, md: 3 }} gap={16}>
              {IDEAS.map((idea) => (
                <Card key={idea.title} className="h-full">
                  <CardHeader>
                    <CardTitle className="text-h4">{idea.title}</CardTitle>
                    <CardDescription>{idea.tag}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-small text-muted-foreground">
                      {idea.body}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </Grid>
          </Stack>
        </Section>

        <Section py={64} innerSize="lg">
          <Stack gap={32}>
            <Stack gap={8}>
              <h2 className="text-h2">Forms come wired</h2>
              <p className="text-body text-muted-foreground max-w-prose">
                Field handles the label, the id, and the aria-describedby link
                for you — so the accessible version is the default version.
              </p>
            </Stack>
            <Stack gap={16} align="start" className="w-full max-w-prose">
              <Field
                label="What are you building?"
                help="Nothing is submitted — this is a live control, not a mock."
                className="w-full"
              >
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="An experiment that…"
                  rows={3}
                />
              </Field>
              <Button disabled={note.trim().length === 0}>Save note</Button>
            </Stack>
          </Stack>
        </Section>

        {/* A second brand on one page — the scoped-theming recipe, verbatim
          * from docs/THEMING.md: import the preset stylesheet (styles.css),
          * wrap a sub-tree in data-brand. Everything inside wears terracotta —
          * semantic roles AND the authored gradation steps — in both modes;
          * everything outside keeps the default brand. */}
        <Section py={64} innerSize="lg" data-brand="terracotta" bg="muted">
          <Stack gap={24} align="start">
            <Badge>terracotta</Badge>
            <Stack gap={8}>
              <h2 className="text-h2">A second brand, two steps</h2>
              <p className="text-body text-foreground max-w-prose">
                This section is wrapped in{" "}
                <code>data-brand=&quot;terracotta&quot;</code>. The badge, the
                buttons, and the gradation tints below come from the preset;
                the rest of the page keeps the default brand.
              </p>
            </Stack>
            <Inline gap={8}>
              <Button>Terracotta primary</Button>
              <Button variant="secondary">Ochre secondary</Button>
            </Inline>
            <Inline gap={8}>
              <span className="bg-primary-1 text-foreground rounded-md px-2 py-1 text-caption">primary-1</span>
              <span className="bg-primary-2 text-foreground rounded-md px-2 py-1 text-caption">primary-2</span>
              <span className="text-primary-4 text-caption font-medium">text-primary-4</span>
              <span className="text-primary-5 text-caption font-medium">text-primary-5</span>
            </Inline>
          </Stack>
        </Section>
      </main>
    </Stack>
  )
}

export default App
