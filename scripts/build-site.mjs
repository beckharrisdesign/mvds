// Build the Vercel deployment: the Vite app (with ManifestDashboard) at `/`
// and the Storybook gallery at `/storybook/`.
//
// Output layout (outputDirectory in vercel.json = dist-site):
//   dist-site/
//     index.html        the Vite app (landing page + dashboard)
//     assets/           Vite app assets
//     storybook/        the static Storybook build
//
// Run via `npm run build:site`. Vercel runs this as its build command.

import { execSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";

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

// Vite app — served at /, so no --base flag needed.
run(`npx vite build --outDir ${OUT} --emptyOutDir`);

// Storybook gallery — static build into /storybook/.
run(`npx storybook build --output-dir ${OUT}/storybook`);

console.log(`\nBuilt site to ${OUT}/ (index.html + storybook/)`);
