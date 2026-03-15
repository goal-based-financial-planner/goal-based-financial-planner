/// <reference types="vite/client" />

// Jest compatibility types for test files during Vitest migration
// These allow existing test code using jest.* type annotations to compile.
import type { vi } from 'vitest';

declare global {
  // eslint-disable-next-line no-var
  var jest: typeof vi;
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type Mock<T extends (...args: any[]) => any = (...args: any[]) => any> = ReturnType<typeof vi.fn<T>>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type MockedFunction<T extends (...args: any[]) => any> = ReturnType<typeof vi.fn<T>> & T;
  }
}
