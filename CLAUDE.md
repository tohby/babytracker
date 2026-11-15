# Nappa

Baby tracking app (naps, feeds, sleep predictions). Monorepo:

- `api/` Laravel 13 + Inertia/React backend, served at https://babytracker.madebyidia.com
- `app/` Expo / React Native mobile app (see `app/AGENTS.md`: check Expo docs, don't trust memory)
- `deploy/` Hostinger deploy scripts; pushing a `v*` tag builds, releases and auto-deploys (see `deploy/README.md`)

## Localisation (i18n)

English only today, built to add French, German, Spanish and Chinese (Simplified) later. Plan: `docs/i18n.md`; code rules: `app/AGENTS.md`; product rules: `AGENTS.md`.

- Never hard-code user-facing text in the app, API responses, emails or notifications. App strings go through `t()` with keys in `app/src/i18n/locales/en/`; Laravel text goes in `api/lang/`.
- Store raw values (timestamps, ml, grams) and format at render time through `app/src/lib/format.ts` (`Intl`). API returns data and error codes, not display sentences.
- Whole sentences with `{{placeholders}}`, plural keys, no concatenation. Add strings to `en` only; translations are a separate batch (M6).
- Design and build for ~40% longer text (German) and logical left/right spacing; check key Figma screens with long strings. Language, units, clock and diaper/nappy wording are separate things.
- If you touch a screen that still has hard-coded text, move it into `en` resources in the same change.

## Design (Figma)

Source of truth for UI: **Nappa — Baby Tracker App**
https://www.figma.com/design/uRRG0z2UlrjjeuCzmTUE4G/Nappa-%E2%80%94-Baby-Tracker-App

- File key: `uRRG0z2UlrjjeuCzmTUE4G`
- Pages: Foundations (`0:1`), Components (`1:2`), Screens (`1:3`)
- Screens are 390×844 frames; reusable pieces include `Button/Primary`, `Tile/Time since`, `Chip`, `Log button`, `Bottom nav`, `Mascot/Cloud`, and the `Icon/*` set.

### Spacing rule

Hierarchical spacing (proximity principle, ~1.4× per nesting level, snapped to 4/8px). Figma variables live in the **Nappa Spacing** collection; bind gaps and padding to them, never raw numbers.

| Token | px | Use |
|---|---|---|
| `spacing/xs` | 4 | Lines within one text block (title + caption), chip vertical padding |
| `spacing/sm` | 8 | Icon ↔ label, dot ↔ text, list rows, items inside a card |
| `spacing/md` | 12 | Siblings in a group (tiles, plan cards, buttons in a row), dense-row vertical padding |
| `spacing/lg` | 16 | Card/tile/row padding, gap between groups inside a section |
| `spacing/page` | 20 | Screen side margin (all screens, bottom nav, sheets) |
| `spacing/xl` | 24 | Gap between sections, large card padding |
| `spacing/2xl` | 32 | Major breaks between screen zones |

- Related items are wrapped in a nested auto-layout group; the group's gap is smaller than the gap around it. A heading belongs to what it introduces (`Since last` title + tiles = `md`; hero cards → that group = `xl`).
- No `Gap`/`Spacer` frames; use auto-layout gap.
- Exceptions: dense list rows use 12 vertical / 16 horizontal padding; primary actions sit with their bottom edge at y=804 (40px bottom inset above the home indicator); stroke weight must not change layout (`strokesIncludedInLayout = false` on selectable cards).
- `app/src/constants/theme.ts` `Spacing` has `half: 2` and no 12; add a 12 step and avoid the 2px step when implementing screens.

Workflow: call `create_session` with the file key first, then `get_design_context` on a screen's node id and adapt the output to Expo components and the tokens in `app/src/constants/theme.ts`. The Figma account (Tobi) has Full seats on "Tobi's Team" and "web dev".
