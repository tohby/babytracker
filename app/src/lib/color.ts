/**
 * The same colour with alpha 0, for gradients that fade out.
 * Fading to plain `transparent` (black at alpha 0) leaves a grey fringe.
 * Accepts the formats used in color-tokens.ts: `#rrggbb` and `rgba(r, g, b, a)`.
 */
export function transparentOf(color: string): string {
  const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(color);
  if (hex) {
    const [r, g, b] = hex.slice(1).map((part) => parseInt(part, 16));
    return `rgba(${r}, ${g}, ${b}, 0)`;
  }
  const rgba = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(color);
  if (rgba) return `rgba(${rgba[1]}, ${rgba[2]}, ${rgba[3]}, 0)`;
  throw new Error(`transparentOf: unsupported colour "${color}"`);
}
