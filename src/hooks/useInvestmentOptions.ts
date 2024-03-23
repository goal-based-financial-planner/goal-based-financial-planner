import { InvestmentOptionType } from '../domain/InvestmentOptions';
import { InvestmentOptionRiskType } from '../types/enums';

const useInvestmentOptions = () => {
  const investmentOptions: InvestmentOptionType[] = [
    {
      id: 'assetType_1',
      assetType: 'Small cap funds',
      expectedReturnPercentage: 12,
      riskType: InvestmentOptionRiskType.LOW,
    },
    {
      id: 'assetType_2',
      assetType: 'Large Cap funds',
      expectedReturnPercentage: 10,
      riskType: InvestmentOptionRiskType.LOW,
    },
    {
      id: 'assetType_3',
      assetType: 'Recurring deposit',
      expectedReturnPercentage: 6,
      riskType: InvestmentOptionRiskType.HIGH,
    },
  ];

  return investmentOptions;
};

export default useInvestmentOptions;