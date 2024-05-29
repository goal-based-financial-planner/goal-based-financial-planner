import React from 'react';
import { render } from '@testing-library/react';
import FinancialGoalsTable from '.';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { screen } from '@testing-library/react';
import { Button } from '@mui/material';

test.skip('renders FinancialGoalsTable component', () => {
  const goals: FinancialGoal[] = [];
  goals.push(new FinancialGoal('Goal 1', 2021, 2023, 10000));
  goals.push(new FinancialGoal('Goal 2', 2021, 2025, 50000));
  goals.push(new FinancialGoal('Goal 3', 2021, 2035, 100000));

  render(
    <FinancialGoalsTable
      goals={goals}
      emptyBodyPlaceholder={<Button></Button>}
      dispatch={() => {}}
    />,
  );

  // Check if the table has the correct number of body rows
  const tableBodyRows = screen.getAllByRole('row');
  expect(tableBodyRows.length).toBe(4);

  //   Verify if term is calculated correctly
  const tableBodyCells = screen.getAllByRole('cell');
  expect(tableBodyCells[3]).toHaveTextContent('2');
  expect(tableBodyCells[8]).toHaveTextContent('4');
  expect(tableBodyCells[13]).toHaveTextContent('14');

  // Verify if term type is calculated correctly
  expect(tableBodyCells[4]).toHaveTextContent('Short Term');
  expect(tableBodyCells[9]).toHaveTextContent('Medium Term');
  expect(tableBodyCells[14]).toHaveTextContent('Long Term');
});
