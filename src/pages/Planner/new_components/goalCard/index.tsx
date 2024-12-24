import { Box, Typography } from '@mui/material';
import SemiCircleProgressBar from 'react-progressbar-semicircle';

const GoalCard = ({ name }: { name: string }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle1">{name}</Typography>
        <Typography variant="body2" sx={{ color: 'grey' }}>
          2024-2028
        </Typography>
      </Box>

      <Box style={{ transform: 'scale(0.8)', transformOrigin: 'center' }}>
        <SemiCircleProgressBar
          percentage={33}
          showPercentValue
          strokeWidth={5}
          diameter={90}
        />
      </Box>
    </Box>
  );
};

export default GoalCard;
