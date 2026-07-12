import React from 'react';
import {
  Grid2 as Grid,
  Box,
  Typography,
  Tab,
  Tabs,
  Drawer,
  IconButton,
  InputAdornment,
  useMediaQuery,
} from '@mui/material';
import { CalendarIcon } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import DatePicker from '../../components/DatePicker';
import InvestmentSuggestionsBox, {
  InvestmentBreakdownBasedOnTermType,
} from './components/InvestmentSuggestions';
import { Dispatch, useRef, useState, useMemo, useCallback } from 'react';
import { TermType } from '../../types/enums';
import useInvestmentCalculator from './hooks/useInvestmentCalculator';
import { PlannerData } from '../../domain/PlannerData';
import { PlannerDataAction } from '../../store/plannerDataReducer';
import GoalBox from './components/GoalBox';
import { StyledBox } from '../../components/StyledBox';
import PageTour from './components/Pagetour';
import CongratulationsPage from '../CongratulationsPage';
import PrintableReport from './components/PrintableReport';
import PlannerStatStrip from './components/PlannerStatStrip';
import GoalGrowthChart from './components/GoalGrowthChart';
import AddGoalPopup from '../Home/components/AddGoalPopup';
import { GoalSuggestion } from '../../domain/investmentLog';

type PlannerProps = {
  plannerData: PlannerData;
  dispatch: Dispatch<PlannerDataAction>;
  headerRight?: React.ReactNode;
  printRef?: React.RefObject<HTMLDivElement | null>;
  runTour?: boolean;
  onTourDone?: () => void;
};

const Planner = ({
  plannerData,
  dispatch,
  headerRight,
  printRef: externalPrintRef,
  runTour = false,
  onTourDone,
}: PlannerProps) => {
  const internalPrintRef = useRef<HTMLDivElement>(null);
  const printRef = externalPrintRef ?? internalPrintRef;
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().toString());
  const [activeTab, setActiveTab] = useState<0 | 1>(0);
  const [showGoalsDrawer, setShowGoalsDrawer] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);

  const handleChange = useCallback((value: Dayjs | null) => {
    setSelectedDate(value!.toString());
  }, []);

  const targetAmount = useMemo(
    () =>
      plannerData.financialGoals.reduce(
        (sum, goal) => sum + goal.getInflationAdjustedTargetAmount(),
        0,
      ),
    [plannerData.financialGoals],
  );

  const { calculateInvestmentNeededForGoals } = useInvestmentCalculator(plannerData);

  const investmentBreakdownForAllGoals = useMemo(
    () => calculateInvestmentNeededForGoals(plannerData, selectedDate),
    [calculateInvestmentNeededForGoals, plannerData, selectedDate],
  );

  const investmentBreakdownBasedOnTermType: InvestmentBreakdownBasedOnTermType[] = useMemo(() => {
    const result: InvestmentBreakdownBasedOnTermType[] = [];
    [TermType.SHORT_TERM, TermType.MEDIUM_TERM, TermType.LONG_TERM].forEach((termType) => {
      const goalsForTerm = plannerData.financialGoals.filter(
        (goal) => goal.getTermType() === termType,
      );
      if (goalsForTerm.length > 0) {
        const goalNames = goalsForTerm.map((goal) => goal.goalName);
        const investmentBreakDownPerTerm = investmentBreakdownForAllGoals.filter((ib) =>
          goalNames.includes(ib.goalName),
        );
        result.push({ termType, investmentBreakdown: investmentBreakDownPerTerm });
      }
    });
    return result;
  }, [plannerData.financialGoals, investmentBreakdownForAllGoals]);

  const aggregatedSuggestions = useMemo(() => {
    const totals: Record<string, number> = {};
    const rates: Record<string, number> = {};
    for (const term of investmentBreakdownBasedOnTermType) {
      for (const goalBreakdown of term.investmentBreakdown) {
        for (const suggestion of goalBreakdown.investmentSuggestions) {
          totals[suggestion.investmentName] = (totals[suggestion.investmentName] ?? 0) + suggestion.amount;
          rates[suggestion.investmentName] = suggestion.expectedReturnPercentage;
        }
      }
    }
    return Object.entries(totals).map(([name, amount]) => ({
      investmentName: name,
      amount: Math.round(amount),
      expectedReturnPercentage: rates[name],
    }));
  }, [investmentBreakdownBasedOnTermType]);

  const goalWiseSuggestions: GoalSuggestion[] = useMemo(() => {
    return investmentBreakdownBasedOnTermType
      .flatMap((term) => term.investmentBreakdown)
      .flatMap((b) => {
        const goal = plannerData.financialGoals.find((g) => g.getGoalName() === b.goalName);
        if (!goal || b.investmentSuggestions.length === 0) return [];
        return [{
          goalStartDate: goal.getInvestmentStartDate(),
          goalTargetDate: goal.getTargetDate(),
          suggestions: b.investmentSuggestions,
        }];
      });
  }, [investmentBreakdownBasedOnTermType, plannerData.financialGoals]);

  const totalRequired = useMemo(
    () => Math.round(aggregatedSuggestions.reduce((sum, s) => sum + s.amount, 0)),
    [aggregatedSuggestions],
  );

  const totalInvesting = useMemo(
    () => Math.round(plannerData.investmentLogs.reduce((sum, s) => sum + s.monthlyAmount, 0)),
    [plannerData.investmentLogs],
  );

  const completedGoals = useMemo(
    () => plannerData.financialGoals.filter((goal) => dayjs(selectedDate).isAfter(goal.getTargetDate())),
    [plannerData.financialGoals, selectedDate],
  );

  const datePickerRef = useRef<HTMLDivElement | null>(null);
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const areAllGoalsCompleted =
    plannerData.financialGoals.length > 0 &&
    completedGoals.length === plannerData.financialGoals.length;

  return (
    <>
      <PageTour run={runTour} onDone={onTourDone} />

      <Grid container padding={2} spacing={2} height="100%">
        {/* Header row */}
        <Grid
          size={12}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: 1 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', minWidth: 0 }}>
            <Typography
              className="navbar-home"
              variant="h4"
              fontWeight="bold"
              color="primary"
              sx={{ fontSize: { xs: '1.25rem', sm: '2.125rem' } }}
            >
              Goal Based Financial Planner
            </Typography>
            <StyledBox className="calendar-button">
              <DatePicker
                label={'"month" and "year"'}
                views={['month', 'year']}
                defaultValue={dayjs()}
                onChange={handleChange}
                ref={datePickerRef}
                format={isSmallScreen ? 'MM/YYYY' : 'MMMM YYYY'}
                slotProps={{
                  textField: {
                    variant: 'standard',
                    size: 'small',
                    label: '',
                    sx: { width: { xs: '120px', sm: '120px', md: 'auto' } },
                    InputProps: {
                      disableUnderline: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => datePickerRef.current?.click()}>
                            <CalendarIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  },
                }}
              />
            </StyledBox>
          </Box>

          {headerRight && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0, ml: 'auto' }}>
              {headerRight}
            </Box>
          )}
        </Grid>

        {areAllGoalsCompleted ? (
          <Box sx={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CongratulationsPage
              targetAmount={targetAmount}
              goals={plannerData.financialGoals.map((goal) => ({
                name: goal.getGoalName(),
                amount: goal.getInflationAdjustedTargetAmount(),
              }))}
            />
          </Box>
        ) : (
          <Grid size={12}>
            <PlannerStatStrip
              targetAmount={targetAmount}
              totalRequired={totalRequired}
              totalInvesting={totalInvesting}
              financialGoals={plannerData.financialGoals}
              onGoalsClick={() => setShowGoalsDrawer(true)}
              onAddGoal={() => setIsAddGoalOpen(true)}
            />

            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v as 0 | 1)}
              sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Investment Plan" />
              <Tab label="Portfolio" />
            </Tabs>

            <Box role="tabpanel" hidden={activeTab !== 0}>
              {activeTab === 0 && (
                <InvestmentSuggestionsBox
                  dispatch={dispatch}
                  investmentAllocations={plannerData.investmentAllocations}
                  investmentBreakdownBasedOnTermType={investmentBreakdownBasedOnTermType}
                  investmentLogs={plannerData.investmentLogs}
                />
              )}
            </Box>

            <Box role="tabpanel" hidden={activeTab !== 1}>
              {activeTab === 1 && (
                <StyledBox>
                  <GoalGrowthChart
                    sips={plannerData.investmentLogs}
                    goals={plannerData.financialGoals}
                    allSuggestions={aggregatedSuggestions}
                    goalWiseSuggestions={goalWiseSuggestions}
                  />
                </StyledBox>
              )}
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Goals drawer */}
      <Drawer
        anchor="right"
        open={showGoalsDrawer}
        onClose={() => setShowGoalsDrawer(false)}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 560 }, p: 2, boxSizing: 'border-box' } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">Financial Goals</Typography>
          <IconButton size="small" onClick={() => setShowGoalsDrawer(false)}>
            <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>close</span>
          </IconButton>
        </Box>

        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          <GoalBox
            financialGoals={plannerData.financialGoals}
            investmentBreakdownForAllGoals={investmentBreakdownForAllGoals}
            selectedDate={selectedDate}
            dispatch={dispatch}
            useStyledBox={false}
          />
        </Box>
      </Drawer>

      <AddGoalPopup
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        dispatch={dispatch}
      />

      <PrintableReport
        plannerData={plannerData}
        selectedDate={selectedDate}
        investmentBreakdownBasedOnTermType={investmentBreakdownBasedOnTermType}
        printRef={printRef}
      />
    </>
  );
};

export default Planner;
