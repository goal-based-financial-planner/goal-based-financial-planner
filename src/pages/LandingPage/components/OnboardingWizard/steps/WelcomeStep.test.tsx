import React from 'react';
import { render, screen } from '@testing-library/react';
import WelcomeStep from './WelcomeStep';

vi.mock('../../../../../assets/icon.png', () => ({ default: 'icon.png' }));

describe('WelcomeStep', () => {
  it('renders the main headline', () => {
    render(<WelcomeStep />);
    expect(screen.getByText(/Plan your financial future/i)).toBeInTheDocument();
  });

  it('renders all three benefit bullets', () => {
    render(<WelcomeStep />);
    expect(screen.getByText(/Define financial goals by timeline/i)).toBeInTheDocument();
    expect(screen.getByText(/investment allocation suggestions/i)).toBeInTheDocument();
    expect(screen.getByText(/Track progress over time/i)).toBeInTheDocument();
  });

  it('renders the app icon', () => {
    render(<WelcomeStep />);
    expect(screen.getByAltText('app icon')).toBeInTheDocument();
  });
});
