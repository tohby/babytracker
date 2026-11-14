# Nappa

Baby tracking app (naps, feeds, sleep predictions). Monorepo:

- `api/` Laravel 13 + Inertia/React backend, served at https://babytracker.madebyidia.com
- `app/` Expo / React Native mobile app (see `app/AGENTS.md`: check Expo docs, don't trust memory)
- `deploy/` Hostinger deploy scripts; pushing a `v*` tag builds, releases and auto-deploys (see `deploy/README.md`)

## Design (Figma)

Source of truth for UI: **Nappa — Baby Tracker App**
https://www.figma.com/design/uRRG0z2UlrjjeuCzmTUE4G/Nappa-%E2%80%94-Baby-Tracker-App

- File key: `uRRG0z2UlrjjeuCzmTUE4G`
- Pages: Foundations (`0:1`), Components (`1:2`), Screens (`1:3`)
- Screens are 390×844 frames; reusable pieces include `Button/Primary`, `Tile/Time since`, `Chip`, `Log button`, `Bottom nav`, `Mascot/Cloud`, and the `Icon/*` set.

Workflow: call `create_session` with the file key first, then `get_design_context` on a screen's node id and adapt the output to Expo components and the tokens in `app/src/constants/theme.ts`. The Figma account (Tobi) has Full seats on "Tobi's Team" and "web dev".
