import * as React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import { ChangeEvent } from 'react';
import AssetTable from '.';

export default function LabTabs() {
  const [value, setValue] = React.useState('1');

  const handleChange = (event: ChangeEvent<{}>, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Assets Table" value="1" />
            <Tab label="Pie chart" value="2" />
          </TabList>
        </Box>
        <TabPanel value="1">
          <AssetTable />
        </TabPanel>
        <TabPanel value="2">Item Two</TabPanel>
      </TabContext>
    </Box>
  );
}
