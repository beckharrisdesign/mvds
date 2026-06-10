// Build the Vercel deployment as a small hub: a landing page at `/` linking to
// the sample app at `/app/` and the Storybook gallery at `/storybook/`.
//
// Output layout (outputDirectory in vercel.json = dist-site):
//   dist-site/
//     index.html        landing hub
//     app/              the Vite sample app (built with base /app/)
//     storybook/        the static Storybook build
//
// Run via `npm run build:site`. Vercel runs this as its build command.

import { execSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";

const OUT = "dist-site";

function run(cmd) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// Manifest snapshot — regenerate before the app build so the dashboard reflects
// this deploy (npx vite build bypasses the npm `prebuild` hook).
run("node scripts/generate-manifest-snapshot.mjs");

// Sample app — served under /app/, so build with that base.
run(`npx vite build --base=/app/ --outDir ${OUT}/app --emptyOutDir`);

// Storybook gallery — static build into /storybook/.
run(`npx storybook build --output-dir ${OUT}/storybook`);

// Landing hub at /.
const landing = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="/app/favicon.svg" />
    <title>MVDS — Minimum Viable Design System</title>
    <style>
      :root { color-scheme: light dark; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        background: #0a0a0a;
        color: #fafafa;
        padding: 24px;
      }
      main { width: 100%; max-width: 640px; }
      .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
      .brand svg { width: 32px; height: 32px; }
      h1 { font-size: 28px; line-height: 1.1; letter-spacing: -0.02em; margin: 0; }
      p.lede { color: #a1a1a1; font-size: 16px; line-height: 1.6; margin: 8px 0 32px; }
      .cards { display: grid; gap: 16px; grid-template-columns: 1fr; }
      @media (min-width: 560px) { .cards { grid-template-columns: 1fr 1fr; } }
      a.card {
        display: block;
        text-decoration: none;
        color: inherit;
        background: #171717;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 14px;
        padding: 24px;
        transition: border-color 0.15s ease, transform 0.15s ease;
      }
      a.card:hover { border-color: #863bff; transform: translateY(-2px); }
      a.card h2 { font-size: 20px; margin: 0 0 4px; letter-spacing: -0.005em; }
      a.card span { color: #a1a1a1; font-size: 14px; line-height: 1.5; }
      a.card .go { color: #863bff; font-size: 14px; margin-top: 16px; display: block; font-weight: 500; }
      footer { margin-top: 32px; color: #737373; font-size: 12px; }
      footer a { color: #a1a1a1; }
    </style>
  </head>
  <body>
    <main>
      <div class="brand">
        <svg viewBox="0 0 48 46" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fill="#863bff" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"/>
        </svg>
        <h1>MVDS</h1>
      </div>
      <p class="lede">Minimum Viable Design System — an agent-first system built on shadcn/ui, Tailwind v4, and Storybook. Code is the single source of truth.</p>
      <div class="cards">
        <a class="card" href="/app/">
          <h2>Sample app</h2>
          <span>The demo application — primitives and components composed into a real screen, with a light/dark toggle.</span>
          <span class="go">Open the app →</span>
        </a>
        <a class="card" href="/storybook/">
          <h2>Storybook</h2>
          <span>The living component gallery — every variant and state, with accessibility checks and docs.</span>
          <span class="go">Open Storybook →</span>
        </a>
      </div>
      <footer>
        Source: <a href="https://github.com/beckharrisdesign/mvds">github.com/beckharrisdesign/mvds</a>
      </footer>
    </main>
  </body>
</html>
`;
writeFileSync(`${OUT}/index.html`, landing);
console.log(`\nBuilt hub to ${OUT}/ (index.html + app/ + storybook/)`);
