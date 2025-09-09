import { Typography } from '@mui/material';
import React, { useEffect, useState, useMemo } from 'react';

interface LiveCounterProps {
  value: number;
  duration: number;
}

const LiveCounter: React.FC<LiveCounterProps> = ({ value, duration }) => {
  const [currentValue, setCurrentValue] = useState(0);

  const fontSize = useMemo(() => {
    const valueLength = currentValue.toFixed().length;
    if (valueLength <= 8) return '3.5rem';
    if (valueLength <= 12) return '2.8rem';
    if (valueLength <= 15) return '2.5rem';
    return '1.8rem';
  }, [currentValue]);

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
      sx={{
        fontWeight: 'bold',
        mt: 2,
        fontSize,
      }}
      color="primary"
    >
      {currentValue.toLocaleString()}
    </Typography>
  );
};

export default LiveCounter;
