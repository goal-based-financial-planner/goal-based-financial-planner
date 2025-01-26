import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Grid2 as Grid, Box, Typography, InputAdornment } from '@mui/material';
import { CalendarIcon, DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import TargetMobileBox from './components/TargetBox/mobileIndex';
import TermWiseProgressMobileBox, {
  TermTypeWiseProgressData,
} from './components/TermwiseProgressBox/mobileIndex';
import { PlannerData } from '../../domain/PlannerData';
import { Dispatch } from 'react';
import { PlannerDataAction } from '../../store/plannerDataReducer';
import useInvestmentCalculator from './hooks/useInvestmentCalculator';
import GoalBox from './components/GoalBox';
import InvestmentSuggestionsBox, {
  InvestmentBreakdownBasedOnTermType,
} from './components/InvestmentSuggestions';
import { TermType } from '../../types/enums';
import { StyledBox } from '../../components/StyledBox';

type PlannerProps = {
  plannerData: PlannerData;
  dispatch: Dispatch<PlannerDataAction>;
};

const MobilePlanner = ({ plannerData, dispatch }: PlannerProps) => {
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().toString());
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleChange = (value: Dayjs | null) => {
    setSelectedDate(value!.toString());
  };

  const targetAmount = plannerData.financialGoals.reduce(
    (sum, goal) => sum + goal.getInflationAdjustedTargetAmount(),
    0,
  );

  const { calculateInvestmentNeededForGoals } =
    useInvestmentCalculator(plannerData);
  const investmentBreakdownForAllGoals = calculateInvestmentNeededForGoals(
    plannerData,
    selectedDate,
  );

  const investmentBreakdownBasedOnTermType: InvestmentBreakdownBasedOnTermType[] =
    [];
  const termTypeWiseProgressData: TermTypeWiseProgressData[] = [];

  [TermType.SHORT_TERM, TermType.MEDIUM_TERM, TermType.LONG_TERM].forEach(
    (termType) => {
      const goalsForTerm = plannerData.financialGoals.filter(
        (goal) => goal.getTermType() === termType,
      );

      if (goalsForTerm.length > 0) {
        const goalNames = goalsForTerm.map((goal) => goal.goalName);

        const investmentBreakDownPerTerm =
          investmentBreakdownForAllGoals.filter((ib) =>
            goalNames.includes(ib.goalName),
          );

        const termTypeSum = Math.round(
          goalsForTerm.reduce(
            (sum, goal) => sum + goal.getInflationAdjustedTargetAmount(),
            0,
          ),
        );

        const progressPercent = Math.round(
          (investmentBreakDownPerTerm.reduce(
            (acc, val) => acc + val.currentValue,
            0,
          ) /
            termTypeSum) *
            100,
        );

        investmentBreakdownBasedOnTermType.push({
          termType,
          investmentBreakdown: investmentBreakDownPerTerm,
        });
        termTypeWiseProgressData.push({
          termType,
          termTypeWiseData: {
            goalNames,
            termTypeSum,
            progressPercent,
          },
        });
      }
    },
  );

  const previousScrollLeft = useRef(0);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollLeft = container.scrollLeft;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      if (scrollLeft === maxScrollLeft) {
        setShowSuggestions(false);
      } else if (scrollLeft === 0) {
        setShowSuggestions(true);
      } else {
        const isScrollingRight = scrollLeft > previousScrollLeft.current;
        const scrollIncrement = 10;

        if (isScrollingRight) {
          container.scrollLeft += scrollIncrement;
        } else {
          container.scrollLeft -= scrollIncrement;
        }
      }
      previousScrollLeft.current = scrollLeft;
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  return (
    <>
      <Grid container>
        <Grid size={12} display="flex" justifyContent="space-between">
          <Box sx={{ mt: 2, ml: 2 }}>
            <Typography className="navbar-home" variant="h3">
              Welcome
            </Typography>
          </Box>
          <StyledBox
            sx={{ width: '160px', mt: 1, mr: 2 }}
            className="calendar-button"
          >
            <DatePicker
              label={'"month" and "year"'}
              views={['month', 'year']}
              sx={{ width: '160px' }}
              defaultValue={dayjs()}
              onChange={handleChange}
              slotProps={{
                textField: {
                  variant: 'standard',
                  label: '',
                  InputProps: {
                    disableUnderline: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <CalendarIcon />
                      </InputAdornment>
                    ),
                  },
                },
              }}
            />
          </StyledBox>
        </Grid>

        <Grid
          size={12}
          sx={{
            overflowX: 'auto',
            display: 'flex',
            width: '100%',
            maxWidth: '100vw',
            overscrollBehaviorX: 'contain', // Prevent scroll propagation
          }}
          ref={scrollContainerRef}
        >
          <Box
            sx={{
              minWidth: '90%',
            }}
          >
            <TargetMobileBox
              targetAmount={targetAmount}
              dispatch={dispatch}
              financialGoals={plannerData.financialGoals}
              investmentBreakdownForAllGoals={investmentBreakdownForAllGoals}
              selectedDate={selectedDate}
            />
          </Box>
          <Box
            sx={{
              minWidth: '100%',
              transition: 'height 0.3s ease',
            }}
          >
            <TermWiseProgressMobileBox
              data={termTypeWiseProgressData}
              showSuggestions={showSuggestions}
            />
          </Box>
        </Grid>

        <>
          <Grid size={12}>
            <InvestmentSuggestionsBox
              dispatch={dispatch}
              investmentAllocations={plannerData.investmentAllocations}
              investmentBreakdownBasedOnTermType={
                investmentBreakdownBasedOnTermType
              }
            />
          </Grid>
          <Grid size={12}>
            <GoalBox
              financialGoals={plannerData.financialGoals}
              investmentBreakdownForAllGoals={investmentBreakdownForAllGoals}
              selectedDate={selectedDate}
              dispatch={dispatch}
            />
          </Grid>
        </>
      </Grid>
    </>
  );
};

export default MobilePlanner;
