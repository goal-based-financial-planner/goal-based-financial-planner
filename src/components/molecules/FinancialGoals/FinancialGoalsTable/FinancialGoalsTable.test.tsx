import React from 'react';
import { render } from '@testing-library/react';
import FinancialGoalsTable from '.';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { screen } from '@testing-library/react';

test('renders FinancialGoalsTable component', () => {
  const goals: FinancialGoal[] = [];
  goals.push(new FinancialGoal('Goal 1', 2021, 2023, 10000));
  goals.push(new FinancialGoal('Goal 2', 2021, 2025, 50000));
  goals.push(new FinancialGoal('Goal 3', 2021, 2035, 100000));

  render(<FinancialGoalsTable goals={goals} dispatch={() => {}} />);

  // Check if the table has the correct number of body rows
  const tableBodyRows = screen.getAllByRole('row');
  expect(tableBodyRows.length).toBe(4);

  // Check if the table has the correct number of cells
  // const tableCells = screen.getAllByRole('cell');
  // expect(tableCells.length).toBe(12);
});
