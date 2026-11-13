#!/usr/bin/env bash
#
# Deploy a tagged release on Hostinger shared hosting.
#
#   bash deploy/deploy.sh            # deploy the newest v* tag
#   bash deploy/deploy.sh v1.2.0     # deploy (or roll back to) a specific tag
#
# Expected layout (the "Brad Traversy" layout):
#
#   domains/example.com/
#   ├── babytracker/        <- this repo (git clone)
#   │   ├── api/            <- the Laravel app (vendor, .env, storage live here)
#   │   └── deploy/
#   └── public_html/        <- web root: contents of api/public + built assets
#
# Overridable via environment variables:
#   PHP_BIN       php binary         (default: first PHP 8.3+ found)
#   COMPOSER_BIN  composer command   (default: composer run with PHP_BIN)
#   PUBLIC_HTML   web root           (default: <repo>/../public_html)
#
# Hostinger tip: the default `php` on SSH may be old. Use e.g.
#   export PHP_BIN=/opt/alt/php83/usr/bin/php

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_DIR="$REPO_DIR/api"
PUBLIC_HTML="${PUBLIC_HTML:-$REPO_DIR/../public_html}"

# Non-interactive SSH (e.g. GitHub Actions) doesn't load ~/.bashrc, so settings
# saved by install.sh live in a file we source explicitly.
# shellcheck disable=SC1091
[ -f "$HOME/.babytracker-deploy.env" ] && . "$HOME/.babytracker-deploy.env"

php_ok() { "$1" -r 'exit(PHP_VERSION_ID >= 80300 ? 0 : 1);' >/dev/null 2>&1; }
if [ -z "${PHP_BIN:-}" ]; then
    for c in /opt/alt/php85/usr/bin/php /opt/alt/php84/usr/bin/php /opt/alt/php83/usr/bin/php php8.4 php8.3 php; do
        if command -v "$c" >/dev/null 2>&1 && php_ok "$c"; then PHP_BIN="$(command -v "$c")"; break; fi
    done
fi
PHP_BIN="${PHP_BIN:-php}"
if [ -z "${COMPOSER_BIN:-}" ]; then
    COMPOSER_PATH="$(command -v composer || true)"
    [ -n "$COMPOSER_PATH" ] || COMPOSER_PATH="$HOME/.local/bin/composer.phar"
    COMPOSER_BIN="$PHP_BIN $COMPOSER_PATH"
fi

log() { printf '\n\033[1;34m==>\033[0m %s\n' "$*"; }
die() { printf '\n\033[1;31mERROR:\033[0m %s\n' "$*" >&2; exit 1; }

[ -d "$PUBLIC_HTML" ] || die "public_html not found at $PUBLIC_HTML (set PUBLIC_HTML=...)"
PUBLIC_HTML="$(cd "$PUBLIC_HTML" && pwd)"

artisan() { "$PHP_BIN" "$API_DIR/artisan" "$@"; }

# Wrapped in a block so bash parses the whole thing up front: the checkout below
# can replace this very file while it runs.
{
cd "$REPO_DIR"

# ---------------------------------------------------------------- pick a tag
log "Fetching tags"
git fetch --tags --force --quiet origin
TAG="${1:-$(git tag --list 'v*' --sort=-v:refname | head -n1)}"
[ -n "$TAG" ] || die "No v* tags found. Push a tag first (git tag v1.0.0 && git push origin v1.0.0)."
git rev-parse -q --verify "refs/tags/$TAG" >/dev/null || die "Tag $TAG does not exist."

# ------------------------------------------------- first run: need a .env file
if [ ! -f "$API_DIR/.env" ]; then
    cp "$API_DIR/.env.example" "$API_DIR/.env"
    die "Created $API_DIR/.env from the example. Edit it (APP_ENV=production, APP_DEBUG=false, APP_URL, DB_*), then run this script again."
fi

# --------------------------------------------- download built assets first
# Done before touching anything so a not-yet-finished GitHub Action aborts cleanly.
log "Downloading built assets for $TAG"
SLUG="$(git remote get-url origin | sed -E 's#(git@github\.com:|https://github\.com/)##; s#\.git$##')"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
ASSET_URL="https://github.com/$SLUG/releases/download/$TAG/build.tar.gz"
curl -fsSL "$ASSET_URL" -o "$TMP/build.tar.gz" \
    || die "Could not download $ASSET_URL. Is the 'release' GitHub Action for $TAG finished?"
mkdir "$TMP/extract"
tar -xzf "$TMP/build.tar.gz" -C "$TMP/extract"
[ -f "$TMP/extract/build/manifest.json" ] || die "Asset bundle looks wrong (no build/manifest.json)."

# --------------------------------------------------------------- maintenance
UP_NEEDED=0
if [ -f "$API_DIR/vendor/autoload.php" ]; then
    artisan down --retry=60 >/dev/null 2>&1 && UP_NEEDED=1 || true
fi
bring_up() { [ "$UP_NEEDED" = 1 ] && artisan up >/dev/null 2>&1 || true; }
trap 'bring_up; rm -rf "$TMP"' EXIT

# ------------------------------------------------------------------ code
log "Checking out $TAG"
git checkout --force --quiet "refs/tags/$TAG"

log "Installing PHP dependencies"
(cd "$API_DIR" && $COMPOSER_BIN install --no-dev --optimize-autoloader --no-interaction --prefer-dist)

if ! grep -qE '^APP_KEY=.+' "$API_DIR/.env"; then
    log "Generating APP_KEY"
    artisan key:generate --force
fi

# ------------------------------------------------------------ public_html
log "Publishing to $PUBLIC_HTML"
mkdir -p "$PUBLIC_HTML"
cp -R "$API_DIR/public/." "$PUBLIC_HTML/"          # favicon, robots.txt, .htaccess, ...
rm -rf "$PUBLIC_HTML/build"
mv "$TMP/extract/build" "$PUBLIC_HTML/build"

sed "s|__API_PATH__|$API_DIR|g" "$REPO_DIR/deploy/public_html_index.php" > "$PUBLIC_HTML/index.php"

# Storage symlink (public_html/storage -> api/storage/app/public)
mkdir -p "$API_DIR/storage/app/public"
if [ ! -e "$PUBLIC_HTML/storage" ]; then
    ln -s "$API_DIR/storage/app/public" "$PUBLIC_HTML/storage"
fi

# ------------------------------------------------------------- laravel
log "Migrating and caching"
artisan migrate --force
artisan optimize:clear
artisan config:cache
artisan route:cache
artisan view:cache
artisan event:cache

echo "$TAG" > "$API_DIR/storage/app/.deployed_tag"
log "Deployed $TAG"

exit 0
}
