#!/usr/bin/env bash
#
# One-time installer for Hostinger shared hosting. Run it over SSH:
#
#   curl -fsSL https://raw.githubusercontent.com/tohby/babytracker/main/deploy/install.sh | bash
#
# It finds your domain folder, clones the repo next to public_html, asks for the
# app URL and database credentials, writes api/.env, then runs deploy.sh.
# Safe to re-run: an existing clone and .env are left alone.
#
# Overridable: REPO_URL, APP_DIR_NAME (default: babytracker), DOMAIN_DIR,
# PUBLIC_HTML (web root, for subdomains), REPO_DIR (where to clone).

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/tohby/babytracker.git}"
APP_DIR_NAME="${APP_DIR_NAME:-babytracker}"

log()  { printf '\n\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m!\033[0m %s\n' "$*"; }
die()  { printf '\n\033[1;31mERROR:\033[0m %s\n' "$*" >&2; exit 1; }

# When piped through `curl | bash`, stdin is the script, so prompt via the tty.
[ -r /dev/tty ] || die "No terminal available for prompts. Run this from an interactive SSH session."
ask() { # ask "Question" "default" -> echoes answer
    local reply
    read -r -p "$1${2:+ [$2]}: " reply < /dev/tty
    echo "${reply:-$2}"
}
ask_secret() {
    local reply
    read -r -s -p "$1: " reply < /dev/tty
    echo >&2
    echo "$reply"
}
confirm() { # confirm "Question" -> 0 if yes
    local reply
    read -r -p "$1 [y/N]: " reply < /dev/tty
    [[ "$reply" =~ ^[Yy]$ ]]
}

# Set KEY=VALUE in an env file: replaces KEY= or "# KEY=", else appends.
set_env() {
    local file="$1" key="$2" value="$3" tmp
    value="${value//\\/\\\\}"; value="${value//\"/\\\"}"; value="${value//\$/\\\$}"
    tmp="$(mktemp)"
    KEY="$key" VAL="\"$value\"" awk '
        BEGIN { k = ENVIRON["KEY"]; v = ENVIRON["VAL"]; done = 0 }
        !done && ($0 ~ "^" k "=" || $0 ~ "^# *" k "=") { print k "=" v; done = 1; next }
        { print }
        END { if (!done) print k "=" v }
    ' "$file" > "$tmp"
    cat "$tmp" > "$file"; rm -f "$tmp"
}

php_ok() { "$1" -r 'exit(PHP_VERSION_ID >= 80300 ? 0 : 1);' >/dev/null 2>&1; }

main() {
    command -v git  >/dev/null || die "git is not installed."
    command -v curl >/dev/null || die "curl is not installed."

    # --------------------------------------------- web root + repo location
    # Layout A (main domain):  <domain>/public_html  +  <domain>/babytracker
    # Layout B (subdomain whose web root is nested inside the main domain's
    #           public_html): web root = that folder, repo lives in ~/babytracker
    #           (outside every web root).
    if [ -z "${PUBLIC_HTML:-}" ] && [ -z "${DOMAIN_DIR:-}" ]; then
        if [[ "$PWD" == */public_html/* ]]; then
            warn "You are inside a web root: $PWD"
            if confirm "Use this folder as the web root (subdomain install)?"; then
                PUBLIC_HTML="$PWD"
            else
                die "Aborted. cd to the folder you want to serve (or set PUBLIC_HTML=...) and re-run."
            fi
        fi
    fi

    if [ -n "${PUBLIC_HTML:-}" ]; then
        [ -d "$PUBLIC_HTML" ] || die "$PUBLIC_HTML does not exist."
        PUBLIC_HTML="$(cd "$PUBLIC_HTML" && pwd)"
        DOMAIN_DIR="${DOMAIN_DIR:-$HOME}"
        REPO_DIR="${REPO_DIR:-$HOME/$APP_DIR_NAME}"
    else
        if [ -z "${DOMAIN_DIR:-}" ]; then
            if [ -d "$PWD/public_html" ]; then
                DOMAIN_DIR="$PWD"
            else
                local candidates=()
                while IFS= read -r d; do candidates+=("$(dirname "$d")"); done < <(ls -d "$HOME"/domains/*/public_html 2>/dev/null)
                [ "${#candidates[@]}" -gt 0 ] || die "Couldn't find ~/domains/*/public_html. Set DOMAIN_DIR=/path/to/domain and re-run."
                if [ "${#candidates[@]}" -eq 1 ]; then
                    DOMAIN_DIR="${candidates[0]}"
                else
                    echo "Which domain is this app for?"
                    select DOMAIN_DIR in "${candidates[@]}"; do [ -n "${DOMAIN_DIR:-}" ] && break; done < /dev/tty
                fi
            fi
        fi
        DOMAIN_DIR="$(cd "$DOMAIN_DIR" && pwd)"
        PUBLIC_HTML="$DOMAIN_DIR/public_html"
        REPO_DIR="${REPO_DIR:-$DOMAIN_DIR/$APP_DIR_NAME}"
        [ -d "$PUBLIC_HTML" ] || die "$PUBLIC_HTML does not exist."
    fi
    log "Web root: $PUBLIC_HTML"
    log "App code: $REPO_DIR"
    confirm "Continue?" || die "Aborted."

    # ------------------------------------------------------------------ PHP
    if [ -z "${PHP_BIN:-}" ]; then
        for c in /opt/alt/php85/usr/bin/php /opt/alt/php84/usr/bin/php /opt/alt/php83/usr/bin/php php8.4 php8.3 php; do
            if command -v "$c" >/dev/null 2>&1 && php_ok "$c"; then PHP_BIN="$(command -v "$c")"; break; fi
        done
    fi
    [ -n "${PHP_BIN:-}" ] && php_ok "$PHP_BIN" || die "PHP 8.3+ not found. Set the domain's PHP version to 8.3+ in hPanel, or export PHP_BIN=/path/to/php."
    echo "PHP: $PHP_BIN ($("$PHP_BIN" -r 'echo PHP_VERSION;'))"

    # ------------------------------------------------------------- composer
    if [ -z "${COMPOSER_BIN:-}" ]; then
        local composer_path
        composer_path="$(command -v composer || true)"
        if [ -z "$composer_path" ]; then
            log "Composer not found, installing a local copy"
            mkdir -p "$HOME/.local/bin"
            curl -fsSL https://getcomposer.org/installer | "$PHP_BIN" -- --install-dir="$HOME/.local/bin" --filename=composer.phar
            composer_path="$HOME/.local/bin/composer.phar"
        fi
        # Run composer with the right PHP regardless of the shell's default php.
        COMPOSER_BIN="$PHP_BIN $composer_path"
    fi
    echo "Composer: $COMPOSER_BIN"

    # ---------------------------------------------------------- clone repo
    if [ -d "$REPO_DIR/.git" ]; then
        warn "$REPO_DIR already exists, skipping clone."
    else
        [ ! -e "$REPO_DIR" ] || die "$REPO_DIR exists but is not a git clone."
        log "Cloning $REPO_URL"
        git clone --quiet "$REPO_URL" "$REPO_DIR"
    fi
    local env_file="$REPO_DIR/api/.env"

    # ------------------------------------------------------------ .env file
    if [ -f "$env_file" ]; then
        warn "$env_file already exists, keeping it."
    else
        log "Configuring the app"
        local default_host app_name app_url db_host db_name db_user db_pass
        default_host="$(basename "$DOMAIN_DIR")"
        app_name="$(ask 'App name' 'Baby Tracker')"
        app_url="$(ask 'App URL' "https://$default_host")"
        echo "Create the MySQL database in hPanel first (Databases > Management)."
        db_host="$(ask 'DB host' 'localhost')"
        db_name="$(ask 'DB name' '')"
        db_user="$(ask 'DB user' '')"
        db_pass="$(ask_secret 'DB password')"
        [ -n "$db_name" ] && [ -n "$db_user" ] || die "DB name and user are required."

        if ! DB_HOST="$db_host" DB_NAME="$db_name" DB_USER="$db_user" DB_PASS="$db_pass" "$PHP_BIN" -r '
            try { new PDO("mysql:host=".getenv("DB_HOST").";dbname=".getenv("DB_NAME"), getenv("DB_USER"), getenv("DB_PASS")); }
            catch (Throwable $e) { fwrite(STDERR, $e->getMessage()."\n"); exit(1); }'; then
            confirm "Database connection failed (see above). Continue anyway?" || die "Aborted. Fix the credentials and re-run."
        fi

        cp "$REPO_DIR/api/.env.example" "$env_file"
        set_env "$env_file" APP_NAME "$app_name"
        set_env "$env_file" APP_ENV production
        set_env "$env_file" APP_DEBUG false
        set_env "$env_file" APP_URL "$app_url"
        set_env "$env_file" LOG_LEVEL error
        set_env "$env_file" DB_CONNECTION mysql
        set_env "$env_file" DB_HOST "$db_host"
        set_env "$env_file" DB_PORT 3306
        set_env "$env_file" DB_DATABASE "$db_name"
        set_env "$env_file" DB_USERNAME "$db_user"
        set_env "$env_file" DB_PASSWORD "$db_pass"
        chmod 600 "$env_file"
    fi

    # ----------------------------------------- existing public_html content
    if [ ! -f "$PUBLIC_HTML/index.php" ] && [ -n "$(ls -A "$PUBLIC_HTML" 2>/dev/null)" ]; then
        warn "public_html is not empty:"
        ls -A "$PUBLIC_HTML" | head -10 | sed 's/^/    /'
        local backup="$DOMAIN_DIR/public_html_backup_$(date +%Y%m%d%H%M%S)"
        if confirm "Move these files into $backup so the app can take over?"; then
            mkdir "$backup"
            find "$PUBLIC_HTML" -mindepth 1 -maxdepth 1 -exec mv {} "$backup"/ \;
        else
            die "Aborted. Empty public_html (or back it up) and re-run."
        fi
    fi

    # ----------------------------------- remember PHP/composer for later deploys
    local marker="# babytracker deploy settings"
    if ! grep -qF "$marker" "$HOME/.bashrc" 2>/dev/null; then
        {
            echo "$marker"
            echo "export PHP_BIN=\"$PHP_BIN\""
            echo "export COMPOSER_BIN=\"$COMPOSER_BIN\""
        } >> "$HOME/.bashrc"
    fi

    # Non-interactive SSH (GitHub Actions auto-deploy) skips ~/.bashrc, so also
    # save the settings where deploy.sh sources them explicitly.
    {
        echo "export PHP_BIN=\"$PHP_BIN\""
        echo "export COMPOSER_BIN=\"$COMPOSER_BIN\""
    } > "$HOME/.babytracker-deploy.env"

    # --------------------------------------------------------------- deploy
    log "Running first deploy"
    PHP_BIN="$PHP_BIN" COMPOSER_BIN="$COMPOSER_BIN" PUBLIC_HTML="$PUBLIC_HTML" \
        bash "$REPO_DIR/deploy/deploy.sh"

    log "Done. Visit $(grep -E '^APP_URL=' "$env_file" | cut -d= -f2- | tr -d '"')"
    echo "Future releases:  bash $REPO_DIR/deploy/deploy.sh   (after pushing a v* tag)"
}

# Called last so a truncated download can't run half a script.
main "$@"
