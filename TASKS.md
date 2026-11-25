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

### API locale support: user.locale, Accept-Language, api/lang, localised push text

  - tags: [M1, @tobi]
  - priority: medium
  - workload: Normal
  - steps:
    - [x] users.locale column, set on register
    - [x] API errors return codes, not sentences
    - [ ] Accept-Language middleware, api/lang, localised mail and push
    ```md
    Not started: no Accept-Language middleware yet. Errors return codes, not display sentences. Push text uses the recipient's locale.
    ```

### Settings: units (ml/oz, kg/lb), date format, diaper/nappy wording

  - tags: [M1, @tobi]
  - priority: medium
  - workload: Normal
    ```md
    Not started. format.ts already has VolumeUnit and WeightUnit types; no setting or storage yet.
    ```

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
    Ranges are cited only in a comment in lib/onboarding/age.ts; move to a doc in the repo. Start at 2 months. Below 6 months, show sleepy-cue guidance alongside.
    ```

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
    ```md
    Partly built: account deletion (email code, API and screen) and CSV/JSON export via the share sheet. Left: PDF export, deletion must revoke the Apple token once social sign-in exists, and confirm deletion removes events and avatars.
    ```

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


### Verify onboarding and quick unlock on devices

  - tags: [M1, @tobi]
  - priority: high
  - workload: Hard
  - steps:
    - [x] iOS simulator intro, wrong and valid email codes, PIN mismatch, cold lock, setup and Today
    - [x] iOS simulator 60-second background lock, five-try lockout across restart, and email recovery
    - [ ] iOS and Android native builds including physical Face ID and fingerprint
    - [ ] Email OTP autofill and expired-code UI on a physical device
    - [ ] Biometric denial and enrolment changes on a physical device
    - [ ] Compare A01–D10 and long German layouts with the Nov 21 Figma page

### Verify M2 logging and sync on devices

  - tags: [M2, @tobi]
  - priority: high
  - workload: Hard
  - steps:
    - [ ] Development build run: create, edit, delete, backdate, timer completion, reopen
    - [ ] Offline retry: log in airplane mode, reconnect, no duplicates
    - [ ] Two-device catch-up: delete and edit reach the other phone and stay deleted
    - [ ] Write native SQLite tests: migration, persistence, account isolation
    - [ ] Run the API suite against MySQL (production database)
    - [ ] Confirm logs from a second account on the same phone stay separate
    ```md
    Acceptance for M2: a parent runs a full day with no sample data. Plan: docs/superpowers/plans/2026-11-19-m2-logging-sync.md task 3.
    ```

### M3 screens: Timeline, Insights, Growth and extra log types

  - tags: [M3, @tobi]
  - priority: high
  - workload: Hard
  - steps:
    - [x] Timeline tab and day view
    - [x] Insights tab: day totals, trends, stat cards
    - [x] Pumping, solids, medicine, growth, activity log screens
    - [ ] Check summaries and charts against a week of real logs on a device
    - [ ] Confirm every new type round-trips through the events API payload rule
    - [ ] Long-German layout check of Timeline and Insights
    ```md
    UI exists on local events (timeline, insights, growth, pumping, solids, medicine, growth, activity logs). Replaces the three M3 Todo cards.
    ```

### Nap prediction engine v1 (client) and explanation screens

  - tags: [M5, @tobi]
  - priority: high
  - workload: Extreme
  - steps:
    - [x] Age-based window and median personalisation; none under 8 weeks
    - [x] Why this time and sources screens
    - [x] Local nap reminder via scheduleReminder
    - [ ] Unit tests for prediction.ts (none exist)
    - [ ] Custom wake windows
    - [ ] Wake-window report
    - [ ] Wire notification toggles to scheduling and cancel stale reminders
    ```md
    lib/prediction.ts, next-nap, next-nap-why and next-nap-sources exist. Replaces the Wake-window engine and "Why this time" Todo cards for v1.
    ```

## Blocked

### Sign in with Apple and Google (app + API)

  - tags: [M2, @tobi]
  - priority: medium
  - workload: Hard
  - steps:
    - [x] iOS bundle ID com.madebyidia.nappa set
    - [ ] Pick Android package; set in app.json; add eas.json
    - [ ] Apple: confirm Developer Program, enable Sign in with Apple, create .p8 key (Team ID, Key ID)
    - [ ] Google Cloud: consent screen + iOS, Android (SHA-1), Web client IDs
    - [ ] API: POST /api/v1/auth/{apple|google}, verify ID token, social_accounts table, link by verified email only
    - [ ] App: expo-apple-authentication (iOS only) and @react-native-google-signin/google-signin
    ```md
    **Blocked** on Apple .p8 / Team ID, Google client IDs, Android package and eas.json, not on code. Apple sends name/email only on first sign-in: send them to the API then. Account deletion must revoke the Apple token (needs the .p8). Moved from M1 to M2 on 2026-11-21 so it no longer gates M1.
    ```

### Quick unlock settings need design

  - tags: [M2, @tobi, needs-design, blocked]
  - priority: medium
    ```md
    Design change PIN, biometrics toggle, and turn quick unlock off.
    ```

## Done

### Replace sample next-nap data on Home with the engine

  - tags: [M5, @tobi]
    ```md
    Home uses useNapPrediction (lib/prediction.ts). The sample rhythm in data/home.ts is only the age-based fallback.
    ```

### Drive Home tiles from real events (last feed, awake for, last nappy, sleep today)

  - tags: [M2, @tobi]
    ```md
    Today reads useBabyEvents; first-day empty state, feed-due card and 7-day average.
    ```

### Offline-first local store and sync queue in the app

  - tags: [M2, @tobi]
    ```md
    expo-sqlite with account-scoped tables, outbox, 30s polling and foreground catch-up, AsyncStorage migration. Native SQLite tests still to write (see verify card).
    ```

### Edit, delete and backdate entries

  - tags: [M2, @tobi]
    ```md
    entry/[id] and entry/edit; deletes are tombstones that sync.
    ```

### Live sleep timer and nursing timer (left/right side)

  - tags: [M2, @tobi]
    ```md
    Pause, resume, switch side and stop in the log store; pumping timer too. Running timers are device-local until stopped.
    ```

### Quick-log buttons for sleep, feed and diaper

  - tags: [M2, @tobi]
    ```md
    Log index plus feed, nappy, nap, nursing, pumping, solids, medicine, growth and activity screens. Not device-verified.
    ```

### Events table and API (type, start, end, payload, client id)

  - tags: [M2, @tobi]
    ```md
    Idempotent PUT keyed by client UUID with mutation receipts, soft deletes, per-baby change numbers and a paginated catch-up feed. 175 API tests pass on SQLite (MySQL not run).
    ```

### Wire Home header and greeting to the API

  - tags: [M1, @tobi]
    ```md
    Today uses the current baby and account name from the API with a time-of-day greeting.
    ```

### Intro screens

  - tags: [M1, @tobi]
    ```md
    Sleeping, Feeding and Happy with Continue, Skip and Log in. [Figma A01–A03](https://www.figma.com/design/uRRG0z2UlrjjeuCzmTUE4G?node-id=429-4)
    ```

### Email-code sign-in and create account

  - tags: [M1, @tobi]
    ```md
    Six-digit code input, paste and autofill. API error codes drive wrong-code, expiry and email-in-use states. [Figma C01–C06](https://www.figma.com/design/uRRG0z2UlrjjeuCzmTUE4G?node-id=429-137)
    ```

### Baby setup and first prediction

  - tags: [M1, @tobi]
    ```md
    Five steps. B03–B05 can be skipped. B06 leads to Today. [Figma B01–B06](https://www.figma.com/design/uRRG0z2UlrjjeuCzmTUE4G?node-id=429-32)
    ```

### Create and confirm a device PIN

  - tags: [M1, @tobi]
    ```md
    Four digits, salted hash in SecureStore, and a confirmation mismatch state. [Figma D02–D04](https://www.figma.com/design/uRRG0z2UlrjjeuCzmTUE4G?node-id=429-254)
    ```

### Choose quick unlock and enable biometrics

  - tags: [M1, @tobi]
    ```md
    Offer enrolled biometrics with a backup PIN and platform-specific labels. [Figma D01, D05–D06](https://www.figma.com/design/uRRG0z2UlrjjeuCzmTUE4G?node-id=429-238)
    ```

### Root unlock gate and repeated lockout

  - tags: [M1, @tobi]
    ```md
    Cold start and 60-second background lock. A persisted failure counter controls escalating pauses. [Figma D07–D09](https://www.figma.com/design/uRRG0z2UlrjjeuCzmTUE4G?node-id=429-334)
    ```

### Recover a forgotten PIN with an email code

  - tags: [M1, @tobi]
    ```md
    Verify the same email account and require a new PIN before unlocking. [Figma D07–D09, C01–C04](https://www.figma.com/design/uRRG0z2UlrjjeuCzmTUE4G?node-id=429-334)
    ```

### Biometrics unavailable state

  - tags: [M1, @tobi]
    ```md
    System Settings or PIN fallback when biometrics are denied or no longer enrolled. [Figma D10](https://www.figma.com/design/uRRG0z2UlrjjeuCzmTUE4G?node-id=429-382)
    ```

### Import onboarding tokens and 3D mascot assets

  - tags: [M1, @tobi]
    ```md
    Four brand tokens and selected state aligned. Nine Figma poses exported at 1×, 2× and 3×. [Figma Nov 21 exploration and Mascot asset library](https://www.figma.com/design/uRRG0z2UlrjjeuCzmTUE4G?node-id=429-2)
    ```

### Add a 12 step to Spacing in theme.ts and drop the 2px step

  - tags: [M1, @tobi]
  - priority: low
  - workload: Easy
  - due: 2026-11-17
    ```md
    Spacing now uses the Figma token names and values (xs 4, sm 8, md 12, lg 16, page 20, xl 24, 2xl 32, 3xl 48), the same as --spacing-* in global.css. The 2px and 64px steps are gone; only Expo starter files used them.
    ```

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
    Committed in 023c469.
    ```

