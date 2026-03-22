const TOUR_TAKEN_KEY = 'isTourTaken';
const DISCLAIMER_ACCEPTED_KEY = 'disclaimerAccepted';

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
