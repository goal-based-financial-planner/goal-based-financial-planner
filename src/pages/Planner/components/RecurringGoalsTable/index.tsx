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
import { formatNumber } from '../../../../types/util';
import { Dispatch } from 'react';

type RecurringGoalsTableProps = {
  recurringGoals: FinancialGoal[];
  dispatch: Dispatch<PlannerDataAction>;
};

const RecurringGoalsTable = ({
  recurringGoals,
  dispatch,
}: RecurringGoalsTableProps) => {
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
                Monthly Target
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recurringGoals.map((goal) => {
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
                      ₹{formatNumber(goal.getTargetAmount())}
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
};

export default RecurringGoalsTable;
