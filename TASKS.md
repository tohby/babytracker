# Nappa Board

<!--
Kanban board for the holooooo.markdown-kanban VS Code extension.
Right-click this file → "Kanban" (or Cmd+Shift+P → "Open Kanban Board") to
get a drag-and-drop board with two-way sync back to this file.

FORMAT RULES (the extension only parses tasks that follow these exactly):
  ## Column name              → a kanban column (Todo / In Progress / Blocked / Done)
  ### Task name               → a task card in the column it sits under
  indented "- attr: value"    → task attributes (all optional)

Supported attributes:
  - due: YYYY-MM-DD
  - tags: [tag1, tag2]        → use for milestone + owner, e.g. [M2, @tobi]
  - priority: high | medium | low
  - workload: Easy | Normal | Hard | Extreme
  - steps:                    → sub-checklist, each as "- [ ] step" / "- [x] step"
  - a ```md fenced block      → free-form task description

Moving a card = moving its "### Task" block (and its indented attributes)
under a different "## Column". The extension does this on drag; you or Claude
do it by editing the file. Both edit the same file, so they stay in sync.
-->

## Todo

### Add a 12 step to Spacing in theme.ts and drop the 2px step

  - tags: [M1, @tobi]
  - priority: low
  - workload: Easy

### API locale support: user.locale, Accept-Language, api/lang, localised push text

  - tags: [M1, @tobi]
  - priority: medium
  - workload: Normal
  - steps:
    - [x] users.locale column, set on register
    - [x] API errors return codes, not sentences
    - [ ] Accept-Language middleware, api/lang, localised mail and push
    ```md
    Errors return codes, not display sentences. Push text uses the recipient's locale.
    ```

### Sign in with Apple and Google (app + API)

  - tags: [M1, @tobi]
  - priority: medium
  - workload: Hard
  - steps:
    - [ ] Pick bundle ID / Android package; set in app.json; add eas.json
    - [ ] Apple: confirm Developer Program, enable Sign in with Apple, create .p8 key (Team ID, Key ID)
    - [ ] Google Cloud: consent screen + iOS, Android (SHA-1), Web client IDs
    - [ ] API: POST /api/v1/auth/{apple|google}, verify ID token, social_accounts table, link by verified email only
    - [ ] App: expo-apple-authentication (iOS only) and @react-native-google-signin/google-signin
    ```md
    Blocked on the IDs above, not on code. Apple sends name/email only on first sign-in: send them to the API then. Account deletion must revoke the Apple token (needs the .p8). Can slip to M2 without blocking M1.
    ```

### Build login and create-account screens

  - tags: [M1, @tobi]
  - priority: high
  - workload: Normal
    ```md
    Figma: 06 Login (19:241) and Onboarding 00-2 / 00-2b.
    ```

### Build onboarding flow (about baby, last wake, first prediction)

  - tags: [M1, @tobi]
  - priority: medium
  - workload: Hard
    ```md
    Figma: Onboarding section 24:261, frames 00-1 to 00-5b.
    ```

### Settings: units (ml/oz, kg/lb), date format, diaper/nappy wording

  - tags: [M1, @tobi]
  - priority: medium
  - workload: Normal

### Wire Home header and greeting to the API

  - tags: [M1, @tobi]
  - priority: medium
  - workload: Easy

### Events table and API (type, start, end, payload, client id)

  - tags: [M2, @tobi]
  - priority: high
  - workload: Hard
    ```md
    Idempotent writes keyed by a client-generated id, so offline retries never duplicate. Soft deletes and updated_at for sync. Decide this before building the app side.
    ```

### Quick-log buttons for sleep, feed and diaper

  - tags: [M2, @tobi]
  - priority: high
  - workload: Normal
    ```md
    Figma component: Log button.
    ```

### Live sleep timer and nursing timer (left/right side)

  - tags: [M2, @tobi]
  - priority: high
  - workload: Hard

### Edit, delete and backdate entries

  - tags: [M2, @tobi]
  - priority: high
  - workload: Normal

### Offline-first local store and sync queue in the app

  - tags: [M2, @tobi]
  - priority: high
  - workload: Extreme

### Drive Home tiles from real events (last feed, awake for, last nappy, sleep today)

  - tags: [M2, @tobi]
  - priority: medium
  - workload: Normal

### Timeline day view

  - tags: [M3, @tobi]
  - priority: high
  - workload: Hard

### Daily summaries and charts

  - tags: [M3, @tobi]
  - priority: medium
  - workload: Hard

### More log types: pumping, solids, medication, growth, activities

  - tags: [M3, @tobi]
  - priority: medium
  - workload: Hard

### Caregiver invites and shared baby access

  - tags: [M4, @tobi]
  - priority: high
  - workload: Hard

### Multi-device sync: conflict handling and loss-proof tests

  - tags: [M4, @tobi]
  - priority: high
  - workload: Extreme

### Multiple children and twins, trend comparison

  - tags: [M4, @tobi]
  - priority: medium
  - workload: Hard

### Source and document public wake-window ranges by age

  - tags: [M5, @tobi]
  - priority: high
  - workload: Normal
    ```md
    Cite pediatric sources in the repo. Start at 2 months. Below 6 months, show sleepy-cue guidance alongside.
    ```

### Wake-window prediction engine (age-based, personalised from logs)

  - tags: [M5, @tobi]
  - priority: high
  - workload: Extreme

### "Why this time" explanation and custom wake windows

  - tags: [M5, @tobi]
  - priority: medium
  - workload: Hard

### Replace sample next-nap data on Home with the engine

  - tags: [M5, @tobi]
  - priority: medium
  - workload: Normal

### Decide pricing model (free plus one-time vs subscription)

  - tags: [M6, @tobi]
  - priority: high
  - workload: Easy
    ```md
    Verify current competitor prices in the stores first. Decision shapes the paywall and the "your data stays free" promise.
    ```

### Paywall screen and purchase flow

  - tags: [M6, @tobi]
  - priority: medium
  - workload: Hard
    ```md
    Figma: 05b Paywall v2.
    ```

### Opt-in reminders and push notifications

  - tags: [M6, @tobi]
  - priority: medium
  - workload: Hard

### Home screen and lock screen widgets

  - tags: [M6, @tobi]
  - priority: low
  - workload: Hard

### Data export and account deletion

  - tags: [M6, @tobi]
  - priority: high
  - workload: Normal

### Privacy policy, GDPR and children's-data review, hosting region decision

  - tags: [M6, @tobi]
  - priority: high
  - workload: Normal

### Add first extra languages (fr, de, es, then zh-Hans)

  - tags: [M6, @tobi]
  - priority: medium
  - workload: Hard
    ```md
    docs/i18n.md Phase 3. Native-speaker review incl. medical-claim and paywall wording. Add i18n:check CI script, localise app.json metadata, store listings, privacy policy. Settle Chinese font fallback first.
    ```

### Figma: long-German and Chinese variants of Home, a log sheet and paywall

  - tags: [M2, @tobi]
  - priority: low
  - workload: Normal
    ```md
    Catch truncation before it is built.
    ```

### Crash reporting and store listing assets

  - tags: [M6, @tobi]
  - priority: medium
  - workload: Normal

## In Progress

### i18n foundation: i18next, expo-localization, en resources, format helpers

  - tags: [M1, @tobi]
  - priority: high
  - workload: Normal
  - steps:
    - [x] Install i18next, react-i18next, expo-localization; plugin supportedLocales ["en"]
    - [x] src/i18n (instance, typed keys, AppState re-read for Android) and lib/format.ts
    - [ ] Check the dev log `[i18n] ... Intl support` on a real iOS and Android device
    ```md
    Do before login/onboarding screens. Plan in docs/i18n.md Phase 0: install with `npx expo install`, add `expo-localization` plugin (supportedLocales ["en"]), create src/i18n and src/lib/format.ts, verify Intl (PluralRules, DateTimeFormat, NumberFormat, RelativeTimeFormat) on a device.
    ```

### Extract Home strings to en resources; make data/home.ts raw values

  - tags: [M1, @tobi]
  - priority: high
  - workload: Normal
  - steps:
    - [x] common.json + home.json; Home, header, nav, tiles use t()
    - [x] data/home.ts holds ISO timestamps, ms, ml and enums; useNow keeps times live
    - [ ] Check Home on a device (feed-due card shrinks "~3:10 pm" to fit)
    ```md
    Replace pre-formatted sample strings ('2h 10m', 'Window until 2:10 pm') with timestamps/ms/ml formatted at render. Greeting uses t().
    ```


## Blocked

## Done

### Auth API: register, login, logout, token (Sanctum)

  - tags: [M1, @tobi]
  - priority: high
  - workload: Normal
  - due: 2026-11-15
    ```md
    /api/v1/auth/register|login|logout and /api/v1/me. One Sanctum token per device. Errors are codes ({"code":"validation_failed","errors":{"email":["unique"]}}), handled in app/Http/Api/ApiErrors.php. Login throttled (api-auth limiter). No email verification mail sent yet.
    ```

### Babies table and API (name, birth date, timezone)

  - tags: [M1, @tobi]
  - priority: high
  - workload: Normal
  - due: 2026-11-15
    ```md
    Design for multiple babies per account from the start (twins).
    Done: ULID ids, baby_user pivot with owner/caregiver role (ready for M4), soft deletes, /api/v1/babies CRUD, BabyPolicy (strangers get 404, only owner deletes).
    ```


### Commit the Home UI, theme and Uniwind work

  - tags: [M1, @tobi]
  - priority: high
  - workload: Easy
  - due: 2026-11-15


### Hostinger deploy pipeline with SSH auto-deploy

  - tags: [M0, @tobi]
  - due: 2026-11-13

### Add /api/ping and API client in the app

  - tags: [M0, @tobi]
  - due: 2026-11-13

### Rename app to Nappa

  - tags: [M0, @tobi]
  - due: 2026-11-14

### Competitor research: Huckleberry teardown and landscape

  - tags: [M0, @tobi]
  - due: 2026-11-15

### Figma designs: screens, paywall, login, onboarding

  - tags: [M0, @tobi]
  - due: 2026-11-14

### Home screen UI on sample data

  - tags: [M0, @tobi]
  - due: 2026-11-14
    ```md
    Built but uncommitted. See "Commit the Home UI" in Todo.
    ```
