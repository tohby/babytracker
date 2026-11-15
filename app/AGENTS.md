This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Localisation (i18n)

The app is English-only now but must stay translatable. Plan and rationale: `../docs/i18n.md`. Re-read the Expo localization guide (https://docs.expo.dev/guides/localization.md) before changing setup.

- Stack: `i18next` + `react-i18next` + `expo-localization`. Install with `npx expo install`. Resources live in `src/i18n/locales/<lang>/<feature>.json`; `en` is the source of truth and the fallback.
- **Never write a user-facing string literal in a component.** Use `const { t } = useTranslation('<feature>')`. This includes `accessibilityLabel`, placeholders, alerts, toasts, empty states, notification text and widget text.
- Keys are typed from the `en` resources; name them by meaning (`home.nextNap.windowUntil`), not by the English text.
- One whole sentence per key with `{{placeholders}}`. Never concatenate fragments or build sentences with `+` or template literals around `t()`.
- Plurals: `key_one`, `key_other` and `t('key', { count })`. No `count === 1 ?` branches.
- Dates, times, durations, numbers, volumes and weights go through `src/lib/format.ts` (built on `Intl` and the user's unit and clock settings). Do not call `toFixed` or hand-format in components.
- `src/data/*` and API types hold raw values (ISO timestamps, ms, ml, g) and ids/enums, never display text.
- Layout: no fixed-width text boxes; allow wrapping; assume ~40% longer text (German) and taller glyphs (Chinese). Use logical spacing (`ms-`/`me-`/`ps-`/`pe-`, `start`/`end`), never `left`/`right`.
- Add new strings to `en` only. Do not machine-translate other languages as part of a feature; that is a separate batch (M6).
- Language follows the device; per-app language comes from the OS via the `expo-localization` plugin's `supportedLocales`. Re-read `getLocales()` when the app returns to the foreground (Android does not restart on language change).
- Outfit has no Chinese glyphs; do not assume the brand font renders every language.

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
