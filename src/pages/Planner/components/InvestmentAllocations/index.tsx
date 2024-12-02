import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Box,
  Button,
  Snackbar,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import InvestmentAllocationPerTerm from '../../../../pages/Planner/components/InvesmentAllocationPerTerm';
import { TermType } from '../../../../types/enums';
import { updateInvestmentAllocation } from '../../../../store/plannerDataActions';
import { PlannerData } from '../../../../domain/PlannerData';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { InvestmentAllocationsType } from '../../../../domain/InvestmentOptions';

const InvestmentAllocations = ({
  plannerData,
  dispatch,
  onSubmit,
}: {
  plannerData: PlannerData;
  dispatch: React.Dispatch<PlannerDataAction>;
  onSubmit: () => void;
}) => {
  const { control, handleSubmit } = useForm<InvestmentAllocationsType>({
    defaultValues: plannerData.investmentAllocations,
    reValidateMode: 'onChange',
    mode: 'onBlur',
  });
  const [showSnackBar, setShowSnackBar] = useState(false);

  const areInvestmentAllocationsValid = (
    data: InvestmentAllocationsType,
  ): boolean => {
    let isFormValid = true;
    Object.values(data).forEach((allocation) => {
      if (allocation.length === 0) {
        return;
      }
      const totalPercentage = allocation.reduce(
        (acc, v) => Number(v.investmentPercentage) + acc,
        0,
      );
      if (totalPercentage !== 100) {
        isFormValid = false;
      }
    });

    return isFormValid;
  };

  const onSubmitForm = (data: InvestmentAllocationsType) => {
    if (areInvestmentAllocationsValid(data)) {
      updateInvestmentAllocation(dispatch, data);
      onSubmit();
    } else {
      setShowSnackBar(true);
    }
  };
  const areGoalsPresentOfType = (column: TermType) =>
    plannerData
      .getFinancialGoalSummary()
      .some((item) => item.termType === column && item.numberOfGoals > 0);

  const [value, setValue] = React.useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmitForm)} noValidate>
        <Box>
          <Tabs value={value} onChange={handleChange}>
            {Object.values(TermType).map((termType) => {
              if (areGoalsPresentOfType(termType)) {
                return <Tab label={termType} key={termType} />;
              }
              return null;
            })}
          </Tabs>

          {Object.values(TermType)
            .filter((termType) => areGoalsPresentOfType(termType))
            .map((termType, index) => (
              <Box
                key={termType}
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                sx={{ p: 3 }}
              >
                <Typography component="div">
                  <InvestmentAllocationPerTerm
                    control={control}
                    name={termType}
                  />
                </Typography>
              </Box>
            ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#B401B0' }}
            type="submit"
          >
            Submit
          </Button>
        </Box>
      </form>
      <Snackbar
        autoHideDuration={5000}
        open={showSnackBar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        onClose={() => setShowSnackBar(false)}
      >
        <Alert severity="warning" sx={{ width: '100%' }}>
          Invalid Allocation. Please make sure the allocation percentages adds
          upto 100
        </Alert>
      </Snackbar>
    </>
  );
};

export default InvestmentAllocations;
