import React from 'react';
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
}

const FinancialGoalsTable: React.FC<FinancialGoalsTableProps> = ({ goals }) => {
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
          {goals.map((goal, index) => (
            <TableRow key={index}>
              <TableCell>{goal.goalName}</TableCell>
              <TableCell>{goal.startYear}</TableCell>
              <TableCell>{goal.targetYear}</TableCell>
              <TableCell>{goal.targetAmount}</TableCell>
              <TableCell>{goal.getTerm()}</TableCell>
              <TableCell>{goal.getTermType()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FinancialGoalsTable;
