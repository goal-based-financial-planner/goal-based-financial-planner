import * as React from 'react';
import { ChangeEvent, useEffect } from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import InvestmentSuggestionsTable from './InvestmentSuggestionsTable';
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Tabs,
  Typography,
} from '@mui/material';
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
  const [selectedYear, setSelectedYear] = React.useState(0);
  const [years, setYears] = React.useState<number[]>([]);

  useEffect(() => {
    const minMaxYears = plannerData.financialGoals.reduce(
      (acc, e) => ({
        minYear: Math.min(acc.minYear, e.getInvestmentStartYear()),
        maxYear: Math.max(acc.maxYear, e.getTargetYear()),
      }),
      { minYear: Infinity, maxYear: 0 },
    );
    // Build an array of values between minYear and maxYear
    const years = [];
    for (let i = minMaxYears.minYear; i <= minMaxYears.maxYear; i++) {
      years.push(i);
    }
    setYears(years);
    setSelectedYear(years[0]);
  }, [plannerData]);

  const handleChange = (event: ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  const { calculateInvestmentNeededForGoals } =
    useInvestmentCalculator(plannerData);
  const investmentBreakdown = calculateInvestmentNeededForGoals(
    plannerData,
    selectedYear,
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
            <Box
              sx={{ width: '100%', display: 'flex' }}
              justifyContent="flex-end"
            >
              <FormControl sx={{ width: '300px' }}>
                <InputLabel id="year">For Year</InputLabel>
                <Select
                  labelId="year"
                  id="yearSelect"
                  label="Year"
                  value={selectedYear}
                  onChange={(e) =>
                    setSelectedYear(parseInt(e.target.value as string))
                  }
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

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
        <PortfolioProjection plannerData={plannerData} />
      </Grid>
    </Grid>
  );
};

export default InvestmentSuggestions;
