# Huckleberry teardown

Researched 2026-11-14/15 from public sources only (no hands-on use of the app). Pricing and tier contents vary between sources; verify in the App Store before relying on any figure. Items marked *(unverified)* come from general knowledge, not a source below.

## Tiers and pricing

| Tier | Price (per sources) | Contents |
|---|---|---|
| Free | $0 | Logging for sleep, breast/bottle feeds, diapers, pumping, medication, growth, solids, activities (bath, tummy time); day view; daily charts and summaries; reminders; multi-caregiver sync |
| Plus | $9.99/mo or ~$58.99/yr | SweetSpot nap/bedtime predictor, Schedule Creator, Insights, widgets, enhanced sleep and solids reports, wake-windows-vs-SweetSpot report, Apple Watch |
| Premium | $14.99/mo or ~$119.99/yr | Everything in Plus, plus Berry AI chat (launched Feb 2026), custom sleep plan from pediatric sleep experts (one assessment per month) |

No free trial for Premium at time of the FAQ.

## Feature map

**Logging (free)**
- Sleep with live timer; nursing timer with left/right side tracking; bottle; pumping; diapers; solids; medication; growth; activities (bath, tummy time, etc.)
- Tube-feeding support, built with C.S. Mott Children's Hospital experts
- Day view of the whole day's timeline
- Editing and backdating entries

**Sharing (free)**
- Multiple caregivers on one child, synced. Reviewers' most consistent praise.

**Prediction (Plus): SweetSpot**
- Starts from published age-based wake windows, then adjusts to logged sleep. One logged sleep is enough for a first prediction.
- Stays inside published age ranges rather than fully personalising.
- Supports 2 months and up. For 2 to 6 months Huckleberry itself recommends combining wake windows with sleepy cues.
- Custom/manual mode: nudge wake windows longer or shorter, or enter exact values. Defaults update as the child ages.
- Report comparing actual awake times with SweetSpot's suggestions.
- Naps logged close together are treated as one nap.
- No independent accuracy evaluation found.

**Premium**
- Berry AI: chat that uses the child's logged data plus pediatric expertise.
- Custom sleep plan from human sleep experts.

**Other** *(unverified)*: growth percentile charts, milestones and development content, multiple children, data export.

## Where users complain (opportunities)

1. **Paywall bait-and-switch.** Reviewers say SweetSpot used to be free and moved behind a subscription (complaints cluster around March 2025). One reviewer paid $76, then was asked for more to unlock the widget. Several call it a money grab.
2. **Upgrade pop-ups.** The most common complaint in third-party summaries.
3. **Gated basics.** Widgets and Apple Watch sit behind the subscription.
4. **Reliability.** Reports of crashes, screens failing to load, forced logouts after updates (release 0.9.296 on Android fixed a logout bug), and lag when editing entries. A release also fixed older activities (bath, tummy time) disappearing.
5. **Prediction gaps.** Bedtime suggestion sometimes doesn't appear, and users dispute prediction accuracy.

## Competitor landscape

- Napper: sleep-focused, trial-based rather than a free tier.
- Sprout Baby: strong charts and growth; reviews flag data loss and device transfer issues.
- Baby Tracker (Nighp): free with a one-time purchase.
- Nara Baby: reported free and ad-free by older sources, but the newest source says it is paid after a 7-day trial. Unresolved.

See [landscape.md](landscape.md) for the full comparison.

## Implications for Nappa

- **Match:** free logging set, live timers, day view, multi-caregiver sync, age-based wake-window prediction, custom wake windows.
- **Beat:** make basic prediction and widgets free or cheap; never gate data users already logged; reliable offline-first sync; fast edits; no upgrade pop-up spam.
- **Skip for now:** human sleep-plan coaching, AI chat, tube-feeding, Apple Watch.
- **Decide:** pricing model (free + low one-time unlock vs. subscription for advanced features only).
- **Own the prediction:** build it on public pediatric wake-window ranges, not by imitating SweetSpot output.

## Sources

- https://apps.apple.com/us/app/huckleberry-baby-tracker/id1169136078
- https://huckleberrycare.com/huckleberry-plus-announcement
- https://huckleberrycare.com/huckleberry-plus-faq
- https://huckleberrycare.com/product/sweetspot
- https://huckleberrycare.com/blog/how-to-use-our-magical-sleep-predictor-sweetspot
- https://huckleberrycare.com/blog/our-magical-sleep-predictor-sweetspot-is-now-even-better
- https://huckleberry.zendesk.com/hc/en-us/articles/39174325077139-What-age-range-is-SweetSpot-for
- https://huckleberry.zendesk.com/hc/en-us/articles/360053175093-SweetSpot-Manual-Mode-What-is-it-and-how-do-I-use-it
- https://huckleberry.zendesk.com/hc/en-us/articles/4404741421331-What-s-the-Wake-Windows-vs-SweetSpot-report-How-do-I-read-the-report
- https://huckleberrycare.com/day-view-free-app-feature
- https://prnewswire.com/news-releases/huckleberry-expands-support-for-infants-on-feeding-tubes-302055707.html
- https://www.ocbj.com/oc-homepage/berry-provides-specialized-expert-vetted-ai-to-help-with-babies-young-children/
- https://www.apkmirror.com/apk/huckleberry-labs/huckleberry-baby-child-tracker-sleep-experts/huckleberry-smart-baby-care-0-9-296-release/
- https://www.rootwise.app/en/huckleberry-review/
- https://appsupports.co/1169136078/huckleberry-baby-child/negative-reviews
- https://apps.apple.com/ca/app/huckleberry-baby-tracker/id1169136078?see-all=reviews&platform=ipad
