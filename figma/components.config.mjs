// Index of the component → Figma manifests. One import for the drift guard
// (scripts/check-figma-manifest.mjs) and the mvds-figma-component-sync skill —
// same single-entry pattern as principles.config.mjs.
//
// Adding a component to the Figma mirror = author its manifest in
// figma/components/ and list it here. The drift guard then holds its axis
// options exactly equal to the code (cva / prop-union), so the mirror can't
// silently fall behind the source of truth.

import button from "./components/button.figma.mjs"
import badge from "./components/badge.figma.mjs"
import card from "./components/card.figma.mjs"

export const componentManifests = [button, badge, card]

export default componentManifests
