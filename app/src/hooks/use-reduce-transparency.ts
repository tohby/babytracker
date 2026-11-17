import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** True when the user turned on "Reduce Transparency" (iOS accessibility). Glass then becomes solid. */
export function useReduceTransparency(): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceTransparencyEnabled().then((value) => {
      if (mounted) setEnabled(value);
    });
    const sub = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setEnabled);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);
  return enabled;
}
