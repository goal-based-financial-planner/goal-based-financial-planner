import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SIPForm from './index';
import { SIPEntry } from '../../../../../../types/investmentLog';
import { addInvestmentLogEntry, editInvestmentLogEntry } from '../../../../../../store/plannerDataActions';

vi.mock('../../../../../../store/plannerDataActions', async (importActual) => {
  const actual = await importActual();
  return {
    ...actual,
    addInvestmentLogEntry: vi.fn(),
    editInvestmentLogEntry: vi.fn(),
  };
});

const mockDispatch = jest.fn();
const investmentTypes = ['Liquid Funds', 'Index Funds', 'Gold'];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SIPForm', () => {
  describe('Add mode', () => {
    it('renders the Add SIP dialog with all base fields', () => {
      render(<SIPForm open onClose={jest.fn()} investmentTypes={investmentTypes} dispatch={mockDispatch} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText(/fund \/ investment name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/investment type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/monthly sip amount/i)).toBeInTheDocument();
    });

    it('does not show return % field when type is a known suggestion', () => {
      render(<SIPForm open onClose={jest.fn()} investmentTypes={investmentTypes} dispatch={mockDispatch} />);

      expect(screen.queryByLabelText(/expected annual return/i)).not.toBeInTheDocument();
    });

    it('shows return % field when a custom type is entered', async () => {
      render(<SIPForm open onClose={jest.fn()} investmentTypes={investmentTypes} dispatch={mockDispatch} />);

      fireEvent.change(screen.getByLabelText(/investment type/i), { target: { value: 'PPF' } });

      expect(await screen.findByLabelText(/expected annual return/i)).toBeInTheDocument();
    });

    it('shows helper text on return % field describing its purpose', async () => {
      render(<SIPForm open onClose={jest.fn()} investmentTypes={investmentTypes} dispatch={mockDispatch} />);

      fireEvent.change(screen.getByLabelText(/investment type/i), { target: { value: 'PPF' } });

      expect(await screen.findByText(/used to project portfolio growth/i)).toBeInTheDocument();
    });

    it('return % field accepts decimal values', async () => {
      render(<SIPForm open onClose={jest.fn()} investmentTypes={investmentTypes} dispatch={mockDispatch} />);

      fireEvent.change(screen.getByLabelText(/investment type/i), { target: { value: 'PPF' } });

      const returnInput = await screen.findByLabelText(/expected annual return/i) as HTMLInputElement;
      fireEvent.change(returnInput, { target: { value: '7.1' } });

      expect(returnInput.value).toBe('7.1');
    });

    it('shows validation error when return % field is empty for custom type', async () => {
      render(<SIPForm open onClose={jest.fn()} investmentTypes={investmentTypes} dispatch={mockDispatch} />);

      fireEvent.change(screen.getByLabelText(/investment type/i), { target: { value: 'PPF' } });
      await userEvent.click(screen.getByRole('button', { name: /add sip/i }));

      expect(await screen.findByText(/return % is required/i)).toBeInTheDocument();
      expect(addInvestmentLogEntry).not.toHaveBeenCalled();
    });
  });

  describe('Edit mode', () => {
    it('pre-populates fields from the existing entry', () => {
      const entry: SIPEntry = { id: 'e1', name: 'Axis Liquid', type: 'Liquid Funds', monthlyAmount: 30000 };
      render(<SIPForm open onClose={jest.fn()} investmentTypes={investmentTypes} dispatch={mockDispatch} existingEntry={entry} />);

      expect(screen.getByDisplayValue('Axis Liquid')).toBeInTheDocument();
      expect(screen.getByDisplayValue('30000')).toBeInTheDocument();
    });

    it('pre-populates expectedReturnPct for a custom-type entry', () => {
      const entry: SIPEntry = { id: 'e2', name: 'PPF', type: 'PPF', monthlyAmount: 12500, expectedReturnPct: 7.1 };
      render(<SIPForm open onClose={jest.fn()} investmentTypes={investmentTypes} dispatch={mockDispatch} existingEntry={entry} />);

      expect(screen.getByDisplayValue('7.1')).toBeInTheDocument();
    });

    it('calls editInvestmentLogEntry with correct args on submit', async () => {
      const entry: SIPEntry = { id: 'e1', name: 'Axis Liquid', type: 'Liquid Funds', monthlyAmount: 30000 };
      render(<SIPForm open onClose={jest.fn()} investmentTypes={investmentTypes} dispatch={mockDispatch} existingEntry={entry} />);

      await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(editInvestmentLogEntry).toHaveBeenCalledWith(
          mockDispatch, 'e1', 'Axis Liquid', 'Liquid Funds', 30000, undefined,
        );
      });
    });

    it('calls editInvestmentLogEntry with expectedReturnPct for custom type on submit', async () => {
      const entry: SIPEntry = { id: 'e2', name: 'PPF', type: 'PPF', monthlyAmount: 12500, expectedReturnPct: 7.1 };
      render(<SIPForm open onClose={jest.fn()} investmentTypes={investmentTypes} dispatch={mockDispatch} existingEntry={entry} />);

      await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(editInvestmentLogEntry).toHaveBeenCalledWith(
          mockDispatch, 'e2', 'PPF', 'PPF', 12500, 7.1,
        );
      });
    });
  });

  describe('Cancel', () => {
    it('calls onClose when Cancel is clicked', () => {
      const onClose = jest.fn();
      render(<SIPForm open onClose={onClose} investmentTypes={investmentTypes} dispatch={mockDispatch} />);

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
