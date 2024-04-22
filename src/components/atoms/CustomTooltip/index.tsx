import { Box, Tooltip, Typography } from '@mui/material';
import { Info } from '@mui/icons-material';
import { ReactNode } from 'react';

interface CustomPaperProps {
  tooltipText: ReactNode | string;
}
const CustomTooltip = ({ tooltipText }: CustomPaperProps) => {
  return (
    <Tooltip
      title={
        <Box>
          <Typography
            variant="body2"
            sx={{ fontSize: '16px', textAlign: 'center' }}
          >
            {tooltipText}
          </Typography>
        </Box>
      }
      sx={{
        alignContent: 'right',
        justifyContent: 'right',
        verticalAlign: 'top',
        ml: 1,
      }}
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
