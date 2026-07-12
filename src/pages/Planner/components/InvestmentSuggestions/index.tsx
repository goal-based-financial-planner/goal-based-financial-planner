import {
  Box,
  Typography,
  Grid2 as Grid,
  Modal,
  Divider,
} from '@mui/material';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { TermType } from '../../../../types/enums';
import { GoalWiseInvestmentSuggestions } from '../../hooks/useInvestmentCalculator';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import AllocationTour from '../AllocationTour';
import InvestmentAllocations from '../InvestmentAllocations';
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
}: {
  dispatch: React.Dispatch<PlannerDataAction>;
  investmentAllocations: InvestmentAllocationsType;
  investmentBreakdownBasedOnTermType: InvestmentBreakdownBasedOnTermType[];
  investmentLogs: SIPEntry[];
}) => {
  const [termTypeModal, setTermTypeModal] = useState<TermType | null>(null);
  const [runAllocationTour, setRunAllocationTour] = useState(false);
  const hasShownAllocationTourRef = useRef(false);

  useEffect(() => {
    if (termTypeModal !== null && !hasShownAllocationTourRef.current) {
      hasShownAllocationTourRef.current = true;
      setRunAllocationTour(true);
    }
    if (termTypeModal === null) {
      setRunAllocationTour(false);
    }
  }, [termTypeModal]);

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
      <StyledBox mb={2} className="investment-plan-box">
        <Grid container spacing={3}>
          {/* Left: Allocation Plan */}
          <Grid
            size={{ xs: 12, md: 5 }}
            sx={{
              borderRight: { md: '1px solid' },
              borderColor: { md: 'divider' },
              pr: { md: 3 },
            }}
          >
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ letterSpacing: 1.2, display: 'block', mb: 1.5 }}
            >
              Allocation Plan
            </Typography>

            {visibleTerms.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Add financial goals to see investment suggestions.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {visibleTerms.map((term, i) => (
                  <Box key={term.termType}>
                    {i > 0 && <Divider sx={{ mb: 2 }} />}
                    <CustomLegend
                      suggestions={term.investmentBreakdown}
                      label={term.termType}
                      onCustomize={() => setTermTypeModal(term.termType)}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Grid>

          {/* Right: Investment Tracker */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ letterSpacing: 1.2, display: 'block', mb: 1.5 }}
            >
              Investment Tracker
            </Typography>

            {aggregatedSuggestions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Add financial goals to see investment types to track against.
              </Typography>
            ) : (
              <InvestmentTracker
                investmentSuggestions={aggregatedSuggestions}
                sips={investmentLogs}
                dispatch={dispatch}
              />
            )}
          </Grid>
        </Grid>
      </StyledBox>

      <AllocationTour run={runAllocationTour} onDone={() => setRunAllocationTour(false)} />

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
