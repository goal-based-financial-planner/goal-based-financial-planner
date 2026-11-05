import { SxProps, Theme } from '@mui/material';
import { TermType } from '../../../../types/enums';

export const TERM_STYLES: Record<TermType, { short: string; color: string; bg: string; text: string }> = {
  [TermType.SHORT_TERM]: { short: 'Short', color: '#E8772E', bg: '#FDEBDD', text: '#C2561A' },
  [TermType.MEDIUM_TERM]: { short: 'Mid', color: '#4C6EF5', bg: '#E7ECFE', text: '#3B5BDB' },
  [TermType.LONG_TERM]: { short: 'Long', color: '#2E7D32', bg: '#E6F4E3', text: '#2E7D32' },
};

export const TERM_ORDER = [TermType.SHORT_TERM, TermType.MEDIUM_TERM, TermType.LONG_TERM];

export const STATUS_STYLES = {
  'at-risk': { label: 'At risk', bg: '#FDECEC', text: '#E5484D' },
  'on-track': { label: 'On track', bg: '#E6F4E3', text: '#2E7D32' },
} as const;

const INSTRUMENT_COLORS: [RegExp, string][] = [
  [/recurring|fixed deposit|\bfd\b/i, '#E8772E'],
  [/large cap/i, '#6B9BF2'],
  [/mid cap/i, '#5DCB8A'],
  [/small cap/i, '#3E8E5E'],
  [/gold|sgb/i, '#F2C94C'],
  [/real estate/i, '#9AA1B5'],
];

const FALLBACK_COLORS = ['#8B5CF6', '#14B8A6', '#EC4899', '#0EA5E9', '#A16207', '#64748B'];

/** Same instrument → same colour on every chart, whichever term it appears in. */
export const instrumentColor = (name: string): string => {
  const match = INSTRUMENT_COLORS.find(([pattern]) => pattern.test(name));
  if (match) return match[1];
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
};

export const cardSx: SxProps<Theme> = {
  backgroundColor: 'background.paper',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 4,
  p: { xs: 2, sm: 3 },
};
