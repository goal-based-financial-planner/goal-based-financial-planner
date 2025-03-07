import { Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNumberFormatter } from '../../types/util';

interface LiveCounterProps {
  value: number;
  duration: number;
}

const LiveCounter: React.FC<LiveCounterProps> = ({ value, duration }) => {
  const [currentValue, setCurrentValue] = useState(0);

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

  const formattedNumber = useNumberFormatter(currentValue);

  return (
    <Typography variant="h2" sx={{ fontWeight: 'bold', mt: 2 }} color="primary">
      {formattedNumber}
    </Typography>
  );
};

export default LiveCounter;
