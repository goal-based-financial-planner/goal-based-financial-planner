import React, { Dispatch, ReactNode } from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import CustomTooltip from '../../../atoms/CustomTooltip';
import { Delete } from '@mui/icons-material';
import { deleteFinancialGoal } from '../../../../store/plannerDataActions';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';

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
              <span style={{ verticalAlign: 'middle' }}>Term</span>
              <CustomTooltip tooltipText="Number of years you have to accumulate the capital " />
            </TableCell>
            <TableCell>
              <span style={{ verticalAlign: 'middle' }}>Term type</span>
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
              <span style={{ verticalAlign: 'middle' }}>
                Capital Adjusted by Inflation
              </span>
              <CustomTooltip tooltipText="Capital adjusted by taking inflation into account" />
            </TableCell>
            <TableCell align="right" />
          </TableRow>
        </TableHead>
        <TableBody>
          {goals && goals.length > 0 ? (
            goals.map((goal, index) => (
              <TableRow key={index}>
                <TableCell>{goal.goalName}</TableCell>
                <TableCell>{goal.startYear}</TableCell>
                <TableCell>{goal.targetYear}</TableCell>
                <TableCell>{goal.targetAmount.toLocaleString(navigator.language)}</TableCell>
                <TableCell>{goal.getTerm()}</TableCell>
                <TableCell>{goal.getTermType()}</TableCell>
                <TableCell>
                  {goal.getInflationAdjustedTargetAmount().toLocaleString(navigator.language)}
                </TableCell>
                <TableCell align="right">
                  <Delete color="error" onClick={() => deleteGoal(index)} />
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
