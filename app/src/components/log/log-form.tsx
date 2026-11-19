import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useLogStore, type NewEvent } from '@/data/log-store';
import { formatTime } from '@/lib/format';

/**
 * A log sheet (Figma "D · Logging"): tall Bottom sheet with Save (primary) and Cancel (tertiary). Saving adds the
 * event, closes the sheet and shows "<what> logged · time" with Undo, the safety net for one-tap logging.
 */
export function LogForm({
  title,
  subtitle,
  saveLabel,
  canSave = true,
  buildEvent,
  savedMessage,
  children,
  extraActions,
  size = 'tall',
}: {
  title: string;
  subtitle?: string;
  saveLabel: string;
  canSave?: boolean;
  /** Returns the event to save, or null to stay open. */
  buildEvent: () => NewEvent | null;
  /** Toast text; receives the saved time. */
  savedMessage: (time: string) => string;
  children: ReactNode;
  extraActions?: ReactNode;
  size?: 'compact' | 'tall';
}) {
  const { t } = useTranslation();
  const { add, remove } = useLogStore();
  const toast = useToast();
  const save = () => {
    const event = buildEvent();
    if (!event) return;
    const saved = add(event);
    router.back();
    toast.show({ message: savedMessage(formatTime(saved.startAt)), onUndo: () => remove(saved.id) });
  };
  return (
    <BottomSheet
      size={size}
      title={title}
      subtitle={subtitle}
      onClose={() => router.back()}
      actions={
        <>
          {extraActions}
          <Button label={saveLabel} onPress={save} disabled={!canSave} />
          <Button label={t('actions.cancel')} hierarchy="tertiary" size="medium" onPress={() => router.back()} />
        </>
      }>
      {children}
    </BottomSheet>
  );
}
