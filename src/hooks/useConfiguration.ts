import { useState } from 'react';

export const useConfiguraiton = () => {
  const [inflationPercentage, setInflationPercentage] = useState(5);

  return { inflationPercentage, setInflationPercentage };
};
