import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useElevation } from '@/hooks/use-elevation';

type ToastInput = { message: string; onUndo?: () => void };
type ToastContextValue = { show: (toast: ToastInput) => void; hide: () => void };

const ToastContext = createContext<ToastContextValue | null>(null);

/** Figma `Toast` (Undo): ink pill with a check, the message and optional Undo. */
export function Toast({ message, onUndo }: ToastInput) {
  const { t } = useTranslation();
  const shadow = useElevation('floating');
  return (
    <View style={{ boxShadow: shadow }} className="min-h-[52px] flex-row items-center gap-md rounded-full bg-text-primary px-lg py-md">
      <Icon name="check" size={20} tone="color/background/surface" />
      <Text variant="body-small" tone="inverse" className="flex-1">
        {message}
      </Text>
      {onUndo && (
        <Pressable accessibilityRole="button" onPress={onUndo} hitSlop={12}>
          <Text variant="button-small" tone="ring">
            {t('actions.undo')}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

/**
 * One toast at a time, bottom of the screen above the tab bar: 4 s, or 8 s with Undo (the safety net for
 * one-tap logging). `bottomOffset` is the height of the chrome it must clear.
 */
export function ToastProvider({ children, bottomOffset }: { children: ReactNode; bottomOffset: number }) {
  const [toast, setToast] = useState<(ToastInput & { id: number }) | null>(null);
  const [opacity] = useState(() => new Animated.Value(0));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setToast(null));
  }, [opacity]);

  const show = useCallback(
    (input: ToastInput) => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ ...input, id: Date.now() });
      AccessibilityInfo.announceForAccessibility(input.message);
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      timer.current = setTimeout(hide, input.onUndo ? 8000 : 4000);
    },
    [hide, opacity],
  );

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const value = useMemo(() => ({ show, hide }), [show, hide]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <Animated.View pointerEvents="box-none" style={{ opacity, position: 'absolute', left: 0, right: 0, bottom: bottomOffset }} className="px-page">
          <Toast
            message={toast.message}
            onUndo={
              toast.onUndo
                ? () => {
                    toast.onUndo?.();
                    hide();
                  }
                : undefined
            }
          />
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used inside ToastProvider');
  return value;
}
