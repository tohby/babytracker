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

Create the MySQL database in hPanel and set the domain's PHP version to 8.3+, then over SSH:

```bash
curl -fsSL https://raw.githubusercontent.com/tohby/babytracker/main/deploy/install.sh | bash
```

The installer finds your domain folder and PHP 8.3, clones the repo next to `public_html`, asks for the app URL and DB credentials, writes `api/.env` (production defaults), offers to move any existing `public_html` files to a backup folder, saves `PHP_BIN`/`COMPOSER_BIN` to `~/.bashrc`, and runs the first deploy. Re-running it is safe: an existing clone and `.env` are kept.

<details><summary>Manual setup instead</summary>

```bash
cd ~/domains/example.com
git clone https://github.com/tohby/babytracker.git
export PHP_BIN=/opt/alt/php83/usr/bin/php
bash babytracker/deploy/deploy.sh     # 1st run creates api/.env and stops
nano babytracker/api/.env             # APP_ENV=production, APP_DEBUG=false, APP_URL, DB_*
bash babytracker/deploy/deploy.sh     # real deploy
```
</details>

## Releasing

```bash
git tag v1.0.0 && git push origin v1.0.0
# wait for the "release" Action to go green, then on the server:
bash ~/domains/example.com/babytracker/deploy/deploy.sh          # latest tag
bash ~/domains/example.com/babytracker/deploy/deploy.sh v0.9.0   # rollback
```

`deploy.sh` checks out the tag, runs `composer install --no-dev`, downloads the built assets, refreshes `public_html` (and regenerates its `index.php` to point at `api/`), migrates, and rebuilds the Laravel caches. It enters maintenance mode while running and aborts before changing anything if the release assets aren't ready yet.

## Scheduled jobs (cron)

One cron entry runs Laravel's scheduler every minute; the jobs themselves live in `api/routes/console.php` (queue worker each minute, nightly cleanups). Add it once in hPanel → Advanced → Cron Jobs → Custom, every minute (`* * * * *`):

```bash
/opt/alt/php83/usr/bin/php /home/<user>/domains/example.com/babytracker-app/api/artisan schedule:run >> /dev/null 2>&1
```

Use the `PHP_BIN` from `~/.babytracker-deploy.env`. Job output goes to `api/storage/logs/schedule.log`; `php artisan schedule:list` shows what runs when. New jobs only need a code change and a release.

## Public repo notes

Safe as long as secrets stay in `api/.env` on the server (gitignored). Never commit `.env`, keys, or `auth.json`. Enable GitHub secret scanning and push protection in the repo settings.
