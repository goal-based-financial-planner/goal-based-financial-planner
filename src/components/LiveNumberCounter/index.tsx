import { Typography } from '@mui/material';
import React, { useEffect, useState, useMemo } from 'react';
import { formatNumber } from '../../types/util';

interface LiveCounterProps {
  value: number;
  duration: number;
  size?: 'small' | 'medium' | 'large';
}

const fontSizeMap = {
  small: {
    8: '1.2rem',
    12: '1.1rem',
    15: '1rem',
    default: '0.9rem',
  },
  medium: {
    8: '1.5rem',
    12: '1.2rem',
    15: '1rem',
    default: '0.9rem',
  },
  large: {
    8: '3.5rem',
    12: '2.8rem',
    15: '2.5rem',
    default: '1.8rem',
  },
};

const LiveCounter: React.FC<LiveCounterProps> = ({
  value,
  duration,
  size = 'large',
}) => {
  const [currentValue, setCurrentValue] = useState(0);

  const fontSize = useMemo(() => {
    const valueLength = currentValue.toFixed().length;
    const sizeConfig = fontSizeMap[size];
    if (valueLength <= 8) return sizeConfig[8];
    if (valueLength <= 12) return sizeConfig[12];
    if (valueLength <= 15) return sizeConfig[15];
    return sizeConfig.default;
  }, [currentValue, size]);

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
      {formatNumber(currentValue)}
    </Typography>
  );
};

export default LiveCounter;
