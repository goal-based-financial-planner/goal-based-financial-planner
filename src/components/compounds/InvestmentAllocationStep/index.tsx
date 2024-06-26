import React, { Dispatch, useState } from 'react';
import { PlannerDataAction } from '../../../store/plannerDataReducer';
import Step, { StepProps } from '../../molecules/Step';
import { TermType } from '../../../types/enums';
import AddIcon from '@mui/icons-material/Add';
import { PlannerData } from '../../../domain/PlannerData';
import AddInvestmentOptions from '../../molecules/InvestmentAllocation/AddInvestmentOptions';
import { Box, Button } from '@mui/material';
import InvestmentAllocationTable from '../../molecules/InvestmentAllocation/InvestmentAllocationTable';

type InvestmentAllocationProps = Pick<
  StepProps,
  'isExpanded' | 'onContinue' | 'onEdit'
> & {
  dispatch: Dispatch<PlannerDataAction>;
  plannerData: PlannerData;
};

export interface ToolTipVisibilityState {
  [TermType.SHORT_TERM]?: boolean;
  [TermType.MEDIUM_TERM]?: boolean;
  [TermType.LONG_TERM]?: boolean;
}

const InvestmentAllocationStep: React.FC<InvestmentAllocationProps> = ({
  plannerData,
  dispatch,
  isExpanded,
  onContinue,
  onEdit,
}) => {
  const [showInvestmentOptionModal, setShowInvestmentOptionModal] =
    useState(false);

  const handleClose = () => {
    setShowInvestmentOptionModal(false);
  };

  const getAddInvestmentOptionButton = () => {
    return (
      <Button
        startIcon={<AddIcon />}
        variant="contained"
        color="secondary"
        onClick={() => {
          setShowInvestmentOptionModal(true);
        }}
      >
        Add Investment option
      </Button>
    );
  };

  const [tooltipVisibilityState, setTooltipVisibilityState] =
    useState<ToolTipVisibilityState>({
      [TermType.SHORT_TERM]: false,
      [TermType.MEDIUM_TERM]: false,
      [TermType.LONG_TERM]: false,
    });
  const areGoalsPresentOfType = (column: string) => {
    return plannerData
      .getFinancialGoalSummary()
      .some((item) => item.termType === column && item.numberOfGoals > 0);
  };
  const isInvestmentAllocationInvalid = (termType: TermType) => {
    if (areGoalsPresentOfType(termType)) {
      const termSum = plannerData.investmentAllocationOptions.reduce(
        (sum, row) =>
          sum +
          Number(
            plannerData.investmentAllocations[termType].filter(
              (e) => e.id === row.id,
            )[0]?.investmentPercentage || 0,
          ),
        0,
      );

      return termSum !== 100;
    } else return false;
  };

  const handleStepContinue = () => {
    const isShortTermInvestmentAllocationInvalid =
      isInvestmentAllocationInvalid(TermType.SHORT_TERM);
    const isMidTermInvestmentAllocationInvalid = isInvestmentAllocationInvalid(
      TermType.MEDIUM_TERM,
    );
    const isLongTermInvestmentAllocationInvalid = isInvestmentAllocationInvalid(
      TermType.LONG_TERM,
    );

    if (isShortTermInvestmentAllocationInvalid) {
      setTooltipVisibilityState({
        [TermType.SHORT_TERM]: isShortTermInvestmentAllocationInvalid,
      });
      return;
    }
    if (isMidTermInvestmentAllocationInvalid) {
      setTooltipVisibilityState({
        [TermType.MEDIUM_TERM]: isMidTermInvestmentAllocationInvalid,
      });
      return;
    }

    if (isLongTermInvestmentAllocationInvalid) {
      setTooltipVisibilityState({
        [TermType.LONG_TERM]: isLongTermInvestmentAllocationInvalid,
      });
      return;
    }
    if (
      !isShortTermInvestmentAllocationInvalid &&
      !isMidTermInvestmentAllocationInvalid &&
      !isLongTermInvestmentAllocationInvalid
    ) {
      setTooltipVisibilityState({
        [TermType.SHORT_TERM]: false,
        [TermType.MEDIUM_TERM]: false,
        [TermType.LONG_TERM]: false,
      });
      onContinue();
    }
  };

  const prepareEmptyBodyPlaceholder = () => {
    return (
      <>
        <p>
          You don't have any goals added. Click on Add Goal to start adding your
          goals...
        </p>
        {getAddInvestmentOptionButton()}
      </>
    );
  };

  return (
    <Step
      isExpanded={isExpanded}
      onContinue={handleStepContinue}
      onEdit={onEdit}
      title={'Investment Allocation'}
      subtext="Now that you have added your financial goals, choose the investments that you are comfortable investing in. Just put the percentage of investment next each option under the type of goal"
      isContinueDisabled={false}
      summaryText={`You have added some investment options here`}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        {plannerData.investmentAllocationOptions.length > 0 ? (
          <Box>{getAddInvestmentOptionButton()}</Box>
        ) : null}
      </Box>
      <InvestmentAllocationTable
        dispatch={dispatch}
        plannerData={plannerData}
        emptyBodyPlaceholder={prepareEmptyBodyPlaceholder()}
        tooltipVisibilityState={tooltipVisibilityState}
      />
      {/* <InvesmentOptionsTable
        invesmentOptions={plannerData.investmentAllocationOptions}
        emptyBodyPlaceholder={undefined}
        dispatch={dispatch}
      /> */}

      <AddInvestmentOptions
        showAddInvesmentOptionsModal={showInvestmentOptionModal}
        handleClose={handleClose}
        dispatch={dispatch}
      />
    </Step>
  );
};

export default InvestmentAllocationStep;
