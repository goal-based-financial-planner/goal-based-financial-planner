import { Card, CardContent, Box } from '@mui/material';
import { theme } from '../../../../theme';

const InvestmentSuggestionCard = () => {
  return (
    <Card sx={{ borderRadius: 4, height: '50px' }}>
      <CardContent sx={{ padding: 1, '&:last-child': { paddingBottom: 1.3 } }}>
        <Box
          sx={{
            backgroundColor: theme.palette.cardBackGround.main,
            padding: 1,
            borderRadius: 4,
          }}
        >
          Mid Cap Invesmnets - 20{' '}
        </Box>
      </CardContent>
    </Card>
  );
};
export default InvestmentSuggestionCard;
