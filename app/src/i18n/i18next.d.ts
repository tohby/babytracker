import 'i18next';

import type { defaultNS, resources } from './resources';

/** Types `t()` keys from the `en` resources, so a missing or misspelled key fails typecheck. */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: (typeof resources)['en'];
  }
}
