import dayjs from 'dayjs';
import { GoalType, TermType } from '../types/enums';
import { INFLATION_PERCENTAGE } from './constants';

export class FinancialGoal {
  constructor(
    goalName: string,
    goalType: GoalType,
    startDate: string,
    targetDate: string,
    targetAmount: number,
  ) {
    this.id = Math.random().toString(36).substring(2, 9);
    this.goalName = goalName;
    this.goalType = goalType || GoalType.ONE_TIME;
    this.startDate = startDate;
    this.targetDate = targetDate;
    this.targetAmount = targetAmount;
  }

  id: string;
  goalName: string;
  goalType: GoalType;
  startDate: string;
  targetDate: string;
  targetAmount: number;

  getInvestmentStartDate(): string {
    // If the goal is recurring, we don't have a specific start date. Return today's date
    if (this.goalType === GoalType.RECURRING) {
      return dayjs().format('YYYY-MM-DD');
    }
    return this.startDate;
  }

  getTargetDate(): string {
    return this.targetDate;
  }

  getTargetAmount(): number {
    return this.targetAmount;
  }

  getGoalName(): string {
    return this.goalName;
  }

  getTerm(): number {
    if (this.goalType === GoalType.RECURRING) {
      return 1;
    }
    return dayjs(this.targetDate).diff(dayjs(this.startDate), 'year');
  }

  getMonthTerm(): number {
    if (this.goalType === GoalType.RECURRING) {
      return 12;
    }
    return dayjs(this.targetDate).diff(dayjs(this.startDate), 'month');
  }

  getTermType(): TermType {
    const term = this.getMonthTerm();
    if (term <= 36) {
      return TermType.SHORT_TERM;
    } else if (term > 36 && term <= 60) {
      return TermType.MEDIUM_TERM;
    } else if (term > 60) {
      return TermType.LONG_TERM;
    }
    return TermType.LONG_TERM;
  }

  getInflationAdjustedTargetAmount(): number {
    if (this.goalType === GoalType.RECURRING) {
      return this.targetAmount;
    }

    const term = this.getTerm();
    const inflatedAmount =
      this.targetAmount * Math.pow(1 + INFLATION_PERCENTAGE / 100, term);
    return Math.round((inflatedAmount + Number.EPSILON) * 100) / 100;
  }

  getElapsedMonths(): number {
    if (this.goalType === GoalType.RECURRING) {
      return 0;
    }
    return Math.max(
      0,
      dayjs().diff(dayjs(this.getInvestmentStartDate()), 'month'),
    );
  }
}
