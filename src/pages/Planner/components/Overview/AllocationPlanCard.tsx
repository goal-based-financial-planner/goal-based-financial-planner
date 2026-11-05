import { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { PieChart } from '@mui/x-charts';
import TuneIcon from '@mui/icons-material/Tune';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { TermType } from '../../../../types/enums';
import { formatCurrency } from '../../../../types/util';
import {
  AllocationSlice,
  TermAllocation,
} from '../../../../domain/termAllocation';
import SegmentedControl from './SegmentedControl';
import { cardSx, instrumentColor, STATUS_STYLES } from './styles';

type TermFilter = 'all' | TermType;

type AllocationPlanCardProps = {
  idealAllocations: TermAllocation[];
  termStatuses: Partial<Record<TermType, 'at-risk' | 'on-track'>>;
  goalCount: number;
  /** Shown when no term has anything to allocate. */
  emptyMessage: string;
  onCustomize: (term: TermType) => void;
  onOpenTerm: (term: TermType) => void;
  onViewGoals: () => void;
};

const FILTERS: { value: TermFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: TermType.SHORT_TERM, label: 'Short' },
  { value: TermType.MEDIUM_TERM, label: 'Mid' },
  { value: TermType.LONG_TERM, label: 'Long' },
];

const Donut = ({
  slices,
  label,
}: {
  slices: AllocationSlice[];
  label: string;
}) => (
  <Box
    sx={{ width: 100, height: 100, flexShrink: 0 }}
    aria-label={label}
    role="img"
  >
    <PieChart
      series={[
        {
          data:
            slices.length > 0
              ? slices.map((slice, i) => ({
                  id: i,
                  value: slice.amount,
                  label: slice.investmentName,
                  color: instrumentColor(slice.investmentName),
                }))
              : [
                  {
                    id: 0,
                    value: 1,
                    label: 'Nothing logged',
                    color: '#ECECEA',
                  },
                ],
          innerRadius: 34,
          outerRadius: 50,
          paddingAngle: slices.length > 1 ? 1 : 0,
          valueFormatter: (item) =>
            slices.length > 0 ? formatCurrency(Math.round(item.value)) : '—',
        },
      ]}
      width={100}
      height={100}
      margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
      slotProps={{ legend: { hidden: true } }}
      skipAnimation
    />
  </Box>
);

const TermRow = ({
  title,
  status,
  slices,
  onCustomize,
  onOpen,
}: {
  title: string;
  status?: 'at-risk' | 'on-track';
  slices: AllocationSlice[];
  onCustomize?: () => void;
  onOpen?: () => void;
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      gap: { xs: 2, sm: 3 },
      alignItems: { xs: 'stretch', sm: 'center' },
      py: 2.5,
    }}
  >
    <Donut slices={slices} label={`${title} allocation`} />
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {onOpen ? (
          <Box
            component="button"
            type="button"
            onClick={onOpen}
            aria-label={`Open ${title} portfolio`}
            sx={{
              all: 'unset',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.25,
              fontWeight: 700,
              fontSize: 15,
              '&:hover': { textDecoration: 'underline' },
              '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
            }}
          >
            {title}
            <ChevronRightIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          </Box>
        ) : (
          <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{title}</Typography>
        )}
        {status && (
          <Box
            component="span"
            sx={{
              px: 0.75,
              py: 0.25,
              borderRadius: 1,
              fontSize: 11,
              fontWeight: 600,
              backgroundColor: STATUS_STYLES[status].bg,
              color: STATUS_STYLES[status].text,
            }}
          >
            {STATUS_STYLES[status].label}
          </Box>
        )}
        {onCustomize && (
          <Tooltip title="Customize allocation" arrow>
            <IconButton
              size="small"
              onClick={onCustomize}
              className="customize-button"
              aria-label={`Customize ${title} allocation`}
              sx={{ ml: 'auto', color: 'text.disabled' }}
            >
              <TuneIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Box
        component="ul"
        sx={{
          listStyle: 'none',
          m: 0,
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
        }}
      >
        {slices.map((slice) => (
          <Box
            component="li"
            key={slice.investmentName}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              fontSize: 13,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                flexShrink: 0,
                backgroundColor: instrumentColor(slice.investmentName),
              }}
            />
            <Box
              component="span"
              sx={{
                flex: 1,
                minWidth: 0,
                color: 'text.secondary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={slice.investmentName}
            >
              {slice.investmentName}
            </Box>
            <Box
              component="span"
              sx={{ width: 44, textAlign: 'right', fontWeight: 500 }}
            >
              {slice.percentage}%
            </Box>
            <Box
              component="span"
              sx={{ width: 76, textAlign: 'right', color: 'text.disabled' }}
            >
              {formatCurrency(slice.amount)}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  </Box>
);

const AllocationPlanCard = ({
  idealAllocations,
  termStatuses,
  goalCount,
  emptyMessage,
  onCustomize,
  onOpenTerm,
  onViewGoals,
}: AllocationPlanCardProps) => {
  const [filter, setFilter] = useState<TermFilter>('all');

  const rows = idealAllocations.filter(
    ({ termType }) => filter === 'all' || filter === termType,
  );

  return (
    <Box
      className="investment-plan-box"
      sx={{
        ...cardSx,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexWrap: 'wrap',
          mb: 0.5,
        }}
      >
        <Typography
          component="h2"
          sx={{ fontWeight: 700, fontSize: 17, mr: 'auto' }}
        >
          Allocation Plan
        </Typography>
        <SegmentedControl
          ariaLabel="Filter by term"
          value={filter}
          options={FILTERS}
          onChange={setFilter}
        />
      </Box>

      <Typography variant="body2" color="text.secondary">
        What to invest in each month, for the goals in each term.
      </Typography>

      <Box sx={{ flex: 1 }}>
        {rows.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
            {idealAllocations.length === 0
              ? emptyMessage
              : 'No active goals in this term.'}
          </Typography>
        ) : (
          rows.map(({ termType, slices }, i) => (
            <Box key={termType}>
              {i > 0 && <Divider />}
              <TermRow
                title={termType}
                status={termStatuses[termType]}
                slices={slices}
                onCustomize={() => onCustomize(termType)}
                onOpen={() => onOpenTerm(termType)}
              />
            </Box>
          ))
        )}
      </Box>

      {goalCount > 0 && (
        <Button
          fullWidth
          variant="outlined"
          onClick={onViewGoals}
          endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
          sx={{
            mt: 2,
            color: 'primary.main',
            borderColor: '#DDEBD8',
            backgroundColor: '#F6FAF4',
            '&:hover': {
              backgroundColor: 'primary.light',
              borderColor: 'primary.main',
            },
          }}
        >
          View All {goalCount} Goal{goalCount === 1 ? '' : 's'}
        </Button>
      )}
    </Box>
  );
};

export default AllocationPlanCard;
