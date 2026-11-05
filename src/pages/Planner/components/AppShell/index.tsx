import React, { useState } from 'react';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SpaIcon from '@mui/icons-material/Spa';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { GoalRiskSummary } from '../../../../domain/goalRiskStatus';
import { TermType } from '../../../../types/enums';

export type PlannerView = 'overview' | 'goals' | 'investments' | 'portfolio' | 'whatif';

const SIDEBAR_WIDTH = 240;

type NavItem = {
  view?: PlannerView;
  label: string;
  icon: React.ReactNode;
  indent?: boolean;
};

const MAIN_NAV: NavItem[] = [
  { view: 'overview', label: 'Overview', icon: <DonutLargeIcon fontSize="small" /> },
  { view: 'goals', label: 'My Goals', icon: <TrackChangesIcon fontSize="small" /> },
  { view: 'investments', label: 'Investments', icon: <AccountBalanceWalletIcon fontSize="small" /> },
  { view: 'portfolio', label: 'Portfolio', icon: <BusinessCenterIcon fontSize="small" />, indent: true },
];

const PLANNING_NAV: NavItem[] = [
  { view: 'whatif', label: 'What If', icon: <AutoFixHighIcon fontSize="small" /> },
  { label: 'History', icon: <HistoryIcon fontSize="small" /> },
];

const TERM_TABS: { term: TermType | null; label: string }[] = [
  { term: null, label: 'Summary' },
  { term: TermType.SHORT_TERM, label: 'Short-term' },
  { term: TermType.MEDIUM_TERM, label: 'Mid-term' },
  { term: TermType.LONG_TERM, label: 'Long-term' },
];

type AppShellProps = {
  activeView: PlannerView;
  onNavigate: (view: PlannerView) => void;
  /** The term portfolio being shown, or null for none (Summary = the Overview). */
  activeTerm: TermType | null;
  onTermSelect: (term: TermType | null) => void;
  onNewGoal: () => void;
  healthScore: number | null;
  goalRiskSummary: GoalRiskSummary;
  completedCount?: number;
  topBarRight?: React.ReactNode;
  children: React.ReactNode;
};

const healthColor = (score: number) =>
  score >= 75 ? 'success.main' : score >= 40 ? 'warning.main' : 'error.main';

const AppShell = ({
  activeView,
  onNavigate,
  activeTerm,
  onTermSelect,
  onNewGoal,
  healthScore,
  goalRiskSummary,
  completedCount = 0,
  topBarRight,
  children,
}: AppShellProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const topBarSwitcher = useMediaQuery(theme.breakpoints.up('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = (view: PlannerView) => {
    onNavigate(view);
    setMobileOpen(false);
  };

  const renderItem = ({ view, label, icon, indent }: NavItem) => {
    const active = view === activeView;
    const disabled = !view;
    const button = (
      <Box
        key={label}
        component="button"
        type="button"
        disabled={disabled}
        aria-current={active ? 'page' : undefined}
        onClick={() => view && navigate(view)}
        sx={{
          all: 'unset',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          width: '100%',
          px: 1.5,
          pl: indent ? 4.5 : 1.5,
          py: 1.1,
          borderRadius: 2,
          fontSize: 14,
          fontWeight: active ? 600 : 500,
          cursor: disabled ? 'default' : 'pointer',
          color: active ? 'primary.main' : disabled ? 'text.disabled' : 'text.primary',
          backgroundColor: active ? 'primary.light' : 'transparent',
          '& svg': { color: active ? 'primary.main' : disabled ? 'text.disabled' : 'text.secondary' },
          '&:hover': disabled || active ? undefined : { backgroundColor: 'action.hover' },
          '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
        }}
      >
        {icon}
        {label}
      </Box>
    );
    return disabled ? (
      <Tooltip key={label} title="Coming soon" placement="right">
        <span>{button}</span>
      </Tooltip>
    ) : (
      button
    );
  };

  const summaryActive = activeTerm === null && activeView === 'overview';
  const termSwitcher = (vertical: boolean) => (
    <Box
      role="tablist"
      aria-label="Portfolio by term"
      sx={{
        display: 'flex',
        flexDirection: vertical ? 'column' : 'row',
        gap: 0.25,
        p: vertical ? 0 : 0.5,
        borderRadius: 2.5,
        backgroundColor: vertical ? 'transparent' : '#F3F3F1',
      }}
    >
      {TERM_TABS.map(({ term, label }) => {
        const selected = term === null ? summaryActive : activeTerm === term;
        return (
          <Box
            key={label}
            component="button"
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => {
              onTermSelect(term);
              setMobileOpen(false);
            }}
            sx={{
              all: 'unset',
              cursor: 'pointer',
              px: vertical ? 1.5 : 2,
              py: vertical ? 1 : 0.75,
              borderRadius: 2,
              fontSize: 14,
              fontWeight: selected ? 600 : 500,
              color: selected ? 'text.primary' : 'text.secondary',
              backgroundColor: selected ? 'background.paper' : 'transparent',
              boxShadow: selected && !vertical ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              border: selected && vertical ? '1px solid' : 'none',
              borderColor: 'divider',
              '&:hover': selected ? undefined : { color: 'text.primary' },
              '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
            }}
          >
            {label}
          </Box>
        );
      })}
    </Box>
  );

  const sidebar = (
    <Box
      component="nav"
      aria-label="Planner sections"
      sx={{
        width: SIDEBAR_WIDTH,
        boxSizing: 'border-box',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        gap: 0.5,
        backgroundColor: 'background.paper',
      }}
    >
      {MAIN_NAV.map(renderItem)}
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ fontSize: 11, px: 1.5, mt: 2, mb: 0.5, lineHeight: 1.5 }}
      >
        Planning
      </Typography>
      {PLANNING_NAV.map(renderItem)}
      {!topBarSwitcher && (
        <>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontSize: 11, px: 1.5, mt: 2, mb: 0.5, lineHeight: 1.5 }}
          >
            Portfolio by term
          </Typography>
          {termSwitcher(true)}
        </>
      )}

      <Box sx={{ flex: 1 }} />

      {healthScore !== null && (
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            p: 2,
            mb: 1.5,
            textAlign: 'center',
          }}
        >
          <Typography variant="overline" color="text.secondary" sx={{ fontSize: 11, lineHeight: 1.5 }}>
            Health Score
          </Typography>
          <Typography sx={{ fontSize: 26, fontWeight: 700, color: healthColor(healthScore), my: 0.5 }}>
            {healthScore}%
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            {goalRiskSummary.atRisk} of {goalRiskSummary.total} goal{goalRiskSummary.total === 1 ? '' : 's'} at risk
          </Typography>
          {completedCount > 0 && (
            <Typography
              variant="caption"
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 0.5, color: 'primary.main', fontWeight: 600 }}
            >
              <CheckCircleIcon sx={{ fontSize: 14 }} />
              {completedCount} completed
            </Typography>
          )}
        </Box>
      )}

      <Button
        fullWidth
        variant="contained"
        onClick={() => {
          onNewGoal();
          setMobileOpen(false);
        }}
        className="add-goals-button"
        sx={{
          py: 1.2,
          backgroundColor: '#111111',
          '&:hover': { backgroundColor: '#2A2A2A' },
        }}
      >
        + New Goal
      </Button>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
      {/* Top bar */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: theme.zIndex.appBar,
          height: 64,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: { xs: 2, md: 3 },
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {isMobile && (
          <IconButton edge="start" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
            <MenuIcon />
          </IconButton>
        )}
        <Box
          className="navbar-home"
          sx={{
            width: 32,
            height: 32,
            borderRadius: 2,
            backgroundColor: '#111111',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SpaIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Goal Planner</Typography>
        {topBarSwitcher && (
          <Box sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>{termSwitcher(false)}</Box>
        )}
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>{topBarRight}</Box>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {isMobile ? (
          <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
            {sidebar}
          </Drawer>
        ) : (
          <Box
            sx={{
              position: 'sticky',
              top: 64,
              height: 'calc(100vh - 64px)',
              flexShrink: 0,
              borderRight: '1px solid',
              borderColor: 'divider',
            }}
          >
            {sidebar}
          </Box>
        )}

        <Box component="main" sx={{ flex: 1, minWidth: 0, p: { xs: 2, sm: 3, md: 4 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AppShell;
