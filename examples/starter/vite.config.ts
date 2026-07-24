import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// Tailwind v4 is wired as a Vite plugin — there is no tailwind.config.js.
// All theme configuration arrives through the MVDS token layer, imported in
// src/styles.css.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
