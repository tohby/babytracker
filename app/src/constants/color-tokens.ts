/**
 * Nappa colour tokens: the single source of truth for every colour in the app.
 *
 * Mirrors the Figma file uRRG0z2UlrjjeuCzmTUE4G:
 * - `v2Light` / `v2Dark`: the "V2 · Color" collection (modes Light and Dark), 51 semantic tokens keyed by
 *   their Figma names (`color/background/canvas`). These are what components use.
 * - `primitives`: the "V2 · Primitives" collection. Only used to resolve aliases; never emitted as CSS or
 *   exposed to components.
 * - `legacyLight` / `legacyDark`: the V1 "Nappa Colors" tokens (Light and Dark A). Kept only while V1
 *   screens are being rebuilt; delete when nothing references them.
 *
 * A value in braces, e.g. '{slate/900}', is an alias, exactly like a Figma variable alias. V2 aliases
 * point at primitives; legacy aliases point at other legacy tokens.
 *
 * After editing, run `npm run theme:generate`: it resolves every alias to its final value and writes the
 * `<color-tokens>` block in src/global.css (`color/background/canvas` -> `--color-background-canvas`,
 * class `bg-background-canvas`). Never edit that block by hand.
 *
 * This file must stay dependency-free: the generator script imports it in Node.
 */

/** "V2 · Primitives". Private: resolve aliases only. */
const primitives = {
  'teal/50': '#eaf3f5',
  'teal/100': '#d2e6eb',
  'teal/200': '#9fc4ce',
  'teal/300': '#6fa3b1',
  'teal/400': '#3f7f90',
  'teal/500': '#1d6475',
  'teal/600': '#0f4c5c',
  'teal/700': '#0b3d4a',
  'teal/800': '#082e38',
  'teal/900': '#051f26',
  'pink/50': '#fbf0f7',
  'pink/100': '#f7e1ef',
  'pink/200': '#f2cde8',
  'pink/300': '#e9b6da',
  'pink/400': '#da8cc2',
  'pink/500': '#c4649f',
  'pink/600': '#9c4a7d',
  'pink/700': '#74375d',
  'pink/900': '#42253a',
  'pink/hot': '#e8459a',
  'lilac/50': '#f4f3fd',
  'lilac/100': '#e9e7fb',
  'lilac/200': '#d9d5f7',
  'lilac/300': '#beb7f0',
  'lilac/400': '#9c93e3',
  'lilac/500': '#7a70cf',
  'lilac/600': '#5d53ae',
  'lilac/700': '#443c84',
  'lilac/900': '#2a2747',
  'sky/50': '#eef7fa',
  'sky/100': '#ddeff4',
  'sky/200': '#cde7ef',
  'sky/300': '#a8d3e1',
  'sky/400': '#74b6cb',
  'sky/500': '#4796b0',
  'sky/600': '#2f758c',
  'sky/700': '#225869',
  'sky/900': '#173540',
  'mint/50': '#eff9ee',
  'mint/100': '#e1f4df',
  'mint/200': '#d3efd0',
  'mint/300': '#b1e0ab',
  'mint/400': '#82c97a',
  'mint/500': '#56a94d',
  'mint/600': '#3f8838',
  'mint/700': '#2e6629',
  'mint/900': '#1f3a22',
  'amber/100': '#fcebd3',
  'amber/200': '#f8d7a8',
  'amber/500': '#d98a1f',
  'amber/700': '#8f5710',
  'amber/900': '#3d2c12',
  'red/100': '#fbe3e1',
  'red/200': '#f5c1bc',
  'red/500': '#d2453b',
  'red/600': '#b3342b',
  'red/700': '#8a2620',
  'red/900': '#3f1d1a',
  'slate/0': '#ffffff',
  'slate/25': '#f4f7f8',
  'slate/50': '#e7eef0',
  'slate/100': '#dce5e8',
  'slate/200': '#d3dee2',
  'slate/300': '#b4c2c8',
  'slate/400': '#8c9aa0',
  'slate/500': '#7d8b91',
  'slate/600': '#5e6e75',
  'slate/700': '#4c5c63',
  'slate/800': '#2b3a41',
  'slate/850': '#1f2f37',
  'slate/900': '#17262e',
  'slate/950': '#0e1a20',
  'slate/black': '#000000',
} as const;

type Primitive = keyof typeof primitives;
type Alias<T extends string> = `{${T}}`;

/** "V2 · Color", mode Light. */
const v2Light = {
  'color/background/canvas': '{slate/50}',
  'color/background/surface': '{slate/0}',
  'color/background/surface-muted': '{slate/25}',
  'color/background/surface-raised': '{slate/0}',
  'color/background/scrim': '{slate/900}',
  'color/text/primary': '{slate/900}',
  'color/text/secondary': '{slate/700}',
  'color/text/tertiary': '{slate/600}',
  'color/text/disabled': '{slate/400}',
  'color/text/on-primary': '{slate/0}',
  'color/text/link': '{teal/600}',
  'color/text/error': '{red/600}',
  'color/icon/primary': '{slate/900}',
  'color/icon/secondary': '{slate/600}',
  'color/icon/disabled': '{slate/400}',
  'color/icon/on-primary': '{slate/0}',
  'color/border/default': '{slate/200}',
  'color/border/strong': '{slate/300}',
  'color/border/focus': '{teal/400}',
  'color/border/error': '{red/500}',
  'color/divider': '{slate/100}',
  'color/primary/default': '{teal/600}',
  'color/primary/pressed': '{teal/700}',
  'color/primary/subtle': '{teal/100}',
  'color/primary/ring': '{teal/200}',
  'color/secondary/default': '{pink/200}',
  'color/secondary/pressed': '{pink/300}',
  'color/secondary/on': '{slate/900}',
  'color/state/disabled': '{slate/100}',
  'color/state/pressed-surface': '{slate/100}',
  'color/state/selected': '{teal/600}',
  'color/status/success': '{mint/600}',
  'color/status/success-subtle': '{mint/100}',
  'color/status/warning': '{amber/700}',
  'color/status/warning-subtle': '{amber/100}',
  'color/status/error': '{red/600}',
  'color/status/error-subtle': '{red/100}',
  'color/status/error-pressed': '{red/700}',
  'color/status/info': '{sky/600}',
  'color/status/info-subtle': '{sky/100}',
  'color/feature/sleep': '{sky/200}',
  'color/feature/sleep-strong': '{sky/600}',
  'color/feature/feed': '{lilac/200}',
  'color/feature/feed-strong': '{lilac/600}',
  'color/feature/nappy': '{mint/200}',
  'color/feature/nappy-strong': '{mint/600}',
  'color/feature/care': '{pink/200}',
  'color/feature/care-strong': '{pink/600}',
  'color/feature/care-deep': '{pink/300}',
  'color/accent/notification': '{pink/hot}',
  'color/static/white': '{slate/0}',
} as const satisfies Record<string, Alias<Primitive>>;

export type V2ColorToken = keyof typeof v2Light;

/** "V2 · Color", mode Dark. */
const v2Dark: Record<V2ColorToken, Alias<Primitive>> = {
  'color/background/canvas': '{slate/950}',
  'color/background/surface': '{slate/900}',
  'color/background/surface-muted': '{slate/850}',
  'color/background/surface-raised': '{slate/850}',
  'color/background/scrim': '{slate/black}',
  'color/text/primary': '{slate/50}',
  'color/text/secondary': '{slate/300}',
  'color/text/tertiary': '{slate/400}',
  'color/text/disabled': '{slate/600}',
  'color/text/on-primary': '{teal/900}',
  'color/text/link': '{teal/200}',
  'color/text/error': '{red/200}',
  'color/icon/primary': '{slate/50}',
  'color/icon/secondary': '{slate/400}',
  'color/icon/disabled': '{slate/600}',
  'color/icon/on-primary': '{teal/900}',
  'color/border/default': '{slate/800}',
  'color/border/strong': '{slate/700}',
  'color/border/focus': '{teal/200}',
  'color/border/error': '{red/200}',
  'color/divider': '{slate/800}',
  'color/primary/default': '{teal/200}',
  'color/primary/pressed': '{teal/300}',
  'color/primary/subtle': '{teal/800}',
  'color/primary/ring': '{teal/500}',
  'color/secondary/default': '{pink/900}',
  'color/secondary/pressed': '{pink/700}',
  'color/secondary/on': '{pink/100}',
  'color/state/disabled': '{slate/800}',
  'color/state/pressed-surface': '{slate/800}',
  'color/state/selected': '{teal/200}',
  'color/status/success': '{mint/300}',
  'color/status/success-subtle': '{mint/900}',
  'color/status/warning': '{amber/200}',
  'color/status/warning-subtle': '{amber/900}',
  'color/status/error': '{red/200}',
  'color/status/error-subtle': '{red/900}',
  'color/status/error-pressed': '{red/100}',
  'color/status/info': '{sky/300}',
  'color/status/info-subtle': '{sky/900}',
  'color/feature/sleep': '{sky/900}',
  'color/feature/sleep-strong': '{sky/300}',
  'color/feature/feed': '{lilac/900}',
  'color/feature/feed-strong': '{lilac/300}',
  'color/feature/nappy': '{mint/900}',
  'color/feature/nappy-strong': '{mint/300}',
  'color/feature/care': '{pink/900}',
  'color/feature/care-strong': '{pink/300}',
  'color/feature/care-deep': '{pink/700}',
  'color/accent/notification': '{pink/hot}',
  'color/static/white': '{slate/0}',
};

/** V1 "Nappa Colors", Light. LEGACY: do not use in new work. */
const legacyLight = {
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
  'text/hero-muted': '{plum/600}',
  'text/on-accent': '{white}',
  // Labels on accent/primary (orange). Dark plum in every theme: white on orange is 2.5:1 and fails WCAG AA.
  'text/on-accent-ink': '{plum/900}',
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
} as const;

export type LegacyColorToken = keyof typeof legacyLight;

/** V1 "Nappa Colors", Dark A. LEGACY. */
const legacyDark: Record<LegacyColorToken, string> = {
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

  'text/hero-muted': '#e6dcef',
  'text/on-accent': '{white}',
  'text/on-accent-ink': '#3e2a47',
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
};

export type ColorToken = V2ColorToken | LegacyColorToken;
export type ThemeName = 'light' | 'dark';
export type ResolvedColors = Record<ColorToken, string>;

const sources: Record<ThemeName, { v2: Record<V2ColorToken, string>; legacy: Record<LegacyColorToken, string> }> = {
  light: { v2: v2Light, legacy: legacyLight },
  dark: { v2: v2Dark, legacy: legacyDark },
};

const aliasOf = (value: string) => /^\{(.+)\}$/.exec(value)?.[1];

/** Every token for a theme as a final colour string (aliases followed to the end). */
export function resolveColors(theme: ThemeName): ResolvedColors {
  const { v2, legacy } = sources[theme];
  const out = {} as ResolvedColors;
  for (const [name, value] of Object.entries(v2) as [V2ColorToken, string][]) {
    const alias = aliasOf(value);
    if (!alias) {
      out[name] = value;
      continue;
    }
    if (!(alias in primitives)) throw new Error(`V2 colour "${name}" points at unknown primitive "${alias}"`);
    out[name] = primitives[alias as Primitive];
  }
  const resolveLegacy = (name: LegacyColorToken, seen: string[]): string => {
    const alias = aliasOf(legacy[name]) as LegacyColorToken | undefined;
    if (!alias) return legacy[name];
    if (!(alias in legacy)) throw new Error(`Colour token "${name}" points at unknown token "${alias}"`);
    if (seen.includes(alias)) throw new Error(`Colour token alias loop: ${[...seen, alias].join(' -> ')}`);
    return resolveLegacy(alias, [...seen, alias]);
  };
  for (const name of Object.keys(legacy) as LegacyColorToken[]) out[name] = resolveLegacy(name, [name]);
  return out;
}

/** Token names in emit order (V2 first). */
export function tokenNames(): ColorToken[] {
  return [...(Object.keys(v2Light) as V2ColorToken[]), ...(Object.keys(legacyLight) as LegacyColorToken[])];
}

/**
 * Figma name to CSS variable. V2 drops the `color/` prefix because Tailwind's colour namespace adds it back:
 * 'color/background/canvas' -> '--color-background-canvas' (class `bg-background-canvas`).
 * Legacy: 'glass/fill' -> '--color-glass-fill'.
 */
export function cssVariableName(token: ColorToken): string {
  return `--color-${token.replace(/^color\//, '').replace(/\//g, '-')}`;
}
