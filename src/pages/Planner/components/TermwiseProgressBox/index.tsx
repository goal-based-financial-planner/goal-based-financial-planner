import { Box, Typography, Chip, Grid2 as Grid, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { StyledBox } from '../../../../components/StyledBox';
import { formatNumber } from '../../../../types/util';
import { TermTypeWiseProgressData, TermTypeWiseData } from '../../../../types/planner';
import { memo } from 'react';

type TermWiseProgressBoxProps = {
  data: TermTypeWiseProgressData[];
};

const TERM_PALETTE: Record<string, { label: string; chip: string; definition: string }> = {
  'Short Term':  { label: '#E65100', chip: '#FFF3E0', definition: 'Goals within 3 years' },
  'Medium Term': { label: '#0D47A1', chip: '#E3F2FD', definition: 'Goals between 3 – 5 years' },
  'Long Term':   { label: '#1B5E20', chip: '#E8F5E9', definition: 'Goals beyond 5 years' },
};

const DEFAULT_PALETTE = { label: '#4A148C', chip: '#F3E5F5', definition: '' };

const TermSection = ({
  termType,
  termTypeWiseData,
  isLast,
}: {
  termType: string;
  termTypeWiseData: TermTypeWiseData;
  isLast: boolean;
}) => {
  const { termTypeSum, goalNames } = termTypeWiseData;
  const palette = TERM_PALETTE[termType] ?? DEFAULT_PALETTE;

  return (
    <Box
      sx={{
        px: { xs: 0, sm: 2 },
        py: { xs: 2, sm: 0 },
        borderRight: { xs: 'none', sm: isLast ? 'none' : '1px solid' },
        borderBottom: { xs: isLast ? 'none' : '1px solid', sm: 'none' },
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {/* Term label + info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{ color: palette.label, letterSpacing: 0.8, textTransform: 'uppercase', fontSize: '0.7rem' }}
        >
          {termType}
        </Typography>
        {palette.definition && (
          <Tooltip title={palette.definition} placement="top" arrow>
            <InfoOutlinedIcon sx={{ fontSize: 13, color: 'text.disabled', cursor: 'help' }} />
          </Tooltip>
        )}
      </Box>

      {/* Amount + goal count */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Typography variant="body1" fontWeight={600}>
          ₹{formatNumber(termTypeSum)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {goalNames.length} goal{goalNames.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Goal chips */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {goalNames.map((name) => (
          <Chip
            key={name}
            label={name}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.7rem',
              backgroundColor: palette.chip,
              color: palette.label,
              fontWeight: 500,
              border: 'none',
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

const TermWiseProgressBox = memo(({ data }: TermWiseProgressBoxProps) => {
  return (
    <StyledBox className="financial-progress-box" sx={{ height: '100%', width: '100%' }}>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ letterSpacing: 1.5, fontSize: '0.65rem', lineHeight: 1.4, display: 'block', mb: 1.5 }}
      >
        Goals by Timeline
      </Typography>

      <Grid container>
        {data.map(({ termType, termTypeWiseData }, idx) => (
          <Grid key={termType} size={{ xs: 12, sm: 12 / data.length }}>
            <TermSection
              termType={termType}
              termTypeWiseData={termTypeWiseData}
              isLast={idx === data.length - 1}
            />
          </Grid>
        ))}
      </Grid>
    </StyledBox>
  );
});

TermWiseProgressBox.displayName = 'TermWiseProgressBox';

export type { TermTypeWiseProgressData };

export default TermWiseProgressBox;
