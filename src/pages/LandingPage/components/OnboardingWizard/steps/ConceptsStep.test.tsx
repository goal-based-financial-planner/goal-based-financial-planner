import React from 'react';
import { render, screen } from '@testing-library/react';
import ConceptsStep from './ConceptsStep';

describe('ConceptsStep', () => {
  it('renders the section heading', () => {
    render(<ConceptsStep />);
    expect(screen.getByText(/How goals and allocations work/i)).toBeInTheDocument();
  });

  it('renders all three term categories', () => {
    render(<ConceptsStep />);
    expect(screen.getByText('Short Term')).toBeInTheDocument();
    expect(screen.getByText('Medium Term')).toBeInTheDocument();
    expect(screen.getByText('Long Term')).toBeInTheDocument();
  });

  it('renders timelines for each term', () => {
    render(<ConceptsStep />);
    expect(screen.getByText('Up to 3 years')).toBeInTheDocument();
    expect(screen.getByText('3 – 7 years')).toBeInTheDocument();
    expect(screen.getByText('7+ years')).toBeInTheDocument();
  });

  it('renders allocation description text', () => {
    render(<ConceptsStep />);
    expect(screen.getByText(/Mostly debt instruments/i)).toBeInTheDocument();
    expect(screen.getByText(/Balanced mix of equity and debt/i)).toBeInTheDocument();
    expect(screen.getByText(/Mostly equity/i)).toBeInTheDocument();
  });
});
