import React, { useState } from 'react';
import { AxisConfig, LineChart, LineSeriesType } from '@mui/x-charts';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {
  GoalWiseInvestmentSuggestions,
  GoalWiseReturn,
} from '../../../hooks/useInvestmentCalculator';
import { MakeOptional } from '@mui/x-charts/models/helpers';
import { FinancialGoal } from '../../../domain/FinancialGoals';

type PortfolioProjectionProps = {
  goalWiseReturns: GoalWiseReturn[];
  financialGoals: FinancialGoal[];
  investmentBreakdown: GoalWiseInvestmentSuggestions[];
};

const PortfolioProjection: React.FC<PortfolioProjectionProps> = ({
  goalWiseReturns,
  financialGoals,
  investmentBreakdown,
}) => {
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal>(
    financialGoals[0],
  );

  const generateXAxis = (): MakeOptional<AxisConfig, 'id'>[] => {
    const data = Array.from(
      { length: selectedGoal.getTerm() + 1 },
      (_, i) => i + selectedGoal.getInvestmentStartYear(),
    );
    return [
      {
        data,
        valueFormatter: (v) => v.toString(),
        label: 'Year',
        tickMinStep: 1,
      },
    ];
  };

  const generateSeries = (): MakeOptional<LineSeriesType, 'type'>[] => {
    const selectedGoalWiseReturn = goalWiseReturns.find(
      (gr) => gr.goalName === selectedGoal.goalName,
    )!;

    const investmentSuggestion = investmentBreakdown.find(
      (ib) => ib.goalName === selectedGoal.goalName,
    )!;
    const investmentPerOneYear =
      investmentSuggestion.investmentSuggestions.reduce((acc, investment) => {
        return acc + investment.amount;
      }, 0) * 12;

    const returns: number[] = [];
    const invested: number[] = [];

    for (
      let i = selectedGoal.getInvestmentStartYear();
      i <= selectedGoal.getTargetYear();
      i++
    ) {
      const totalReturn = selectedGoalWiseReturn.returnsPerInvestment.reduce(
        (acc, investment) => {
          const returnByYear = investment.returnsByYear.find(
            (ry) => ry.year === i,
          );
          return acc + (returnByYear?.return || 0);
        },
        0,
      );

      returns.push(totalReturn);

      invested.push(
        investmentPerOneYear * (i - selectedGoal.getInvestmentStartYear()) || 0,
      );
    }
    return [
      {
        data: returns,
        label: 'Expected Portfolio Value',
        valueFormatter: (v) =>
          v.toLocaleString(navigator.language, { maximumFractionDigits: 2 }),
      },
      {
        data: invested,
        label: 'Invested Amount',
        valueFormatter: (v) =>
          v.toLocaleString(navigator.language, { maximumFractionDigits: 2 }),
      },
    ];
  };

  const handleSelectedGoalChange = (e: SelectChangeEvent<string>) => {
    const goal = financialGoals.find(
      (goal) => goal.goalName === e.target.value,
    )!;
    setSelectedGoal(goal);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Box>
        <FormControl>
          <InputLabel id="Goal">Goal</InputLabel>
          <Select
            labelId="goalName"
            id="goalSelect"
            value={selectedGoal.goalName}
            label="Goal"
            onChange={(e) => handleSelectedGoalChange(e)}
          >
            {goalWiseReturns.map((goalWiseReturn) => (
              <MenuItem value={goalWiseReturn.goalName}>
                {goalWiseReturn.goalName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box height={400} width={'100%'}>
        {' '}
        {/* Adjust the height as needed */}
        <LineChart
          xAxis={generateXAxis()}
          series={generateSeries()}
          margin={{ left: 80 }}
        />
      </Box>
    </Box>
  );
};

export default PortfolioProjection;
