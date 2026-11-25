import { passwordProblem } from '../password-rules';

it('reports the first rule a new password breaks', () => {
  expect(passwordProblem('Ab1!')).toBe('length');
  expect(passwordProblem('abcdefg1!')).toBe('case');
  expect(passwordProblem('ABCDEFG1!')).toBe('case');
  expect(passwordProblem('Abcdefgh!')).toBe('number');
  expect(passwordProblem('Abcdefgh1')).toBe('symbol');
  expect(passwordProblem('New-pass-2026!')).toBeNull();
  expect(passwordProblem('Ünïcode-9x')).toBeNull();
});
