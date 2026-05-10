const DISCLAIMER_ACCEPTED_KEY = 'disclaimerAccepted';

export function isDisclaimerAccepted() {
  return JSON.parse(localStorage.getItem(DISCLAIMER_ACCEPTED_KEY) || 'false');
}

export function setDisclaimerAccepted() {
  localStorage.setItem(DISCLAIMER_ACCEPTED_KEY, JSON.stringify(true));
}
