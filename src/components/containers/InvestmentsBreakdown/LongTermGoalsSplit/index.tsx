// // import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';

// // const BasicEditingGrid = () => {
// //   return (
// //     <div style={{ height: 400, width: '30%' }}>
// //       <DataGrid
// //         rows={rows}
// //         columns={columns}
// //         hideFooterPagination
// //         rowSelection={false}
// //       />
// //     </div>
// //   );
// // };

// // const columns: GridColDef[] = [
// //   { field: 'assetType', headerName: 'Asset Type', width: 180, editable: true },
// //   {
// //     field: 'percentage',
// //     headerName: 'Percentage',
// //     type: 'number',
// //     editable: true,
// //   },
// // ];

// // const rows: GridRowsProp = [
// //   {
// //     id: 1,
// //     assetType: 'fghjk',
// //     percentage: 25,
// //   },
// //   {
// //     id: 2,
// //     assetType: 'trfyguhjk',
// //     percentage: 36,
// //   },
// //   {
// //     id: 3,
// //     assetType: 'rtfyguhil',
// //     percentage: 19,
// //   },
// //   {
// //     id: 4,
// //     assetType: 'ytui',
// //     percentage: 28,
// //   },
// //   {
// //     id: 5,
// //     assetType: 'ytui',
// //     percentage: 23,
// //   },
// // ];
// // export default BasicEditingGrid;

// import * as React from 'react';
// import Box from '@mui/material/Box';
// import Button from '@mui/material/Button';
// import AddIcon from '@mui/icons-material/Add';

// import {
//   GridRowsProp,
//   DataGrid,
//   GridColDef,
//   GridToolbarContainer,
//   GridEventListener,
//   GridRowEditStopReasons,
// } from '@mui/x-data-grid';

// const initialRows: GridRowsProp = [
//   {
//     id: 1,
//     assetType: 'fghjk',
//     percentage: 25,
//   },
//   {
//     id: 2,
//     assetType: 'trfyguhjk',
//     percentage: 36,
//   },
//   {
//     id: 3,
//     assetType: 'rtfyguhil',
//     percentage: 19,
//   },
//   {
//     id: 4,
//     assetType: 'ytui',
//     percentage: 28,
//   },
//   {
//     id: 5,
//     assetType: 'ytui',
//     percentage: 23,
//   },
// ];

// interface EditToolbarProps {
//   setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
// }

// const EditToolbar = (props: EditToolbarProps) => {
//   const { setRows } = props;

//   const handleClick = () => {
//     const id = 10;
//     setRows((oldRows) => [
//       ...oldRows,
//       { id, assetType: '', percentage: '', isNew: true },
//     ]);
//   };

//   return (
//     <GridToolbarContainer>
//       <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
//         Add record
//       </Button>
//     </GridToolbarContainer>
//   );
// };

// const FullFeaturedCrudGrid = () => {
//   const [rows, setRows] = React.useState(initialRows);

//   const handleRowEditStop: GridEventListener<'rowEditStop'> = (
//     params,
//     event,
//   ) => {
//     if (params.reason === GridRowEditStopReasons.rowFocusOut) {
//       event.defaultMuiPrevented = true;
//     }
//   };

//   const columns: GridColDef[] = [
//     {
//       field: 'assetType',
//       headerName: 'Asset Type',
//       width: 180,
//       editable: true,
//     },
//     {
//       field: 'percentage',
//       headerName: 'Percentage',
//       type: 'number',
//       editable: true,
//     },
//   ];

//   return (
//     <Box
//       sx={{
//         height: 500,
//         width: '30%',
//         '& .actions': {
//           color: 'text.secondary',
//         },
//         '& .textPrimary': {
//           color: 'text.primary',
//         },
//       }}
//     >
//       <DataGrid
//         rows={rows}
//         columns={columns}
//         editMode="row"
//         onRowEditStop={handleRowEditStop}
//         slots={{
//           toolbar: EditToolbar,
//         }}
//         slotProps={{
//           toolbar: { setRows },
//         }}
//         hideFooterPagination
//       />
//     </Box>
//   );
// };

// export default FullFeaturedCrudGrid;

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

  // const goalsWithoutEmptyData = (goals: AssetRow[] | null | undefined) => {
  //   goals?.filter((id) => {
  //     return id.assetType !== '' && id.percentage !== '';
  //   });
  // };
  const handleContinue = () => {
    const longTermGoals = longTermGoalsRef.current?.getData();
    const midTermGoals = midTermGoalsRef.current?.getData();
    const shortTermGoals = shortTermGoalsRef.current?.getData();

    const assetsData = {
      LongTermGoals: longTermGoals,
      MidTermGoals: midTermGoals,
      ShortTermGoals: shortTermGoals,
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

        {/* <EditableTable columnConfig={columnConfig} ref={midTermGoalsRef} />
        <EditableTable columnConfig={columnConfig} ref={shortTermGoalsRef} /> */}
      </Stack>
      <CustomButton sx={{ mt: 3 }} text={'Continue'} onClick={handleContinue} />
    </>
  );
};

export default AssetsPlanner;
