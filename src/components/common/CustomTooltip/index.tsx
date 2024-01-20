import { Tooltip } from '@mui/material';
import { Info } from '@mui/icons-material';
import { Fragment, ReactNode } from 'react';

interface CustomPaperProps {
  tooltipText: ReactNode | string;
}
const CustomTooltip = ({ tooltipText }: CustomPaperProps) => {
  return (
    <Tooltip
      title={<Fragment>{tooltipText}</Fragment>}
      style={{ verticalAlign: 'middle' }}
      slotProps={{
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [-10, -10],
              },
            },
          ],
        },
      }}
    >
      <Info fontSize="small" color="action" />
    </Tooltip>
  );
};

export default CustomTooltip;
