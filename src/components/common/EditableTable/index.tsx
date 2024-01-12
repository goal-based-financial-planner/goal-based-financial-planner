import { Delete } from '@mui/icons-material';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { AssetRow } from '../../../domain/AssetData';

export interface EditableTableColumnConfig {
  id: string;
  headerName: string;
}

export interface EditableTableRef {
  getData: () => AssetRow[] | null;
}

interface EditableTableProps {
  columnConfig: EditableTableColumnConfig[];
}

export const generateUniqueId = () =>
  `id${Math.random().toString(16).slice(2)}`;

const EditableTable = forwardRef<EditableTableRef, EditableTableProps>(
  ({ columnConfig }, ref) => {
    const newEmptyObject = () =>
      columnConfig
        .map((e) => e.id)
        .reduce((curr: any, key: string) => {
          curr[key] = '';
          return curr;
        }, {});

    const [data, setData] = useState<any[]>([newEmptyObject()]);

    const handleChange = (index: number, property: string, value: string) => {
      const newData = [...data];
      newData[index][property] = value;
      if (!newData[index + 1]) {
        newData[index + 1] = newEmptyObject();
      }
      setData(newData);
    };

    useImperativeHandle(ref, () => ({
      getData: () => {
        return data;
      },
    }));

    const deleteRow = (index: number) => {
      const newData = [...data];
      newData.splice(index, 1);
      setData(newData);
    };

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columnConfig.map((config) => (
                <TableCell>{config.headerName}</TableCell>
              ))}
              <TableCell key="delete" style={{ width: '50px' }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow>
                {columnConfig.map((config, i) => (
                  <TableCell>
                    <TextField
                      value={row[config.id]}
                      onChange={(e) =>
                        handleChange(index, config.id, e.target.value)
                      }
                    />
                  </TableCell>
                ))}
                {index < data.length - 1 ? (
                  <TableCell key="delete">
                    <Delete onClick={() => deleteRow(index)} />
                  </TableCell>
                ) : (
                  <TableCell />
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  },
);

export default EditableTable;
