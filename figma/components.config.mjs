// Index of the component → Figma manifests. One import for the drift guard
// (scripts/check-figma-manifest.mjs) and the mvds-figma-component-sync skill —
// same single-entry pattern as principles.config.mjs.
//
// Adding a component to the Figma mirror = author its manifest in
// figma/components/ and list it here. The drift guard then holds its axis
// options exactly equal to the code (cva / prop-union), so the mirror can't
// silently fall behind the source of truth.
//
// Enrollment is NOT optional. `mirrorScope` below is the census: the guard walks
// it and requires every component file to be either manifested or carried by a
// `notMirrored` record. Three states, no fourth — a component that is neither
// fails `npm run check:figma` rather than passing unnoticed, which is how Input
// and Dropzone shipped to code AND to Figma while the gate still reported 17.

// UI components
import button from "./components/button.figma.mjs"
import badge from "./components/badge.figma.mjs"
import card from "./components/card.figma.mjs"
import checkbox from "./components/checkbox.figma.mjs"
import input from "./components/input.figma.mjs"
import label from "./components/label.figma.mjs"
import radioGroup from "./components/radio-group.figma.mjs"
import select from "./components/select.figma.mjs"
import switchComp from "./components/switch.figma.mjs"
import table from "./components/table.figma.mjs"
import textarea from "./components/textarea.figma.mjs"

// Form components
import dropzone from "./components/dropzone.figma.mjs"
import field from "./components/field.figma.mjs"

// Block components
import hero from "./components/hero.figma.mjs"
import mediaFrame from "./components/media-frame.figma.mjs"
import blockquote from "./components/blockquote.figma.mjs"
import callout from "./components/callout.figma.mjs"

// Spatial layout primitives (Chrome/Section/Layer are visual surfaces, so they
// get component corollaries; Stack/Inline/Grid/Container/Spacer stay native
// auto-layout — see the mvds-figma-component-sync skill's out-of-scope list)
import chrome from "./components/chrome.figma.mjs"
import section from "./components/section.figma.mjs"
import layer from "./components/layer.figma.mjs"

export const componentManifests = [
  // UI
  button, badge, card, checkbox, input, label, radioGroup, select, switchComp, table, textarea,
  // Forms
  dropzone, field,
  // Blocks
  hero, mediaFrame, blockquote, callout,
  // Spatial layout primitives
  chrome, section, layer,
]

// --- the census ---------------------------------------------------------------
// Which files the guard considers candidates for mirroring. Same include/exclude
// shape as principles.config.mjs — rules as data, per AGENTS.md, not paths
// hardcoded in the checker.
//
// `src/components/site/` is deliberately absent: the landing page is not DS
// surface, so its components are out of scope rather than excluded-with-reason.
export const mirrorScope = {
  include: ["src/components/{ui,forms,blocks,layout}/*.tsx"],
  exclude: ["src/**/*.stories.tsx"],
}

// --- deliberately not mirrored --------------------------------------------------
// A component in scope with no manifest must appear here, with a reason a reader
// can evaluate. `props` is a fingerprint of the component's public prop signature
// at the time the judgment was made; the guard recomputes it every run and fails
// on a mismatch. It makes NO claim about whether a component *ought* to be
// mirrored — that is design judgment and three attempts to derive it from source
// all failed (Layer is mirrored and paints no surface; Container has a closed
// `size` enum and stays native). It only asks: has the thing you judged changed
// shape since you judged it?
//
// The reason these six are native: Chrome/Section/Layer are visual surfaces, so
// they earn component corollaries. Pure-arrangement primitives would mirror as
// empty frames — there is nothing for a designer to grab.
export const notMirrored = [
  {
    file: "src/components/layout/container.tsx",
    reason: "pure arrangement — width + responsive padding only, no surface to grab in Figma",
    props: "className|size",
  },
  {
    file: "src/components/layout/grid.tsx",
    reason: "pure arrangement — the column field is native auto-layout in Figma",
    props: "className|cols|gap",
  },
  {
    file: "src/components/layout/grid-item.tsx",
    reason: "pure arrangement — a span within a native grid, nothing to render standalone",
    props: "className|span|start",
  },
  {
    file: "src/components/layout/inline.tsx",
    reason: "pure arrangement — horizontal auto-layout with a gap, native in Figma",
    props: "align|className|gap|justify|wrap",
  },
  {
    file: "src/components/layout/spacer.tsx",
    reason: "pure arrangement — fixed or flexible space, expressed as auto-layout gap in Figma",
    props: "axis|className|size",
  },
  {
    file: "src/components/layout/stack.tsx",
    reason: "pure arrangement — vertical auto-layout with a gap, native in Figma",
    props: "align|className|gap|justify",
  },
]

export default componentManifests
