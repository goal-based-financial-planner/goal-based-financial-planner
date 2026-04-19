import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import InvestmentAllocationPerTerm from './index';
import { TermType } from '../../../../types/enums';
import { InvestmentAllocationsType } from '../../../../domain/InvestmentOptions';

const emptyAllocations: InvestmentAllocationsType = {
  [TermType.SHORT_TERM]: [],
  [TermType.MEDIUM_TERM]: [],
  [TermType.LONG_TERM]: [],
};

const withOneRow: InvestmentAllocationsType = {
  ...emptyAllocations,
  [TermType.SHORT_TERM]: [
    { investmentName: 'Liquid Funds', expectedReturnPercentage: 6, investmentPercentage: 100 },
  ],
};

const Wrapper = ({
  defaultValues = emptyAllocations,
  name = TermType.SHORT_TERM,
}: {
  defaultValues?: InvestmentAllocationsType;
  name?: TermType;
}) => {
  const { control } = useForm<InvestmentAllocationsType>({ defaultValues });
  return <InvestmentAllocationPerTerm control={control} name={name} />;
};

describe('InvestmentAllocationPerTerm', () => {
  it('renders table headers', () => {
    render(<Wrapper />);
    expect(screen.getByText('Investment Name')).toBeInTheDocument();
    expect(screen.getByText('Expected Return (%)')).toBeInTheDocument();
    expect(screen.getByText('Investment (%)')).toBeInTheDocument();
  });

  it('renders Add Investment button', () => {
    render(<Wrapper />);
    expect(screen.getByRole('button', { name: /add investment/i })).toBeInTheDocument();
  });

  it('renders no rows when fields are empty', () => {
    render(<Wrapper />);
    expect(screen.queryByText('Liquid Funds')).not.toBeInTheDocument();
  });

  it('renders existing row values in read mode', () => {
    render(<Wrapper defaultValues={withOneRow} />);
    expect(screen.getByText('Liquid Funds')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('appends a new editable row when Add Investment is clicked', () => {
    render(<Wrapper />);
    fireEvent.click(screen.getByRole('button', { name: /add investment/i }));
    // Edit icons (material symbols) indicate the row is in edit mode
    expect(screen.getByText('save')).toBeInTheDocument();
  });

  it('shows edit icon for existing rows in read mode', () => {
    render(<Wrapper defaultValues={withOneRow} />);
    expect(screen.getByText('edit')).toBeInTheDocument();
  });

  it('switches row to edit mode when edit icon is clicked', () => {
    render(<Wrapper defaultValues={withOneRow} />);
    fireEvent.click(screen.getByText('edit'));
    expect(screen.getByText('save')).toBeInTheDocument();
  });

  it('saves row back to read mode when save icon is clicked', () => {
    render(<Wrapper defaultValues={withOneRow} />);
    fireEvent.click(screen.getByText('edit'));
    fireEvent.click(screen.getByText('save'));
    expect(screen.getByText('edit')).toBeInTheDocument();
  });

  it('removes a row when delete icon is clicked', () => {
    render(<Wrapper defaultValues={withOneRow} />);
    expect(screen.getByText('Liquid Funds')).toBeInTheDocument();
    fireEvent.click(screen.getByText('delete'));
    expect(screen.queryByText('Liquid Funds')).not.toBeInTheDocument();
  });

  it('renders correctly for Medium Term', () => {
    const data: InvestmentAllocationsType = {
      ...emptyAllocations,
      [TermType.MEDIUM_TERM]: [
        { investmentName: 'Index Funds', expectedReturnPercentage: 12, investmentPercentage: 60 },
      ],
    };
    render(<Wrapper defaultValues={data} name={TermType.MEDIUM_TERM} />);
    expect(screen.getByText('Index Funds')).toBeInTheDocument();
  });
});
