import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { deleteFinancialGoal } from '../../../../store/plannerDataActions';
import { formatCurrency } from '../../../../types/util';
import { Dispatch, memo } from 'react';

type RecurringGoalsTableProps = {
  recurringGoals: FinancialGoal[];
  dispatch: Dispatch<PlannerDataAction>;
};

const RecurringGoalsTable = memo(
  ({ recurringGoals, dispatch }: RecurringGoalsTableProps) => {
  const handleDelete = (goalId: string) => {
    deleteFinancialGoal(dispatch, goalId);
  };

  if (recurringGoals.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Goal Name</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                Yearly Target
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                Duration
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recurringGoals.map((goal) => {
              const duration = goal.recurringDurationYears ?? 1;
              return (
                <TableRow
                  key={goal.id}
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: 'action.hover',
                    },
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    },
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {goal.goalName}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1">
                      {formatCurrency(goal.getTargetAmount() / duration)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body1">
                      {duration} {duration === 1 ? 'year' : 'years'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleDelete(goal.id)}
                      color="error"
                      size="small"
                    >
                      <span className="material-symbols-rounded">delete</span>
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
});

RecurringGoalsTable.displayName = 'RecurringGoalsTable';

export default RecurringGoalsTable;
