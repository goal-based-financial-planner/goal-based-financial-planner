import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PathChoiceStep from './PathChoiceStep';

describe('PathChoiceStep', () => {
  it('renders both path options', () => {
    render(<PathChoiceStep onChoose={vi.fn()} />);
    expect(screen.getByText('Create a new plan')).toBeInTheDocument();
    expect(screen.getByText('Open existing plan')).toBeInTheDocument();
  });

  it('calls onChoose("new") when new plan card is clicked', () => {
    const onChoose = vi.fn();
    render(<PathChoiceStep onChoose={onChoose} />);
    fireEvent.click(screen.getByText('Create a new plan'));
    expect(onChoose).toHaveBeenCalledWith('new');
  });

  it('calls onChoose("open") when open existing card is clicked', () => {
    const onChoose = vi.fn();
    render(<PathChoiceStep onChoose={onChoose} />);
    fireEvent.click(screen.getByText('Open existing plan'));
    expect(onChoose).toHaveBeenCalledWith('open');
  });

  it('renders the heading', () => {
    render(<PathChoiceStep onChoose={vi.fn()} />);
    expect(screen.getByText(/How would you like to get started/i)).toBeInTheDocument();
  });
});
