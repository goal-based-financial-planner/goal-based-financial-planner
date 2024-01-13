import React, { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { FinancialGoal } from '../../../../domain/FinancialGoals';

interface FinancialGoalsTableProps {
  goals: FinancialGoal[];
  addGoalButton: ReactNode;
}

const FinancialGoalsTable: React.FC<FinancialGoalsTableProps> = ({
  goals,
  addGoalButton,
}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Goal name</TableCell>
            <TableCell>Start Year</TableCell>
            <TableCell>Target Year</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Term</TableCell>
            <TableCell>Term type</TableCell>
            <TableCell>Capital Adjusted by Inflation</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {goals && goals.length > 0 ? (
            goals.map((goal, index) => (
              <TableRow key={index}>
                <TableCell>{goal.goalName}</TableCell>
                <TableCell>{goal.startYear}</TableCell>
                <TableCell>{goal.targetYear}</TableCell>
                <TableCell>{goal.targetAmount}</TableCell>
                <TableCell>{goal.getTerm()}</TableCell>
                <TableCell>{goal.getTermType()}</TableCell>
                <TableCell>{goal.getTargetAmount()}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} style={{ textAlign: 'center' }}>
                {addGoalButton}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FinancialGoalsTable;
