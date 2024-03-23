import { TermType } from '../types/enums';
import { INFLATION_PERCENTAGE } from './constants';

export class FinancialGoal {
  constructor(
    goalName: string,
    startYear: number,
    targetYear: number,
    targetAmount: number,
  ) {
    this.goalName = goalName;
    this.startYear = startYear;
    this.targetYear = targetYear;
    this.targetAmount = targetAmount;
  }

  goalName: string;
  startYear: number;
  targetYear: number;
  targetAmount: number;

  getInvestmentStartYear(): number {
    return this.startYear;
  }

  getTargetYear(): number {
    return this.targetYear;
  }

  getTargetAmount(): number {
    return this.targetAmount;
  }

  getGoalName(): string {
    return this.goalName;
  }

  getTerm(): number {
    return this.targetYear - this.startYear;
  }

  getTermType(): TermType {
    const term = this.getTerm();
    if (term <= 3) {
      return TermType.SHORT_TERM;
    } else if (term <= 5) {
      return TermType.MEDIUM_TERM;
    } else {
      return TermType.LONG_TERM;
    }
  }

  getInfaltionAdjustedTargetAmount(): number {
    const term = this.getTerm();
    const inflatedAmount =
      this.targetAmount * Math.pow(1 + INFLATION_PERCENTAGE / 100, term);
    return Math.round((inflatedAmount + Number.EPSILON) * 100) / 100;
  }
}
