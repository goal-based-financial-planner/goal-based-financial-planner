import { PlannerData } from '../domain/PlannerData';

export type StepType = {
  isExpanded: boolean;
  onContinue: () => void;
  onEdit: () => void;
  plannerData: PlannerData
};
