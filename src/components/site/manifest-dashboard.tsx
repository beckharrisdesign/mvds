import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card"
import { Grid, Inline, Stack } from "@/components/layout"
import type {
  ManifestCard as ManifestCardData,
  ManifestItem,
  ManifestSnapshot,
  ManifestStatus,
} from "./manifest-snapshot.types"

/**
 * ManifestDashboard — renders the generated manifest snapshot
 * (src/generated/manifest-snapshot.json) as object cards: one Card per
 * manifest with its name, path, kind, counts, and code-vs-Figma mapping
 * status. Status levels map 1:1 onto the Badge semantic triad.
 */

function StatusBadge({ status }: { status: ManifestStatus }) {
  return (
    <Badge variant={status.level} title={status.detail}>
      {status.label}
    </Badge>
  )
}

function ItemRow({ item }: { item: ManifestItem }) {
  return (
    <Inline gap={8} align="baseline" justify="between">
      <Stack gap={0}>
        <span className="text-small">{item.name}</span>
        <span className="text-caption text-muted-foreground">{item.meta}</span>
      </Stack>
      {item.status && <StatusBadge status={item.status} />}
    </Inline>
  )
}

function ManifestCard({ manifest }: { manifest: ManifestCardData }) {
  return (
    <Card size="sm" className="h-full">
      <CardHeader>
        <CardTitle className="text-body font-medium">{manifest.name}</CardTitle>
        <CardDescription className="text-caption">
          {manifest.path}
        </CardDescription>
        <CardAction>
          <StatusBadge status={manifest.status} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <Stack gap={8}>
          <p className="text-caption text-muted-foreground">
            {manifest.description}
          </p>
          <Inline gap={4}>
            <Badge variant="outline">{manifest.kind}</Badge>
            {manifest.counts.map((count) => (
              <Badge key={count.label} variant="muted">
                {count.value} {count.label}
              </Badge>
            ))}
          </Inline>
          {manifest.items && (
            <Stack gap={8}>
              {manifest.items.map((item) => (
                <ItemRow key={item.name} item={item} />
              ))}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}

function ManifestDashboard({ snapshot }: { snapshot: ManifestSnapshot }) {
  return (
    <Stack gap={16}>
      <Stack gap={4}>
        <h2 className="text-h3">Manifests</h2>
        <Inline gap={8} align="center">
          <p className="text-caption text-muted-foreground">
            Generated {snapshot.generatedAt.slice(0, 10)} · commit{" "}
            {snapshot.commit} · Figma synced {snapshot.lock.syncedAt} from{" "}
            {snapshot.lock.syncedFromCommit}
          </p>
          {snapshot.dirty && (
            <Badge variant="neutral">uncommitted changes</Badge>
          )}
        </Inline>
      </Stack>
      <Grid cols={{ base: 1, md: 2, lg: 3 }} gap={16}>
        {snapshot.manifests.map((manifest) => (
          <ManifestCard key={manifest.id} manifest={manifest} />
        ))}
      </Grid>
    </Stack>
  )
}

export { ManifestDashboard }
