import React, { Dispatch, ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import CustomTooltip from '../../../common/CustomTooltip';
import { Delete } from '@mui/icons-material';
import { deleteFinancialGoal } from '../../../../store/plannerDataActions';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { useConfiguraiton } from '../../../../hooks/useConfiguration';

interface FinancialGoalsTableProps {
  goals: FinancialGoal[];
  emptyBodyPlaceholder: ReactNode;
  dispatch: Dispatch<PlannerDataAction>;
}

const FinancialGoalsTable: React.FC<FinancialGoalsTableProps> = ({
  goals,
  emptyBodyPlaceholder: addGoalButton,
  dispatch,
}) => {
  const { inflationPercentage } = useConfiguraiton();

  const deleteGoal = (index: any) => {
    deleteFinancialGoal(dispatch, index);
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Goal name</TableCell>

            <TableCell>Start Year</TableCell>
            <TableCell>Target Year</TableCell>
            <TableCell>Capital Required</TableCell>
            <TableCell>
              Term
              <CustomTooltip tooltipText="Number of years you have to accumulate the capital " />
            </TableCell>
            <TableCell>
              Term type{' '}
              <CustomTooltip
                tooltipText={
                  <>
                    <ul>
                      <li>Short Term if the term is less than 4 years</li>
                      <li>Medium Term if the term is less than 6 years</li>
                      <li>Long Term if the term is more than 6 years</li>
                    </ul>
                  </>
                }
              />
            </TableCell>
            <TableCell>
              Capital Adjusted by Inflation
              <CustomTooltip tooltipText="Capital adjusted by taking inflation into account" />
            </TableCell>
            <TableCell />
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
                <TableCell>
                  {goal.getInfaltionAdjustedTargetAmount(inflationPercentage)}
                </TableCell>
                <TableCell>
                  <Delete color="action" onClick={() => deleteGoal(index)} />
                </TableCell>
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
