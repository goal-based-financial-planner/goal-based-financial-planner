import { PlannerData } from '../../domain/PlannerData';

export type StorageProviderId = 'local-file' | 'google-drive';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export type PermissionState = 'unknown' | 'granted' | 'denied';

export type StorageSaveReason =
  | 'permission-denied'
  | 'file-not-found'
  | 'network-error'
  | 'quota-exceeded'
  | 'unknown';

export type StorageLoadReason =
  | 'permission-denied'
  | 'file-not-found'
  | 'invalid-format'
  | 'network-error'
  | 'unknown';

export class StorageSaveError extends Error {
  readonly provider: StorageProviderId;
  readonly reason: StorageSaveReason;
  readonly retryable: boolean;

  constructor(
    provider: StorageProviderId,
    reason: StorageSaveReason,
    retryable: boolean,
    message?: string,
  ) {
    super(message ?? `Save failed: ${reason}`);
    this.name = 'StorageSaveError';
    this.provider = provider;
    this.reason = reason;
    this.retryable = retryable;
  }
}

export class StorageLoadError extends Error {
  readonly provider: StorageProviderId;
  readonly reason: StorageLoadReason;

  constructor(
    provider: StorageProviderId,
    reason: StorageLoadReason,
    message?: string,
  ) {
    super(message ?? `Load failed: ${reason}`);
    this.name = 'StorageLoadError';
    this.provider = provider;
    this.reason = reason;
  }
}

export interface StorageProvider {
  readonly id: StorageProviderId;

  /**
   * Write the complete plan state to the backing store.
   * Throws StorageSaveError on failure.
   */
  save(data: PlannerData): Promise<void>;

  /**
   * Read the plan from the backing store.
   * Returns null if no file/session exists yet.
   * Throws StorageLoadError on read/parse failures.
   */
  load(): Promise<PlannerData | null>;

  /**
   * Delete all persisted session state.
   * Idempotent — safe to call multiple times.
   * MUST NOT throw.
   */
  clearSession(): Promise<void>;
}
