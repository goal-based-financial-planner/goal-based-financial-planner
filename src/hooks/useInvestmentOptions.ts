import { InvestmentOptionType } from "../domain/InvestmentOptions";
import { InvestmentOptionRiskType } from "../types/enums";

const investmentOptions: InvestmentOptionType[] = [
  {
    id: "assetType_1",
    investmentName: "Small cap funds",
    expectedReturnPercentage: 12,
    riskType: InvestmentOptionRiskType.LOW,
  },
  {
    id: "assetType_2",
    investmentName: "Large Cap funds",
    expectedReturnPercentage: 10,
    riskType: InvestmentOptionRiskType.LOW,
  },
  {
    id: "assetType_3",
    investmentName: "Recurring deposit",
    expectedReturnPercentage: 6,
    riskType: InvestmentOptionRiskType.HIGH,
  },
];

const useInvestmentOptions = () => {
  return investmentOptions;
};

export default useInvestmentOptions;
