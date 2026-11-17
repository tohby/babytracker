/**
 * Runs once before any test. Pins the timezone so date tests give the same
 * answer on every machine and in CI. Tests that need another timezone run
 * their code in a child process with its own TZ (see theme-schedule.test.ts).
 */
module.exports = () => {
  process.env.TZ = 'Africa/Lagos';
};
