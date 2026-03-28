import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';
import { PlannerData } from '../domain/PlannerData';
import {
  DriveFileInfo,
  GoogleDriveProvider,
  LocalFileProvider,
  SaveStatus,
  StorageProvider,
  StorageProviderId,
} from '../util/storage';

export interface StorageProviderContextValue {
  provider: StorageProvider | null;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  lastError: Error | null;
  /** Initial PlannerData loaded when a provider is first set up */
  initialData: PlannerData | null;
  /** Drive file list returned by initProvider('google-drive','open') */
  driveFiles: DriveFileInfo[];
  /** Select a Drive file after initProvider('google-drive','open') */
  selectDriveFile: (fileId: string) => Promise<PlannerData | null>;
  /** Delete a Drive file from the list */
  deleteDriveFile: (fileId: string) => Promise<void>;
  /** Initialize a provider for New or Open flows */
  initProvider: (
    type: StorageProviderId,
    mode: 'new' | 'open',
    planName?: string,
  ) => Promise<PlannerData | null>;
  /** Tear down the active provider and return to the welcome screen */
  clearProvider: () => Promise<void>;
  /** Update save status from useAutosave hook */
  setSaveStatus: (status: SaveStatus) => void;
  setLastSavedAt: (date: Date | null) => void;
  setLastError: (err: Error | null) => void;
}

const StorageProviderContext = createContext<StorageProviderContextValue | null>(
  null,
);

export function useStorageProvider(): StorageProviderContextValue {
  const ctx = useContext(StorageProviderContext);
  if (!ctx) {
    throw new Error(
      'useStorageProvider must be used within StorageProviderContextProvider',
    );
  }
  return ctx;
}

export const StorageProviderContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [provider, setProvider] = useState<StorageProvider | null>(null);
  const [initialData, setInitialData] = useState<PlannerData | null>(null);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [driveFiles, setDriveFiles] = useState<DriveFileInfo[]>([]);

  const initProvider = useCallback(
    async (
      type: StorageProviderId,
      mode: 'new' | 'open',
      planName?: string,
    ): Promise<PlannerData | null> => {
      if (type === 'local-file') {
        const p = new LocalFileProvider();
        if (mode === 'new') {
          await p.initNew();
          if (!p.fileHandle && !p.fallbackMode) return null; // user cancelled
          setProvider(p);
          setInitialData(new PlannerData());
          return new PlannerData();
        } else {
          const data = await p.initOpen();
          if (!data) return null; // user cancelled
          setProvider(p);
          setInitialData(data);
          return data;
        }
      } else {
        const p = new GoogleDriveProvider();
        if (mode === 'new') {
          await p.initNew(planName);
          setProvider(p);
          setInitialData(new PlannerData());
          return new PlannerData();
        } else {
          const { files } = await p.initOpen();
          setDriveFiles(files);
          // Caller must then call selectDriveFile to complete the open flow
          setProvider(p);
          return null;
        }
      }
    },
    [],
  );

  const selectDriveFile = useCallback(
    async (fileId: string): Promise<PlannerData | null> => {
      if (!provider || provider.id !== 'google-drive') return null;
      const driveProvider = provider as GoogleDriveProvider;
      const data = await driveProvider.selectFile(fileId);
      setInitialData(data);
      setDriveFiles([]);
      return data;
    },
    [provider],
  );

  const deleteDriveFile = useCallback(
    async (fileId: string): Promise<void> => {
      if (!provider || provider.id !== 'google-drive') return;
      const driveProvider = provider as GoogleDriveProvider;
      await driveProvider.deleteFile(fileId);
      setDriveFiles((prev) => prev.filter((f) => f.id !== fileId));
    },
    [provider],
  );

  const clearProvider = useCallback(async () => {
    if (provider) {
      await provider.clearSession();
    }
    setProvider(null);
    setInitialData(null);
    setDriveFiles([]);
    setSaveStatus('idle');
    setLastSavedAt(null);
    setLastError(null);
  }, [provider]);

  return (
    <StorageProviderContext.Provider
      value={{
        provider,
        saveStatus,
        lastSavedAt,
        lastError,
        initialData,
        driveFiles,
        selectDriveFile,
        deleteDriveFile,
        initProvider,
        clearProvider,
        setSaveStatus,
        setLastSavedAt,
        setLastError,
      }}
    >
      {children}
    </StorageProviderContext.Provider>
  );
};
