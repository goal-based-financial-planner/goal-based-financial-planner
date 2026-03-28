import { renderHook, act } from '@testing-library/react';
import { useAutosave } from './useAutosave';
import { PlannerData } from '../domain/PlannerData';
import { StorageSaveError } from '../util/storage';

const makeProvider = (saveFn = vi.fn().mockResolvedValue(undefined)) => ({
  id: 'local-file' as const,
  save: saveFn,
  load: vi.fn(),
  clearSession: vi.fn(),
});

describe('useAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('does not save when provider is null', () => {
    const data = new PlannerData();
    const { result } = renderHook(() => useAutosave(data, null));

    act(() => { vi.advanceTimersByTime(3000); });

    expect(result.current.saveStatus).toBe('idle');
  });

  it('debounces save and transitions to "saving" then "saved"', async () => {
    const provider = makeProvider();
    const data = new PlannerData();

    const { result } = renderHook(() => useAutosave(data, provider));

    expect(result.current.saveStatus).toBe('idle');

    await act(async () => { vi.advanceTimersByTime(2000); });

    expect(provider.save).toHaveBeenCalledWith(data);
    expect(result.current.saveStatus).toBe('saved');
    expect(result.current.lastSavedAt).not.toBeNull();
    expect(result.current.lastError).toBeNull();
  });

  it('transitions to "error" on save failure', async () => {
    const saveError = new StorageSaveError('local-file', 'unknown', false);
    const provider = makeProvider(vi.fn().mockRejectedValue(saveError));
    const data = new PlannerData();

    const { result } = renderHook(() => useAutosave(data, provider));

    await act(async () => { vi.advanceTimersByTime(2000); });

    expect(result.current.saveStatus).toBe('error');
    expect(result.current.lastError).toBe(saveError);
  });

  it('wraps non-StorageSaveError in StorageSaveError', async () => {
    const provider = makeProvider(vi.fn().mockRejectedValue(new Error('network fail')));
    const data = new PlannerData();

    const { result } = renderHook(() => useAutosave(data, provider));

    await act(async () => { vi.advanceTimersByTime(2000); });

    expect(result.current.saveStatus).toBe('error');
    expect(result.current.lastError).toBeInstanceOf(StorageSaveError);
  });

  it('triggerManualSave immediately calls save without waiting for debounce', async () => {
    const provider = makeProvider();
    const data = new PlannerData();

    const { result } = renderHook(() => useAutosave(data, provider));

    await act(async () => { result.current.triggerManualSave(); });

    expect(provider.save).toHaveBeenCalledWith(data);
  });

  it('triggerManualSave is a no-op when provider is null', async () => {
    const data = new PlannerData();
    const { result } = renderHook(() => useAutosave(data, null));

    await act(async () => { result.current.triggerManualSave(); });
    // no error thrown
    expect(result.current.saveStatus).toBe('idle');
  });

  it('transitions from "saved" back to "idle" after display timeout', async () => {
    const provider = makeProvider();
    const data = new PlannerData();

    const { result } = renderHook(() => useAutosave(data, provider));

    await act(async () => { vi.advanceTimersByTime(2000); });
    expect(result.current.saveStatus).toBe('saved');

    await act(async () => { vi.advanceTimersByTime(3000); });
    expect(result.current.saveStatus).toBe('idle');
  });
});
