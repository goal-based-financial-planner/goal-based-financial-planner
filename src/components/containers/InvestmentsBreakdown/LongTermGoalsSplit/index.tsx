import React, { Dispatch, useRef, useState } from 'react';

import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { PlannerData } from '../../../../domain/PlannerData';
import EditableTable, {
  EditableTableColumnConfig,
  EditableTableRef,
} from '../../../common/EditableTable';
import { Box, Button, Stack } from '@mui/material';
import { updateAssets } from '../../../../store/plannerDataActions';
import { AssetRow } from '../../../../domain/AssetData';
import { TermType } from '../../../../types/enums';

interface AssetsPlannerProps {
  dispatch: Dispatch<PlannerDataAction>;
  plannerData: PlannerData;
}

const AssetsPlanner: React.FC<AssetsPlannerProps> = ({
  dispatch,
  plannerData,
}) => {
  const [errorMsg, setErrorMsg] = useState(false);
  const longTermGoalsRef = useRef<EditableTableRef>(null);
  const midTermGoalsRef = useRef<EditableTableRef>(null);
  const shortTermGoalsRef = useRef<EditableTableRef>(null);
  const columnConfig: EditableTableColumnConfig[] = [
    {
      id: 'assetType',
      headerName: 'Asset Type',
    },
    {
      id: 'percentage',
      headerName: 'Percentage',
    },
  ];

  const goalsWithoutEmptyData = (goals?: AssetRow[]) => {
    return goals?.filter((id) => {
      return id.assetType !== '' && id.percentage !== '';
    });
  };
  const handleContinue = () => {
    const longTermGoals =
      goalsWithoutEmptyData(longTermGoalsRef.current?.getData()) || [];
    const midTermGoals =
      goalsWithoutEmptyData(midTermGoalsRef.current?.getData()) || [];
    const shortTermGoals =
      goalsWithoutEmptyData(shortTermGoalsRef.current?.getData()) || [];

    const assetsData = {
      longTermGoals,
      midTermGoals,
      shortTermGoals,
    };

    console.log(
      goalsWithoutEmptyData(longTermGoalsRef.current?.getData())?.length === 0,
      shortTermGoalsRef.current?.getData().length === 0,
      midTermGoalsRef.current?.getData().length === 0,
    );

    if (
      goalsWithoutEmptyData(longTermGoalsRef.current?.getData())?.length ===
        0 ||
      goalsWithoutEmptyData(midTermGoalsRef.current?.getData())?.length === 0 ||
      goalsWithoutEmptyData(shortTermGoalsRef.current?.getData())?.length === 0
    ) {
      setErrorMsg(true);
      return;
    }

    updateAssets(dispatch, assetsData);
    setErrorMsg(false);
  };

  const handleInputChange = () => {
    setErrorMsg(false);
  };

  const a = plannerData
    .getFinancialGoalSummary()
    .filter((i) => i.numberOfGoals > 0)
    .map((i) => i.termType);

  return (
    <>
      <Box>
        Now that you have added your financial goals, let's add the assets that
        you are interested to invest in.
      </Box>
      {errorMsg ? (
        <p style={{ marginBottom: '10px', color: 'hsl(0,70%,60%)' }}>
          {' '}
          Please add atleast one asset type
        </p>
      ) : null}

      <Stack flexDirection="row" gap={3} justifyContent={'center'}>
        {a.includes(TermType.LONG_TERM) ? (
          <Stack>
            <h4>Long Term Goals</h4>
            <EditableTable
              columnConfig={columnConfig}
              ref={longTermGoalsRef}
              onInputChange={handleInputChange}
            />
          </Stack>
        ) : null}

        {a.includes(TermType.MEDIUM_TERM) ? (
          <Stack>
            <h4>Mid Term Goals</h4>
            <EditableTable
              columnConfig={columnConfig}
              ref={midTermGoalsRef}
              onInputChange={handleInputChange}
            />
          </Stack>
        ) : null}

        {a.includes(TermType.SHORT_TERM) ? (
          <Stack>
            <h4>Short Term Goals</h4>
            <EditableTable
              columnConfig={columnConfig}
              ref={shortTermGoalsRef}
              onInputChange={handleInputChange}
            />
          </Stack>
        ) : null}
      </Stack>
      <Box textAlign="right">
        <Button
          sx={{ mt: 3, fontSize: '1.2rem' }}
          onClick={handleContinue}
          variant="contained"
          color="primary"
        >
          Continue
        </Button>
      </Box>
    </>
  );
};

export default AssetsPlanner;
