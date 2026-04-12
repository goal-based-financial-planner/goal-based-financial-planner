import { PlannerData } from '../../domain/PlannerData';
import { FinancialGoal } from '../../domain/FinancialGoals';
import {
  StorageLoadError,
  StorageProvider,
  StorageProviderId,
  StorageSaveError,
} from './storageProvider';
import { validateParsedGoal } from './localFileProvider';

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';

export type DriveAuthStatus =
  | 'unauthorized'
  | 'authorizing'
  | 'authorized'
  | 'expired';

export interface DriveFileInfo {
  id: string;
  name: string;
  modifiedTime: string;
}

// Module-level token storage — NEVER persisted to storage APIs
let _accessToken: string | null = null;
let _tokenExpiresAt: number | null = null;
let _tokenClient: google.accounts.oauth2.TokenClient | null = null;
// Mutable resolve/reject so the callback always settles the current Promise
let _resolveToken: (() => void) | null = null;
let _rejectToken: ((err: unknown) => void) | null = null;

export class GoogleDriveProvider implements StorageProvider {
  readonly id: StorageProviderId = 'google-drive';

  fileId: string | null = null;
  authStatus: DriveAuthStatus = 'unauthorized';
  availableFiles: DriveFileInfo[] = [];

  private pendingQueue: PlannerData[] = [];
  private readonly _onlineHandler = () => { void this._flushQueue(); };

  constructor() {
    window.addEventListener('online', this._onlineHandler);
  }

  // ── Token management ──────────────────────────────────────────────────────

  async ensureToken(forceRefresh = false): Promise<void> {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) {
      throw new StorageSaveError(
        'google-drive',
        'unknown',
        false,
        'VITE_GOOGLE_CLIENT_ID is not configured',
      );
    }

    const isExpired =
      !_accessToken ||
      forceRefresh ||
      (_tokenExpiresAt !== null && Date.now() > _tokenExpiresAt - 60_000);

    if (!isExpired) return;

    return new Promise<void>((resolve, reject) => {
      // Update module-level handles so the callback always settles THIS Promise,
      // even if _tokenClient was initialised during a previous ensureToken call.
      _resolveToken = resolve;
      _rejectToken = reject;

      if (!_tokenClient) {
        _tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: DRIVE_SCOPE,
          callback: (response) => {
            if (response.error) {
              this.authStatus = 'expired';
              _rejectToken?.(
                new StorageSaveError(
                  'google-drive',
                  'network-error',
                  true,
                  `Auth error: ${response.error}`,
                ),
              );
              return;
            }
            _accessToken = response.access_token;
            _tokenExpiresAt = Date.now() + Number(response.expires_in) * 1000;
            this.authStatus = 'authorized';
            _resolveToken?.();
          },
        });
      }
      this.authStatus = 'authorizing';
      _tokenClient.requestAccessToken({ prompt: forceRefresh ? 'consent' : '' });
    });
  }

  // ── Initialisation ────────────────────────────────────────────────────────

  async initNew(planName?: string): Promise<void> {
    await this.ensureToken();
    const emptyData = new PlannerData();
    const name = planName?.trim()
      ? `${planName.trim()}.json`
      : `financial-plan-${Date.now()}.json`;
    const fileId = await this._createFile(name, emptyData);
    this.fileId = fileId;
  }

  async initOpen(): Promise<{ files: DriveFileInfo[] }> {
    await this.ensureToken();
    const files = await this._listFiles();
    this.availableFiles = files;
    return { files };
  }

  async selectFile(fileId: string): Promise<PlannerData> {
    this.fileId = fileId;
    return this._readFile(fileId);
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.ensureToken();
    const response = await fetch(`${DRIVE_FILES_URL}/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${_accessToken}` },
    });
    if (!response.ok && response.status !== 404) {
      throw new StorageSaveError('google-drive', 'network-error', true);
    }
  }

  // ── StorageProvider interface ─────────────────────────────────────────────

  async save(data: PlannerData): Promise<void> {
    if (!this.fileId) {
      // No file selected yet (e.g. mid-open flow) — skip silently
      return;
    }
    if (!navigator.onLine) {
      this.pendingQueue.push(data);
      return;
    }
    await this._doSave(data);
  }

  async load(): Promise<PlannerData | null> {
    if (!this.fileId) return null;
    await this.ensureToken();
    return this._readFile(this.fileId);
  }

  async clearSession(): Promise<void> {
    window.removeEventListener('online', this._onlineHandler);
    this.fileId = null;
    this.authStatus = 'unauthorized';
    this.availableFiles = [];
    this.pendingQueue = [];
    _accessToken = null;
    _tokenExpiresAt = null;
  }

  // ── Internal Drive REST helpers ───────────────────────────────────────────

  private async _doSave(data: PlannerData): Promise<void> {
    try {
      await this.ensureToken();
      const response = await fetch(
        `${DRIVE_UPLOAD_URL}/${this.fileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${_accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
      );
      if (response.status === 401) {
        await this.ensureToken(true);
        await this._doSave(data); // retry once
        return;
      }
      if (!response.ok) {
        if (response.status === 507 || response.status === 403) {
          throw new StorageSaveError('google-drive', 'quota-exceeded', false);
        }
        throw new StorageSaveError('google-drive', 'network-error', true);
      }
    } catch (err) {
      if (err instanceof StorageSaveError) throw err;
      if (!navigator.onLine) {
        this.pendingQueue.push(data);
        throw new StorageSaveError('google-drive', 'network-error', true);
      }
      throw new StorageSaveError('google-drive', 'unknown', true, String(err));
    }
  }

  private async _flushQueue(): Promise<void> {
    if (this.pendingQueue.length === 0) return;
    const latest = this.pendingQueue[this.pendingQueue.length - 1];
    this.pendingQueue = [];
    try {
      await this._doSave(latest);
    } catch {
      // will retry on next online event or manual save
    }
  }

  private async _listFiles(): Promise<DriveFileInfo[]> {
    await this.ensureToken();
    const url = `${DRIVE_FILES_URL}?spaces=appDataFolder&fields=files(id,name,modifiedTime)&pageSize=50`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${_accessToken}` },
    });
    if (!response.ok) {
      throw new StorageLoadError('google-drive', 'network-error');
    }
    const json = (await response.json()) as { files: DriveFileInfo[] };
    return json.files ?? [];
  }

  private async _createFile(
    name: string,
    data: PlannerData,
  ): Promise<string> {
    const metadata = { name, parents: ['appDataFolder'], mimeType: 'application/json' };
    const boundary = crypto.randomUUID().replace(/-/g, '');
    const body = [
      `--${boundary}`,
      'Content-Type: application/json; charset=UTF-8',
      '',
      JSON.stringify(metadata),
      `--${boundary}`,
      'Content-Type: application/json',
      '',
      JSON.stringify(data),
      `--${boundary}--`,
    ].join('\r\n');

    const response = await fetch(
      `${DRIVE_UPLOAD_URL}?uploadType=multipart`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${_accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body,
      },
    );
    if (!response.ok) {
      throw new StorageSaveError('google-drive', 'network-error', true);
    }
    const json = (await response.json()) as { id: string };
    return json.id;
  }

  private async _readFile(fileId: string): Promise<PlannerData> {
    await this.ensureToken();
    const response = await fetch(
      `${DRIVE_FILES_URL}/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${_accessToken}` },
      },
    );
    if (response.status === 404) {
      throw new StorageLoadError('google-drive', 'file-not-found');
    }
    if (!response.ok) {
      throw new StorageLoadError('google-drive', 'network-error');
    }
    const text = await response.text();
    return this._parsePlannerData(text);
  }

  private _parsePlannerData(text: string): PlannerData {
    try {
      const parsed = JSON.parse(text) as PlannerData;
      if (!Array.isArray(parsed.financialGoals) || !parsed.investmentAllocations) {
        throw new StorageLoadError('google-drive', 'invalid-format');
      }
      const financialGoals = parsed.financialGoals.map((g: FinancialGoal) => {
        validateParsedGoal(g, 'google-drive');
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
      throw new StorageLoadError('google-drive', 'invalid-format');
    }
  }
}
