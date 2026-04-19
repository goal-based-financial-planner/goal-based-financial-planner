import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InvestmentAllocations from './index';
import { TermType } from '../../../../types/enums';
import { InvestmentAllocationsType } from '../../../../domain/InvestmentOptions';
import { updateInvestmentAllocation } from '../../../../store/plannerDataActions';

vi.mock('../../../../store/plannerDataActions', async (importActual) => {
  const actual = await importActual();
  return { ...actual, updateInvestmentAllocation: vi.fn() };
});

const mockDispatch = vi.fn();
const mockOnSubmit = vi.fn();

const emptyAllocations: InvestmentAllocationsType = {
  [TermType.SHORT_TERM]: [],
  [TermType.MEDIUM_TERM]: [],
  [TermType.LONG_TERM]: [],
};

const validAllocations: InvestmentAllocationsType = {
  ...emptyAllocations,
  [TermType.SHORT_TERM]: [
    { investmentName: 'Liquid Funds', expectedReturnPercentage: 6, investmentPercentage: 100 },
  ],
};

const incompleteAllocations: InvestmentAllocationsType = {
  ...emptyAllocations,
  [TermType.SHORT_TERM]: [
    { investmentName: '', expectedReturnPercentage: 6, investmentPercentage: 50 },
  ],
};

const splitAllocations: InvestmentAllocationsType = {
  ...emptyAllocations,
  [TermType.SHORT_TERM]: [
    { investmentName: 'Liquid Funds', expectedReturnPercentage: 6, investmentPercentage: 60 },
    { investmentName: 'Index Funds', expectedReturnPercentage: 12, investmentPercentage: 30 },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('InvestmentAllocations', () => {
  it('renders the term type label in the heading', () => {
    render(
      <InvestmentAllocations
        investmentAllocations={emptyAllocations}
        dispatch={mockDispatch}
        onSubmit={mockOnSubmit}
        termType={TermType.SHORT_TERM}
      />,
    );
    expect(screen.getByText(/investment allocations for short term goals/i)).toBeInTheDocument();
  });

  it('renders the instructional text', () => {
    render(
      <InvestmentAllocations
        investmentAllocations={emptyAllocations}
        dispatch={mockDispatch}
        onSubmit={mockOnSubmit}
        termType={TermType.SHORT_TERM}
      />,
    );
    expect(screen.getByText(/adds up to 100%/i)).toBeInTheDocument();
  });

  it('renders the Submit button', () => {
    render(
      <InvestmentAllocations
        investmentAllocations={emptyAllocations}
        dispatch={mockDispatch}
        onSubmit={mockOnSubmit}
        termType={TermType.SHORT_TERM}
      />,
    );
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('shows warning snackbar when allocation list is empty on submit', async () => {
    render(
      <InvestmentAllocations
        investmentAllocations={emptyAllocations}
        dispatch={mockDispatch}
        onSubmit={mockOnSubmit}
        termType={TermType.SHORT_TERM}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByText(/add atleast one allocation/i)).toBeInTheDocument();
    });
    expect(updateInvestmentAllocation).not.toHaveBeenCalled();
  });

  it('shows warning snackbar when allocation has empty name', async () => {
    render(
      <InvestmentAllocations
        investmentAllocations={incompleteAllocations}
        dispatch={mockDispatch}
        onSubmit={mockOnSubmit}
        termType={TermType.SHORT_TERM}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByText(/delete empty allocation/i)).toBeInTheDocument();
    });
    expect(updateInvestmentAllocation).not.toHaveBeenCalled();
  });

  it('shows warning snackbar when percentages do not add up to 100', async () => {
    render(
      <InvestmentAllocations
        investmentAllocations={splitAllocations}
        dispatch={mockDispatch}
        onSubmit={mockOnSubmit}
        termType={TermType.SHORT_TERM}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid allocation/i)).toBeInTheDocument();
    });
    expect(updateInvestmentAllocation).not.toHaveBeenCalled();
  });

  it('calls dispatch and onSubmit when allocations are valid', async () => {
    render(
      <InvestmentAllocations
        investmentAllocations={validAllocations}
        dispatch={mockDispatch}
        onSubmit={mockOnSubmit}
        termType={TermType.SHORT_TERM}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(updateInvestmentAllocation).toHaveBeenCalledWith(mockDispatch, validAllocations);
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it('renders the inner InvestmentAllocationPerTerm table headers', () => {
    render(
      <InvestmentAllocations
        investmentAllocations={emptyAllocations}
        dispatch={mockDispatch}
        onSubmit={mockOnSubmit}
        termType={TermType.LONG_TERM}
      />,
    );
    expect(screen.getByText('Investment Name')).toBeInTheDocument();
  });

  it('closes snackbar after it is opened', async () => {
    render(
      <InvestmentAllocations
        investmentAllocations={emptyAllocations}
        dispatch={mockDispatch}
        onSubmit={mockOnSubmit}
        termType={TermType.SHORT_TERM}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() =>
      expect(screen.getByText(/add atleast one allocation/i)).toBeInTheDocument(),
    );
  });
});
