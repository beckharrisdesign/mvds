// Canonical color math for MVDS — oklch → sRGB and WCAG contrast.
// Single source of truth for color conversion, reused by the contrast gate
// (check-contrast.mjs) and the Figma token sync. The oklch→sRGB pipeline
// reproduces Figma's own variable values to the digit.

/** Parse an `oklch(L C H [/ A])` string → { L, C, H, a }. Alpha optional. */
export function parseOklch(str) {
  const m = String(str).match(
    /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+%?))?\s*\)/i
  )
  if (!m) throw new Error(`Not an oklch() value: ${str}`)
  const a = m[4] ? (m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4])) : 1
  return { L: parseFloat(m[1]), C: parseFloat(m[2]), H: parseFloat(m[3]), a }
}

/** oklch (L 0..1, C, H degrees) → sRGB { r, g, b } in 0..1 (gamut-clamped). */
export function oklchToRgb(L, C, H) {
  const hr = (H * Math.PI) / 180
  const A = C * Math.cos(hr)
  const B = C * Math.sin(hr)
  const l_ = L + 0.3963377774 * A + 0.2158037573 * B
  const m_ = L - 0.1055613458 * A - 0.0638541728 * B
  const s_ = L - 0.0894841775 * A - 1.291485548 * B
  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const b = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  const gam = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(Math.max(x, 0), 1 / 2.4) - 0.055)
  const cl = (x) => Math.min(1, Math.max(0, x))
  return { r: cl(gam(r)), g: cl(gam(g)), b: cl(gam(b)) }
}

/** Convenience: `oklch(...)` string → sRGB { r, g, b } (ignores alpha). */
export function oklchStrToRgb(str) {
  const { L, C, H } = parseOklch(str)
  return oklchToRgb(L, C, H)
}

/** WCAG relative luminance of an sRGB { r, g, b } (0..1 channels). */
export function relLuminance({ r, g, b }) {
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/** WCAG contrast ratio between two sRGB colors (1..21). */
export function contrastRatio(rgb1, rgb2) {
  const l1 = relLuminance(rgb1)
  const l2 = relLuminance(rgb2)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

/** sRGB { r, g, b } (0..1) → `#rrggbb`. */
export function rgbToHex({ r, g, b }) {
  return "#" + [r, g, b].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("")
}
