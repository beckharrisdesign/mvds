# scoped-theming

## Human anchor

> "yes lets propose the fixes 1-3 to start. 4-6 I've had in the back of my mind for a whie and want to get to as well." — following the Etsy Listing Kit audit the founder asked for: "I did dogfood the etsy listing kit in the experiment hub with mvds from day 1. lets also look at how that went and what was missing."

## Outcomes

- **Who:** Consumer apps hosting more than one brand on one domain — concretely, the experiment hub, where a route-level product (Etsy Listing Kit) needs its own terracotta brand inside a green-branded host. Plus the agents building those routes on-system.
- **Job:** Give one route or sub-tree its own complete brand — every token role, light and dark — without repainting the host app and without leaving MVDS.
- **Done when:** Wrapping a sub-tree in a documented attribute scope (`data-brand="…"` per the existing THEMING.md sketch) re-brands every MVDS component inside it, in both modes, from a consumer app with zero component edits; at least one shippable preset (terracotta — the palette ELK hand-rolled) exists as an importable CSS file; the preset's token pairings pass the same AA bar as the defaults (`check:contrast` covers presets); THEMING.md documents the recipe end-to-end and a consumer-side example proves it (starter or a hub route).
- **Not doing:** The Phase-3 principle cascade (per-context *rule* variance — this change is the token half only); a multi-accent token model (more roles per brand — REVIEW_QUEUE #13 territory, separate change); runtime theme-switcher UI; Figma sync of presets (one-way, only when explicitly asked, as always).

## Why

The Etsy Listing Kit is the strongest adoption evidence MVDS has, and it points at exactly one seam. The kit's own design doc committed to MVDS by name, the hub's global wiring is textbook-correct — and the shipped revenue surface still uses zero MVDS, because its brand is scoped to a route and the cascade (MVDS's only theming API) is global. The kit's CSS opens with the confession: *"scoped MVDS-base + terracotta theme (NOT the hub green). Tokens are local to this route via .kit wrapper."* Its palette was then re-declared three times (route CSS, email consts, admin inline styles). The hub even self-nominated the fix: `docs/PACKAGE_CONTRIBUTION_CANDIDATES.md` files the terracotta set as "a real alternative theme … could ship as an MVDS theme preset."

The Motion & Muse dogfood proved the complementary half: when one brand owns the whole page, the cascade recipe works exactly as documented. The gap is only scope.

## What changes

- The token layer (`src/index.css`) gains a scoping contract: brand overrides can bind to an attribute scope (`[data-brand="x"]` / `[data-brand="x"].dark` or a `.dark` descendant form), not just `:root`/`.dark`, with the derived `primary-*`/`secondary-*` ramps re-deriving inside the scope. This is the substrate the Phase-3 `[data-brand]` cascade already planned — built now for tokens only.
- A first shippable preset: `terracotta` (warm light brand matching what ELK hand-rolled), published as an importable stylesheet from the package.
- `check:contrast` extends over preset token pairings, both modes.
- `docs/THEMING.md` grows from "multi-brand: scope each brand's overrides to an attribute" (today a two-line aside) into the documented, verified recipe.

## Capabilities

### New Capabilities

- `scoped-theming`: sub-tree token scope — a brand attribute re-brands every MVDS component beneath it, light + dark, ramps included.
- `theme-presets`: named, importable brand stylesheets shipped by the package, starting with `terracotta`; each preset held to token-level AA.

### Modified Capabilities

- (none)

## Impact

- `src/index.css` (token layer selector structure), `dist-lib` exports (preset CSS file), `scripts/check-contrast.mjs`, `docs/THEMING.md`, `examples/starter` or a documented hub route as the verified consumer proof.
- Roadmap: implements the token substrate of Phase 3 (`[data-brand]` cascade) without the principle-variance half.

## Optional links

- Consuming / theming docs: `docs/CONSUMING.md`, `docs/THEMING.md`
- Evidence: `motion-muse` repo `FINDINGS.md`; hub `app/etsy-listing-kit/elk.module.css:1-2`; hub `docs/PACKAGE_CONTRIBUTION_CANDIDATES.md:19`
- House rules: `AGENTS.md`
