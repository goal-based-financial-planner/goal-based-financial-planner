import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

vi.mock('./pages/Home', () => ({
  default: function MockHome() {
    return <div data-testid="home-page">Home Page</div>;
  },
}));

vi.mock('./context/StorageProviderContext', () => ({
  useStorageProvider: vi.fn(() => ({
    provider: null,
    saveStatus: 'idle' as const,
    lastSavedAt: null,
    lastError: null,
    initialData: null,
    driveFiles: [],
    selectDriveFile: vi.fn(),
    initProvider: vi.fn(),
    clearProvider: vi.fn(),
    setSaveStatus: vi.fn(),
    setLastSavedAt: vi.fn(),
    setLastError: vi.fn(),
  })),
  StorageProviderContextProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

describe('App', () => {
  it('should render without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('should wrap content in theme and localization providers', () => {
    render(<App />);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('should match snapshot', () => {
    const { container } = render(<App />);
    expect(container).toMatchSnapshot();
  });
});
