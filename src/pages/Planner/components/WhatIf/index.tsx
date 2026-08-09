import { Alert, Box, Button, Grid2 as Grid, InputAdornment, Slider, TextField, Typography } from '@mui/material';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import { PlannerData } from '../../../../domain/PlannerData';
import { DEFAULT_INFLATION_RATE } from '../../../../domain/constants';
import useWhatIf from '../../hooks/useWhatIf';
import WhatIfChart from './WhatIfChart';

const MIN_INFLATION_RATE = 0;
const MAX_INFLATION_RATE = 20;
const MIN_RETURN_RATE = 0;
const MAX_RETURN_RATE = 20;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

type Props = {
  plannerData: PlannerData;
};

const WhatIf = ({ plannerData }: Props) => {
  const {
    oneTimeGoals,
    investmentBaselines,
    adjustments,
    setGoalInflationRate,
    setInvestmentReturnRate,
    resetAdjustments,
    adjusted,
    requiredTopUp,
  } = useWhatIf(plannerData);

  const hasOneTimeGoals = oneTimeGoals.length > 0;
  const hasAdjustments =
    Object.keys(adjustments.goalInflationRates).length > 0 ||
    Object.keys(adjustments.investmentReturnRates).length > 0;

  if (!hasOneTimeGoals) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Add a goal to start exploring what-if scenarios.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
        What If
      </Typography>

      <Alert
        severity="info"
        icon={<InsightsOutlinedIcon fontSize="small" />}
        sx={{ mb: 2, py: 0.25, alignItems: 'center', '& .MuiAlert-message': { fontSize: 13 } }}
      >
        Drag the sliders to stress-test your plan — see how a change in inflation or investment returns affects whether you&apos;ll still hit each goal, updated live.
      </Alert>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="outlined" size="small" disabled={!hasAdjustments} onClick={resetAdjustments}>
                Reset
              </Button>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                Inflation adjustment
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {oneTimeGoals.map((goal) => {
                  const baselineRate = goal.inflationRate ?? DEFAULT_INFLATION_RATE;
                  const value = adjustments.goalInflationRates[goal.id] ?? baselineRate;
                  return (
                    <Box key={goal.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography
                        variant="body2"
                        noWrap
                        title={goal.getGoalName()}
                        sx={{ minWidth: 0, flex: '1 1 auto' }}
                      >
                        {goal.getGoalName()}
                      </Typography>
                      <Slider
                        aria-label={`${goal.getGoalName()} inflation rate`}
                        value={value}
                        min={MIN_INFLATION_RATE}
                        max={MAX_INFLATION_RATE}
                        step={0.5}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => `${v}%`}
                        onChange={(_, v) => setGoalInflationRate(goal.id, v as number)}
                        size="small"
                        sx={{ width: 90, flexShrink: 0 }}
                      />
                      <TextField
                        type="number"
                        size="small"
                        variant="standard"
                        value={value}
                        onChange={(e) => {
                          const num = Number(e.target.value);
                          if (Number.isNaN(num)) return;
                          setGoalInflationRate(goal.id, clamp(num, MIN_INFLATION_RATE, MAX_INFLATION_RATE));
                        }}
                        slotProps={{
                          htmlInput: {
                            'aria-label': `${goal.getGoalName()} inflation rate value`,
                            min: MIN_INFLATION_RATE,
                            max: MAX_INFLATION_RATE,
                            step: 0.5,
                            style: { textAlign: 'right' },
                          },
                          input: {
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          },
                        }}
                        sx={{ width: 62, flexShrink: 0 }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                Return rate adjustment
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {investmentBaselines.map(({ investmentName, expectedReturnPercentage }) => {
                  const value = adjustments.investmentReturnRates[investmentName] ?? expectedReturnPercentage;
                  return (
                    <Box key={investmentName} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography
                        variant="body2"
                        noWrap
                        title={investmentName}
                        sx={{ minWidth: 0, flex: '1 1 auto' }}
                      >
                        {investmentName}
                      </Typography>
                      <Slider
                        aria-label={`${investmentName} expected return`}
                        value={value}
                        min={MIN_RETURN_RATE}
                        max={MAX_RETURN_RATE}
                        step={0.5}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => `${v}%`}
                        onChange={(_, v) => setInvestmentReturnRate(investmentName, v as number)}
                        size="small"
                        color="warning"
                        sx={{ width: 90, flexShrink: 0 }}
                      />
                      <TextField
                        type="number"
                        size="small"
                        variant="standard"
                        value={value}
                        onChange={(e) => {
                          const num = Number(e.target.value);
                          if (Number.isNaN(num)) return;
                          setInvestmentReturnRate(investmentName, clamp(num, MIN_RETURN_RATE, MAX_RETURN_RATE));
                        }}
                        slotProps={{
                          htmlInput: {
                            'aria-label': `${investmentName} expected return value`,
                            min: MIN_RETURN_RATE,
                            max: MAX_RETURN_RATE,
                            step: 0.5,
                            style: { textAlign: 'right' },
                          },
                          input: {
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          },
                        }}
                        sx={{ width: 62, flexShrink: 0 }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <WhatIfChart
            requirement={adjusted.requirementPoints}
            investing={adjusted.investingPoints}
            markers={adjusted.markers}
            requiredTopUp={requiredTopUp}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default WhatIf;
