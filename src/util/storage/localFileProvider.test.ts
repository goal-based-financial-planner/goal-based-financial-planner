import { validateParsedGoal, LocalFileProvider, fsaSupported } from './localFileProvider';
import { StorageLoadError, StorageSaveError } from './storageProvider';
import { GoalType } from '../../types/enums';
import { PlannerData } from '../../domain/PlannerData';

const validGoal = {
  goalName: 'Retirement',
  goalType: GoalType.ONE_TIME,
  targetAmount: 1000000,
  startDate: '2024-01-01',
  targetDate: '2034-01-01',
};

describe('validateParsedGoal', () => {
  it('passes for a valid goal', () => {
    expect(() => validateParsedGoal(validGoal, 'local-file')).not.toThrow();
  });

  it('throws when goalName is not a string', () => {
    expect(() => validateParsedGoal({ ...validGoal, goalName: 123 }, 'local-file')).toThrow(StorageLoadError);
  });

  it('throws when goalName contains HTML/script characters', () => {
    expect(() =>
      validateParsedGoal({ ...validGoal, goalName: '<script>alert(1)</script>' }, 'local-file'),
    ).toThrow(StorageLoadError);
  });

  it('throws when goalName is empty string', () => {
    expect(() => validateParsedGoal({ ...validGoal, goalName: '   ' }, 'local-file')).toThrow(StorageLoadError);
  });

  it('throws when goalType is not a valid enum value', () => {
    expect(() => validateParsedGoal({ ...validGoal, goalType: 'INVALID' }, 'local-file')).toThrow(StorageLoadError);
  });

  it('throws when targetAmount is not a number', () => {
    expect(() => validateParsedGoal({ ...validGoal, targetAmount: '1000' }, 'local-file')).toThrow(StorageLoadError);
  });

  it('throws when targetAmount is zero', () => {
    expect(() => validateParsedGoal({ ...validGoal, targetAmount: 0 }, 'local-file')).toThrow(StorageLoadError);
  });

  it('throws when targetAmount is negative', () => {
    expect(() => validateParsedGoal({ ...validGoal, targetAmount: -100 }, 'local-file')).toThrow(StorageLoadError);
  });

  it('throws when targetAmount is NaN', () => {
    expect(() => validateParsedGoal({ ...validGoal, targetAmount: NaN }, 'local-file')).toThrow(StorageLoadError);
  });

  it('accepts google-drive source', () => {
    expect(() => validateParsedGoal(validGoal, 'google-drive')).not.toThrow();
  });
});

describe('fsaSupported', () => {
  it('is a boolean', () => {
    expect(typeof fsaSupported).toBe('boolean');
  });
});

describe('LocalFileProvider — fallback mode (jsdom has no FSA)', () => {
  let provider: LocalFileProvider;

  beforeEach(() => {
    // jsdom has no showOpenFilePicker → fallbackMode is always true in tests
    provider = new LocalFileProvider();
    // Set up URL stubs required by _triggerDownload
    URL.createObjectURL = vi.fn().mockReturnValue('blob:mock');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('has id "local-file"', () => {
    expect(provider.id).toBe('local-file');
  });

  it('load returns null when no fileHandle', async () => {
    expect(await provider.load()).toBeNull();
  });

  it('clearSession resets fileHandle and permissionState', async () => {
    await provider.clearSession();
    expect(provider.fileHandle).toBeNull();
    expect(provider.permissionState).toBe('unknown');
  });

  it('save in fallback mode triggers a download', async () => {
    const mockAnchor = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLElement);

    await provider.save(new PlannerData());

    expect(mockAnchor.click).toHaveBeenCalled();
    expect(mockAnchor.download).toBe('financial-plan.json');
  });

  it('initNew is a no-op in fallback mode', async () => {
    await expect(provider.initNew()).resolves.toBeUndefined();
  });

  it('initOpen returns null in fallback mode', async () => {
    expect(await provider.initOpen()).toBeNull();
  });
});

describe('LocalFileProvider — FSA code paths (fallbackMode overridden)', () => {
  let provider: LocalFileProvider;

  const makeWritable = () => ({
    write: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
  });

  const makeHandle = (content: string) =>
    ({
      queryPermission: vi.fn().mockResolvedValue('granted'),
      requestPermission: vi.fn().mockResolvedValue('granted'),
      createWritable: vi.fn().mockResolvedValue(makeWritable()),
      getFile: vi.fn().mockResolvedValue({ text: vi.fn().mockResolvedValue(content) }),
    }) as unknown as FileSystemFileHandle;

  beforeEach(() => {
    provider = new LocalFileProvider();
    // Override fallbackMode so FSA code paths are exercised
    (provider as unknown as { fallbackMode: boolean }).fallbackMode = false;
    URL.createObjectURL = vi.fn().mockReturnValue('blob:mock');
    URL.revokeObjectURL = vi.fn();
  });

  it('save silently no-ops when fileHandle is null (open-plan pending)', async () => {
    provider.fileHandle = null;
    await expect(provider.save(new PlannerData())).resolves.toBeUndefined();
  });

  it('save succeeds when permissionState is granted and handle is present', async () => {
    provider.fileHandle = makeHandle('{}');
    provider.permissionState = 'granted';
    await expect(provider.save(new PlannerData())).resolves.toBeUndefined();
  });

  it('save throws StorageSaveError when permission is denied', async () => {
    provider.fileHandle = {
      queryPermission: vi.fn().mockResolvedValue('denied'),
    } as unknown as FileSystemFileHandle;
    provider.permissionState = 'unknown';
    await expect(provider.save(new PlannerData())).rejects.toBeInstanceOf(StorageSaveError);
  });

  it('load returns parsed PlannerData when handle is set and permission granted', async () => {
    const data = new PlannerData();
    provider.fileHandle = makeHandle(JSON.stringify(data));
    provider.permissionState = 'granted';
    const result = await provider.load();
    expect(result).not.toBeNull();
  });

  it('load returns null when fileHandle is null', async () => {
    expect(await provider.load()).toBeNull();
  });

  it('initOpen throws StorageLoadError on invalid JSON', async () => {
    vi.stubGlobal('showOpenFilePicker', vi.fn().mockResolvedValue([makeHandle('not-json')]));
    await expect(provider.initOpen()).rejects.toBeInstanceOf(StorageLoadError);
    vi.unstubAllGlobals();
  });

  it('initOpen returns null on AbortError', async () => {
    vi.stubGlobal(
      'showOpenFilePicker',
      vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError')),
    );
    expect(await provider.initOpen()).toBeNull();
    vi.unstubAllGlobals();
  });

  it('initNew returns without error on AbortError', async () => {
    vi.stubGlobal(
      'showSaveFilePicker',
      vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError')),
    );
    await expect(provider.initNew()).resolves.toBeUndefined();
    vi.unstubAllGlobals();
  });
});
