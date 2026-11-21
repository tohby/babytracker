/**
 * Nappa colour tokens: the single source of truth for every colour in the app.
 *
 * Mirrors the Figma file uRRG0z2UlrjjeuCzmTUE4G:
 * - `v2Light` / `v2Dark`: the "V2 · Color" collection (modes Light and Dark), with tokens keyed by
 *   their Figma names (`color/background/canvas`). These are what components use.
 * - `primitives`: the "V2 · Primitives" collection. Only used to resolve aliases; never emitted as CSS or
 *   exposed to components.
 *
 * A value in braces, e.g. '{slate/900}', is an alias to a primitive, exactly like a Figma variable alias.
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
  'color/brand/surface': '{pink/200}',
  'color/brand/surface-strong': '{pink/300}',
  'color/brand/on-surface': '{slate/900}',
  'color/brand/accent': '{pink/400}',
  'color/state/disabled': '{slate/100}',
  'color/state/pressed-surface': '{slate/100}',
  'color/state/selected': '{teal/200}',
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
  'color/brand/surface': '{pink/900}',
  'color/brand/surface-strong': '{pink/700}',
  'color/brand/on-surface': '{pink/100}',
  'color/brand/accent': '{pink/500}',
  'color/state/disabled': '{slate/800}',
  'color/state/pressed-surface': '{slate/800}',
  'color/state/selected': '{teal/800}',
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

export type ColorToken = V2ColorToken;
export type ThemeName = 'light' | 'dark';
export type ResolvedColors = Record<ColorToken, string>;

const sources: Record<ThemeName, Record<V2ColorToken, string>> = { light: v2Light, dark: v2Dark };

const aliasOf = (value: string) => /^\{(.+)\}$/.exec(value)?.[1];

/** Every token for a theme as a final colour string (aliases followed to the end). */
export function resolveColors(theme: ThemeName): ResolvedColors {
  const out = {} as ResolvedColors;
  for (const [name, value] of Object.entries(sources[theme]) as [V2ColorToken, string][]) {
    const alias = aliasOf(value);
    if (!alias) {
      out[name] = value;
      continue;
    }
    if (!(alias in primitives)) throw new Error(`V2 colour "${name}" points at unknown primitive "${alias}"`);
    out[name] = primitives[alias as Primitive];
  }
  return out;
}

/** Token names in emit order (V2 first). */
export function tokenNames(): ColorToken[] {
  return Object.keys(v2Light) as V2ColorToken[];
}

/**
 * Figma name to CSS variable. V2 drops the `color/` prefix because Tailwind's colour namespace adds it back:
 * 'color/background/canvas' -> '--color-background-canvas' (class `bg-background-canvas`).
 */
export function cssVariableName(token: ColorToken): string {
  return `--color-${token.replace(/^color\//, '').replace(/\//g, '-')}`;
}
