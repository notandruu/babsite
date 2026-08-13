/**
 * Design tokens for the showcase page's 3D card scene. Single source of
 * truth for card geometry, typography, color, and the spacing scale — no
 * positioning magic numbers should live in ShowcaseScene.tsx itself.
 *
 * DOM-side tokens (showcase.module.css) mirror the COLOR values below by
 * hand — CSS can't import these directly without a build-time step, so if
 * you change a color here, update the matching custom property in
 * showcase.module.css's `.stage` block too.
 */

export const CARD = {
  width: 3.2,
  height: 1.9,
  depth: 0.16,
  // RoundedBox bevel radius must stay under half the smallest dimension
  // (depth) or the geometry degenerates — see ShowcaseScene.tsx history.
  radius: 0.055,
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

// JetBrains Mono is fixed-width; this is its measured horizontal advance as
// a fraction of font size. Because it's monospace, wrapped line count is
// predictable from character count alone — no async text-measurement pass
// needed before we can lay out the rest of the card around it.
export const MONO_ADVANCE_RATIO = 0.6;
// Safety margin subtracted from the raw fit estimate: troika wraps on word
// boundaries, so a line can end up slightly shorter than the raw
// characters-per-line math suggests. Biasing down means we reserve slightly
// more space than strictly needed rather than risk an overlap.
const WRAP_SAFETY = 0.92;

export const TYPE = {
  kicker: { size: 0.086, letterSpacing: 0.06, lineHeight: 1.3 },
  // `size` is the largest step in the fluid title scale (see
  // pickTitleFontSize) — also the height reserved in the card's vertical
  // layout for the title, regardless of which step actually gets used, so
  // every card's screen area lines up in the same place.
  title: { size: 0.165, lineHeight: 1.25, steps: [0.165, 0.145, 0.125, 0.108] },
  tag: { size: 0.07, lineHeight: 1.2 },
  glyph: { size: 0.42, lineHeight: 1 },
} as const;

export const COLOR = {
  inkDark: "#2b1a10",
  inkDarker: "#221407",
  inkTag: "#3a2712",
  paper: "#f5ead9",
  paperMuted: "#c7b6a2",
  paperTag: "#b7a68f",
  gold: "#fecb33",
  cardActive: "#c99a3d",
  cardInactive: "#171310",
  screenBacking: "#0c0906",
  activeSkinStops: [
    [0, "#e8c874"],
    [0.5, "#c99a3d"],
    [1, "#2f2210"],
  ] as Array<[number, string]>,
  inactiveSkinStops: [
    [0, "#221c15"],
    [0.6, "#181310"],
    [1, "#0e0b09"],
  ] as Array<[number, string]>,
} as const;

/** Upper-bound estimate of wrapped line count for fixed-width text. */
function estimateWrappedLines(text: string, fontSize: number, maxWidth: number): number {
  const charWidth = fontSize * MONO_ADVANCE_RATIO;
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
