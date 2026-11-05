import { Box, Button, IconButton, Typography } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CloseIcon from '@mui/icons-material/Close';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { RedirectSummary } from '../../../../domain/goalCompletion';
import { GoalRiskDisplayStatus } from '../../../../domain/goalRiskStatus';
import { formatCurrency } from '../../../../types/util';

type CompletionBannerProps = {
  goal: FinancialGoal;
  monthsAhead: number;
  redirect: RedirectSummary;
  riskStatuses: Record<string, GoalRiskDisplayStatus>;
  onViewSummary: () => void;
  onReview: () => void;
  onDismiss: () => void;
};

const joinNames = (names: string[]) =>
  names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

const CompletionBanner = ({
  goal,
  monthsAhead,
  redirect,
  riskStatuses,
  onViewSummary,
  onReview,
  onDismiss,
}: CompletionBannerProps) => {
  const top = redirect.recipients[0];

  const detail = (() => {
    if (redirect.freed <= 0) return 'Nothing more needs to be invested for it.';
    if (!top) {
      return (
        <>
          Its <strong>{formatCurrency(redirect.freed)}/mo</strong> SIP share isn&apos;t needed by any other goal&apos;s plan —
          consider moving it.
        </>
      );
    }
    const names = redirect.recipients.map((r) => r.goal.getGoalName());
    return (
      <>
        Its <strong>{formatCurrency(redirect.freed)}/mo</strong> SIP share now goes to <strong>{joinNames(names)}</strong>
        {redirect.recipients.length === 1 && (
          <>
            {riskStatuses[top.goal.id] === 'at-risk' && ' (at risk)'}, covering {top.coveragePercent}% of its monthly need
          </>
        )}
        .
      </>
    );
  })();

  return (
    <Box
      role="status"
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', md: 'center' },
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        p: 2,
        mb: 3,
        borderRadius: 4,
        border: '1px solid #BFDDB8',
        backgroundColor: '#F4FAF2',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: 2.5,
            backgroundColor: 'primary.main',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <EmojiEventsIcon />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
            {goal.getGoalName()} completed{monthsAhead > 0 ? ` — ${monthsAhead} month${monthsAhead === 1 ? '' : 's'} early` : ''} 🎉
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {detail}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0, alignSelf: { xs: 'flex-end', md: 'center' } }}>
        <Button onClick={onViewSummary} sx={{ color: 'text.primary' }}>
          View Summary
        </Button>
        <Button variant="contained" onClick={onReview}>
          {top ? `Review ${top.goal.getGoalName()}` : 'Review SIPs'}
        </Button>
        <IconButton aria-label="Dismiss" onClick={onDismiss} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default CompletionBanner;
