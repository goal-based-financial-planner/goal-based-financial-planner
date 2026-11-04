import { Dispatch, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { LineChart } from '@mui/x-charts/LineChart';
import dayjs from 'dayjs';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { GoalFunding } from '../../../../domain/goalFunding';
import { GoalRiskDisplayStatus } from '../../../../domain/goalRiskStatus';
import { buildGoalProjection } from '../../../../domain/goalProjection';
import { InvestmentAllocationsType } from '../../../../domain/InvestmentOptions';
import { calculateInvestmentSuggestionsForGoal } from '../../../../domain/investmentCalculations';
import { GoalType } from '../../../../types/enums';
import { formatCompactCurrency, formatCurrency } from '../../../../types/util';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { deleteFinancialGoal } from '../../../../store/plannerDataActions';
import FinancialGoalForm from '../../../Home/components/FinancialGoalForm';
import SIPForm from '../GoalCard/components/LogEntryForm';
import { cardSx } from '../Overview/styles';
import { goalAccent, goalEndDate, goalIcon, goalStatus, isGoalNotStarted, timeLeft } from '../MyGoals/goalVisuals';

const DEPOSIT_PATTERN = /deposit|\bfd\b|ppf|nps|bond|g-sec|provident|pension/i;
const HISTORY_PAGE = 10;

/** "Large Cap Equity Mutual Funds" → "Large Cap". */
const shortType = (type: string) => type.replace(/\s*(Equity\s+)?Mutual Funds?$/i, '').trim() || type;

type GoalDetailProps = {
  goal: FinancialGoal;
  funding: GoalFunding;
  riskStatus: GoalRiskDisplayStatus | undefined;
  investmentAllocations: InvestmentAllocationsType;
  investmentTypes: string[];
  selectedDate: string;
  dispatch: Dispatch<PlannerDataAction>;
  onBack: () => void;
};

const StatTile = ({ label, value, color }: { label: string; value: string; color?: string }) => (
  <Box sx={{ ...cardSx, p: 2 }}>
    <Typography variant="overline" color="text.secondary" sx={{ fontSize: 11, lineHeight: 1.5, display: 'block' }} noWrap>
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 700, fontSize: 18, mt: 0.5, color: color ?? 'text.primary' }} noWrap>
      {value}
    </Typography>
  </Box>
);

const LegendDot = ({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: 12, fontWeight: 500 }}>
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: dashed ? 'transparent' : color,
        border: dashed ? `2px solid ${color}` : 'none',
      }}
    />
    {label}
  </Box>
);

const GoalDetail = ({
  goal,
  funding,
  riskStatus,
  investmentAllocations,
  investmentTypes,
  selectedDate,
  dispatch,
  onBack,
}: GoalDetailProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [sipFormOpen, setSipFormOpen] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const Icon = goalIcon(goal.getGoalName());
  const accent = goalAccent(goal, selectedDate);
  const status = goalStatus(goal, selectedDate, riskStatus);
  const end = goalEndDate(goal);

  const projection = useMemo(
    () =>
      buildGoalProjection(
        goal,
        calculateInvestmentSuggestionsForGoal(goal, investmentAllocations),
        funding.contributions,
      ),
    [goal, investmentAllocations, funding.contributions],
  );

  // Implied monthly instalments: SIPs are logged as standing instructions, not individual payments.
  const history = useMemo(() => {
    const asOf = dayjs(selectedDate);
    const rows: { key: string; date: dayjs.Dayjs; name: string; amount: number }[] = [];
    funding.contributions.forEach(({ sip, monthly, from }) => {
      for (let date = dayjs(from); !date.isAfter(asOf, 'day'); date = date.add(1, 'month')) {
        rows.push({ key: `${sip.id}-${date.format('YYYY-MM-DD')}`, date, name: sip.name, amount: Math.round(monthly) });
      }
    });
    return rows.sort((a, b) => b.date.diff(a.date));
  }, [funding.contributions, selectedDate]);

  const subtitle =
    goal.goalType === GoalType.RECURRING
      ? `Recurring goal · every ${goal.recurringDurationYears ?? 1} year${(goal.recurringDurationYears ?? 1) === 1 ? '' : 's'}`
      : `${goal.getTermType()} goal · ${isGoalNotStarted(goal, selectedDate) ? 'Starts' : 'Started'} ${dayjs(goal.getInvestmentStartDate()).format('MMM YYYY')}`;

  const visibleHistory = showAllHistory ? history : history.slice(0, HISTORY_PAGE);

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

      {/* Header */}
      <Box sx={{ ...cardSx, display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box
          sx={{
            width: 52,
            height: 52,
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
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
            <Typography component="h1" sx={{ fontWeight: 700, fontSize: { xs: 20, sm: 24 } }}>
              {goal.getGoalName()}
            </Typography>
            {status && (
              <Box
                component="span"
                sx={{
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  backgroundColor: status.bg,
                  color: status.text,
                }}
              >
                {status.label}
              </Box>
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {subtitle}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit goal">
            <IconButton
              aria-label="Edit goal"
              onClick={() => setIsEditing(true)}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, color: 'text.secondary' }}
            >
              <EditIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete goal">
            <IconButton
              aria-label="Delete goal"
              onClick={() => setConfirmDelete(true)}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, color: 'error.main' }}
            >
              <DeleteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: 'repeat(3, minmax(0, 1fr))',
            lg: 'repeat(6, minmax(0, 1fr))',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <StatTile label="Target" value={formatCompactCurrency(goal.getInflationAdjustedTargetAmount())} />
        <StatTile label="Current Value" value={formatCompactCurrency(funding.fundedValue)} />
        <StatTile label="Monthly Required" value={formatCurrency(funding.requiredMonthly)} />
        <StatTile
          label="Monthly Investing"
          value={formatCurrency(funding.investingMonthly)}
          color={funding.investingMonthly > 0 ? 'primary.main' : 'error.main'}
        />
        <StatTile label="Years Left" value={timeLeft(end, selectedDate, true)} />
        <StatTile
          label="Est. Completion"
          value={projection.estimatedCompletion ? projection.estimatedCompletion.format('MMM YYYY') : '—'}
          color={
            projection.estimatedCompletion && projection.estimatedCompletion.isAfter(end, 'month')
              ? 'error.main'
              : undefined
          }
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 7fr) minmax(0, 4fr)' },
          gap: 3,
          mb: 3,
          alignItems: 'start',
        }}
      >
        {/* Chart */}
        <Box sx={cardSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography component="h2" sx={{ fontWeight: 700, fontSize: 16, mr: 'auto' }}>
              Projected vs Required Corpus
            </Typography>
            <LegendDot color="#2E7D32" label="Projected" />
            <LegendDot color="#A3A3A3" label="Required" dashed />
          </Box>
          <Typography variant="caption" color="text.secondary">
            Projected: what this goal&apos;s share of your SIPs grows to if they continue. Required: where it needs
            to be to reach the target on time.
          </Typography>
          <Box aria-label="Projected vs required corpus chart" sx={{ mx: -1 }}>
            <LineChart
              height={300}
              xAxis={[
                {
                  data: projection.points.map((p) => p.date),
                  scaleType: 'time',
                  // Short goals get month ticks; longer ones one tick per year.
                  valueFormatter: (value: Date) =>
                    dayjs(value).format(projection.points.length <= 37 ? 'MMM YY' : 'YYYY'),
                  tickInterval: (value: Date) =>
                    projection.points.length <= 37 ? value.getMonth() % 3 === 0 : value.getMonth() === 0,
                },
              ]}
              yAxis={[{ valueFormatter: (value: number) => formatCompactCurrency(value) }]}
              series={[
                {
                  id: 'required',
                  data: projection.points.map((p) => p.required),
                  label: 'Required',
                  color: '#A3A3A3',
                  showMark: false,
                  valueFormatter: (v) => (v === null ? '' : formatCurrency(v)),
                },
                {
                  id: 'projected',
                  data: projection.points.map((p) => p.projected),
                  label: 'Projected',
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
                '& .MuiChartsAxis-tickLabel': { fill: '#9CA3AF' },
                '& .MuiChartsGrid-line': { stroke: '#F0F0EE' },
                '& .MuiAreaElement-root': { fillOpacity: 0.08 },
                '& .MuiLineElement-series-required': { strokeDasharray: '5 5' },
              }}
              skipAnimation
            />
          </Box>
        </Box>

        {/* Linked SIPs */}
        <Box sx={cardSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Typography component="h2" sx={{ fontWeight: 700, fontSize: 16, mr: 'auto' }}>
              Linked SIPs
            </Typography>
            <Typography variant="overline" color="text.secondary" sx={{ fontSize: 11 }}>
              {funding.contributions.length} linked
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            This goal&apos;s share of each SIP, based on how much it needs from that instrument.
          </Typography>
          {funding.contributions.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {isGoalNotStarted(goal, selectedDate)
                ? 'This goal hasn’t started yet, so no SIPs count towards it.'
                : 'None of your SIPs are in instruments this goal’s plan uses.'}
            </Typography>
          ) : (
            <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {funding.contributions.map(({ sip, monthly }) => {
                const isDeposit = DEPOSIT_PATTERN.test(sip.type);
                const isShared = Math.round(monthly) < sip.monthlyAmount;
                return (
                  <Box
                    component="li"
                    key={sip.id}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        flexShrink: 0,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isDeposit ? 'warning.main' : 'primary.main',
                      }}
                    >
                      {isDeposit ? <AccountBalanceIcon sx={{ fontSize: 18 }} /> : <ShowChartIcon sx={{ fontSize: 18 }} />}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap title={sip.name}>
                        {sip.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        sx={{ display: 'block', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.3 }}
                      >
                        {shortType(sip.type)}
                        {isShared && ` · of ${formatCurrency(sip.monthlyAmount)}`}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap' }}>
                      {formatCurrency(Math.round(monthly))}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}
          <Box
            component="button"
            type="button"
            onClick={() => setSipFormOpen(true)}
            sx={{
              all: 'unset',
              boxSizing: 'border-box',
              cursor: 'pointer',
              display: 'block',
              width: '100%',
              textAlign: 'center',
              mt: 2,
              py: 1,
              borderRadius: 2.5,
              border: '1px dashed',
              borderColor: '#D4D4D2',
              fontSize: 13,
              fontWeight: 500,
              color: 'text.secondary',
              '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
              '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
            }}
          >
            + Link Another Investment
          </Box>
        </Box>
      </Box>

      {/* Contribution history */}
      <Box sx={cardSx}>
        <Typography component="h2" sx={{ fontWeight: 700, fontSize: 16 }}>
          Contribution History
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Monthly SIP instalments counted towards this goal, from each SIP&apos;s start date.
        </Typography>
        {history.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            No contributions yet.
          </Typography>
        ) : (
          <>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ '& td, & th': { borderColor: 'divider', py: 1.5 } }}>
                <TableHead>
                  <TableRow>
                    {['Date', 'Instrument', 'Type', 'Amount'].map((h) => (
                      <TableCell
                        key={h}
                        sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleHistory.map((row) => (
                    <TableRow key={row.key}>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.date.format('MMM D, YYYY')}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                      <TableCell>
                        <Box
                          component="span"
                          sx={{ px: 0.75, py: 0.25, borderRadius: 1, fontSize: 11, fontWeight: 600, backgroundColor: '#E6F4E3', color: 'primary.main' }}
                        >
                          SIP
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{formatCurrency(row.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            {history.length > HISTORY_PAGE && (
              <Button size="small" onClick={() => setShowAllHistory((v) => !v)} sx={{ mt: 1.5 }}>
                {showAllHistory ? 'Show less' : `Show all ${history.length}`}
              </Button>
            )}
          </>
        )}
      </Box>

      <Dialog open={isEditing} onClose={() => setIsEditing(false)} maxWidth="sm" fullWidth>
        <FinancialGoalForm dispatch={dispatch} close={() => setIsEditing(false)} embedded initialGoal={goal} />
      </Dialog>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Delete goal?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            &ldquo;{goal.getGoalName()}&rdquo; will be removed from your plan. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} color="inherit">
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              setConfirmDelete(false);
              onBack();
              deleteFinancialGoal(dispatch, goal.id);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <SIPForm open={sipFormOpen} onClose={() => setSipFormOpen(false)} investmentTypes={investmentTypes} dispatch={dispatch} />
    </>
  );
};

export default GoalDetail;
