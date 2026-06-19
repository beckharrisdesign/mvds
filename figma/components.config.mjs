// Index of the component → Figma manifests. One import for the drift guard
// (scripts/check-figma-manifest.mjs) and the mvds-figma-component-sync skill —
// same single-entry pattern as principles.config.mjs.
//
// Adding a component to the Figma mirror = author its manifest in
// figma/components/ and list it here. The drift guard then holds its axis
// options exactly equal to the code (cva / prop-union), so the mirror can't
// silently fall behind the source of truth.

// UI components
import button from "./components/button.figma.mjs"
import badge from "./components/badge.figma.mjs"
import card from "./components/card.figma.mjs"
import checkbox from "./components/checkbox.figma.mjs"
import label from "./components/label.figma.mjs"
import radioGroup from "./components/radio-group.figma.mjs"
import select from "./components/select.figma.mjs"
import switchComp from "./components/switch.figma.mjs"
import textarea from "./components/textarea.figma.mjs"
import field from "./components/field.figma.mjs"

// Block components
import hero from "./components/hero.figma.mjs"
import mediaFrame from "./components/media-frame.figma.mjs"
import blockquote from "./components/blockquote.figma.mjs"
import callout from "./components/callout.figma.mjs"

export const componentManifests = [
  // UI
  button, badge, card, checkbox, label, radioGroup, select, switchComp, textarea, field,
  // Blocks
  hero, mediaFrame, blockquote, callout,
]

export default componentManifests
