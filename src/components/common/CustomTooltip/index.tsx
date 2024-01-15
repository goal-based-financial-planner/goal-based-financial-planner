import { Tooltip } from '@mui/material';
import { Info } from '@mui/icons-material';

interface CustomPaperProps {
  tooltipText: string;
}
const CustomTooltip = ({ tooltipText }: CustomPaperProps) => {
  return (
    <Tooltip
      title={tooltipText}
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
