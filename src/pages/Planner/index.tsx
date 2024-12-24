import React, { useEffect, useReducer, useState } from 'react';
import {
  getInitialData,
  persistPlannerData,
  plannerDataReducer,
} from '../../store/plannerDataReducer';
import {
  Box,
  Divider,
  FormControl,
  Grid2 as Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  styled,
  Typography,
} from '@mui/material';
import FinancialGoalForm from './components/FinancialGoalForm';
import InvestmentSuggestions from './new_components/investmentSuggestions';
import TermwiseProgress from './new_components/TermwiseProgress';
import GoalCard from './new_components/goalCard';
import LiveCounter from '../../components/LiveNumberCounter';

export const StyledBox = styled(Box)(({ theme }) => ({
  border: '1px solid #F0F0F0',
  backgroundColor: 'white',
  borderRadius: '10px',
  padding: '16px',
}));

const Planner: React.FC = () => {
  const [plannerData, dispatch] = useReducer(
    plannerDataReducer,
    getInitialData(),
  );

  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAdd = () => {
    setIsFormOpen(true);
  };

  useEffect(() => {
    persistPlannerData(plannerData);
  }, [plannerData]);

  const [selectedYear, setSelectedYear] = React.useState<number>(
    new Date().getFullYear(),
  );
  const [years, setYears] = useState<number[]>([]);

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedYear(Number(event.target.value));
  };

  useEffect(() => {
    const minMaxYears = plannerData.financialGoals.reduce(
      (acc, e) => ({
        minYear: Math.min(acc.minYear, e.getInvestmentStartYear()),
        maxYear: Math.max(acc.maxYear, e.getTargetYear()),
      }),
      { minYear: Infinity, maxYear: 0 },
    );
    const years = [];
    for (let i = minMaxYears.minYear; i <= minMaxYears.maxYear; i++) {
      years.push(i);
    }
    setYears(years);
  }, [plannerData]);

  const targetAmount = plannerData.financialGoals.reduce(
    (sum, goal) => sum + goal.getInflationAdjustedTargetAmount(),
    0,
  );
  return (
    <>
      <Box
        sx={{
          minWidth: 100,
          m: 2,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', flexGrow: 1 }}>
          <LiveCounter value={targetAmount} duration={500} />
        </Box>

        <FormControl>
          <Select value={String(selectedYear)} onChange={handleChange}>
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Grid container>
        <Grid size={9} sx={{ border: '1px light black' }}>
          <TermwiseProgress plannerData={plannerData} />
          <InvestmentSuggestions
            plannerData={plannerData}
            dispatch={dispatch}
            selectedYear={selectedYear}
          />
        </Grid>
        <Grid size={3}>
          <Box
            sx={{
              pl: 2,
              pt: 2,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}
          >
            <Typography variant="h4">Financial Goals</Typography>
            <Box
              onClick={handleAdd}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                },
              }}
            >
              <span
                className="material-symbols-rounded"
                style={{
                  fontSize: '40px',

                  fontWeight: 'bold',
                }}
              >
                add_circle
              </span>
            </Box>
          </Box>
          <Grid container>
            <Grid size={12} padding={2}>
              <StyledBox
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                {plannerData.financialGoals.map((term) => {
                  return (
                    <>
                      <GoalCard name={term.goalName} />
                      <Divider />
                    </>
                  );
                })}
              </StyledBox>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {isFormOpen ? (
        <FinancialGoalForm
          plannerData={plannerData}
          dispatch={dispatch}
          close={() => setIsFormOpen(false)}
        />
      ) : null}
    </>
  );
};

export default Planner;
