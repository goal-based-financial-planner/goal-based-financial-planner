import React from 'react';
import dayjs from 'dayjs';
import FlightIcon from '@mui/icons-material/Flight';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HomeIcon from '@mui/icons-material/Home';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import SchoolIcon from '@mui/icons-material/School';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LaptopIcon from '@mui/icons-material/Laptop';
import SavingsIcon from '@mui/icons-material/Savings';
import FlagIcon from '@mui/icons-material/Flag';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { isGoalDone } from '../../../../domain/goalCompletion';
import { GoalRiskDisplayStatus } from '../../../../domain/goalRiskStatus';
import { GoalType, TermType } from '../../../../types/enums';
import { STATUS_STYLES, TERM_STYLES } from '../Overview/styles';

/** Matches `FinancialGoal.getTermType`: ≤ 36 months short, ≤ 60 medium, longer is long. */
export const TERM_RANGES: Record<TermType, string> = {
  [TermType.SHORT_TERM]: '0 – 3 Years',
  [TermType.MEDIUM_TERM]: '3 – 5 Years',
  [TermType.LONG_TERM]: '5+ Years',
};

export const RECURRING_ACCENT = '#8B5CF6';
export const COMPLETED_ACCENT = '#A3A3A3';

const GOAL_ICONS: [RegExp, React.ElementType][] = [
  [/trip|travel|vacation|holiday|tour/i, FlightIcon],
  [/car|bike|vehicle/i, DirectionsCarIcon],
  [/house|home|flat|apartment|property/i, HomeIcon],
  [/retire/i, BeachAccessIcon],
  [/educat|school|college|study|child/i, SchoolIcon],
  [/wedding|marriage/i, FavoriteIcon],
  [/health|medical|hospital/i, MedicalServicesIcon],
  [/laptop|phone|gadget|computer/i, LaptopIcon],
  [/emergency|fund|saving/i, SavingsIcon],
];

export const goalIcon = (name: string): React.ElementType =>
  GOAL_ICONS.find(([pattern]) => pattern.test(name))?.[1] ?? FlagIcon;

/** Reached its target early, or a one-time goal past its target date. */
export const isGoalCompleted = (goal: FinancialGoal, asOf: string) => isGoalDone(goal, asOf);

// Recurring goals always start "today", so they never count as not started.
export const isGoalNotStarted = (goal: FinancialGoal, asOf: string) =>
  goal.goalType === GoalType.ONE_TIME &&
  dayjs(asOf).isBefore(dayjs(goal.getInvestmentStartDate()), 'day');

export type GoalStatusStyle = { label: string; bg: string; text: string };

const GREY = { bg: '#F1F1EF', text: '#6B7280' };

export const goalStatus = (
  goal: FinancialGoal,
  asOf: string,
  risk: GoalRiskDisplayStatus | undefined,
): GoalStatusStyle | null => {
  if (isGoalCompleted(goal, asOf)) return { label: 'Completed', bg: '#2E7D32', text: '#FFFFFF' };
  if (isGoalNotStarted(goal, asOf)) return { ...GREY, label: 'Not started' };
  return risk === 'at-risk' || risk === 'on-track' ? STATUS_STYLES[risk] : null;
};

/** The colour a goal is drawn in: its term's, or recurring/completed grey-ish accents. */
export const goalAccent = (goal: FinancialGoal, asOf: string) => {
  if (goal.goalType === GoalType.RECURRING) return RECURRING_ACCENT;
  // Archived goals fade to grey; completed ones keep their term's colour.
  if (goal.archived && isGoalCompleted(goal, asOf)) return COMPLETED_ACCENT;
  return TERM_STYLES[goal.getTermType()].color;
};

/** When the goal's money is needed: the target date, or the end of a recurring goal's cycle. */
export const goalEndDate = (goal: FinancialGoal) =>
  goal.goalType === GoalType.RECURRING
    ? dayjs(goal.getInvestmentStartDate()).add(goal.getMonthTerm(), 'month')
    : dayjs(goal.getTargetDate());

export const timeLeft = (end: dayjs.Dayjs, asOf: string, short = false) => {
  const months = Math.max(end.diff(dayjs(asOf), 'month'), 0);
  if (months >= 12) {
    const years = Math.floor(months / 12);
    return short ? `${years} yr${years === 1 ? '' : 's'}` : `${years} year${years === 1 ? '' : 's'} left`;
  }
  return short ? `${months} mo` : `${months} month${months === 1 ? '' : 's'} left`;
};
