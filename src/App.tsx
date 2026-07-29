import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Container,
  Stack,
  Inline,
  Chrome,
  Section,
  Spacer,
} from "@/components/layout"
import { SiteHero } from "@/components/site/site-hero"
import { VerificationPanel } from "@/components/site/verification-panel"
import { PrinciplesPanel } from "@/components/site/principles-panel"
import { FigmaMirror } from "@/components/site/figma-mirror"
import { REPO_URL } from "@/components/site/repo-links"
import { PackageDocs } from "@/components/site/package-docs"
import { ManifestDashboard } from "@/components/site/manifest-dashboard"
import type { ManifestSnapshot } from "@/components/site/manifest-snapshot.types"
import snapshotData from "@/generated/manifest-snapshot.json"

const snapshot = snapshotData as unknown as ManifestSnapshot

const STORYBOOK_HREF = import.meta.env.DEV
  ? "http://localhost:6006"
  : "/storybook/"

function App() {
  const [dark, setDark] = useState(false)

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
  }

  return (
    <Stack gap={0} className="bg-background text-foreground min-h-svh">
      {/* role="banner": Chrome renders a <div>, so restore the header landmark
          that the old <header> element carried implicitly. */}
      <Chrome
        position="top"
        bg="background"
        role="banner"
        className="border-border border-b"
      >
        <Container size="xl" className="h-full">
          <Inline gap={8} justify="between" align="center" className="h-full">
            {/* A wordmark, not the page heading — the hero owns the single h1. */}
            <span className="text-h4 font-semibold">MVDS</span>
            <Inline gap={8}>
              <Button variant="outline" size="sm" onClick={toggleTheme}>
                {dark ? "Light" : "Dark"} mode
              </Button>
              {/* Jump to the in-page mirror (checked-in previews). Only shown
                  when previews are actually committed. */}
              {snapshot.figmaExports && (
                <Button variant="outline" size="sm" asChild>
                  <a href="#figma-mirror">Figma</a>
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                  GitHub ↗
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={STORYBOOK_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Storybook →
                </a>
              </Button>
            </Inline>
          </Inline>
        </Container>
      </Chrome>

      <main>
        <Section py={64}>
          <SiteHero
            storybookHref={STORYBOOK_HREF}
            commit={snapshot.commit}
          />
        </Section>

        <Section bg="card" py={64}>
          <PrinciplesPanel principles={snapshot.principles} />
        </Section>

        <Section py={64}>
          <VerificationPanel gates={snapshot.gates} commit={snapshot.commit} />
        </Section>

        <Section bg="card" py={64}>
          <PackageDocs commit={snapshot.commit} />
        </Section>

        {snapshot.figmaExports && (
          <Section py={64} id="figma-mirror">
            <FigmaMirror
              figmaExports={snapshot.figmaExports}
              lock={snapshot.lock}
            />
          </Section>
        )}

        <Section bg="card" py={64}>
          <ManifestDashboard snapshot={snapshot} />
        </Section>
      </main>

      {/* Flexible push so the footer sits at the viewport bottom on short pages.
          Spacer is the sanctioned primitive for this — a top-margin auto would
          be spacing via margin, which the principles gate forbids. */}
      <Spacer />

      {/* A page footer, not persistent chrome — Chrome position="bottom" is
          sticky and would claim viewport space over the content. */}
      <Section py={24} role="contentinfo" className="border-border border-t">
        <Inline gap={16} justify="between" align="center" wrap>
          <span className="text-caption text-muted-foreground">
            Built with MVDS · code is the single source of truth
          </span>
          <span className="text-caption text-muted-foreground font-mono">
            {snapshot.commit}
          </span>
        </Inline>
      </Section>
    </Stack>
  )
}

export default App
