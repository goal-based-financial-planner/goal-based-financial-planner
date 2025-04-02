import { PlannerData } from '../domain/PlannerData';

const PLANNER_DATA_KEY = 'plannerData';
const TOUR_TAKEN_KEY = 'isTourTaken';
const DISCLAIMER_ACCEPTED_KEY = 'disclaimerAccepted';

export function getPlannerData() {
  return localStorage.getItem(PLANNER_DATA_KEY) as string;
}

export function setPlannerData(plannerData: PlannerData) {
  localStorage.setItem(PLANNER_DATA_KEY, JSON.stringify(plannerData));
}

export function setTourTaken() {
  localStorage.setItem(TOUR_TAKEN_KEY, JSON.stringify(true));
}

export function isTourTaken() {
  return JSON.parse(localStorage.getItem(TOUR_TAKEN_KEY) || 'false');
}

export function isDisclaimerAccepted() {
  return JSON.parse(localStorage.getItem(DISCLAIMER_ACCEPTED_KEY) || 'false');
}

export function setDisclaimerAccepted() {
  localStorage.setItem(DISCLAIMER_ACCEPTED_KEY, JSON.stringify(true));
}
