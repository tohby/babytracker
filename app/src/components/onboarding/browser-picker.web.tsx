export function BrowserPicker({ mode, value, label, minimum, maximum, onChange }: {
  mode: 'date' | 'time';
  value?: string;
  label: string;
  minimum?: string;
  maximum?: string;
  onChange: (value: string) => void;
}) {
  return <input className="rounded-md border border-border-default bg-background-surface p-md text-text-primary"
    type={mode} aria-label={label} defaultValue={value} min={minimum} max={maximum}
    onChange={(event) => { if (event.currentTarget.validity.valid && event.currentTarget.value) onChange(event.currentTarget.value); }} />;
}
