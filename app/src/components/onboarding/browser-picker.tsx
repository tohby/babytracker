/** Native builds use the platform date and time picker. */
export function BrowserPicker(_props: {
  mode: 'date' | 'time';
  value?: string;
  label: string;
  minimum?: string;
  maximum?: string;
  onChange: (value: string) => void;
}) {
  return null;
}
