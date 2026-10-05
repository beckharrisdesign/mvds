import { defineConfig } from "tsup";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Imports dropped when deriving dist-lib/tokens.css from src/index.css: the
// external layers a consumer supplies themselves, plus the vendored shadcn
// variant layer, which ships inside styles.css only. Keep in sync with the
// @import block at the top of src/index.css.
const TOKENS_CSS_STRIPPED_IMPORTS = [
  "tailwindcss",
  "tw-animate-css",
  "./shadcn-variants.css",
  "@fontsource-variable/inter",
];

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
    "@radix-ui/react-checkbox",
    "@radix-ui/react-label",
    "@radix-ui/react-radio-group",
    "@radix-ui/react-select",
    "@radix-ui/react-slot",
    "@radix-ui/react-switch",
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

    // styles.css imports ./shadcn-variants.css relatively, so the vendored file
    // has to travel with it. Without this the import resolves in-repo and fails
    // on a consumer's install — invisible to every local gate.
    // (openspec: trim-runtime-dependency-graph, design D3)
    copyFileSync(
      path.resolve(dirname, "src/shadcn-variants.css"),
      path.resolve(dirname, "dist-lib/shadcn-variants.css")
    );
    console.log(
      "[tsup] copied src/shadcn-variants.css -> dist-lib/shadcn-variants.css"
    );

    // Also emit tokens.css: the same file minus the imported layers
    // (tailwindcss, tw-animate-css, the vendored shadcn variants, font). For
    // consumers who bring their own Tailwind/reset/font and want ONLY the MVDS
    // token layer. src/index.css stays the single editable source — this is derived.
    //
    // The list above is explicit on purpose. This filter used to test for a bare
    // specifier (`!/^@import "[^.]/`), which KEEPS a relative import — so
    // vendoring shadcn's variant layer to ./shadcn-variants.css would have
    // silently added it to tokens.css and referenced a file that is copied
    // below. tokens.css has never carried the variant layer; naming each
    // stripped import keeps that contract readable instead of implied.
    // (openspec: trim-runtime-dependency-graph, design D2)
    const indexCss = readFileSync(
      path.resolve(dirname, "src/index.css"),
      "utf8"
    );
    const tokensCss = indexCss
      .split("\n")
      .filter((line) => {
        const match = line.trim().match(/^@import\s+"([^"]+)"/);
        return !match || !TOKENS_CSS_STRIPPED_IMPORTS.includes(match[1]);
      })
      .join("\n")
      .replace(
        " * ===========================================================================*/",
        " * (tokens.css build: external @imports stripped — bring your own\n *  Tailwind, reset, and font; see docs/CONSUMING.md)\n * ===========================================================================*/"
      );
    writeFileSync(path.resolve(dirname, "dist-lib/tokens.css"), tokensCss);
    console.log("[tsup] emitted dist-lib/tokens.css (token layer only)");

    // Ship brand presets — plain-declaration stylesheets under themes/
    // (openspec: scoped-theming). Consumers import them via the
    // "./themes/*" package export.
    const themesSrc = path.resolve(dirname, "src/themes");
    const themesOut = path.resolve(dirname, "dist-lib/themes");
    mkdirSync(themesOut, { recursive: true });
    for (const f of readdirSync(themesSrc).filter((f) => f.endsWith(".css"))) {
      copyFileSync(path.join(themesSrc, f), path.join(themesOut, f));
    }
    console.log("[tsup] copied src/themes/*.css -> dist-lib/themes/");
  },
});
