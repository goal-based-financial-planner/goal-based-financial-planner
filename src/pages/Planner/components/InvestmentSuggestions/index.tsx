import {
  Box,
  Typography,
  Grid2 as Grid,
  Modal,
  Button,
  Tab,
  Tabs,
} from '@mui/material';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { TermType } from '../../../../types/enums';
import { GoalWiseInvestmentSuggestions } from '../../hooks/useInvestmentCalculator';
import React, { useMemo, useState } from 'react';
import InvestmentSuggestionsDoughnutChart from '../InvestmentSuggestionsDoughnutChart';
import InvestmentAllocations from '../InvestmentAllocations';
import InvestmentPieChart from '../InvestmentPieChart';
import CustomLegend from '../CustomLegend';
import { StyledBox } from '../../../../components/StyledBox';
import { InvestmentAllocationsType } from '../../../../domain/InvestmentOptions';
import { SIPEntry } from '../../../../types/investmentLog';
import { InvestmentSuggestion } from '../../../../types/planner';
import InvestmentTracker from '../GoalCard/components/InvestmentTracker';

export type InvestmentBreakdownBasedOnTermType = {
  termType: TermType;
  investmentBreakdown: GoalWiseInvestmentSuggestions[];
};

const InvestmentSuggestionsBox = ({
  investmentAllocations,
  dispatch,
  investmentBreakdownBasedOnTermType,
  investmentLogs = [],
  projectionYears = 10,
}: {
  dispatch: React.Dispatch<PlannerDataAction>;
  investmentAllocations: InvestmentAllocationsType;
  investmentBreakdownBasedOnTermType: InvestmentBreakdownBasedOnTermType[];
  investmentLogs: SIPEntry[];
  projectionYears?: number;
}) => {
  const [activeTab, setActiveTab] = useState<0 | 1>(0);
  const [termTypeModal, setTermTypeModal] = useState<TermType | null>(null);

  const handleClose = () => setTermTypeModal(null);
  const handleSubmit = () => setTermTypeModal(null);

  const aggregatedSuggestions: InvestmentSuggestion[] = useMemo(() => {
    const totals: Record<string, number> = {};
    const rates: Record<string, number> = {};

    for (const term of investmentBreakdownBasedOnTermType) {
      for (const goalBreakdown of term.investmentBreakdown) {
        for (const suggestion of goalBreakdown.investmentSuggestions) {
          totals[suggestion.investmentName] =
            (totals[suggestion.investmentName] ?? 0) + suggestion.amount;
          rates[suggestion.investmentName] = suggestion.expectedReturnPercentage;
        }
      }
    }

    return Object.entries(totals).map(([name, amount]) => ({
      investmentName: name,
      amount: Math.round(amount),
      expectedReturnPercentage: rates[name],
    }));
  }, [investmentBreakdownBasedOnTermType]);

  const visibleTerms = investmentBreakdownBasedOnTermType.filter(
    ({ investmentBreakdown }) =>
      investmentBreakdown.find((ib) => ib.investmentSuggestions.length > 0),
  );

  return (
    <>
      <StyledBox mb={2}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v as 0 | 1)}
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Allocation Plan" />
          <Tab label="Investment Tracker" />
        </Tabs>

        {/* Tab 0: Suggestions */}
        <Box role="tabpanel" hidden={activeTab !== 0}>
          <Grid container>
            <Grid size={12}>
              {visibleTerms.map((term) => (
                <Box key={term.termType} mb={2}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      Investments for {term.termType}
                    </Typography>
                    <Button
                      onClick={() => setTermTypeModal(term.termType)}
                      sx={{ color: 'green', px: 0 }}
                      className="customize-button"
                    >
                      <span className="material-symbols-rounded">tune</span>
                    </Button>
                  </Box>
                  <Grid container justifyContent="center" alignItems="center">
                    <>
                      <Grid
                        size={{ xs: 0, sm: 0, md: 6, lg: 3.5 }}
                        display={{ xs: 'none', sm: 'none', md: 'flex', lg: 'flex' }}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <InvestmentPieChart
                          allocations={investmentAllocations[term.termType]}
                        />
                      </Grid>
                      <Grid
                        size={{ xs: 0, sm: 0, md: 0, lg: 1 }}
                        display={{ xs: 'none', sm: 'none', md: 'none', lg: 'flex' }}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <span
                          className="material-symbols-rounded"
                          style={{ fontSize: '80px' }}
                        >
                          double_arrow
                        </span>
                      </Grid>
                    </>
                    <Grid
                      size={{ xs: 0, sm: 0, md: 0, lg: 3.5 }}
                      display={{ xs: 'none', sm: 'none', md: 'none', lg: 'flex' }}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <InvestmentSuggestionsDoughnutChart
                        suggestions={term.investmentBreakdown}
                      />
                    </Grid>
                    <Grid
                      size={{ xs: 12, sm: 12, md: 6, lg: 4 }}
                      display={{ xs: 'flex', sm: 'flex', md: 'flex', lg: 'flex' }}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <CustomLegend suggestions={term.investmentBreakdown} />
                    </Grid>
                  </Grid>
                </Box>
              ))}
              {visibleTerms.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  Add financial goals to see investment suggestions.
                </Typography>
              )}
            </Grid>
          </Grid>
        </Box>

        {/* Tab 1: Investment Tracker */}
        <Box role="tabpanel" hidden={activeTab !== 1}>
          {aggregatedSuggestions.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              Add financial goals to see investment types to track against.
            </Typography>
          ) : (
            <InvestmentTracker
              investmentSuggestions={aggregatedSuggestions}
              sips={investmentLogs}
              dispatch={dispatch}
              projectionYears={projectionYears}
            />
          )}
        </Box>
      </StyledBox>

      <Modal
        open={termTypeModal !== null}
        onClose={handleClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(0.5px)',
        }}
      >
        <InvestmentAllocations
          dispatch={dispatch}
          investmentAllocations={investmentAllocations}
          onSubmit={handleSubmit}
          termType={termTypeModal!}
        />
      </Modal>
    </>
  );
};

export default InvestmentSuggestionsBox;
