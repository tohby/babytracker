/**
 * Fills the `Intl` APIs Hermes is missing on some builds (Expo Go on iOS has no
 * `Intl.PluralRules` or `Intl.RelativeTimeFormat`). Each polyfill checks first and
 * only installs itself when the engine lacks the API, so native support always wins.
 *
 * Without PluralRules, i18next guesses "1 = one, anything else = other", which is
 * right for English but wrong for French ("0 sieste") and Chinese (no plural form).
 *
 * Order matters: each one builds on the previous. Import this before i18next.
 * When a language ships (M6), add its locale-data lines here.
 */
import '@formatjs/intl-getcanonicallocales/polyfill.js';
import '@formatjs/intl-locale/polyfill.js';
import '@formatjs/intl-pluralrules/polyfill.js';
import '@formatjs/intl-pluralrules/locale-data/en.js';
import '@formatjs/intl-relativetimeformat/polyfill.js';
import '@formatjs/intl-relativetimeformat/locale-data/en.js';
