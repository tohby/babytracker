/**
 * Nappa colour tokens: the single source of truth for every colour in the app.
 *
 * Mirrors the Figma "Nappa Colors" collection (file uRRG0z2UlrjjeuCzmTUE4G).
 * Keys are the Figma variable names. `light` is the Figma "Light" mode and
 * `dark` is "Dark A". A value in braces, e.g. '{plum/900}', is an alias: it
 * resolves to that token in the same theme, exactly like a Figma variable alias.
 *
 * After editing this file run `npm run theme:generate`, which writes these
 * values into src/global.css so Tailwind classes (`text-text-primary`,
 * `bg-glass-fill`) pick them up. Never edit that generated block by hand.
 *
 * This file must stay dependency-free: the generator script imports it in Node.
 */

const light = {
  // Palette
  'lavender/100': '#eee7f8',
  'lavender/300': '#c9b8e8',
  'lavender/500': '#9b86d6',
  'orange/100': '#fde6d3',
  'orange/500': '#f28a3c',
  'yellow/400': '#f6c65b',
  'cream/50': '#fbf6f2',
  white: '#ffffff',
  'plum/200': '#e7dfea',
  'plum/600': '#7a6a82',
  'plum/900': '#3e2a47',
  'mint/100': '#ddf2e8',
  'mint/400': '#7fc8a9',
  'neutral/numeral': '#dddde0',
  'danger/500': '#d9564a',

  // Roles
  'text/primary': '{plum/900}',
  'text/secondary': '{plum/600}',
  'text/hero-muted': '{plum/600}',
  'text/on-accent': '{white}',
  // Labels on accent/primary (orange). Dark plum in every theme: white on orange is 2.5:1 and fails WCAG AA.
  'text/on-accent-ink': '{plum/900}',
  'icon/primary': '{plum/900}',
  'icon/on-accent': '{white}',
  'accent/primary': '{orange/500}',
  'accent/ring': 'rgba(255, 255, 255, 0.5)',
  'surface/inverse': '{plum/900}',

  // App background gradient
  'bg/gradient-top': '#fbf6f2',
  'bg/gradient-mid': '#fcede1',
  'bg/gradient-bottom': '#eee7f8',

  // Hero cards: base gradient plus blurred glow blobs
  'hero/nap-start': '#fee8d6',
  'hero/nap-end': '#facbba',
  'hero/nap-blob-1': 'rgba(255, 226, 130, 0.8)',
  'hero/nap-blob-2': 'rgba(246, 165, 180, 0.65)',
  'hero/nap-blob-3': 'rgba(252, 170, 115, 0.55)',
  'hero/feed-start': '#ece2f8',
  'hero/feed-end': '#f4cee5',
  'hero/feed-blob-1': 'rgba(190, 170, 240, 0.6)',
  'hero/feed-blob-2': 'rgba(250, 175, 215, 0.7)',
  'hero/feed-blob-3': 'rgba(185, 215, 245, 0.7)',
  'hero/decor': 'rgba(255, 255, 255, 0.5)',

  // Frosted glass surfaces
  'glass/fill': 'rgba(255, 255, 255, 0.55)',
  'glass/stroke': 'rgba(255, 255, 255, 0.7)',
  'glass/nav-fill': 'rgba(255, 255, 255, 0.6)',
  'glass/chip-fill': 'rgba(255, 255, 255, 0.6)',
  'glass/chip-stroke': 'rgba(255, 255, 255, 0.7)',

  'texture/grain': 'rgba(255, 255, 255, 0.02)',

  // Shadow colours. Not Figma variables yet: they come from the effect styles
  // `Glass/Card` / `Glass/Pill` and the Log FAB glow.
  'shadow/glass': 'rgba(62, 42, 71, 0.07)',
  'shadow/accent': 'rgba(242, 138, 51, 0.4)',
  /** Selected segment in `Nav/Segmented`. */
  'shadow/raised': 'rgba(61, 41, 71, 0.12)',

  // Dims the screen behind a sheet or modal. Native iOS/Android sheets dim themselves;
  // use this for custom overlays. Not plum/900, which turns near-white in dark.
  scrim: 'rgba(62, 42, 71, 0.12)',

  // Same in every theme (e.g. Sign in with Apple must stay black/white)
  'static/black': '#000000',
  'static/white': '#ffffff',
} as const;

export type ColorToken = keyof typeof light;

const dark: Record<ColorToken, string> = {
  'lavender/100': '#3a2d52',
  'lavender/300': '#6f5aa6',
  'lavender/500': '#b7a5ee',
  'orange/100': '#4d3326',
  'orange/500': '#ff9d55',
  'yellow/400': '#f6c65b',
  'cream/50': '#2c1f35',
  white: '#35263f',
  'plum/200': '#4a3856',
  'plum/600': '#b9aac4',
  'plum/900': '#f4eefa',
  'mint/100': '#24423a',
  'mint/400': '#8fd6b7',
  'neutral/numeral': '#4a4452',
  'danger/500': '#ff7a6e',

  'text/primary': '{plum/900}',
  'text/secondary': '{plum/600}',
  'text/hero-muted': '#e6dcef',
  'text/on-accent': '{white}',
  'text/on-accent-ink': '#3e2a47',
  'icon/primary': '{plum/900}',
  'icon/on-accent': '{white}',
  'accent/primary': '{orange/500}',
  'accent/ring': 'rgba(255, 255, 255, 0.5)',
  'surface/inverse': '{plum/900}',

  'bg/gradient-top': '#1b1222',
  'bg/gradient-mid': '#261a31',
  'bg/gradient-bottom': '#33254a',

  'hero/nap-start': '#4d332e',
  'hero/nap-end': '#664136',
  'hero/nap-blob-1': 'rgba(217, 164, 65, 0.25)',
  'hero/nap-blob-2': 'rgba(196, 106, 134, 0.35)',
  'hero/nap-blob-3': 'rgba(224, 122, 58, 0.3)',
  'hero/feed-start': '#3d3366',
  'hero/feed-end': '#5a3b6e',
  'hero/feed-blob-1': 'rgba(122, 99, 214, 0.4)',
  'hero/feed-blob-2': 'rgba(196, 90, 154, 0.35)',
  'hero/feed-blob-3': 'rgba(79, 120, 199, 0.4)',
  'hero/decor': 'rgba(255, 255, 255, 0.08)',

  'glass/fill': 'rgba(255, 255, 255, 0.07)',
  'glass/stroke': 'rgba(255, 255, 255, 0.14)',
  'glass/nav-fill': 'rgba(255, 255, 255, 0.07)',
  'glass/chip-fill': 'rgba(27, 18, 34, 0.45)',
  'glass/chip-stroke': 'rgba(255, 255, 255, 0.2)',

  'texture/grain': 'rgba(255, 255, 255, 0.02)',

  'shadow/glass': 'rgba(62, 42, 71, 0.07)',
  'shadow/accent': 'rgba(242, 138, 51, 0.4)',
  'shadow/raised': 'rgba(61, 41, 71, 0.12)',

  scrim: 'rgba(8, 5, 12, 0.6)',

  'static/black': '#000000',
  'static/white': '#ffffff',
};

export type ThemeName = 'light' | 'dark';

export const colorTokens: Record<ThemeName, Record<ColorToken, string>> = { light, dark };

export type ResolvedColors = Record<ColorToken, string>;

/** Follows '{alias}' references so every token is a plain colour string. */
export function resolveColors(theme: ThemeName): ResolvedColors {
  const source = colorTokens[theme];
  const resolve = (name: ColorToken, seen: ColorToken[]): string => {
    const value = source[name];
    const alias = /^\{(.+)\}$/.exec(value)?.[1] as ColorToken | undefined;
    if (!alias) return value;
    if (!(alias in source)) throw new Error(`Colour token "${name}" points at unknown token "${alias}"`);
    if (seen.includes(alias)) throw new Error(`Colour token alias loop: ${[...seen, alias].join(' -> ')}`);
    return resolve(alias, [...seen, alias]);
  };
  return Object.fromEntries(
    (Object.keys(source) as ColorToken[]).map((name) => [name, resolve(name, [name])]),
  ) as ResolvedColors;
}

/** Figma name to CSS variable: 'text/primary' -> '--color-text-primary' (class `text-text-primary`). */
export function cssVariableName(token: ColorToken): string {
  return `--color-${token.replace(/\//g, '-')}`;
}
