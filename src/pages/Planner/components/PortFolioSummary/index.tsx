import React, { useEffect, useState } from 'react';
import { PlannerData } from '../../../../domain/PlannerData';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import Header from '../../../../components/Header';
import InvestmentAllocations from '../InvestmentAllocations';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import useInvestmentCalculator from '../../hooks/useInvestmentCalculator';
import InvestmentSuggestionsGrid from './InvestmentSuggestionsGrid';

type PortFolioSummaryProps = {
  plannerData: PlannerData;
  dispatch: React.Dispatch<PlannerDataAction>;
};

const PortfolioSummary: React.FC<PortFolioSummaryProps> = ({
  plannerData,
  dispatch,
}) => {
  const [showModal, setShowModal] = useState(false);
  const handleEdit = () => {
    setShowModal(true);
  };
  const handleClose = () => setShowModal(false);

  const handleSubmit = () => {
    setShowModal(false);
  };
  const [selectedYear, setSelectedYear] = React.useState<string>('2024');
  const [years, setYears] = useState<number[]>([]);

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedYear(event.target.value);
  };

  useEffect(() => {
    const minMaxYears = plannerData.financialGoals.reduce(
      (acc, e) => ({
        minYear: Math.min(acc.minYear, e.getInvestmentStartYear()),
        maxYear: Math.max(acc.maxYear, e.getTargetYear()),
      }),
      { minYear: Infinity, maxYear: 0 },
    );
    const years = [];
    for (let i = minMaxYears.minYear; i <= minMaxYears.maxYear; i++) {
      years.push(i);
    }
    setYears(years);
  }, [plannerData]);

  const { calculateInvestmentNeededForGoals } =
    useInvestmentCalculator(plannerData);
  const investmentBreakdown = calculateInvestmentNeededForGoals(
    plannerData,
    Number(selectedYear),
  );

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Header
          title="Your Investment Suggestions"
          iconName="edit"
          onAction={handleEdit}
        />

        <Box sx={{ maxWidth: 100 }}>
          <FormControl fullWidth>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={selectedYear}
              onChange={handleChange}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box sx={{ px: 3 }}>
        <InvestmentSuggestionsGrid suggestions={investmentBreakdown} />
      </Box>
      <Modal
        open={showModal}
        onClose={handleClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(1px)',
        }}
      >
        <Box
          sx={{
            width: '800px',
            height: '60vh',
            overflowY: 'auto',
            backgroundColor: '#E3E1CD',
            padding: 2,
            borderRadius: 2,
            margin: 'auto',
            position: 'absolute',
            boxShadow: 24,
          }}
        >
          <Typography
            sx={{
              fontSize: 30,
              display: 'flex',
              justifyContent: 'center',
              fontWeight: 'bold',
            }}
          >
            Investment Allocations
          </Typography>

          <Typography
            sx={{
              fontSize: 16,
              p: 2,
              display: 'flex',
            }}
          >
            Customize your investment options here.............
          </Typography>

          <InvestmentAllocations
            dispatch={dispatch}
            plannerData={plannerData}
            onSubmit={handleSubmit}
          />
        </Box>
      </Modal>
    </>
  );
};

export default PortfolioSummary;
