/**
 * Design tokens for the showcase page — both the 3D card scene and (via
 * the mirrored custom properties documented below) the DOM HUD. Typography
 * and color intentionally match the main site's actual conventions
 * (see src/app/page.tsx, src/components/Navbar.tsx, globals.css):
 * Instrument Sans everywhere, white text at a small set of opacity steps,
 * gold (#fecb33) reserved for accents/CTAs, near-black surfaces.
 *
 * DOM-side tokens (showcase.module.css) mirror the COLOR values below by
 * hand — CSS can't import these directly without a build-time step, so if
 * you change a color here, update the matching custom property in
 * showcase.module.css's `.stage` block too.
 */

export const FONT = {
  // Same family the rest of the site loads via next/font (--font-instrument-sans).
  // troika-three-text needs an actual font file URL rather than a CSS
  // variable, so this is a self-hosted copy of the same Google Font — see
  // public/fonts/InstrumentSans-Variable.ttf. It's a variable font; troika
  // renders its default named instance (Regular) since troika doesn't
  // expose variation-axis selection, so card type doesn't get a distinct
  // bold/medium weight the way the DOM chrome can — size and color carry
  // the hierarchy instead.
  sans: "/fonts/InstrumentSans-Variable.ttf",
} as const;

export const CARD = {
  width: 3.2,
  height: 1.9,
  // Thick enough that the side faces read clearly once a card is tilted
  // (fan angle, hover, or the per-card orientation bias) — a thin slab
  // just looks like a flat plane rotating in place instead of an object
  // with volume.
  depth: 0.34,
  // RoundedBox bevel radius must stay under half the smallest dimension
  // (depth) or the geometry degenerates — see ShowcaseScene.tsx history.
  radius: 0.1,
  padding: 0.16, // inset from the card edge for all text/content
  // Contain-fit box for the "screen" image — width capped here; height is
  // whatever computeCardLayout() works out is left over after kicker/title/
  // tags, so it's derived, not independently chosen. This width is tuned
  // to roughly match that derived height at the real asset aspect ratio
  // (~1.23:1) so images fill the box without much letterboxing.
  screenMaxWidth: 1.3,
} as const;

// A 4px-ish base unit, expressed in world units. Every gap in the card
// layout should reference one of these rather than an ad hoc number.
export const SPACE = {
  xs: 0.06,
  sm: 0.09,
  md: 0.11,
  lg: 0.16,
  xl: 0.22,
} as const;

// Instrument Sans is proportional, not fixed-width, so unlike a monospace
// face its wrap point can't be read exactly off character count — but it
// doesn't have to be a guess either. This is the *measured* average glyph
// advance width (as a fraction of font size), extracted directly from
// public/fonts/InstrumentSans-Variable.ttf's hmtx/cmap tables over a
// representative English sample ("The quick brown fox...", plus a few
// actual card titles): raw average ~0.47, capital-heavy words (e.g.
// "ETHGlobal") ran up to ~0.55. This constant is set above that observed
// range so the line-fit estimate stays a safe upper bound rather than an
// average that some titles would exceed.
export const AVG_ADVANCE_RATIO = 0.52;
// Additional margin on top of AVG_ADVANCE_RATIO: troika wraps on word
// boundaries and this is only an average (not exact, as it would be for a
// monospace font), so bias down further to keep reserving enough space
// rather than risk underestimating and reproducing the overlap bug.
const WRAP_SAFETY = 0.85;

export const TYPE = {
  kicker: { size: 0.086, letterSpacing: 0.05, lineHeight: 1.3, fillOpacity: 0.6 },
  // `size` is the largest step in the fluid title scale (see
  // pickTitleFontSize) — also the height reserved in the card's vertical
  // layout for the title, regardless of which step actually gets used, so
  // every card's screen area lines up in the same place.
  title: { size: 0.165, lineHeight: 1.2, steps: [0.165, 0.145, 0.125, 0.108], fillOpacity: 1 },
  tag: { size: 0.068, lineHeight: 1.2, fillOpacity: 0.45 },
  glyph: { size: 0.42, lineHeight: 1 },
} as const;

export const COLOR = {
  // Matches --color-gold / --color-surface in globals.css exactly.
  gold: "#fecb33",
  surface: "#0c0c0c",
  white: "#ffffff",
  screenBacking: "#0c0c0c",
  // Active-card material: a soft radial glow (not a hard diagonal sweep) in
  // a deliberately *narrow* luminance range — it never gets dark enough to
  // swallow the dark ink text that sits on top of it, wherever on the card
  // that text lands. Center hits the exact site gold, same spirit as the
  // site's bg-gold CTA buttons. Inactive cards use neutral dark-grays
  // matching --color-border/--color-border-nav instead of a tinted "ink" —
  // the site's own dark surfaces are neutral, not warm.
  activeSkinStops: [
    [0, "#ffedb0"],
    [0.6, "#fecb33"],
    [1, "#d9a536"],
  ] as Array<[number, string]>,
  inactiveSkinStops: [
    [0, "#242424"],
    [0.6, "#161616"],
    [1, "#0c0c0c"],
  ] as Array<[number, string]>,
} as const;

/** Upper-bound estimate of wrapped line count. See AVG_ADVANCE_RATIO. */
function estimateWrappedLines(text: string, fontSize: number, maxWidth: number): number {
  const charWidth = fontSize * AVG_ADVANCE_RATIO;
  const charsPerLine = Math.max(1, Math.floor((maxWidth / charWidth) * WRAP_SAFETY));
  return Math.max(1, Math.ceil(text.length / charsPerLine));
}

/**
 * Picks the largest step from TYPE.title.steps that keeps `text` on one
 * line within `maxWidth`. Falls back to the smallest step if nothing fits
 * (rare — only hit by unusually long titles), which may still wrap; the
 * card layout's reserved title height is sized for the *largest* step
 * regardless, so even that edge case won't overlap neighboring text, it'll
 * just sit slightly off-center within its reserved slot.
 */
export function pickTitleFontSize(text: string, maxWidth: number): number {
  for (const size of TYPE.title.steps) {
    if (estimateWrappedLines(text, size, maxWidth) <= 1) return size;
  }
  return TYPE.title.steps[TYPE.title.steps.length - 1];
}

interface CardLayout {
  kickerY: number;
  titleY: number;
  screenTop: number;
  screenBottom: number;
  screenCenterY: number;
  screenHeight: number;
  tagsY: number;
}

/**
 * Computes every vertical position on a card from the type scale and
 * spacing tokens alone — content never overlaps because each element's
 * reserved height (not its rendered height) determines where the next one
 * starts. Reserved heights use the *largest* size in a fluid scale, so
 * screen position/size stays identical across every card regardless of
 * which font-size step a given title actually renders at.
 */
export function computeCardLayout(): CardLayout {
  const kickerBlock = TYPE.kicker.size * TYPE.kicker.lineHeight;
  const titleBlock = TYPE.title.size * TYPE.title.lineHeight;
  const tagBlock = TYPE.tag.size * TYPE.tag.lineHeight;

  let cursor = CARD.height / 2 - CARD.padding;
  const kickerY = cursor - kickerBlock / 2;
  cursor -= kickerBlock + SPACE.sm;

  const titleY = cursor - titleBlock / 2;
  cursor -= titleBlock + SPACE.md;

  const screenTop = cursor;
  const screenBottom = -CARD.height / 2 + CARD.padding + tagBlock + SPACE.sm;
  const screenHeight = screenTop - screenBottom;
  const screenCenterY = (screenTop + screenBottom) / 2;

  const tagsY = -CARD.height / 2 + CARD.padding;

  return { kickerY, titleY, screenTop, screenBottom, screenCenterY, screenHeight, tagsY };
}
