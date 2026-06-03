/**
 * DORMANT on Figma Pro — Code Connect cannot publish without an Organization or
 * Enterprise plan. This file is authored ahead of time so that the moment the
 * "Beck Harris Design" team upgrades, you can run:
 *
 *     npx figma connect publish
 *
 * ...and Figma Dev Mode will show this real Button code on the mapped component.
 *
 * To activate later:
 *   1. Upgrade the Figma team to Organization/Enterprise.
 *   2. `npm i -D @figma/code-connect`
 *   3. Replace the placeholder URL below with the Button component's Figma URL
 *      (right-click the component in Figma → Copy link to selection).
 *   4. `npx figma connect publish`
 *
 * Until then this is documentation only — the strong link runs through the
 * Figma MCP `/figma-generate-library` flow instead (see docs/SYNC.md).
 */
import figma from "@figma/code-connect"
import { Button } from "../src/components/ui/button"

figma.connect(
  Button,
  // TODO: replace with the real Figma component URL after an Org/Enterprise upgrade.
  "https://www.figma.com/design/REPLACE_FILE_KEY/REPLACE?node-id=REPLACE",
  {
    props: {
      label: figma.string("Label"),
      variant: figma.enum("Variant", {
        Default: "default",
        Secondary: "secondary",
        Outline: "outline",
        Ghost: "ghost",
        Destructive: "destructive",
        Link: "link",
      }),
      size: figma.enum("Size", {
        Default: "default",
        XS: "xs",
        Small: "sm",
        Large: "lg",
      }),
      disabled: figma.boolean("Disabled"),
    },
    example: ({ label, variant, size, disabled }) => (
      <Button variant={variant} size={size} disabled={disabled}>
        {label}
      </Button>
    ),
  }
)
