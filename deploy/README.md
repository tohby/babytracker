# Deployment (Hostinger shared hosting)

**Release flow:** push a tag → GitHub Action builds the frontend and attaches `build.tar.gz` to a Release → run `deploy/deploy.sh` over SSH.

## Server layout

```
domains/example.com/
├── babytracker/     # git clone of this repo
│   ├── api/         # Laravel app: vendor, .env, storage (NOT web-accessible)
│   └── deploy/
└── public_html/     # web root: api/public contents + build/ + a generated index.php
```

## One-time server setup

```bash
cd ~/domains/example.com
rm -rf public_html/*            # remove Hostinger's placeholder (check it first)
git clone https://github.com/<you>/babytracker.git
export PHP_BIN=/opt/alt/php83/usr/bin/php   # needs PHP 8.3+; add to ~/.bashrc too
bash babytracker/deploy/deploy.sh           # 1st run creates api/.env and stops
nano babytracker/api/.env                   # APP_ENV=production, APP_DEBUG=false,
                                            # APP_URL, DB_* (Hostinger MySQL)
bash babytracker/deploy/deploy.sh           # 2nd run does the real deploy
```

In hPanel, set PHP to 8.3+ for the domain and create the MySQL database first.

## Releasing

```bash
git tag v1.0.0 && git push origin v1.0.0
# wait for the "release" Action to go green, then on the server:
bash ~/domains/example.com/babytracker/deploy/deploy.sh          # latest tag
bash ~/domains/example.com/babytracker/deploy/deploy.sh v0.9.0   # rollback
```

`deploy.sh` checks out the tag, runs `composer install --no-dev`, downloads the built assets, refreshes `public_html` (and regenerates its `index.php` to point at `api/`), migrates, and rebuilds the Laravel caches. It enters maintenance mode while running and aborts before changing anything if the release assets aren't ready yet.

## Public repo notes

Safe as long as secrets stay in `api/.env` on the server (gitignored). Never commit `.env`, keys, or `auth.json`. Enable GitHub secret scanning and push protection in the repo settings.
