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
import CustomTooltip from '../../../common/CustomTooltip';

interface FinancialGoalsTableProps {
  goals: FinancialGoal[];
  emptyBodyPlaceholder: ReactNode;
}

const FinancialGoalsTable: React.FC<FinancialGoalsTableProps> = ({
  goals,
  emptyBodyPlaceholder: addGoalButton,
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
            <TableCell>
              Term <CustomTooltip tooltipText="Goal Name" />
            </TableCell>
            <TableCell>
              Term type <CustomTooltip tooltipText="Goal Name" />
            </TableCell>
            <TableCell>
              Capital Adjusted by Inflation{' '}
              <CustomTooltip tooltipText="Goal Name" />
            </TableCell>
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
