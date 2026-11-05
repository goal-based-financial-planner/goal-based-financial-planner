import { Dispatch, useMemo, useState } from 'react';
import { Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SpaIcon from '@mui/icons-material/Spa';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { PieChart } from '@mui/x-charts';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { GoalFunding } from '../../../../domain/goalFunding';
import { GoalRiskDisplayStatus } from '../../../../domain/goalRiskStatus';
import { InvestmentChoiceType } from '../../../../domain/InvestmentOptions';
import { ASSET_CLASS_COLORS, assetClassMix } from '../../../../domain/assetClass';
import { TermType } from '../../../../types/enums';
import { formatCompactCurrency, formatCurrency } from '../../../../types/util';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import SIPForm from '../GoalCard/components/LogEntryForm';
import { cardSx, STATUS_STYLES, TERM_STYLES } from '../Overview/styles';
import { goalIcon, goalStatus, isGoalNotStarted, TERM_RANGES } from '../MyGoals/goalVisuals';

const TERM_ICONS = {
  [TermType.SHORT_TERM]: SpeedIcon,
  [TermType.MEDIUM_TERM]: TrendingUpIcon,
  [TermType.LONG_TERM]: SpaIcon,
};

/** Asset-class shares within this many points of the plan count as aligned. */
const ALIGNED_TOLERANCE = 5;

/** "Large Cap Equity Mutual Funds" → "Large Cap". */
const shortType = (type: string) => type.replace(/\s*(Equity\s+)?Mutual Funds?$/i, '').trim() || type;

type TermPortfolioProps = {
  term: TermType;
  /** The term's goals that aren't finished yet. */
  goals: FinancialGoal[];
  funding: Record<string, GoalFunding>;
  riskStatuses: Record<string, GoalRiskDisplayStatus>;
  termStatus?: 'at-risk' | 'on-track';
  idealAllocation: InvestmentChoiceType[];
  investmentTypes: string[];
  selectedDate: string;
  dispatch: Dispatch<PlannerDataAction>;
  onBack: () => void;
  onGoalClick: (goalId: string) => void;
  onNewGoal: () => void;
};

const Chip = ({ label, bg, text }: { label: string; bg: string; text: string }) => (
  <Box
    component="span"
    sx={{ px: 0.75, py: 0.25, borderRadius: 1, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap', backgroundColor: bg, color: text }}
  >
    {label}
  </Box>
);

const HeaderStat = ({ label, value, color }: { label: string; value: string; color?: string }) => (
  <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
    <Typography variant="overline" color="text.secondary" sx={{ fontSize: 11, lineHeight: 1.5, display: 'block' }}>
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 700, fontSize: 20, color: color ?? 'text.primary' }}>{value}</Typography>
  </Box>
);

const TermPortfolio = ({
  term,
  goals,
  funding,
  riskStatuses,
  termStatus,
  idealAllocation,
  investmentTypes,
  selectedDate,
  dispatch,
  onBack,
  onGoalClick,
  onNewGoal,
}: TermPortfolioProps) => {
  const [sipFormOpen, setSipFormOpen] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const style = TERM_STYLES[term];
  const Icon = TERM_ICONS[term];

  const targetCorpus = goals.reduce((sum, g) => sum + g.getInflationAdjustedTargetAmount(), 0);
  const required = goals.reduce((sum, g) => sum + funding[g.id].requiredMonthly, 0);
  const investing = goals.reduce((sum, g) => sum + funding[g.id].investingMonthly, 0);
  const invested = goals.reduce((sum, g) => sum + funding[g.id].fundedValue, 0);

  // One row per SIP: this term's share of it, and which of the term's goals it counts towards.
  const instruments = useMemo(() => {
    const bySip = new Map<string, { name: string; type: string; monthly: number; rate: number; goals: string[] }>();
    goals.forEach((goal) =>
      funding[goal.id].contributions.forEach(({ sip, monthly, annualReturnPct }) => {
        const row = bySip.get(sip.id) ?? { name: sip.name, type: sip.type, monthly: 0, rate: annualReturnPct, goals: [] };
        row.monthly += monthly;
        if (!row.goals.includes(goal.getGoalName())) row.goals.push(goal.getGoalName());
        bySip.set(sip.id, row);
      }),
    );
    return [...bySip.values()].sort((a, b) => b.monthly - a.monthly);
  }, [goals, funding]);

  const instrumentTotal = instruments.reduce((sum, r) => sum + r.monthly, 0);
  const weightedReturn =
    instrumentTotal > 0 ? instruments.reduce((sum, r) => sum + r.rate * r.monthly, 0) / instrumentTotal : 0;

  const currentMix = assetClassMix(instruments.map((r) => ({ instrument: r.type, amount: r.monthly })));
  const idealMix = assetClassMix(
    idealAllocation.map((a) => ({ instrument: a.investmentName, amount: Number(a.investmentPercentage) })),
  );
  const hasSips = currentMix.length > 0;
  const donutMix = hasSips ? currentMix : idealMix;

  const mixLabel = (mix: typeof currentMix) => mix.map((m) => m.percent).join('/');
  const drift = idealMix.map((ideal) => ({
    ...ideal,
    current: currentMix.find((c) => c.assetClass === ideal.assetClass)?.percent ?? 0,
  }));
  const offPlanClasses = currentMix.filter((c) => !idealMix.some((i) => i.assetClass === c.assetClass));
  const isAligned =
    hasSips &&
    drift.every((d) => Math.abs(d.current - d.percent) <= ALIGNED_TOLERANCE) &&
    offPlanClasses.every((c) => c.percent <= ALIGNED_TOLERANCE);

  const unfunded = goals.filter((g) => funding[g.id].investingMonthly === 0 && !isGoalNotStarted(g, selectedDate));
  const horizon = TERM_RANGES[term].toLowerCase();

  const goalNames = goals.map((g) => g.getGoalName()).join(', ');

  const suggestion = (() => {
    const parts: string[] = [];
    if (!hasSips) {
      parts.push(`No SIPs count towards your ${term.toLowerCase()} goals yet. The plan mix for a ${horizon} horizon is ${idealMix.map((m) => `${m.percent}% ${m.assetClass}`).join(', ')}.`);
    } else if (isAligned) {
      parts.push(`Your blended ${term} mix (${mixLabel(currentMix)}) is close to the plan for a ${horizon} horizon.`);
    } else {
      const biggest = [...drift].sort((a, b) => Math.abs(b.current - b.percent) - Math.abs(a.current - a.percent))[0];
      parts.push(
        `Your blended ${term} mix (${mixLabel(currentMix)}) has drifted from the plan: ${biggest.assetClass} is ${biggest.current}% against a planned ${biggest.percent}%.`,
      );
    }
    if (unfunded.length > 0) {
      parts.push(
        `${unfunded.map((g) => g.getGoalName()).join(', ')} ${unfunded.length === 1 ? 'has' : 'have'} no SIP counting towards ${unfunded.length === 1 ? 'it' : 'them'} yet — start one to avoid falling behind.`,
      );
    }
    return parts.join(' ');
  })();

  if (goals.length === 0) {
    return (
      <>
        <BackLink onBack={onBack} />
        <Box sx={{ ...cardSx, textAlign: 'center', py: 6 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 1 }}>No {term.toLowerCase()} goals</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Goals needed in {horizon} land here. Add one to see its portfolio.
          </Typography>
          <Button variant="contained" onClick={onNewGoal}>
            + New Goal
          </Button>
        </Box>
      </>
    );
  }

  return (
    <>
      <BackLink onBack={onBack} />

      {/* Header */}
      <Box
        sx={{
          ...cardSx,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 3,
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: style.bg,
              color: style.color,
            }}
          >
            <Icon />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
              <Typography component="h1" sx={{ fontWeight: 700, fontSize: { xs: 20, sm: 24 } }}>
                {term} Portfolio
              </Typography>
              {termStatus && <Chip {...STATUS_STYLES[termStatus]} />}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              Blends {goals.length} goal{goals.length === 1 ? '' : 's'} · {horizon} horizon · {goalNames}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: { xs: 3, md: 4 }, flexWrap: 'wrap' }}>
          <HeaderStat label="Target Corpus" value={formatCompactCurrency(targetCorpus)} />
          <HeaderStat label="Monthly Required" value={formatCurrency(required)} />
          <HeaderStat
            label="Monthly Investing"
            value={formatCurrency(investing)}
            color={investing > 0 ? 'primary.main' : 'error.main'}
          />
        </Box>
      </Box>

      {/* Goals in this term */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
          gap: 2,
          mb: 3,
        }}
      >
        {goals.map((goal) => {
          const GoalIcon = goalIcon(goal.getGoalName());
          const status = goalStatus(goal, selectedDate, riskStatuses[goal.id]);
          const monthly = funding[goal.id].investingMonthly;
          return (
            <Box
              key={goal.id}
              component="button"
              type="button"
              onClick={() => onGoalClick(goal.id)}
              aria-label={`Open ${goal.getGoalName()}`}
              sx={{
                all: 'unset',
                ...cardSx,
                p: 2,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                '&:hover': { borderColor: style.color },
                '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: `${style.color}1A`,
                  color: style.color,
                }}
              >
                <GoalIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                  {goal.getGoalName()}
                </Typography>
                <Typography variant="caption" sx={{ color: monthly > 0 ? 'text.secondary' : 'error.main' }}>
                  {formatCurrency(monthly)}/mo{status ? ` · ${status.label}` : ''}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 4fr) minmax(0, 8fr)' },
          gap: 3,
          mb: 3,
          alignItems: 'stretch',
        }}
      >
        {/* Blended allocation */}
        <Box sx={cardSx}>
          <Typography component="h2" sx={{ fontWeight: 700, fontSize: 16 }}>
            Blended Allocation
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {hasSips ? 'Your SIPs for these goals, by asset class.' : 'No SIPs yet — showing the planned mix.'}
          </Typography>
          <Box sx={{ position: 'relative', width: 200, height: 200, mx: 'auto', my: 3 }}>
            <PieChart
              series={[
                {
                  data: donutMix.map((m, i) => ({
                    id: i,
                    value: m.amount,
                    label: m.assetClass,
                    color: ASSET_CLASS_COLORS[m.assetClass],
                  })),
                  innerRadius: 72,
                  outerRadius: 100,
                  valueFormatter: (item) => `${Math.round((item.value / donutMix.reduce((s, m) => s + m.amount, 0)) * 100)}%`,
                },
              ]}
              width={200}
              height={200}
              margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
              slotProps={{ legend: { hidden: true } }}
              skipAnimation
            />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <Typography variant="overline" color="text.secondary" sx={{ fontSize: 11, lineHeight: 1.4 }}>
                {hasSips ? 'Invested' : 'Planned'}
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 22 }}>
                {hasSips ? formatCompactCurrency(invested) : `${formatCompactCurrency(required)}/mo`}
              </Typography>
            </Box>
          </Box>
          <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {donutMix.map((m) => (
              <Box component="li" key={m.assetClass} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: 0.5, backgroundColor: ASSET_CLASS_COLORS[m.assetClass] }} />
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {m.assetClass}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {m.percent}%
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Instruments */}
        <Box sx={cardSx}>
          <Typography component="h2" sx={{ fontWeight: 700, fontSize: 16 }}>
            Instruments across {term} goals
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            The part of each SIP that counts towards these goals.
          </Typography>
          {instruments.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
              None of your SIPs count towards these goals yet.
            </Typography>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ '& td, & th': { borderColor: 'divider', py: 1.5 } }}>
                <TableHead>
                  <TableRow>
                    {['Instrument', 'Category', 'Linked goal', 'Allocation', 'Monthly SIP', 'Exp. return'].map((h) => (
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
                  {instruments.map((row) => (
                    <TableRow key={row.name + row.type}>
                      <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{shortType(row.type)}</TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{row.goals.join(', ')}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{Math.round((row.monthly / instrumentTotal) * 100)}%</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatCurrency(Math.round(row.monthly))}</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 500 }}>{row.rate}%</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ '& td': { fontWeight: 700, borderBottom: 'none' } }}>
                    <TableCell>Total</TableCell>
                    <TableCell />
                    <TableCell />
                    <TableCell>100%</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatCurrency(Math.round(instrumentTotal))}</TableCell>
                    <TableCell sx={{ color: 'primary.main' }}>~{weightedReturn.toFixed(1)}%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          )}
        </Box>
      </Box>

      {/* Rebalancing */}
      <Box sx={cardSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Typography component="h2" sx={{ fontWeight: 700, fontSize: 16, mr: 'auto' }}>
            Rebalancing Suggestions
          </Typography>
          {hasSips && (
            <Chip
              {...(isAligned ? STATUS_STYLES['on-track'] : { bg: '#FDEBDD', text: '#C2561A' })}
              label={isAligned ? 'Aligned with plan' : 'Needs rebalancing'}
            />
          )}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {suggestion}
        </Typography>

        {showComparison && (
          <Box sx={{ overflowX: 'auto', mb: 2 }}>
            <Table size="small" sx={{ maxWidth: 480, '& td, & th': { borderColor: 'divider' } }}>
              <TableHead>
                <TableRow>
                  {['Asset class', 'Plan', 'Yours'].map((h) => (
                    <TableCell key={h} sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[...drift, ...offPlanClasses.map((c) => ({ ...c, current: c.percent, percent: 0 }))].map((d) => (
                  <TableRow key={d.assetClass}>
                    <TableCell>{d.assetClass}</TableCell>
                    <TableCell>{d.percent}%</TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, color: Math.abs(d.current - d.percent) > ALIGNED_TOLERANCE ? 'warning.main' : 'text.primary' }}
                    >
                      {d.current}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {unfunded.length > 0 && (
            <Button variant="contained" onClick={() => setSipFormOpen(true)}>
              Start SIP for {unfunded[0].getGoalName()}
            </Button>
          )}
          <Button variant="outlined" onClick={() => setShowComparison((v) => !v)} sx={{ color: 'text.primary' }}>
            {showComparison ? 'Hide comparison' : 'Compare to Plan Mix'}
          </Button>
        </Box>
      </Box>

      <SIPForm open={sipFormOpen} onClose={() => setSipFormOpen(false)} investmentTypes={investmentTypes} dispatch={dispatch} />
    </>
  );
};

const BackLink = ({ onBack }: { onBack: () => void }) => (
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
    Back to Overview
  </Box>
);

export default TermPortfolio;
