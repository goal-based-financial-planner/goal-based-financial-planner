import { useCallback, useEffect, useRef, useState } from 'react';
import { PlannerData } from '../domain/PlannerData';
import { SaveStatus, StorageProvider, StorageSaveError } from '../util/storage';

const DEBOUNCE_MS = 2000;
const SAVED_DISPLAY_MS = 3000;

interface UseAutosaveResult {
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  lastError: StorageSaveError | null;
  triggerManualSave: () => void;
}

export function useAutosave(
  data: PlannerData,
  provider: StorageProvider | null,
): UseAutosaveResult {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [lastError, setLastError] = useState<StorageSaveError | null>(null);

  const isMountedRef = useRef(true);
  const savingRef = useRef(false);
  const savedClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Register beforeunload guard when a save is in-flight
  useEffect(() => {
    if (saveStatus !== 'saving') return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [saveStatus]);

  const doSave = useCallback(
    async (plannerData: PlannerData) => {
      if (!provider || savingRef.current) return;
      savingRef.current = true;

      if (isMountedRef.current) setSaveStatus('saving');
      if (savedClearTimerRef.current) {
        clearTimeout(savedClearTimerRef.current);
        savedClearTimerRef.current = null;
      }

      try {
        await provider.save(plannerData);
        if (isMountedRef.current) {
          setSaveStatus('saved');
          setLastSavedAt(new Date());
          setLastError(null);
          savedClearTimerRef.current = setTimeout(() => {
            if (isMountedRef.current) setSaveStatus('idle');
          }, SAVED_DISPLAY_MS);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setSaveStatus('error');
          setLastError(
            err instanceof StorageSaveError
              ? err
              : new StorageSaveError('local-file', 'unknown', false, String(err)),
          );
        }
      } finally {
        savingRef.current = false;
      }
    },
    [provider],
  );

  // Debounced autosave on data change
  useEffect(() => {
    if (!provider) return;
    const timerId = setTimeout(() => {
      void doSave(data);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timerId);
  }, [data, provider, doSave]);

  const triggerManualSave = useCallback(() => {
    if (!provider) return;
    void doSave(data);
  }, [provider, data, doSave]);

  return { saveStatus, lastSavedAt, lastError, triggerManualSave };
}
