import { useMemo, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import dayjs from 'dayjs';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { GoalFunding } from '../../../../domain/goalFunding';
import { CompletionSummary } from '../../../../domain/goalCompletion';
import { GoalRiskDisplayStatus } from '../../../../domain/goalRiskStatus';
import { GoalType, TermType } from '../../../../types/enums';
import { formatCurrency } from '../../../../types/util';
import { cardSx, TERM_ORDER, TERM_STYLES } from '../Overview/styles';
import {
  COMPLETED_ACCENT,
  goalEndDate,
  goalIcon,
  goalStatus,
  GoalStatusStyle,
  isGoalCompleted,
  isGoalNotStarted,
  RECURRING_ACCENT,
  TERM_RANGES,
  timeLeft,
} from './goalVisuals';

type CardStatus = GoalStatusStyle;

type GoalSummaryCardProps = {
  goal: FinancialGoal;
  funding: GoalFunding;
  status: CardStatus | null;
  subtitle: string;
  accent: string;
  muted: boolean;
  /** Present for finished goals: the card shows what was achieved instead of monthly figures. */
  completion?: CompletionSummary;
  /** A finished goal whose completion the user hasn't reviewed yet. */
  needsDecision?: boolean;
  onViewDetails: () => void;
};

const GoalSummaryCard = ({
  goal,
  funding,
  status,
  subtitle,
  accent,
  muted,
  completion,
  needsDecision,
  onViewDetails,
}: GoalSummaryCardProps) => {
  const Icon = goalIcon(goal.getGoalName());
  const barColor = completion
    ? completion.reachedTarget
      ? '#2E7D32'
      : '#A3A3A3'
    : muted
      ? '#A3A3A3'
      : accent;
  const fundedPercent = completion
    ? Math.round((completion.finalValue / Math.max(completion.target, 1)) * 100)
    : funding.fundedPercent;

  return (
    <Box
      component="article"
      aria-label={goal.getGoalName()}
      sx={{
        ...cardSx,
        p: { xs: 2, sm: 2.5 },
        display: 'flex',
        flexDirection: 'column',
        ...(completion?.reachedTarget && {
          borderColor: '#BFDDB8',
          backgroundColor: '#FBFDFA',
        }),
      }}
    >
      <Box
        sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2.5 }}
      >
        <Box
          sx={{
            position: 'relative',
            width: 40,
            height: 40,
            borderRadius: 2.5,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${accent}1A`,
            color: accent,
          }}
        >
          <Icon sx={{ fontSize: 20 }} />
          {completion && (
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                right: -4,
                bottom: -4,
                width: 16,
                height: 16,
                borderRadius: '50%',
                border: '2px solid #fff',
                backgroundColor: completion.reachedTarget
                  ? 'primary.main'
                  : '#A3A3A3',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckIcon sx={{ fontSize: 10 }} />
            </Box>
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{ fontWeight: 600, fontSize: 15 }}
            noWrap
            title={goal.getGoalName()}
          >
            {goal.getGoalName()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
        {status && (
          <Box
            component="span"
            sx={{
              px: 0.75,
              py: 0.25,
              borderRadius: 1,
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.3,
              whiteSpace: 'nowrap',
              backgroundColor: status.bg,
              color: status.text,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {completion && <CheckCircleIcon sx={{ fontSize: 12 }} />}
            {status.label}
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography
          variant="body2"
          sx={{
            color: completion?.reachedTarget
              ? 'primary.main'
              : 'text.secondary',
            fontWeight: completion?.reachedTarget ? 600 : 400,
          }}
        >
          {fundedPercent}% funded
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {completion ? (
            <>
              {formatCurrency(completion.finalValue)}
              <Box
                component="span"
                sx={{ color: 'text.disabled', fontWeight: 400 }}
              >
                {' '}
                / {formatCurrency(completion.target)}
              </Box>
            </>
          ) : (
            formatCurrency(goal.getInflationAdjustedTargetAmount())
          )}
        </Typography>
      </Box>
      <Box
        role="progressbar"
        aria-label={`${goal.getGoalName()} funded`}
        aria-valuenow={Math.min(fundedPercent, 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor: '#ECECEA',
          overflow: 'hidden',
          mb: 2,
        }}
      >
        <Box
          sx={{
            width: `${Math.min(fundedPercent, 100)}%`,
            minWidth: fundedPercent > 0 ? 8 : 0,
            height: '100%',
            borderRadius: 3,
            backgroundColor: barColor,
          }}
        />
      </Box>

      {completion ? (
        needsDecision && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 1,
              mb: 2,
              borderRadius: 2,
              border: '1px solid #F6D7BF',
              backgroundColor: '#FFF7F0',
              color: '#C2561A',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            <InfoIcon sx={{ fontSize: 14 }} />
            Decide what to do with the freed-up SIP money
          </Box>
        )
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 1,
            flexWrap: 'wrap',
            mb: 2.5,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Required:{' '}
            <Box
              component="span"
              sx={{ fontWeight: 600, color: 'text.primary' }}
            >
              {formatCurrency(funding.requiredMonthly)}/mo
            </Box>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Investing:{' '}
            <Box
              component="span"
              sx={{
                fontWeight: 600,
                color: funding.investingMonthly > 0 ? accent : 'error.main',
              }}
            >
              {formatCurrency(funding.investingMonthly)}/mo
            </Box>
          </Typography>
        </Box>
      )}

      <Button
        fullWidth
        variant="outlined"
        onClick={onViewDetails}
        endIcon={<ArrowForwardIcon sx={{ fontSize: '14px !important' }} />}
        sx={{
          mt: 'auto',
          fontSize: 13,
          color: completion?.reachedTarget ? 'primary.main' : 'text.primary',
          ...(completion?.reachedTarget && {
            borderColor: '#BFDDB8',
            backgroundColor: '#fff',
          }),
        }}
      >
        {completion ? 'View Summary' : 'View Details'}
      </Button>
    </Box>
  );
};

type Section = {
  key: string;
  term?: TermType;
  title: string;
  accent: string;
  chip?: { label: string; bg: string; text: string };
  goals: FinancialGoal[];
};

const SectionHeader = ({
  title,
  accent,
  chip,
  count,
  completedCount,
  onOpenPortfolio,
}: Omit<Section, 'goals' | 'key'> & {
  count: number;
  completedCount: number;
  onOpenPortfolio?: () => void;
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
    <Box
      sx={{ width: 3, height: 22, borderRadius: 1, backgroundColor: accent }}
    />
    <Typography component="h2" sx={{ fontWeight: 700, fontSize: 17 }}>
      {title}
    </Typography>
    {chip && (
      <Box
        component="span"
        sx={{
          px: 1,
          py: 0.25,
          borderRadius: 5,
          fontSize: 11,
          fontWeight: 600,
          backgroundColor: chip.bg,
          color: chip.text,
        }}
      >
        {chip.label}
      </Box>
    )}
    <Typography variant="caption" color="text.secondary">
      · {count} goal{count === 1 ? '' : 's'}
      {completedCount > 0 && ` · ${completedCount} completed`}
    </Typography>
    {onOpenPortfolio && (
      <Button
        size="small"
        onClick={onOpenPortfolio}
        endIcon={<ArrowForwardIcon sx={{ fontSize: '14px !important' }} />}
        sx={{ ml: 'auto', fontSize: 13 }}
      >
        View portfolio
      </Button>
    )}
  </Box>
);

type MyGoalsProps = {
  goals: FinancialGoal[];
  funding: Record<string, GoalFunding>;
  riskStatuses: Record<string, GoalRiskDisplayStatus>;
  selectedDate: string;
  /** What each finished goal achieved, keyed by goal id. */
  completionSummaries: Record<string, CompletionSummary>;
  onViewDetails: (goalId: string) => void;
  onOpenTerm: (term: TermType) => void;
};

const MyGoals = ({
  goals,
  funding,
  riskStatuses,
  selectedDate,
  completionSummaries,
  onViewDetails,
  onOpenTerm,
}: MyGoalsProps) => {
  const [showArchived, setShowArchived] = useState(false);
  const archivedCount = goals.filter((g) => g.archived).length;
  const isCompleted = (goal: FinancialGoal) =>
    isGoalCompleted(goal, selectedDate);
  const isNotStarted = (goal: FinancialGoal) =>
    isGoalNotStarted(goal, selectedDate);

  const sections: Section[] = useMemo(() => {
    // In progress first (soonest target first), then finished goals.
    const ordered = [...goals]
      .filter((g) => !g.archived)
      .sort(
        (a, b) =>
          Number(isCompleted(a)) - Number(isCompleted(b)) ||
          dayjs(a.getTargetDate()).diff(dayjs(b.getTargetDate())),
      );
    const termSections = TERM_ORDER.map((term) => {
      const style = TERM_STYLES[term];
      return {
        key: term,
        term,
        title: term,
        accent: style.color,
        chip: { label: TERM_RANGES[term], bg: style.bg, text: style.text },
        goals: ordered.filter(
          (g) => g.goalType === GoalType.ONE_TIME && g.getTermType() === term,
        ),
      };
    });
    return [
      ...termSections,
      {
        key: 'recurring',
        title: 'Recurring',
        accent: RECURRING_ACCENT,
        goals: ordered.filter((g) => g.goalType === GoalType.RECURRING),
      },
      {
        key: 'archived',
        title: 'Archived',
        accent: COMPLETED_ACCENT,
        goals: showArchived ? goals.filter((g) => g.archived) : [],
      },
    ].filter((section) => section.goals.length > 0);
    // isCompleted only depends on selectedDate
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goals, selectedDate, showArchived]);

  const cardStatus = (goal: FinancialGoal): CardStatus | null =>
    goalStatus(goal, selectedDate, riskStatuses[goal.id]);

  const subtitle = (goal: FinancialGoal) => {
    if (goal.goalType === GoalType.RECURRING) {
      const years = goal.recurringDurationYears ?? 1;
      return `Recurring · every ${years} year${years === 1 ? '' : 's'}`;
    }
    if (isCompleted(goal)) {
      const summary = completionSummaries[goal.id];
      const done = dayjs(summary?.doneAt ?? goal.getTargetDate()).format(
        'MMM YYYY',
      );
      if (summary && !summary.reachedTarget)
        return `Ended ${done} · short of target`;
      return summary?.monthsAhead
        ? `Done ${done} · ${summary.monthsAhead} mo early`
        : `Done ${done}`;
    }
    if (isNotStarted(goal))
      return `Starts ${dayjs(goal.getInvestmentStartDate()).format('MMM YYYY')}`;
    return timeLeft(goalEndDate(goal), selectedDate);
  };

  return sections.length === 0 && archivedCount === 0 ? (
    <Typography variant="body2" color="text.secondary">
      No goals yet.
    </Typography>
  ) : (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {sections.map((section) => (
        <Box
          component="section"
          key={section.key}
          aria-label={`${section.title} goals`}
        >
          <SectionHeader
            title={section.title}
            accent={section.accent}
            chip={section.chip}
            count={section.goals.length}
            completedCount={
              section.key === 'archived'
                ? 0
                : section.goals.filter(isCompleted).length
            }
            onOpenPortfolio={
              section.term ? () => onOpenTerm(section.term!) : undefined
            }
          />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(3, minmax(0, 1fr))',
              },
              gap: 3,
            }}
          >
            {section.goals.map((goal) => (
              <GoalSummaryCard
                key={goal.id}
                goal={goal}
                funding={funding[goal.id]}
                status={cardStatus(goal)}
                subtitle={subtitle(goal)}
                accent={section.accent}
                muted={isNotStarted(goal) || isCompleted(goal)}
                completion={
                  isCompleted(goal) ? completionSummaries[goal.id] : undefined
                }
                needsDecision={
                  !!goal.completion &&
                  !goal.completion.acknowledged &&
                  !goal.archived
                }
                onViewDetails={() => onViewDetails(goal.id)}
              />
            ))}
          </Box>
        </Box>
      ))}
      {archivedCount > 0 && (
        <Button
          onClick={() => setShowArchived((v) => !v)}
          sx={{ alignSelf: 'flex-start', color: 'text.secondary' }}
        >
          {showArchived
            ? 'Hide archived goals'
            : `Show archived goals (${archivedCount})`}
        </Button>
      )}
    </Box>
  );
};

export default MyGoals;
