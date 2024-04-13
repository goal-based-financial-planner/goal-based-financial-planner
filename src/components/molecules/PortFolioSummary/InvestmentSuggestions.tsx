import * as React from 'react';
import { ChangeEvent } from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import InvestmentSuggestionsTable from './InvestmentSuggestionsTable';
import { Tabs, Typography } from '@mui/material';
import { PlannerData } from '../../../domain/PlannerData';
import useInvestmentCalculator from '../../../hooks/useInvestmentCalculator';

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
  plannerData: PlannerData
}
const InvestmentSuggestions: React.FC<InvestmentSuggestionsProps> = ({ plannerData }) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  const { calculateInvestmentNeededForGoals } = useInvestmentCalculator();
  const investmentBreakdown = calculateInvestmentNeededForGoals(plannerData);


  return (
    <Box sx={{ width: '50%', typography: 'body1' }}>
      <Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            onChange={handleChange}
            aria-label="lab API tabs example"
            value={value}
          >
            <Tab label="Allocation Table" {...a11yProps(0)} />
            <Tab label="Pie chart" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <InvestmentSuggestionsTable suggestions={investmentBreakdown} />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          Item Two
        </CustomTabPanel>
      </Box>
    </Box>
  );
}

export default InvestmentSuggestions;
