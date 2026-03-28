import { StorageSaveError, StorageLoadError } from './storageProvider';

describe('StorageSaveError', () => {
  it('uses default message when none provided', () => {
    const err = new StorageSaveError('local-file', 'permission-denied', false);
    expect(err.message).toBe('Save failed: permission-denied');
    expect(err.name).toBe('StorageSaveError');
    expect(err.provider).toBe('local-file');
    expect(err.reason).toBe('permission-denied');
    expect(err.retryable).toBe(false);
  });

  it('uses custom message when provided', () => {
    const err = new StorageSaveError('google-drive', 'network-error', true, 'custom msg');
    expect(err.message).toBe('custom msg');
    expect(err.retryable).toBe(true);
  });

  it('is an instance of Error', () => {
    const err = new StorageSaveError('local-file', 'unknown', false);
    expect(err).toBeInstanceOf(Error);
  });

  it('covers all save reasons', () => {
    const reasons = ['permission-denied', 'file-not-found', 'network-error', 'quota-exceeded', 'unknown'] as const;
    reasons.forEach((reason) => {
      const err = new StorageSaveError('local-file', reason, false);
      expect(err.reason).toBe(reason);
    });
  });
});

describe('StorageLoadError', () => {
  it('uses default message when none provided', () => {
    const err = new StorageLoadError('local-file', 'invalid-format');
    expect(err.message).toBe('Load failed: invalid-format');
    expect(err.name).toBe('StorageLoadError');
    expect(err.provider).toBe('local-file');
    expect(err.reason).toBe('invalid-format');
  });

  it('uses custom message when provided', () => {
    const err = new StorageLoadError('google-drive', 'file-not-found', 'custom msg');
    expect(err.message).toBe('custom msg');
  });

  it('is an instance of Error', () => {
    const err = new StorageLoadError('local-file', 'unknown');
    expect(err).toBeInstanceOf(Error);
  });

  it('covers all load reasons', () => {
    const reasons = ['permission-denied', 'file-not-found', 'invalid-format', 'network-error', 'unknown'] as const;
    reasons.forEach((reason) => {
      const err = new StorageLoadError('google-drive', reason);
      expect(err.reason).toBe(reason);
    });
  });
});
