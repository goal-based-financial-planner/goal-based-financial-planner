import { Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { formatNumber } from '../../types/util';

interface LiveCounterProps {
  value: number;
  duration: number;
}

const LiveCounter: React.FC<LiveCounterProps> = ({ value, duration }) => {
  const [currentValue, setCurrentValue] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (currentValue === 0) {
      setCurrentValue(Math.round(value));
      return;
    }
    const stepCount = 30;
    const stepTime = duration / stepCount;
    const valueIncrement = (value - currentValue) / stepCount;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const nextValue = currentValue + valueIncrement * currentStep;
      setCurrentValue(Math.round(nextValue));
      if (currentStep >= stepCount) {
        clearInterval(interval);
      }
    }, stepTime);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return (
    <Typography
      variant={isMobile ? 'h3' : 'h1'}
      sx={{ color: 'green', fontWeight: 'bold', mt: 2 }}
    >
      {formatNumber(currentValue, 1_000_000_000)}
    </Typography>
  );
};

export default LiveCounter;
