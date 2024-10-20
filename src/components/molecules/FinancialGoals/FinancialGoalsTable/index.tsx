import React, { Dispatch } from 'react';
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowId,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
  GridValueGetterParams,
} from '@mui/x-data-grid';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { Cancel, Delete } from '@mui/icons-material';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import {
  deleteFinancialGoal,
  updateFinancialGoal,
} from '../../../../store/plannerDataActions';

interface FinancialGoalsTableProps {
  goals: FinancialGoal[];
  dispatch: Dispatch<PlannerDataAction>;
}

const FinancialGoalsTable: React.FC<FinancialGoalsTableProps> = ({
  goals,
  dispatch,
}) => {
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {},
  );

  const handleDeleteClick = (id: GridRowId) => () => {
    deleteFinancialGoal(dispatch, id as string);
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    updateFinancialGoal(dispatch, newRow);
    return { success: true };
  };

  const columns: GridColDef[] = [
    { field: 'goalName', headerName: 'Goal Name', width: 180, editable: true },
    {
      field: 'startYear',
      headerName: 'Start Year',
      width: 180,
      editable: true,
    },
    {
      field: 'targetYear',
      headerName: 'Target Year',
      width: 180,
      editable: true,
    },
    {
      field: 'targetAmount',
      headerName: 'Target Amount',
      width: 180,
      editable: true,
      valueGetter: (params: GridValueGetterParams<FinancialGoal>) =>
        params.row.getTargetAmount().toLocaleString(navigator.language),
    },
    {
      field: 'term',
      headerName: 'Term',
      width: 180,
      valueGetter: (params: GridValueGetterParams<FinancialGoal>) =>
        params.row.getTerm(),
      editable: false,
    },
    {
      field: 'termType',
      headerName: 'Term Type',
      width: 180,
      valueGetter: (params: GridValueGetterParams<FinancialGoal>) =>
        params.row.getTermType(),
      editable: false,
    },
    {
      field: 'inflationAdjustedTargetAmount',
      headerName: 'Capital Adjusted By Inflation',
      width: 180,
      valueGetter: (params: GridValueGetterParams<FinancialGoal>) =>
        params.row
          .getInflationAdjustedTargetAmount()
          .toLocaleString(navigator.language),
      editable: false,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<Cancel />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<Delete />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];
  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  return (
    <DataGrid
      columns={columns}
      rows={goals}
      editMode="row"
      hideFooterPagination={true}
      rowModesModel={rowModesModel}
      onRowModesModelChange={handleRowModesModelChange}
      processRowUpdate={processRowUpdate}
    />
  );
};

export default FinancialGoalsTable;
