import { PlannerData } from '../../domain/PlannerData';
import { FinancialGoal } from '../../domain/FinancialGoals';
import { GoalType } from '../../types/enums';
import { ALPHANUMERIC_PATTERN, NUMBER_PATTERN } from '../../types/constants';
import {
  PermissionState,
  StorageLoadError,
  StorageProvider,
  StorageProviderId,
  StorageSaveError,
} from './storageProvider';

export const fsaSupported =
  typeof window !== 'undefined' && 'showOpenFilePicker' in window;

/**
 * Validates a raw goal object parsed from a storage file.
 * Rejects unexpected types and patterns to prevent stored-XSS if rendering
 * ever changes from safe React text nodes to raw HTML.
 */
export function validateParsedGoal(
  g: unknown,
  source: 'local-file' | 'google-drive',
): void {
  const goal = g as Record<string, unknown>;
  if (
    typeof goal.goalName !== 'string' ||
    !ALPHANUMERIC_PATTERN.test(goal.goalName) ||
    goal.goalName.trim().length === 0
  ) {
    throw new StorageLoadError(source, 'invalid-format');
  }
  if (!Object.values(GoalType).includes(goal.goalType as GoalType)) {
    throw new StorageLoadError(source, 'invalid-format');
  }
  if (
    typeof goal.targetAmount !== 'number' ||
    !NUMBER_PATTERN.test(String(Math.floor(goal.targetAmount))) ||
    goal.targetAmount <= 0
  ) {
    throw new StorageLoadError(source, 'invalid-format');
  }
}

export class LocalFileProvider implements StorageProvider {
  readonly id: StorageProviderId = 'local-file';

  /** True when the browser does not support the File System Access API */
  readonly fallbackMode: boolean = !fsaSupported;

  fileHandle: FileSystemFileHandle | null = null;
  permissionState: PermissionState = 'unknown';

  // ── Initialisation (called by context initProvider) ───────────────────────

  async initNew(): Promise<void> {
    if (this.fallbackMode) return; // fallback: no handle to acquire
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: 'financial-plan.json',
        types: [
          {
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] },
          },
        ],
      });
      this.fileHandle = handle;
      this.permissionState = 'granted';
      await this._writeData(handle, new PlannerData());
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      throw new StorageSaveError('local-file', 'unknown', false, String(err));
    }
  }

  async initOpen(): Promise<PlannerData | null> {
    if (this.fallbackMode) return null;
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [
          {
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] },
          },
        ],
        multiple: false,
      });
      this.fileHandle = handle;
      this.permissionState = 'granted';
      return this._readData(handle);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return null;
      throw new StorageLoadError('local-file', 'unknown', String(err));
    }
  }

  // ── StorageProvider interface ─────────────────────────────────────────────

  async save(data: PlannerData): Promise<void> {
    if (this.fallbackMode) {
      this._triggerDownload(data);
      return;
    }
    if (!this.fileHandle) {
      // No file handle in this session — data is cached in localStorage.
      // Silently skip the file write; the user can Save to pick a file again.
      return;
    }
    const ok = await this._verifyPermission();
    if (!ok) {
      throw new StorageSaveError('local-file', 'permission-denied', false);
    }
    await this._writeData(this.fileHandle, data);
  }

  async load(): Promise<PlannerData | null> {
    if (!this.fileHandle) return null;
    const ok = await this._verifyPermission();
    if (!ok) {
      throw new StorageLoadError('local-file', 'permission-denied');
    }
    return this._readData(this.fileHandle);
  }

  async clearSession(): Promise<void> {
    this.fileHandle = null;
    this.permissionState = 'unknown';
  }

  // ── Permission helpers ────────────────────────────────────────────────────

  async requestPermission(): Promise<boolean> {
    if (!this.fileHandle) return false;
    try {
      const opts = { mode: 'readwrite' as const };
      if ((await this.fileHandle.queryPermission(opts)) === 'granted') {
        this.permissionState = 'granted';
        return true;
      }
      const result = await this.fileHandle.requestPermission(opts);
      this.permissionState = result === 'granted' ? 'granted' : 'denied';
      return result === 'granted';
    } catch {
      this.permissionState = 'denied';
      return false;
    }
  }

  private async _verifyPermission(): Promise<boolean> {
    if (!this.fileHandle) return false;
    // If permission was explicitly granted in this session (via initNew/initOpen),
    // trust it — queryPermission can return 'prompt' in incognito even after the
    // user just picked the file, causing false permission-denied errors.
    if (this.permissionState === 'granted') return true;
    try {
      const opts = { mode: 'readwrite' as const };
      const state = await this.fileHandle.queryPermission(opts);
      if (state === 'granted') {
        this.permissionState = 'granted';
        return true;
      }
      // 'prompt' or 'denied' — requestPermission requires a user gesture
      this.permissionState = state === 'denied' ? 'denied' : 'unknown';
      return false;
    } catch {
      return false;
    }
  }

  // ── File I/O helpers ──────────────────────────────────────────────────────

  private async _writeData(
    handle: FileSystemFileHandle,
    data: PlannerData,
  ): Promise<void> {
    try {
      const writable = await handle.createWritable();
      await writable.write(JSON.stringify(data, null, 2));
      await writable.close();
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          throw new StorageSaveError('local-file', 'permission-denied', false);
        }
        if (err.name === 'NotFoundError') {
          throw new StorageSaveError('local-file', 'file-not-found', false);
        }
      }
      throw new StorageSaveError('local-file', 'unknown', false, String(err));
    }
  }

  private async _readData(
    handle: FileSystemFileHandle,
  ): Promise<PlannerData> {
    try {
      const file = await handle.getFile();
      const text = await file.text();
      return this._parsePlannerData(text);
    } catch (err) {
      if (err instanceof StorageLoadError) throw err;
      throw new StorageLoadError('local-file', 'unknown', String(err));
    }
  }

  private _parsePlannerData(text: string): PlannerData {
    try {
      const parsed = JSON.parse(text) as PlannerData;
      if (!Array.isArray(parsed.financialGoals) || !parsed.investmentAllocations) {
        throw new StorageLoadError('local-file', 'invalid-format');
      }
      const financialGoals = parsed.financialGoals.map((g: FinancialGoal) => {
        validateParsedGoal(g, 'local-file');
        return new FinancialGoal(
          g.goalName,
          g.goalType,
          g.startDate,
          g.targetDate,
          g.targetAmount,
          g.recurringDurationYears,
        );
      });
      const investmentLogs = Array.isArray(parsed.investmentLogs)
        ? parsed.investmentLogs
        : [];
      return new PlannerData(
        financialGoals,
        parsed.investmentAllocations,
        investmentLogs,
      );
    } catch (err) {
      if (err instanceof StorageLoadError) throw err;
      throw new StorageLoadError('local-file', 'invalid-format');
    }
  }

  // ── Fallback: trigger file download ──────────────────────────────────────

  private _triggerDownload(data: PlannerData): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'financial-plan.json';
    a.click();
    URL.revokeObjectURL(url);
  }
}
