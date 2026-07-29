import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Grid, Inline, Stack } from "@/components/layout"
import { figmaUrl } from "./repo-links"
import type { ManifestSnapshot } from "./manifest-snapshot.types"
import componentsPng from "../../../figma/exports/mvds-components.png"
import foundationsPng from "../../../figma/exports/mvds-foundations.png"

/**
 * FigmaMirror — the code→Figma parity, shown rather than claimed.
 *
 * The Figma file is a generated one-way mirror of the code. Checked-in PNG
 * previews (figma/exports/) render the parity inline with no click required;
 * the live-file link is a public view-only share that opens Foundations &
 * Starters (the top page), not the internal Sync Reports page.
 *
 * Images are keyed by page id so the JSX never assumes an order the snapshot
 * didn't promise.
 */
const IMAGES: Record<string, string> = {
  components: componentsPng,
  foundations: foundationsPng,
}

function FigmaMirror({
  figmaExports,
  lock,
}: {
  figmaExports: NonNullable<ManifestSnapshot["figmaExports"]>
  lock: ManifestSnapshot["lock"]
}) {
  const REPO_EXPORTS =
    "https://github.com/beckharrisdesign/mvds/tree/main/figma/exports"

  return (
    <Stack gap={32}>
      <Stack gap={8}>
        <Inline gap={8} align="center" justify="between" wrap>
          <h2 className="text-h2">The Figma mirror</h2>
          <Badge variant="neutral">generated · one-way</Badge>
        </Inline>
        <p className="text-body text-muted-foreground max-w-prose">
          Code is the source of truth; the Figma file is generated from it, never
          the reverse. These are previews checked into the repo — versioned like
          the lock, captured {figmaExports.capturedAt} and last synced from code
          on {lock.syncedAt}. They render here so the parity is visible without a
          Figma account; the live file is also public view-only.
        </p>
      </Stack>

      <Grid cols={{ base: 1, lg: 2 }} gap={16}>
        {figmaExports.pages.map((page) => (
          <Stack key={page.id} gap={8}>
            <span className="text-small font-medium">{page.name}</span>
            <div className="border-border overflow-hidden rounded-lg border bg-muted">
              <img
                src={IMAGES[page.id]}
                alt={`MVDS Figma mirror — the ${page.name} page`}
                loading="lazy"
                className="h-auto w-full"
              />
            </div>
          </Stack>
        ))}
      </Grid>

      <Inline gap={8} wrap>
        <Button variant="outline" size="sm" asChild>
          <a href={REPO_EXPORTS} target="_blank" rel="noopener noreferrer">
            The checked-in exports →
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a
            href={figmaUrl(figmaExports.fileKey)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open MVDS Core in Figma ↗
          </a>
        </Button>
      </Inline>
    </Stack>
  )
}

export { FigmaMirror }
