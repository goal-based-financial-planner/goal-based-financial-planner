import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export const useNumberFormatter = (num: number) => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  if (isLargeScreen || isSmallScreen) {
    return num.toLocaleString();
  }

  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  } else if (num >= 1_000_000) {
    return isMediumScreen
      ? `${(num / 1_000).toFixed(1)}K`
      : `${(num / 1_000_000).toFixed(1)}M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  } else {
    return num.toString();
  }
};
