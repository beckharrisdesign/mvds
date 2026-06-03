import { addons } from "storybook/manager-api"
import { create } from "storybook/theming"

// Brands the Storybook UI as MVDS (the sidebar/title surface).
addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "MVDS — Minimum Viable Design System",
    brandUrl: "./",
  }),
})
