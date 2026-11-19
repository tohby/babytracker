# V2 design implementation

How the Figma V2 design (file `uRRG0z2UlrjjeuCzmTUE4G`, page "Design System & Components" and the `V2 ·` pages) maps onto the app, and what is still open. Values were read from the file with the Figma MCP tools, not from screenshots.

## 1. Tokens

| Figma | Code | Notes |
|---|---|---|
| `V2 · Color` (Light, Dark), 51 tokens | `app/src/constants/color-tokens.ts` → generated block in `app/src/global.css` | `color/background/canvas` → `--color-background-canvas` → class `bg-background-canvas`. Light is the default, Dark is Uniwind's `dark` variant. Aliases are resolved to hex at generate time (`npm run theme:generate`; `theme:check` in CI). |
| `V2 · Primitives` (73) | `primitives` in `color-tokens.ts` | Private: only used to resolve aliases, never emitted as CSS. |
| `Nappa Spacing` (2xs 2 … 4xl 64) | `--spacing-*` in `global.css`, `Spacing` in `constants/theme.ts` | `p-lg`, `gap-md`, `px-page`, `mb-4xl`. |
| `V2 · Shape & Size` radius/* | `--radius-*`, `Radius` | `rounded-xs` … `rounded-2xl`, `rounded-full`. |
| `V2 · Shape & Size` size/* | `--spacing-<size>`, `Size` | In the spacing namespace so `h-control-lg`, `size-avatar-md`, `min-h-touch-min` work. |
| `V2 · Shape & Size` border/* | `BorderWidth` | Tailwind bare widths: hairline `border`, strong `border-2`, focus `border-3`. |
| 17 `V2/*` text styles | `Typography` in `constants/theme.ts`, `<Text variant>` | Outfit Light/Regular/Medium/SemiBold via `@expo-google-fonts/outfit` (loaded in the root layout). Letter spacing converted from % to px. |
| `V2/Elevation/1 · Card`, `2 · Floating`, `3 · Overlay` | `Elevation`, `useElevation()` | `boxShadow` strings; `useElevation` returns none in Dark (surface colour carries elevation). |

### Typography map

| Variant | Figma style | Font | Size / line | Tracking |
|---|---|---|---|---|
| `display-numeric` | Display/Numeric | SemiBold | 44 / 48 | −0.44 |
| `display-light` | Display/Light | Light | 40 / 44 | −0.40 |
| `title-large` | Title/Large | SemiBold | 30 / 36 | −0.15 |
| `title-medium` | Title/Medium | SemiBold | 24 / 30 | −0.12 |
| `heading` | Heading | SemiBold | 18 / 24 | 0 |
| `subheading` | Subheading | Medium | 16 / 22 | 0 |
| `body` | Body/Regular | Regular | 16 / 24 | 0 |
| `body-small` | Body/Small | Regular | 14 / 20 | 0 |
| `label-large` | Label/Large | Medium | 15 / 20 | 0 |
| `label-small` | Label/Small | Medium | 13 / 18 | 0 |
| `caption` | Caption | Regular | 12 / 16 | 0 |
| `button-large` | Button/Large | SemiBold | 17 / 22 | 0 |
| `button-small` | Button/Small | SemiBold | 14 / 18 | 0 |
| `numeric-large` | Numeric/Large | SemiBold | 28 / 32 | −0.14 |
| `numeric-medium` | Numeric/Medium | SemiBold | 20 / 24 | 0 |
| `numeric-timer` | Numeric/Timer | Light | 56 / 60 | −0.56 |
| `tab-label` | Tab label | Medium | 11 / 13 | +0.11 |

### Didn't map cleanly

| Item | What happened |
|---|---|
| `border/*` widths | No Tailwind namespace for border widths; bare `border`/`border-2`/`border-3` match the values. |
| Elevation shadow colour | Effect styles use a raw slate-900 rgba, not a variable; kept as `rgba(23, 38, 46, α)` in `theme.ts`. |
| `color/background/scrim` | Opaque token; Figma applies 40% layer opacity. Code uses `bg-background-scrim opacity-40`. Native sheets draw their own dimming and can't take the token. |
| Letter spacing | Figma stores %, RN wants px; rounded to 0.01 px. |
| `Glass/Card`, `Glass/Pill` effect styles | V1 styles, not used by V2. |
| `V2 · Primitives` | Not marked hidden from publishing (variables have empty scopes, so they are hidden from pickers). |
| No static black in V2 | Apple sign-in uses `text/primary` per the V2 component, so it inverts in Dark (as documented). |

## 2. Components

Generic pieces live in `app/src/components/ui/`, baby-tracking ones in `components/tracking/`, charts in `components/charts/`, platform chrome in `components/chrome/`.

| Figma component | Code |
|---|---|
| Button (Hierarchy × Size × State) | `ui/button.tsx` (new; replaces V1 PrimaryButton/TextButton) |
| Icon button | `ui/icon-button.tsx` (rewritten) |
| Chip | `ui/chip.tsx` (rewritten) |
| Sign-in button | `ui/sign-in-button.tsx` |
| Field (Text/Select), Search field | `ui/field.tsx`, `ui/search-field.tsx`; `ui/text-field.tsx` is now Field + password toggle |
| Selection control (Toggle/Checkbox/Radio) | `ui/selection-control.tsx` (replaces V1 checkbox/radio) |
| Stepper, Segmented control | `ui/stepper.tsx`, `ui/segmented-control.tsx` |
| Card (Tone), Section header | `ui/card.tsx` (replaces GlassCard), `ui/section-header.tsx` |
| List row, List group, Divider | `ui/list-row.tsx` (rewritten, exports ListGroup), `ui/divider.tsx` |
| Bottom sheet (Size, Content slot) | `ui/bottom-sheet.tsx` (body of every native form-sheet route) |
| Dialog, Tooltip, Insight card | `ui/dialog.tsx`, `ui/tooltip.tsx`, `ui/insight-card.tsx` |
| Hero, Option card | `ui/hero.tsx`, `ui/option-card.tsx` |
| Header, Top bar, Date pill / Date strip, Child switcher | `ui/header.tsx`, `ui/top-bar.tsx`, `ui/date-strip.tsx`, `ui/child-switcher.tsx` |
| Banner, Toast, Sync status, Spinner, Badge, Badge/Dot | `ui/banner.tsx` (+ `status-banner.tsx` two-line variant for auth), `ui/toast.tsx` (+ provider), `ui/sync-status.tsx`, `ui/spinner.tsx`, `ui/badge.tsx` |
| Avatar, Icon tile, Page indicator | `ui/avatar.tsx` (rewritten), `ui/icon-tile.tsx`, `ui/page-indicator.tsx` |
| Skeleton, State (Empty/Error/Offline) | `ui/skeleton.tsx`, `ui/state-view.tsx` |
| Icon/* (54) | `ui/icon.tsx` + `assets/icons/*.svg` exported from Figma; tinted by colour token (`tone`) |
| Mascot poses (asset library, nine) and App Icon / Peach close-up | `ui/mascot.tsx` (`Mascot`, `AppIcon`); see section 5 |
| Log tile, Since-last tile, Next nap card, Reason tile, Prediction feedback | `tracking/log-tile.tsx`, `since-last-tile.tsx`, `next-nap-card.tsx`, `reason-tile.tsx`, `prediction-feedback.tsx` |
| Side toggle, Timer card, Timer mini bar, Time row | `tracking/side-toggle.tsx`, `timer-card.tsx`, `timer-mini-bar.tsx`, `time-row.tsx` (+ `components/log/when-row.tsx` with the native picker) |
| Nappy picker, Amount picker, Timeline entry, Day summary | `tracking/nappy-picker.tsx`, `amount-picker.tsx`, `timeline-entry.tsx`, `day-summary.tsx` |
| Growth measurement, Baby profile card, Family member row, Plan card, Perk row | `tracking/growth-measurement.tsx`, `baby-profile-card.tsx`, `family-member-row.tsx`, `plan-card.tsx` |
| Week chart, Mini bars, Day strip, Legend item, Stat card, Progress bar, Wake-window ring, Line chart | `charts/*` (react-native-svg) |
| Nav item + Bottom nav | `chrome/bottom-nav.tsx` |
| Android/Navigation bar (+ FAB) | `chrome/android-nav-bar.tsx` |
| iOS/Tab bar, Tab item, Glass FAB | system tab bar via `expo-router/native-tabs` in `app/(tabs)/_layout.tsx` |
| iOS/Tab bar accessory | `chrome/timer-accessory.tsx` (NativeTabs.BottomAccessory) |
| iOS/Glass icon button, iOS/Top bar · glass | `chrome/glass-top-bar.tsx` (GlassIconButton, HeroTopBar) |

`app/src/app/dev-components.tsx` previews every component (`?section=1..4`), development builds only.

## 3. Screens

| Figma frame | Route / file |
|---|---|
| V2-A01 Launch · loading / A01b | `components/splash/*` (V1 splash layout on V2 tokens, now with the new mascot) |
| V2-A02 Welcome | `(auth)/welcome.tsx` → `components/auth/intro-screen.tsx` |
| V2-A03 Sign in (+ b error, c signing in) | `(auth)/sign-in.tsx` |
| V2-A05 Forgot password, A06 Check your email | `(auth)/forgot-password.tsx`, `(auth)/check-email.tsx` |
| V2-A07 / A08 Create account | `(auth)/create-account.tsx` |
| V2-B01 … B06 Onboarding | `onboarding/[step].tsx` (V1 step structure on V2 components, see gaps) |
| V2-C01 Today, C02 nap running, C03 first day, C04 loading, C05 offline | `(tabs)/today.tsx` |
| V2-D01 Quick log sheet | `log/index.tsx` |
| V2-D02 Log a nap, D03 Sleep timer, D04 Nap saved | `log/nap.tsx`, `log/sleep-timer.tsx`, `log/saved.tsx` |
| V2-D05 Feed · bottle, D06 Nursing timer, D07 Nappy | `log/feed.tsx`, `log/nursing.tsx`, `log/nappy.tsx` |
| V2-D08 Entry detail, D10 Delete confirm | `entry/[id].tsx` |
| V2-D09 Edit entry, D09b validation | `entry/edit.tsx` |
| V2-D12 Pumping … D16 Activity | `log/pumping.tsx` (+ `log/pumping-timer.tsx`), `log/solids.tsx`, `log/medicine.tsx`, `log/growth.tsx`, `log/activity.tsx` |
| V2-E01 Timeline · day, E02 empty, E04 deleted | `(tabs)/timeline.tsx` |
| V2-E03 Timeline · filter | `timeline-filter.tsx` |
| Sheet content/Still learning | `still-learning.tsx` |
| V2-F01 / F02 Insights | `(tabs)/insights.tsx` |
| V2-F03 Growth (F03b) | `growth.tsx` |
| V2-F04 Next nap, F07 still learning, F08 under 2 months | `next-nap.tsx` |
| V2-F05 Why this time, F06 Sources & method | `next-nap-why.tsx`, `next-nap-sources.tsx` |
| V2-G01 Family (G03 pending) | `(tabs)/family.tsx` |
| V2-G02 Invite a caregiver | `family/invite.tsx` |
| V2-G06 Sync & devices, G09 Child switcher | `sync.tsx`, `child-switcher.tsx` |
| V2-H01 Settings, H04, H06 (H06b), H09, H10 (H10b) | `settings/index.tsx`, `settings/language.tsx`, `settings/notifications.tsx`, `settings/export.tsx`, `settings/delete-account.tsx` |
| V2-I01 Nappa Plus, I02 you're all set | `plus.tsx`, `plus-done.tsx` |

Logging is local-first (`data/log-store.tsx`, AsyncStorage) because the events API (M2) doesn't exist yet; every entry is marked "pending sync" and the UI says "saved on this phone".

## 5. Mascot and app icon

The V2 Figma screens and the `Mascot/Art` components still show the old panda; the new baby mascot lives in the "Asset Library" on the Mascot page (nine poses, "Source PNGs · mascots v2"). The app uses the new set.

| Pose | Used for (Figma guide) | Where in the app |
|---|---|---|
| `standing` | Default / greeting | Welcome hero, splash, onboarding meet/name/routine/basics, Next nap "learning", Still learning, sleep-timer empty, empty states, verify/check-email |
| `happy` | Success, celebration | Nappa Plus (I01, I02), onboarding plan reveal |
| `sleeping` | Nap or night sleep | Next nap, sleep timer, Sleep log tile, onboarding sleep, locked sign-in, offline state |
| `feeding` | Feeds | Feed log tile, onboarding plan |
| `swaddled` | Bedtime, calm | Next nap "too young" (card and hero) |
| `nappy-change` | Nappy logging | Nappy log tile |
| `fussy` | Overtired, gentle errors | Error state, offline sign-in |
| `playing`, `crying` | Milestones / awake time; fussy period, soothing | Imported, not placed yet (no screen asks for them) |

The art is a 1024 px transparent cutout on a square frame with the feet 3% above the bottom edge; the app ships them at 640 px. The `Mascot` component is now square (`size` is width and height).

**App icon: "Peach close-up"** (the chosen concept; Figma still labels all four "not approved").
- iOS and the top-level icon: `assets/images/icon.png` (1024, opaque, from `icon-peach-closeup-ios-1024`). The Expo template `assets/expo.icon` was removed because `ios.icon` overrode it.
- Android adaptive icon: `android-icon-foreground.png` and `android-icon-background.png` (432 px each, from the Figma android-fg/bg files); fallback colour `#FDCDC0` sampled from the background.
- Favicon (48 px), in-app `AppIcon` (`app-icon.png`, 256 px, rounded 22.4%), and the native splash (`splash-icon.png`, a rounded tile) all come from the same master.
- Splash background colours now match the in-app splash (V2 canvas, Light `#E7EEF0`, Dark `#0E1A20`); they were still the V1 cream/plum.
- Not used: lavender cloud, night sleep, peach face concepts, and the `play-512` store file (kept in Figma, not needed in the repo yet).

## 4. Gaps

### Not implemented or partial

- **Onboarding B01–B06**: the V1 step flow (meet → basics → routine → sleep → growth → plan) was moved onto V2 components and tokens, but not rebuilt into the V2 three-step structure (About your baby, Feeding & units, Last wake, First prediction, Reminders). It needs a mapping onto the onboarding API answers.
- **Sign in / Create account**: Apple and Google sign-in buttons and the "or" divider are not shown; the API has no social sign-in.
- **Family sharing**: no caregiver, invite, device or activity API. Family lists only the signed-in user; the invite sheet shows the role choice with sharing disabled and an explanatory banner; Sync & devices shows this phone only.
- **Events sync**: no events API (M2). Logs live on the phone; sync status is honest ("saved on this phone").
- **Nappa Plus**: no in-app purchase library. Trial and Restore show "purchases aren't available yet"; I02 is reachable but never triggered.
- **Export**: CSV and JSON through the share sheet; PDF not built.
- **Growth WHO band**: no WHO reference data in the app, so the band and its legend aren't drawn rather than invented. F03b error can't happen yet (data is local).
- **Reminders**: Next nap "Remind me" and the 8-week reminder schedule local notifications. The H06 toggles are stored but don't schedule anything yet; the medicine "Remind me next time" toggle isn't saved with the entry.
- **Insights Month**: no V2 frame; implemented as 4 weekly-average bars using the week layout.
- **Pumping timer**: no V2 frame; uses the Timer card (Kind=Pumping) on the nursing-timer layout.
- **Tall sheet actions**: inside a native form sheet the scroll view must be the root, so actions sit at the bottom when content is short and scroll with it when long (not pinned).
- **New mascot, assets and icon:**
  - The Figma `Mascot/Art` components, the V2 screen frames and `Mascot/Face` still show the panda, so Figma and the app now differ until the components are re-pointed at the new art.
  - No "thinking" or "waving" pose exists: learning and greeting states use `standing`, errors use `fussy`.
  - No separate face asset: the onboarding chat avatar uses the Peach close-up app icon.
  - The Android foreground in the Figma export has the peach gradient baked in (opaque, not transparent), so it hides the background layer and the icon can't parallax. The Android themed (monochrome) icon was removed because it was the Expo template silhouette; a one-colour silhouette of the baby is needed to bring it back.
  - The Android files are 432 px (the xxxhdpi size); Expo suggests 1024 for adaptive icons.
- **Liquid Glass not verified on device**: the only simulator is iOS 18 (Expo Go), so the glass tab bar, the 5th Log tab, the bottom accessory and glass top bars were built against the API but only the solid fallback was seen running. Android wasn't run (no emulator).
- **Delete account**: the API needs the password (`DELETE /v1/me`); H10 only asks to type DELETE, so a password field was added under it.

### Design inconsistencies found in Figma

- Android/Navigation bar uses raw values: item fills `#ffffff` (would stay white in Dark), label 13 pt SemiBold not a text style, raw gaps/padding (8/12/16) and radius 16, stroke `#000000`.
- Since-last tile contains a `Spacer` frame (the spacing rule says no spacer frames).
- V2-C01 Content uses 20 (`spacing/page`) between every block, including "Since last" heading → tiles, where the spacing rule asks for `md`.
- V2-D04 Nap saved: summary icon tile uses the **Nappy** tone for a nap (code uses Sleep and says so in a comment), and "Ada slept 45 min" is raw 34 pt text with no text style (code uses Title/Large).
- V2-F04 / B05 reason tiles use the Nappy tone for "Age" and Care for "Short nap" (kept as designed).
- Nappy picker "Both" uses `Icon/check` as its picture (kept).
- Timer mini bar stop button uses `Icon/close` (kept; a stop icon would be clearer).
- Learning threshold reads "Log 3 more naps" on the Next nap card and "2 of 3" in Still learning; code uses 3 naps.
- Checkbox radius 7 and Hero bottom radius 40 aren't on the radius scale.
- Line chart (315:1283) uses raw gap 12, padding 20 and radius 32 instead of variables.
- The V2 icon set has `eye` but no `eye-off`; the password toggle shows state with colour + label.
- V2-H10 asks to type DELETE but the API needs a password (see above).
- No "window has passed" state for the Next nap card; past windows read "Any minute now".

### Dark mode contrast (WCAG)

| Pair (Dark) | Ratio | |
|---|---|---|
| Selected tab label `primary/default` on a dark surface (glass approximation) | 8.3 | passes; needs an iOS 26 device check on real glass |
| `text/on-primary` on `primary/default` | 9.2 | passes |
| `text/tertiary` on `background/surface` / canvas | 5.4 / 6.1 | passes |
| `text/tertiary` on `feature/sleep` | 4.47 | **fails** (avoid tertiary on sleep tiles) |
| `text/disabled` on surface | 2.9 | fails, but WCAG exempts disabled text |
| Toast Undo `primary/ring` on ink | 5.7 | passes |
| Week chart `feature/sleep` bars vs card surface (non-text, needs 3:1) | 1.2 | **fails**: bars almost disappear |
| `surface-muted` (Time row, Search field) vs sheet `surface-raised` | 1.0 | **fails**: both are slate-850 in Dark, so those controls lose their shape on sheets |
| "On colour" spinner (`static/white`) on Dark primary (teal-200) | low | the spinner nearly vanishes inside primary buttons in Dark |

The mascot art is unchanged in both modes. The new baby's warm peach reads well on every Dark hero and feature tone (checked in the simulator).
