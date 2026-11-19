import { Redirect } from 'expo-router';

/**
 * Placeholder route for the iOS 26 "Log" tab. The tab is `disabled`, so it is never selected; pressing it opens the
 * quick-log sheet. If something navigates here directly, go to the sheet instead.
 */
export default function LogTab() {
  return <Redirect href="/log" />;
}
