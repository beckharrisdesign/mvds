import { defineConfig } from "tsup";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Library build for @beckharrisdesign/mvds. Separate from the Vite app/Storybook
// build (those stay in `dist/`). Emits ESM + types to dist-lib/, resolving the
// `@ -> src` alias internally so consumers never see it. minify:false so
// Tailwind can scan the emitted class strings in consumers.
export default defineConfig({
  entry: { index: "src/index.ts" },
  outDir: "dist-lib",
  format: ["esm"],
  dts: true,
  minify: false,
  clean: true,
  sourcemap: false,
  treeshake: true,
  tsconfig: "tsconfig.lib.json",
  // Peers + runtime deps: never bundled; consumers provide/inherit them.
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "class-variance-authority",
    "radix-ui",
    "clsx",
    "tailwind-merge",
    "lucide-react",
  ],
  esbuildOptions(options) {
    options.alias = { "@": path.resolve(dirname, "src") };
  },
  async onSuccess() {
    // Ship the token layer (the keystone) as the package's styles entry.
    copyFileSync(
      path.resolve(dirname, "src/index.css"),
      path.resolve(dirname, "dist-lib/styles.css")
    );
    console.log("[tsup] copied src/index.css -> dist-lib/styles.css");

    // Also emit tokens.css: the same file minus the external @imports
    // (tailwindcss, tw-animate-css, shadcn base, font). For consumers who bring
    // their own Tailwind/reset/font and want ONLY the MVDS token layer.
    // src/index.css stays the single editable source — this is derived.
    const indexCss = readFileSync(
      path.resolve(dirname, "src/index.css"),
      "utf8"
    );
    const tokensCss = indexCss
      .split("\n")
      .filter((line) => !/^@import "[^.]/.test(line.trim()))
      .join("\n")
      .replace(
        "* ====",
        "* (tokens.css build: external @imports stripped — bring your own\n *  Tailwind, reset, and font; see docs/CONSUMING.md)\n * ===="
      );
    writeFileSync(path.resolve(dirname, "dist-lib/tokens.css"), tokensCss);
    console.log("[tsup] emitted dist-lib/tokens.css (token layer only)");
  },
});
