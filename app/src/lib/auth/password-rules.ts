/**
 * The first rule a new password breaks, checked before it's sent. Mirrors the API's production
 * `Password::defaults()` (api/app/Providers/AppServiceProvider.php); the server also rejects
 * passwords found in known breaches, which only it can check.
 */
export type PasswordRule = 'length' | 'case' | 'number' | 'symbol';

export const PASSWORD_MIN_LENGTH = 8;

export function passwordProblem(password: string): PasswordRule | null {
  if ([...password].length < PASSWORD_MIN_LENGTH) return 'length';
  if (!/\p{Lu}/u.test(password) || !/\p{Ll}/u.test(password)) return 'case';
  if (!/\p{N}/u.test(password)) return 'number';
  if (!/[\p{P}\p{S}\p{Z}]/u.test(password)) return 'symbol';
  return null;
}
