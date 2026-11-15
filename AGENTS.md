# Nappa — Project Brief for Coding Agents

Read this before making changes. It explains what we are building, for whom, and
the decisions already made.

## What Nappa is

Nappa is a baby tracker app for new parents. Parents log feeds, sleep and
nappies in one tap, both parents see each other's logs in real time, and the app
predicts the baby's next nap window.

**Pitch:** Log in one tap, never lose a log, and know when the next nap is.

- **Target markets:** US, UK, Canada, Europe (English first; French, German,
  Spanish and Chinese (Simplified) later; see Localisation below).
- **Users:** tired parents, often using the app one-handed at night while
  holding a baby.
- **Business model:** freemium subscription. Logging is free; the nap predictor
  and insights are paid.

## Why it exists (problems we fix)

Competitor reviews (Huckleberry, Glow Baby, Baby Daybook, Sprout, Baby Tracker)
repeat the same complaints:

1. The best feature is paywalled and overpriced.
2. Partner sync fails or lags.
3. Data gets lost after updates or phone changes.
4. Logging takes too many taps; timers get left running.
5. Reminders misfire.

**Every technical decision should protect against 2, 3 and 4.** Reliability
beats polish.

## MVP scope (version 1)

- **Logging:** feeds (breast left/right timer, bottle amount, pumping), sleep
  (start/stop timer and manual entry), nappies (wet, dirty, both); edit and
  delete any entry.
- **Today screen:** "time since" last feed, sleep and nappy; next-nap card.
- **Fast access:** iOS home-screen and lock-screen widgets, Live Activity for
  running timers, night mode.
- **Sharing:** invite a partner by link or code; real-time sync; works offline;
  shift handover screen.
- **Nap predictor (paid):** next nap window shown as a time range, based on age
  and recent sleep, with "too early / too late" feedback that adjusts it.
- **Foundations:** one baby profile, sign in with Apple / Google / email,
  paywall with free trial, daily summary, account deletion.

**Not in the MVP:** Apple Watch, voice logging, AI insights, charts, growth
tracking, PDF reports, multiple children, guest caregivers, solids, milestones.
Do not build these unless asked.

## Free vs paid

| Free                                 | Paid (Nappa Plus)                        |
| ------------------------------------ | ---------------------------------------- |
| All logging, timeline, daily summary | Nap predictor                            |
| One partner with sync                | Weekly insights (v2)                     |
| Widgets, night mode                  | Charts, PDF report (v2)                  |
| Data export (always free)            | Guest caregivers, multiple children (v2) |

**Pricing (working assumption):** $4.99/month, $39.99/year, 7-day free trial; a
$49.99 one-time "first-year pass" is under consideration. No third-party ads at
launch.

## Tech stack

- **Monorepo:** `api/` (Laravel) and `app/` (Expo / React Native), one GitHub
  repo.
- **Backend:** Laravel, MySQL, Sanctum token auth for the mobile app, JSON API
  under `/api`.
- **Mobile:** React Native with Expo, TypeScript, development builds (not Expo
  Go).
- **Native code:** Swift only where Expo cannot do it, as local Expo modules in
  `app/modules/`. Treat `app/ios/` and `app/android/` as generated
  (`npx expo prebuild --clean`); never hand-edit them.
- **Widgets / Live Activities:** `expo-widgets`.
- **Payments:** Apple / Google in-app purchases via RevenueCat.
- **Local dev:** Laravel Herd on macOS (`babytracker-api.test`), iOS simulator.

## Hosting constraints (important)

The API launches on **shared hosting**, so:

- No long-running processes: **no Reverb, no always-on queue workers.**
- Real-time updates use **Pusher (or Ably)** via Laravel broadcasting. Code must
  stay protocol-compatible with Reverb so we can switch later by changing `.env`
  only.
- Queue driver is `database`, processed by a cron job every minute. Anything
  time-critical (broadcasting a partner's new log) must happen **in the
  request**, not in a queued job.
- Database is MySQL 8. Use MySQL locally too.

## Sync architecture (local-first)

1. **Write locally first.** Every log is saved to SQLite on the phone
   (`expo-sqlite`); screens read from local data, never wait on the network.
2. **Outbox.** Each change is queued and pushed to the API in the background
   with retries. Record IDs are **UUIDs generated on the device**, so retries
   are idempotent.
3. **Real-time push.** The API broadcasts each saved change on a private
   per-family channel; the partner's phone writes it to its local database.
4. **Silent push notifications** wake the partner's app to pull changes and
   refresh widgets when it is closed.
5. **Catch-up sync** on app open / reconnect: `GET` everything after the last
   server change number. This is the safety net; it must always work on its own.

Rules:

- Order changes by a **server-assigned, increasing change number**, never by
  device clocks. Keep the parent's chosen time (`occurred_at`) for display only.
- Timers are stored as `started_at` plus an optional `ended_at`; either parent
  can stop a timer. Never store a running count.
- Deletes are **soft deletes** (tombstones) so they sync.
- Conflicts: last write wins by server change number.

Any sync change must pass these scenarios on two simulators: both online (update
appears in ~1s); one offline for an hour then reconnects (merges, no
duplicates); one starts a timer, the other stops it; app fully closed then
reopened (current within seconds).

## Design system

Figma file: https://www.figma.com/design/uRRG0z2UlrjjeuCzmTUE4G (pages:
Foundations, Components, Screens).

- **Style:** soft grainy gradients, large rounded cards and pill buttons, big
  numbers, a sleepy cloud mascot (hero, onboarding and paywall only; never on
  logging screens).
- **Font:** Outfit.
- **Colours:**

| Token        | Hex       | Use                                 |
| ------------ | --------- | ----------------------------------- |
| lavender/100 | `#EEE7F8` | Sleep backgrounds                   |
| lavender/300 | `#C9B8E8` | Gradients                           |
| lavender/500 | `#9B86D6` | Sleep accent                        |
| orange/100   | `#FDE6D3` | Feed backgrounds, selected states   |
| orange/500   | `#F28A3C` | Primary buttons, feed accent        |
| yellow/400   | `#F6C65B` | Highlights, gradient end            |
| cream/50     | `#FBF6F2` | Cards, surfaces                     |
| plum/200     | `#E7DFEA` | Borders, dividers                   |
| plum/600     | `#7A6A82` | Secondary text                      |
| plum/900     | `#3E2A47` | Primary text, night-mode background |
| mint/100     | `#DDF2E8` | Nappy backgrounds                   |
| mint/400     | `#7FC8A9` | Nappy accent, success, synced       |

- Each log type has its own colour: **feed = orange, sleep = lavender, nappy =
  mint.**
- Primary actions sit at the bottom of the screen (thumb reach). Tap targets are
  generous.
- Every logging screen needs a night-mode version (dark plum, dimmed accents).

## Localisation

English only today, built so French, German, Spanish and Chinese (Simplified)
can be added later without rewriting screens. Full plan: `docs/i18n.md`.

- **Stack:** `i18next` + `react-i18next` + `expo-localization`; dates, numbers
  and units use native `Intl` through `app/src/lib/format.ts`.
- **No hard-coded user-facing text** in components, notifications, emails or
  API responses. Strings live in `app/src/i18n/locales/en/`; Laravel text lives
  in `api/lang/en/`. The API returns data and error codes, not display
  sentences.
- Data layers store raw values (timestamps, ml, grams); the UI formats them.
- Language follows the device. Units, 12/24h clock and diaper/nappy wording are
  separate user settings, not tied to language.
- Write sentences, not fragments; use plural keys, never string concatenation.
  Layouts must handle text ~40% longer (German) and use logical left/right
  spacing.
- Only add strings to `en`. Other languages are added in batches in M6, with
  native-speaker review (including medical-claim and paywall wording).

## Product rules

- Logging must take one tap wherever possible.
- Never block logging on network, sign-in prompts or upsells. No paywall or ads
  on logging screens.
- Data export is free for everyone; never hold a user's history hostage.
- No medical advice or diagnosis claims. Nappa tracks and shows patterns only.
- Paywall copy must be honest: no fake discounts; renewal terms shown next to
  the purchase button.
- Baby data is sensitive: no ad SDKs, no selling data, minimal analytics.

## Owner

Built by Tobi under Idia Studios Limited.
