import * as React from 'react';
import { ChangeEvent } from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import InvestmentSuggestionsTable from './InvestmentSuggestionsTable';
import { Grid, Tabs, Typography } from '@mui/material';
import { PlannerData } from '../../../domain/PlannerData';
import useInvestmentCalculator from '../../../hooks/useInvestmentCalculator';
import PortfolioProjection from './PortfolioProjection';
import { PieChart } from '@mui/x-charts/PieChart';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

type InvestmentSuggestionsProps = {
  plannerData: PlannerData;
};
const InvestmentSuggestions: React.FC<InvestmentSuggestionsProps> = ({
  plannerData,
}) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  const {
    calculateInvestmentNeededForGoals,
    calculateYearlyReturnValueBySuggestions,
  } = useInvestmentCalculator(plannerData);
  const investmentBreakdown = calculateInvestmentNeededForGoals(plannerData);
  const yearlyReturnValuesForSuggestions =
    calculateYearlyReturnValueBySuggestions(
      plannerData.financialGoals,
      investmentBreakdown,
    );

  const getAmountPerInvestmentOption = () => {
    const aggregatedAmounts: { [key: string]: number } = {};

    investmentBreakdown.forEach((suggestion) => {
      suggestion.investmentSuggestions.forEach((i) => {
        const investmentOptionId = i.investmentOptionId;
        const amount = i.amount;
        if (aggregatedAmounts.hasOwnProperty(investmentOptionId)) {
          aggregatedAmounts[investmentOptionId] += amount;
        } else {
          aggregatedAmounts[investmentOptionId] = amount;
        }
      });
    });

    return Object.entries(aggregatedAmounts).map(
      ([investmentOptionId, totalAmount]) => {
        const investmentName = plannerData.investmentAllocationOptions.find(
          (o) => o.id === investmentOptionId,
        )?.investmentName;
        return { label: investmentName, value: Math.round(totalAmount) };
      },
    );
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={6}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            onChange={handleChange}
            aria-label="lab API tabs example"
            value={value}
          >
            <Tab label="Investment Suggestions" {...a11yProps(0)} />
            <Tab label="Pie chart" {...a11yProps(1)} />
          </Tabs>
          <CustomTabPanel value={value} index={0}>
            <InvestmentSuggestionsTable
              suggestions={investmentBreakdown}
              investmentOptions={plannerData.investmentAllocationOptions}
            />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <PieChart
              series={[
                {
                  data: getAmountPerInvestmentOption(),
                  cx: 100,
                  cy: 100,
                },
              ]}
              width={400}
              height={200}
            />
          </CustomTabPanel>
        </Box>
      </Grid>
      <Grid item xs={6}>
        <PortfolioProjection
          goalWiseReturns={yearlyReturnValuesForSuggestions}
          financialGoals={plannerData.financialGoals}
          investmentBreakdown={investmentBreakdown}
        />
      </Grid>
    </Grid>
  );
};

export default InvestmentSuggestions;
