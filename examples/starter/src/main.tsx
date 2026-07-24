import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./styles.css"
import App from "./App"

// Dark mode is a `.dark` class on a root ancestor — never prefers-color-scheme.
// Following the OS before first paint is the usual default; delete this to pin
// the app to light mode on purpose.
document.documentElement.classList.toggle(
  "dark",
  window.matchMedia("(prefers-color-scheme: dark)").matches
)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
