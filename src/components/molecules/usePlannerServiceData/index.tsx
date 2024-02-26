interface Investment {
  assetType: string;
  amount: number;
}

const usePlanningServiceData = () => {
  const data: { goalName: string; investment: Investment[] }[] = [
    {
      goalName: 'Retirement',
      investment: [
        {
          assetType: 'Small Cap Funds',
          amount: 10000,
        },
        {
          assetType: 'Large Cap Funds',
          amount: 1000,
        },
        {
          assetType: 'Mid Cap Funds',
          amount: 30000,
        },
        {
          assetType: 'Gold',
          amount: 200,
        },
      ],
    },
    {
      goalName: 'Car',
      investment: [
        {
          assetType: 'Small Cap Funds',
          amount: 2000,
        },
        {
          assetType: 'Large Cap Funds',
          amount: 1000,
        },
        {
          assetType: 'Mid Cap Funds',
          amount: 3000,
        },
        {
          assetType: 'Gold',
          amount: 500,
        },
      ],
    },
    {
      goalName: 'House',
      investment: [
        {
          assetType: 'Small Cap Funds',
          amount: 2000,
        },
        {
          assetType: 'Large Cap Funds',
          amount: 1000,
        },
        {
          assetType: 'Mid Cap Funds',
          amount: 3000,
        },
        {
          assetType: 'Stocks',
          amount: 500,
        },
      ],
    },
  ];

  return data;
};

export default usePlanningServiceData;
