import React, { Dispatch } from 'react';
import {
  Box,
  Card,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { deleteFinancialGoal } from '../../../../store/plannerDataActions';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import useInvestmentCalculator from '../../hooks/useInvestmentCalculator';
import { PlannerData } from '../../../../domain/PlannerData';

type FinancialGoalCardProps = {
  goal: FinancialGoal;
  dispatch: Dispatch<PlannerDataAction>;
  plannerData: PlannerData;
};

const FinancialGoalCard = ({
  goal,
  dispatch,
  plannerData,
}: FinancialGoalCardProps) => {
  const handleDelete = () => {
    deleteFinancialGoal(dispatch, goal.id);
  };

  const { calculateInvestmentNeededForGoals } =
    useInvestmentCalculator(plannerData);
  const investmentBreakdown = calculateInvestmentNeededForGoals(
    plannerData,
    goal.startDate,
    // goal.getTermType(),
  );

  return (
    <Card
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: '#f7f9fc',
        boxShadow: 3,
        p: 2,
        mb: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <Box>
          <Typography variant="h6" noWrap>
            {goal.getGoalName()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {goal.getInvestmentStartDate()} - {goal.getTargetDate()}
          </Typography>
        </Box>
        <IconButton color="error" onClick={handleDelete}>
          <DeleteIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mt: 2,
          gap: 1,
        }}
      >
        <Box>
          <Typography variant="h5" color="primary">
            {goal
              .getInflationAdjustedTargetAmount()
              .toLocaleString(navigator.language)}
          </Typography>
        </Box>
      </Box>

      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="investment-breakdown-content"
          id="investment-breakdown-header"
        >
          <Typography>Investment Breakdown</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer>
            <Table size="small">
              <TableBody>
                {investmentBreakdown
                  .find((a) => a.goalName === goal.getGoalName())
                  ?.investmentSuggestions.map((a, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{a.investmentName}</TableCell>
                      <TableCell align="right">
                        {a.amount.toLocaleString(navigator.language, {
                          maximumFractionDigits: 0,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    </Card>
  );
};

export default FinancialGoalCard;
