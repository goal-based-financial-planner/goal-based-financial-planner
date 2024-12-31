import dayjs from 'dayjs';
import { TermType } from '../types/enums';
import { INFLATION_PERCENTAGE } from './constants';

export class FinancialGoal {
  constructor(
    goalName: string,
    startDate: string,
    targetDate: string,
    targetAmount: number,
  ) {
    this.id = Math.random().toString(36).substring(2, 9);
    this.goalName = goalName;
    this.startDate = startDate;
    this.targetDate = targetDate;
    this.targetAmount = targetAmount;
  }

  id: string;
  goalName: string;
  startDate: string;
  targetDate: string;
  targetAmount: number;

  getInvestmentStartDate(): string {
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
    return dayjs(this.targetDate).diff(dayjs(this.startDate), 'year');
  }

  getMonthTerm(): number {
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
    const term = this.getTerm();
    const inflatedAmount =
      this.targetAmount * Math.pow(1 + INFLATION_PERCENTAGE / 100, term);
    return Math.round((inflatedAmount + Number.EPSILON) * 100) / 100;
  }
}
