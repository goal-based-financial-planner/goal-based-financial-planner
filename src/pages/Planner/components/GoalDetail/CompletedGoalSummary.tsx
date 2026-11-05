import { Dispatch, useRef } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ReplayIcon from '@mui/icons-material/Replay';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import CheckIcon from '@mui/icons-material/Check';
import { LineChart } from '@mui/x-charts/LineChart';
import { ChartsReferenceLine } from '@mui/x-charts';
import dayjs from 'dayjs';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { CompletionSummary } from '../../../../domain/goalCompletion';
import { GoalType } from '../../../../types/enums';
import { formatCompactCurrency, formatCurrency } from '../../../../types/util';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { reopenGoal, setGoalArchived } from '../../../../store/plannerDataActions';
import usePdfExport from '../../hooks/usePdfExport';
import { cardSx } from '../Overview/styles';
import { goalAccent, goalIcon } from '../MyGoals/goalVisuals';

type CompletedGoalSummaryProps = {
  goal: FinancialGoal;
  summary: CompletionSummary;
  dispatch: Dispatch<PlannerDataAction>;
  onBack: () => void;
};

const months = (n: number) => `${n} month${n === 1 ? '' : 's'}`;

const StatTile = ({ label, value, color, highlight }: { label: string; value: string; color?: string; highlight?: boolean }) => (
  <Box
    sx={{
      ...cardSx,
      p: 2,
      ...(highlight && { borderColor: '#BFDDB8', backgroundColor: '#F4FAF2' }),
    }}
  >
    <Typography
      variant="overline"
      sx={{ fontSize: 11, lineHeight: 1.5, display: 'block', color: highlight ? 'primary.main' : 'text.secondary' }}
      noWrap
    >
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 700, fontSize: 18, mt: 0.5, color: color ?? 'text.primary' }} noWrap>
      {value}
    </Typography>
  </Box>
);

const LegendItem = ({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: 12, fontWeight: 500 }}>
    <Box
      sx={
        dashed
          ? { width: 14, borderTop: `2px dashed ${color}` }
          : { width: 8, height: 8, borderRadius: '50%', backgroundColor: color }
      }
    />
    {label}
  </Box>
);

const CompletedGoalSummary = ({ goal, summary, dispatch, onBack }: CompletedGoalSummaryProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { isExporting, downloadPdf } = usePdfExport();
  const Icon = goalIcon(goal.getGoalName());
  const accent = goalAccent(goal, summary.doneAt);
  const doneDate = dayjs(summary.doneAt);
  const targetDate = dayjs(goal.getTargetDate());
  const start = dayjs(goal.getInvestmentStartDate());

  const heroTitle = summary.reachedTarget
    ? `You fully funded your ${goal.getGoalName()}`
    : `${goal.getGoalName()} reached its target date`;
  const heroDetail = summary.reachedTarget ? (
    <>
      Reached{' '}
      <strong>{summary.monthsAhead > 0 ? `${months(summary.monthsAhead)} ahead` : 'on time'}</strong> of the{' '}
      {targetDate.format('MMM YYYY')} target
      {summary.surplus > 0 ? `, with ${formatCurrency(summary.surplus)} more than planned.` : '.'}
    </>
  ) : (
    <>
      Your SIPs reached {formatCurrency(summary.finalValue)} of the {formatCurrency(summary.target)} target —{' '}
      <strong>{formatCurrency(-summary.surplus)} short</strong>.
    </>
  );

  const milestoneLabels: Record<number, string> = { 0.25: '25% funded', 0.5: 'Halfway there', 0.75: '75% funded', 1: 'Goal completed' };

  const timeline = [
    {
      key: 'start',
      label: 'Goal started',
      detail: `${start.format('MMM YYYY')}${summary.monthlySip > 0 ? ` · ${formatCurrency(summary.monthlySip)}/mo SIP` : ''}`,
      reached: true,
      final: false,
    },
    ...summary.milestones.map((m) => ({
      key: String(m.fraction),
      label: milestoneLabels[m.fraction],
      detail: m.date
        ? `${dayjs(m.date).format('MMM YYYY')} · ${formatCurrency(m.fraction === 1 ? summary.finalValue : m.value)}`
        : 'Not reached',
      reached: !!m.date,
      final: m.fraction === 1,
    })),
  ];

  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={onBack}
        sx={{
          all: 'unset',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          mb: 2.5,
          fontSize: 13,
          fontWeight: 500,
          color: 'text.secondary',
          '&:hover': { color: 'text.primary' },
          '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
        }}
      >
        <ArrowBackIcon sx={{ fontSize: 16 }} />
        Back to My Goals
      </Box>

      <Box ref={printRef} sx={{ backgroundColor: 'background.default' }}>
        {/* Hero */}
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 4,
            p: { xs: 2.5, sm: 3.5 },
            mb: 3,
            color: '#fff',
            backgroundColor: summary.reachedTarget ? '#3F8A35' : '#8A6A35',
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2.5,
          }}
        >
          <Box
            aria-hidden
            sx={{ position: 'absolute', right: -60, top: -60, width: 260, height: 260, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)' }}
          />
          <Box
            sx={{
              width: 56,
              height: 56,
              flexShrink: 0,
              borderRadius: 3,
              backgroundColor: '#fff',
              color: summary.reachedTarget ? 'primary.main' : '#8A6A35',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <EmojiEventsIcon />
          </Box>
          <Box sx={{ flex: 1, position: 'relative' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, opacity: 0.85, textTransform: 'uppercase' }}>
              {summary.reachedTarget ? 'Goal achieved' : 'Target date reached'} · {doneDate.format('MMM D, YYYY')}
            </Typography>
            <Typography component="h1" sx={{ fontWeight: 700, fontSize: { xs: 22, sm: 26 }, my: 0.5 }}>
              {heroTitle}
            </Typography>
            <Typography sx={{ fontSize: 14, opacity: 0.92 }}>{heroDetail}</Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => void downloadPdf(printRef, `${goal.getGoalName().replace(/\W+/g, '-')}-summary.pdf`)}
            disabled={isExporting}
            startIcon={isExporting ? <CircularProgress size={14} /> : <PictureAsPdfIcon />}
            data-html2canvas-ignore
            sx={{
              position: 'relative',
              flexShrink: 0,
              backgroundColor: '#fff',
              color: 'primary.main',
              '&:hover': { backgroundColor: '#F1F7EF' },
            }}
          >
            Download Summary
          </Button>
        </Box>

        {/* Header */}
        <Box sx={{ ...cardSx, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <Box
            sx={{
              position: 'relative',
              width: 48,
              height: 48,
              borderRadius: 3,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${accent}1A`,
              color: accent,
            }}
          >
            <Icon />
          </Box>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
              <Typography component="h2" sx={{ fontWeight: 700, fontSize: 20 }}>
                {goal.getGoalName()}
              </Typography>
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  backgroundColor: '#E6F4E3',
                  color: 'primary.main',
                }}
              >
                <CheckIcon sx={{ fontSize: 12 }} />
                Completed
              </Box>
              {goal.archived && (
                <Box component="span" sx={{ px: 0.75, py: 0.25, borderRadius: 1, fontSize: 11, fontWeight: 600, backgroundColor: '#F1F1EF', color: 'text.secondary', textTransform: 'uppercase' }}>
                  Archived
                </Box>
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {goal.goalType === GoalType.ONE_TIME ? `${goal.getTermType()} goal` : 'Recurring goal'} · {start.format('MMM YYYY')} →{' '}
              {doneDate.format('MMM YYYY')} · {months(summary.monthsInvested)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }} data-html2canvas-ignore>
            {goal.completion && (
              <Button
                variant="outlined"
                startIcon={<ReplayIcon />}
                onClick={() => reopenGoal(dispatch, goal.id)}
                sx={{ color: 'text.primary' }}
              >
                Reopen Goal
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={goal.archived ? <UnarchiveIcon /> : <ArchiveIcon />}
              onClick={() => {
                setGoalArchived(dispatch, goal.id, !goal.archived);
                if (!goal.archived) onBack();
              }}
              sx={{ color: 'text.primary' }}
            >
              {goal.archived ? 'Unarchive' : 'Archive'}
            </Button>
          </Box>
        </Box>

        {/* Stats */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(6, minmax(0, 1fr))' },
            gap: 2,
            mb: 3,
          }}
        >
          <StatTile label="Target" value={formatCurrency(summary.target)} />
          <StatTile label="Final Value" value={formatCurrency(summary.finalValue)} color="primary.main" highlight />
          <StatTile label="You Contributed" value={formatCurrency(summary.contributed)} />
          <StatTile
            label="Returns Earned"
            value={`${summary.returns >= 0 ? '+' : ''}${formatCurrency(summary.returns)}`}
            color={summary.returns >= 0 ? 'primary.main' : 'error.main'}
          />
          <StatTile label="Months Invested" value={String(summary.monthsInvested)} />
          {summary.reachedTarget ? (
            <StatTile label="Ahead of Plan" value={summary.monthsAhead > 0 ? months(summary.monthsAhead) : 'On time'} />
          ) : (
            <StatTile label="Short By" value={formatCurrency(-summary.surplus)} color="error.main" />
          )}
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 7fr) minmax(0, 4fr)' },
            gap: 3,
            alignItems: 'stretch',
          }}
        >
          {/* Savings journey */}
          <Box sx={cardSx}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography component="h2" sx={{ fontWeight: 700, fontSize: 16, mr: 'auto' }}>
                Savings Journey
              </Typography>
              <LegendItem color="#2E7D32" label="Value" />
              <LegendItem color="#C4C4C2" label="Contributed" />
              <LegendItem color="#E8772E" label="Target" dashed />
            </Box>
            {summary.points.length < 2 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
                Not enough history to chart.
              </Typography>
            ) : (
              <Box aria-label="Savings journey chart" sx={{ mx: -1 }}>
                <LineChart
                  height={280}
                  xAxis={[
                    {
                      data: summary.points.map((p) => p.date),
                      scaleType: 'time',
                      valueFormatter: (value: Date) => dayjs(value).format('MMM YY'),
                    },
                  ]}
                  yAxis={[
                    {
                      valueFormatter: (value: number) => formatCompactCurrency(value),
                      max: Math.max(summary.target, summary.finalValue) * 1.08,
                    },
                  ]}
                  series={[
                    {
                      id: 'contributed',
                      data: summary.points.map((p) => p.contributed),
                      label: 'Contributed',
                      color: '#C4C4C2',
                      showMark: false,
                      valueFormatter: (v) => (v === null ? '' : formatCurrency(v)),
                    },
                    {
                      id: 'value',
                      data: summary.points.map((p) => p.value),
                      label: 'Value',
                      color: '#2E7D32',
                      area: true,
                      showMark: false,
                      valueFormatter: (v) => (v === null ? '' : formatCurrency(v)),
                    },
                  ]}
                  margin={{ top: 16, left: 64, right: 16, bottom: 32 }}
                  slotProps={{ legend: { hidden: true } }}
                  grid={{ horizontal: true }}
                  sx={{
                    '& .MuiChartsAxis-line, & .MuiChartsAxis-tick': { display: 'none' },
                    '& .MuiChartsGrid-line': { stroke: '#F0F0EE' },
                    '& .MuiAreaElement-root': { fillOpacity: 0.08 },
                  }}
                  skipAnimation
                >
                  <ChartsReferenceLine
                    y={summary.target}
                    label={`Target ${formatCompactCurrency(summary.target)}`}
                    labelAlign="start"
                    lineStyle={{ stroke: '#E8772E', strokeDasharray: '6 4', strokeWidth: 1.5 }}
                    labelStyle={{ fontSize: 11, fill: '#E8772E' }}
                  />
                </LineChart>
              </Box>
            )}
          </Box>

          {/* Milestones */}
          <Box sx={cardSx}>
            <Typography component="h2" sx={{ fontWeight: 700, fontSize: 16, mb: 2.5 }}>
              Milestones
            </Typography>
            <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }}>
              {timeline.map((item, i) => (
                <Box component="li" key={item.key} sx={{ display: 'flex', gap: 1.5, pb: i < timeline.length - 1 ? 2.5 : 0, position: 'relative' }}>
                  {i < timeline.length - 1 && (
                    <Box
                      aria-hidden
                      sx={{ position: 'absolute', left: 8, top: 20, bottom: 0, width: 2, backgroundColor: item.reached ? '#BFDDB8' : '#ECECEA' }}
                    />
                  )}
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      flexShrink: 0,
                      borderRadius: '50%',
                      mt: 0.25,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: item.reached ? 'primary.main' : '#ECECEA',
                      color: '#fff',
                    }}
                  >
                    {item.final && item.reached && <CheckIcon sx={{ fontSize: 12 }} />}
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: item.final && item.reached ? 'primary.main' : item.reached ? 'text.primary' : 'text.disabled' }}
                    >
                      {item.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.detail}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default CompletedGoalSummary;
