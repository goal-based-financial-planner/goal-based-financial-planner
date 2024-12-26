import React, { useEffect, useState } from 'react';
import { PlannerData } from '../../../../domain/PlannerData';
import {
  Box,
  FormControl,
  MenuItem,
  Modal,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import InvestmentAllocations from '../InvestmentAllocations';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import useInvestmentCalculator from '../../hooks/useInvestmentCalculator';
import InvestmentSuggestionsGrid from './InvestmentSuggestionsGrid';
import DoughnutChart from '../../../../components/DoughnutChart';
import { TermType } from '../../../../types/enums';
import dayjs from 'dayjs';

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
  const [selectedYear, setSelectedYear] = React.useState<string>(
    dayjs().toString(),
  );
  const [years, setYears] = useState<number[]>([]);

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedYear(event.target.value);
  };

  useEffect(() => {
    const minMaxYears = plannerData.financialGoals.reduce(
      (acc, e) => ({
        minYear: Math.min(
          acc.minYear,
          dayjs(e.getInvestmentStartDate()).get('year'),
        ),
        maxYear: Math.max(acc.maxYear, dayjs(e.getTargetDate()).get('year')),
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

  const investmentBreakdownBasedOnTermType = [
    TermType.SHORT_TERM,
    TermType.MEDIUM_TERM,
    TermType.LONG_TERM,
  ].map((termType) => {
    const investmentBreakdown = calculateInvestmentNeededForGoals(
      plannerData,
      selectedYear,
      termType,
    );
    return { termType, investmentBreakdown };
  });

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            padding: 3,
            alignItems: 'center',
          }}
        >
          <Typography sx={{ fontSize: 40 }} className="home-hero">
            Your Investment Suggestions for
          </Typography>
          <Box sx={{ minWidth: 100, ml: 2 }}>
            <FormControl fullWidth>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={String(selectedYear)}
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
          <Box
            ml={3}
            onClick={handleEdit}
            sx={{
              '&:hover': {
                cursor: 'pointer',
                transform: 'scale(1.05)',
              },
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <span
              className="material-symbols-rounded dashboard-widget"
              style={{
                fontSize: '40px',
                transition: 'color 0.3s ease',
                fontWeight: 'bold',
              }}
            >
              edit
            </span>
          </Box>
        </Box>
      </Box>

      <Box sx={{ px: 3 }}>
        {investmentBreakdownBasedOnTermType.map((term) => (
          <DoughnutChart suggestions={term.investmentBreakdown} />
        ))}
      </Box>

      {investmentBreakdownBasedOnTermType.map((term) => (
        <InvestmentSuggestionsGrid suggestions={term.investmentBreakdown} />
      ))}

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
