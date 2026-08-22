import { render, screen } from '@testing-library/react';
import PlannerStatStrip from './index';

describe('PlannerStatStrip', () => {
  const baseProps = {
    targetAmount: 1_000_000,
    totalRequired: 20_000,
    totalInvesting: 20_000,
  };

  it('shows "On track" when goalRiskSummary reports zero at-risk goals', () => {
    render(
      <PlannerStatStrip {...baseProps} goalRiskSummary={{ atRisk: 0, total: 3 }} />,
    );
    expect(screen.getByText('On track')).toBeInTheDocument();
  });

  it('shows "N of M goals at risk" when goalRiskSummary reports at-risk goals', () => {
    render(
      <PlannerStatStrip {...baseProps} goalRiskSummary={{ atRisk: 2, total: 5 }} />,
    );
    expect(screen.getByText('2 of 5 goals at risk')).toBeInTheDocument();
  });

  it('singularizes "1 of 1 goal at risk"', () => {
    render(
      <PlannerStatStrip {...baseProps} goalRiskSummary={{ atRisk: 1, total: 1 }} />,
    );
    expect(screen.getByText('1 of 1 goal at risk')).toBeInTheDocument();
  });

  it('falls back to "No SIPs logged yet" when nothing is being invested, even with one-time goals', () => {
    render(
      <PlannerStatStrip
        {...baseProps}
        totalInvesting={0}
        goalRiskSummary={{ atRisk: 2, total: 2 }}
      />,
    );
    expect(screen.getByText('No SIPs logged yet')).toBeInTheDocument();
  });

  it('shows no risk caption when there are no one-time goals to evaluate but SIPs are logged', () => {
    render(
      <PlannerStatStrip {...baseProps} goalRiskSummary={{ atRisk: 0, total: 0 }} />,
    );
    expect(screen.queryByText('On track')).not.toBeInTheDocument();
    expect(screen.queryByText(/at risk/)).not.toBeInTheDocument();
  });

  it('falls back to "No SIPs logged yet" when there are no one-time goals and nothing invested', () => {
    render(
      <PlannerStatStrip
        {...baseProps}
        totalInvesting={0}
        goalRiskSummary={{ atRisk: 0, total: 0 }}
      />,
    );
    expect(screen.getByText('No SIPs logged yet')).toBeInTheDocument();
  });
});
