import React from 'react';
import { Box, Button, InputAdornment, Modal, useMediaQuery } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import dayjs, { Dayjs } from 'dayjs';
import DatePicker from '../../components/DatePicker';
import InvestmentSuggestionsBox, {
  InvestmentBreakdownBasedOnTermType,
} from './components/InvestmentSuggestions';
import { Dispatch, useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { TermType } from '../../types/enums';
import useInvestmentCalculator from './hooks/useInvestmentCalculator';
import { PlannerData } from '../../domain/PlannerData';
import { PlannerDataAction } from '../../store/plannerDataReducer';
import PageTour from './components/Pagetour';
import CongratulationsPage from '../CongratulationsPage';
import PrintableReport from './components/PrintableReport';
import GoalGrowthChart from './components/GoalGrowthChart';
import WhatIf from './components/WhatIf';
import AddGoalPopup from '../Home/components/AddGoalPopup';
import { GoalSuggestion } from '../../domain/investmentLog';
import { deriveGoalOutlook } from '../../domain/goalOutlook';
import { buildIdealTermAllocations } from '../../domain/termAllocation';
import { buildGoalFunding } from '../../domain/goalFunding';
import {
  buildCompletionSummary,
  buildRedirect,
  findNewlyReachedGoals,
  isGoalDone,
  monthsAhead,
} from '../../domain/goalCompletion';
import { acknowledgeGoalCompletion, markGoalCompleted } from '../../store/plannerDataActions';
import { GoalType } from '../../types/enums';
import AppShell, { PlannerView } from './components/AppShell';
import PageHeader from './components/PageHeader';
import MyGoals from './components/MyGoals';
import GoalDetail from './components/GoalDetail';
import CompletedGoalSummary from './components/GoalDetail/CompletedGoalSummary';
import CompletionBanner from './components/Overview/CompletionBanner';
import TermPortfolio from './components/TermPortfolio';
import OverviewStatCards from './components/Overview/OverviewStatCards';
import AllocationPlanCard from './components/Overview/AllocationPlanCard';
import GoalProgressCard, { GoalProgress } from './components/Overview/GoalProgressCard';
import ActiveSipsCard from './components/Overview/ActiveSipsCard';
import PlanVsSipsCard from './components/Overview/PlanVsSipsCard';
import InvestmentAllocations from './components/InvestmentAllocations';
import AllocationTour from './components/AllocationTour';
import { cardSx, TERM_ORDER } from './components/Overview/styles';

type PlannerProps = {
  plannerData: PlannerData;
  dispatch: Dispatch<PlannerDataAction>;
  headerRight?: React.ReactNode;
  topBarRight?: React.ReactNode;
  printRef?: React.RefObject<HTMLDivElement | null>;
  runTour?: boolean;
  onTourDone?: () => void;
};

const Planner = ({
  plannerData,
  dispatch,
  headerRight,
  topBarRight,
  printRef: externalPrintRef,
  runTour = false,
  onTourDone,
}: PlannerProps) => {
  const internalPrintRef = useRef<HTMLDivElement>(null);
  const printRef = externalPrintRef ?? internalPrintRef;
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().toString());
  const [activeView, setActiveView] = useState<PlannerView>('overview');
  const [detailGoalId, setDetailGoalId] = useState<string | null>(null);
  const [activeTerm, setActiveTerm] = useState<TermType | null>(null);
  const navigate = useCallback((view: PlannerView) => {
    setActiveView(view);
    setDetailGoalId(null);
    setActiveTerm(null);
  }, []);
  // Term portfolios drill down from the Overview, so the sidebar keeps Overview highlighted.
  const openTerm = useCallback((term: TermType | null) => {
    setActiveView('overview');
    setDetailGoalId(null);
    setActiveTerm(term);
  }, []);
  const openGoal = useCallback((goalId: string) => {
    setActiveView('goals');
    setActiveTerm(null);
    setDetailGoalId(goalId);
  }, []);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [customizeTerm, setCustomizeTerm] = useState<TermType | null>(null);
  const [runAllocationTour, setRunAllocationTour] = useState(false);
  const hasShownAllocationTourRef = useRef(false);

  const openCustomize = useCallback((term: TermType) => {
    setCustomizeTerm(term);
    if (!hasShownAllocationTourRef.current) {
      hasShownAllocationTourRef.current = true;
      setRunAllocationTour(true);
    }
  }, []);
  const closeCustomize = useCallback(() => {
    setCustomizeTerm(null);
    setRunAllocationTour(false);
  }, []);

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
    () => plannerData.financialGoals.filter((goal) => isGoalDone(goal, selectedDate)),
    [plannerData.financialGoals, selectedDate],
  );

  const goalFunding = useMemo(
    () =>
      buildGoalFunding(
        plannerData.financialGoals,
        plannerData.investmentAllocations,
        plannerData.investmentLogs,
        selectedDate,
      ),
    [plannerData.financialGoals, plannerData.investmentAllocations, plannerData.investmentLogs, selectedDate],
  );

  // Goals whose own SIPs have already grown to their target are recorded as completed — always
  // judged against today, never the month picked in the header.
  const today = dayjs().format('YYYY-MM-DD');
  const newlyReached = useMemo(() => {
    const fundingToday = buildGoalFunding(
      plannerData.financialGoals,
      plannerData.investmentAllocations,
      plannerData.investmentLogs,
      today,
    );
    return findNewlyReachedGoals(plannerData.financialGoals, plannerData.investmentAllocations, fundingToday, today);
  }, [plannerData.financialGoals, plannerData.investmentAllocations, plannerData.investmentLogs, today]);
  useEffect(() => {
    newlyReached.forEach(({ goal, at, value }) => markGoalCompleted(dispatch, goal.id, at, value));
  }, [newlyReached, dispatch]);

  const completionSummaries = useMemo(
    () =>
      Object.fromEntries(
        completedGoals.map((goal) => [
          goal.id,
          buildCompletionSummary(
            goal,
            plannerData.financialGoals,
            plannerData.investmentAllocations,
            plannerData.investmentLogs,
          ),
        ]),
      ),
    [completedGoals, plannerData.financialGoals, plannerData.investmentAllocations, plannerData.investmentLogs],
  );

  // The most recent early completion the user hasn't reviewed yet.
  const pendingCompletion = useMemo(
    () =>
      plannerData.financialGoals
        .filter((g) => g.completion && !g.completion.acknowledged && !g.archived)
        .sort((a, b) => dayjs(b.completion!.at).diff(dayjs(a.completion!.at)))[0],
    [plannerData.financialGoals],
  );
  const pendingRedirect = useMemo(
    () =>
      pendingCompletion
        ? buildRedirect(
            pendingCompletion,
            plannerData.financialGoals,
            plannerData.investmentAllocations,
            plannerData.investmentLogs,
            today,
          )
        : null,
    [pendingCompletion, plannerData.financialGoals, plannerData.investmentAllocations, plannerData.investmentLogs, today],
  );

  // Risk chips, term badges and the health score all read each goal's own share of the SIPs, so
  // they agree with the per-goal numbers shown beside them. (The What If and Portfolio pages keep
  // their shared-pot projection.)
  const goalOutlook = useMemo(
    () =>
      deriveGoalOutlook(
        plannerData.financialGoals,
        plannerData.investmentAllocations,
        goalFunding,
        selectedDate,
      ),
    [plannerData.financialGoals, plannerData.investmentAllocations, goalFunding, selectedDate],
  );
  const goalRiskStatuses = goalOutlook.statuses;
  const goalRiskSummary = goalOutlook.summary;
  const goalRiskHealthScore = goalOutlook.healthScore;

  const idealAllocations = useMemo(
    () => buildIdealTermAllocations(investmentBreakdownBasedOnTermType).filter((t) => t.total > 0),
    [investmentBreakdownBasedOnTermType],
  );

  const allocationEmptyMessage = useMemo(() => {
    const month = dayjs(selectedDate).format('MMMM YYYY');
    const upcoming = plannerData.financialGoals
      .filter((g) => dayjs(selectedDate).isBefore(dayjs(g.getInvestmentStartDate()), 'day'))
      .sort((a, b) => dayjs(a.getInvestmentStartDate()).diff(dayjs(b.getInvestmentStartDate())));
    if (upcoming.length > 0) {
      return `None of your goals are being invested for in ${month}. The earliest, ${upcoming[0].getGoalName()}, starts in ${dayjs(upcoming[0].getInvestmentStartDate()).format('MMMM YYYY')}.`;
    }
    return `None of your goals are being invested for in ${month}. A goal counts from its start date to its target date.`;
  }, [plannerData.financialGoals, selectedDate]);

  const termsPresent = useMemo(
    () => TERM_ORDER.filter((term) => plannerData.financialGoals.some((g) => g.getTermType() === term)),
    [plannerData.financialGoals],
  );

  const termStatuses = useMemo(() => {
    const statuses: Partial<Record<TermType, 'at-risk' | 'on-track'>> = {};
    plannerData.financialGoals.forEach((goal) => {
      if (goal.goalType !== GoalType.ONE_TIME) return;
      const term = goal.getTermType();
      const status = goalRiskStatuses[goal.id];
      if (status === 'at-risk') statuses[term] = 'at-risk';
      else if (status === 'on-track' && !statuses[term]) statuses[term] = 'on-track';
    });
    return statuses;
  }, [plannerData.financialGoals, goalRiskStatuses]);

  const goalProgress: GoalProgress[] = useMemo(
    () =>
      plannerData.financialGoals
        .filter((goal) => !goal.archived && !isGoalDone(goal, selectedDate))
        .map((goal) => ({
          id: goal.id,
          name: goal.getGoalName(),
          progress: goalFunding[goal.id].fundedPercent,
        })),
    [plannerData.financialGoals, goalFunding, selectedDate],
  );

  const finishedForProgress = useMemo(
    () =>
      completedGoals
        .filter((goal) => !goal.archived)
        .map((goal) => ({
          id: goal.id,
          name: goal.getGoalName(),
          value: completionSummaries[goal.id]?.finalValue ?? 0,
          doneAt: completionSummaries[goal.id]?.doneAt ?? goal.getTargetDate(),
        })),
    [completedGoals, completionSummaries],
  );

  const datePickerRef = useRef<HTMLDivElement | null>(null);
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const areAllGoalsCompleted =
    plannerData.financialGoals.length > 0 &&
    completedGoals.length === plannerData.financialGoals.length;

  const headerActions = (
    <>
      <Box className="calendar-button">
        <DatePicker
          label={'"month" and "year"'}
          views={['month', 'year']}
          defaultValue={dayjs()}
          onChange={handleChange}
          ref={datePickerRef}
          format={isSmallScreen ? 'MMM YYYY' : 'MMMM YYYY'}
          slotProps={{
            textField: {
              size: 'small',
              label: '',
              inputProps: { 'aria-label': 'Plan month' },
              sx: {
                width: 180,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                  borderRadius: 2,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                '& input': { cursor: 'pointer', py: 1 },
              },
              InputProps: {
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <KeyboardArrowDownIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            },
          }}
        />
      </Box>
      {headerRight}
    </>
  );

  const viewGoals = () => navigate('goals');
  const detailGoal = plannerData.financialGoals.find((g) => g.id === detailGoalId);

  const renderView = () => {
    if (activeTerm) {
      return (
        <TermPortfolio
          term={activeTerm}
          goals={plannerData.financialGoals.filter(
            (g) =>
              g.getTermType() === activeTerm &&
              !isGoalDone(g, selectedDate),
          )}
          funding={goalFunding}
          riskStatuses={goalRiskStatuses}
          termStatus={termStatuses[activeTerm]}
          idealAllocation={plannerData.investmentAllocations[activeTerm] ?? []}
          investmentTypes={aggregatedSuggestions.map((s) => s.investmentName)}
          selectedDate={selectedDate}
          dispatch={dispatch}
          onBack={() => navigate('overview')}
          onGoalClick={openGoal}
          onNewGoal={() => setIsAddGoalOpen(true)}
        />
      );
    }
    switch (activeView) {
      case 'goals':
        if (detailGoal && completionSummaries[detailGoal.id]) {
          return (
            <CompletedGoalSummary
              goal={detailGoal}
              summary={completionSummaries[detailGoal.id]}
              dispatch={dispatch}
              onBack={() => setDetailGoalId(null)}
            />
          );
        }
        if (detailGoal) {
          return (
            <GoalDetail
              goal={detailGoal}
              funding={goalFunding[detailGoal.id]}
              riskStatus={goalRiskStatuses[detailGoal.id]}
              investmentAllocations={plannerData.investmentAllocations}
              investmentTypes={aggregatedSuggestions.map((s) => s.investmentName)}
              selectedDate={selectedDate}
              dispatch={dispatch}
              onBack={() => setDetailGoalId(null)}
            />
          );
        }
        return (
          <>
            <PageHeader
              title="My Goals"
              subtitle="Track every financial goal, organized by how soon you'll need the money."
              actions={
                <Button
                  variant="contained"
                  onClick={() => setIsAddGoalOpen(true)}
                  startIcon={<AddIcon />}
                  sx={{ px: 2.5, py: 1 }}
                >
                  New Goal
                </Button>
              }
            />
            <MyGoals
              goals={plannerData.financialGoals}
              funding={goalFunding}
              riskStatuses={goalRiskStatuses}
              selectedDate={selectedDate}
              completionSummaries={completionSummaries}
              onViewDetails={setDetailGoalId}
              onOpenTerm={openTerm}
            />
          </>
        );
      case 'investments':
        return (
          <>
            <PageHeader title="Investments" actions={headerActions} />
            <InvestmentSuggestionsBox
              dispatch={dispatch}
              investmentAllocations={plannerData.investmentAllocations}
              investmentBreakdownBasedOnTermType={investmentBreakdownBasedOnTermType}
              investmentLogs={plannerData.investmentLogs}
            />
          </>
        );
      case 'portfolio':
        return (
          <>
            <PageHeader title="Portfolio" actions={headerActions} />
            <Box sx={cardSx}>
              <GoalGrowthChart
                sips={plannerData.investmentLogs}
                goals={plannerData.financialGoals}
                allSuggestions={aggregatedSuggestions}
                goalWiseSuggestions={goalWiseSuggestions}
              />
            </Box>
          </>
        );
      case 'whatif':
        return (
          <>
            <PageHeader title="What If" actions={headerActions} />
            <Box sx={cardSx}>
              <WhatIf plannerData={plannerData} />
            </Box>
          </>
        );
      default:
        return (
          <>
            <PageHeader
              title="Overview"
              subtitle={
                <>
                  Snapshot as of{' '}
                  <Box component="strong" sx={{ color: 'text.primary', fontWeight: 600 }}>
                    {dayjs(selectedDate).format('MMMM YYYY')}
                  </Box>
                </>
              }
              actions={headerActions}
            />
            {pendingCompletion && pendingRedirect && (
              <CompletionBanner
                goal={pendingCompletion}
                monthsAhead={monthsAhead(pendingCompletion)}
                redirect={pendingRedirect}
                riskStatuses={goalRiskStatuses}
                onViewSummary={() => openGoal(pendingCompletion.id)}
                onReview={() => {
                  acknowledgeGoalCompletion(dispatch, pendingCompletion);
                  const top = pendingRedirect.recipients[0];
                  if (top) openGoal(top.goal.id);
                  else navigate('investments');
                }}
                onDismiss={() => acknowledgeGoalCompletion(dispatch, pendingCompletion)}
              />
            )}
            <OverviewStatCards
              targetAmount={targetAmount}
              totalRequired={totalRequired}
              totalInvesting={totalInvesting}
              termsPresent={termsPresent}
              onTermClick={openTerm}
            />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 7fr) minmax(0, 5fr)' },
                gap: 3,
                alignItems: 'start',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <AllocationPlanCard
                  idealAllocations={idealAllocations}
                  termStatuses={termStatuses}
                  goalCount={plannerData.financialGoals.length}
                  emptyMessage={allocationEmptyMessage}
                  onCustomize={openCustomize}
                  onOpenTerm={openTerm}
                  onViewGoals={viewGoals}
                />
                <PlanVsSipsCard sips={plannerData.investmentLogs} planned={aggregatedSuggestions} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <GoalProgressCard
                  goals={goalProgress}
                  completed={finishedForProgress}
                  onViewGoals={viewGoals}
                  onGoalClick={openGoal}
                />
                <ActiveSipsCard
                  sips={plannerData.investmentLogs}
                  investmentTypes={aggregatedSuggestions.map((s) => s.investmentName)}
                  dispatch={dispatch}
                />
              </Box>
            </Box>
          </>
        );
    }
  };

  return (
    <>
      <PageTour run={runTour} onDone={onTourDone} />

      <AppShell
        activeView={activeView}
        onNavigate={navigate}
        activeTerm={activeTerm}
        onTermSelect={openTerm}
        onNewGoal={() => setIsAddGoalOpen(true)}
        healthScore={goalRiskHealthScore}
        goalRiskSummary={goalRiskSummary}
        completedCount={finishedForProgress.length}
        topBarRight={topBarRight}
      >
        {areAllGoalsCompleted ? (
          <>
            <PageHeader title="Overview" actions={headerActions} />
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
              <CongratulationsPage
                targetAmount={targetAmount}
                goals={plannerData.financialGoals.map((goal) => ({
                  name: goal.getGoalName(),
                  amount: goal.getInflationAdjustedTargetAmount(),
                }))}
              />
            </Box>
          </>
        ) : (
          renderView()
        )}
      </AppShell>

      <Modal
        open={customizeTerm !== null}
        onClose={closeCustomize}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(0.5px)' }}
      >
        <InvestmentAllocations
          dispatch={dispatch}
          investmentAllocations={plannerData.investmentAllocations}
          onSubmit={closeCustomize}
          onCancel={closeCustomize}
          termType={customizeTerm!}
        />
      </Modal>
      <AllocationTour run={runAllocationTour} onDone={() => setRunAllocationTour(false)} />

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
