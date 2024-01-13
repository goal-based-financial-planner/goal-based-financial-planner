import React, { Dispatch, useRef } from 'react';

import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { PlannerData } from '../../../../domain/PlannerData';
import EditableTable, {
  EditableTableColumnConfig,
  EditableTableRef,
} from '../../../common/EditableTable';
import CustomButton from '../../../common/CustomButton';
import { Stack } from '@mui/material';
import { updateAssets } from '../../../../store/plannerDataActions';
import { AssetRow } from '../../../../domain/AssetData';

interface AssetsPlannerProps {
  dispatch: Dispatch<PlannerDataAction>;
  plannerData: PlannerData;
}

const AssetsPlanner: React.FC<AssetsPlannerProps> = ({
  dispatch,
  plannerData,
}) => {
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

    // console.log('dfghjkl', trimmedLongTermGoals);
    updateAssets(dispatch, assetsData);
  };

  console.log(plannerData);
  return (
    <>
      <Stack flexDirection="row" gap={3}>
        <Stack>
          <h4>Long Term Goals</h4>
          <EditableTable columnConfig={columnConfig} ref={longTermGoalsRef} />
        </Stack>

        <Stack>
          <h4>Mid Term Goals</h4>
          <EditableTable columnConfig={columnConfig} ref={midTermGoalsRef} />
        </Stack>

        <Stack>
          <h4>Short Term Goals</h4>
          <EditableTable columnConfig={columnConfig} ref={shortTermGoalsRef} />
        </Stack>
      </Stack>
      <CustomButton sx={{ mt: 3 }} text={'Continue'} onClick={handleContinue} />
    </>
  );
};

export default AssetsPlanner;
