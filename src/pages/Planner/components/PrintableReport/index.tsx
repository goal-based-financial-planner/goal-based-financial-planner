import React from 'react';
import dayjs from 'dayjs';
import { PlannerData } from '../../../../domain/PlannerData';
import { InvestmentBreakdownBasedOnTermType } from '../InvestmentSuggestions';
import { TermTypeWiseProgressData } from '../TermwiseProgressBox';

type PrintableReportProps = {
  plannerData: PlannerData;
  selectedDate: string;
  investmentBreakdownBasedOnTermType: InvestmentBreakdownBasedOnTermType[];
  termTypeWiseProgressData: TermTypeWiseProgressData[];
  printRef: React.RefObject<HTMLDivElement | null>;
};

const sectionStyle: React.CSSProperties = {
  marginBottom: '24px',
  pageBreakInside: 'avoid',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '13px',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 12px',
  borderBottom: '2px solid #333',
  fontWeight: 700,
  backgroundColor: '#f3f4f6',
};

const tdStyle: React.CSSProperties = {
  padding: '7px 12px',
  borderBottom: '1px solid #e0e0e0',
};

const headingStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 700,
  margin: '0 0 12px 0',
  color: '#1a237e',
  borderBottom: '2px solid #1a237e',
  paddingBottom: '4px',
};

const emptyStyle: React.CSSProperties = {
  color: '#666',
  fontStyle: 'italic',
  padding: '8px 0',
};

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

const PrintableReport = ({
  plannerData,
  selectedDate,
  investmentBreakdownBasedOnTermType,
  termTypeWiseProgressData,
  printRef,
}: PrintableReportProps) => {
  const hasGoals = plannerData.financialGoals.length > 0;

  return (
    <div ref={printRef} className="printable-report">
      {/* Shown only during browser print (not PDF capture) */}
      <div className="print-only" style={{ marginBottom: '8px', fontSize: '11px', color: '#888' }}>
        Financial Plan Report — Printed {dayjs().format('MMMM D, YYYY')}
      </div>

      {/* ── Report Header ── */}
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color: '#1a237e',
            margin: '0 0 4px 0',
          }}
        >
          Goal Based Financial Planner
        </h1>
        <p style={{ margin: '0', color: '#555', fontSize: '13px' }}>
          Exported on {dayjs().format('MMMM D, YYYY')} &nbsp;·&nbsp; As of:{' '}
          {dayjs(selectedDate).format('MMMM YYYY')}
        </p>
        <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #ccc' }} />
      </div>

      {!hasGoals ? (
        <p style={emptyStyle}>No financial goals have been defined yet.</p>
      ) : (
        <>
          {/* ── Section 1: Financial Goals ── */}
          <div style={sectionStyle}>
            <h2 style={headingStyle}>Financial Goals</h2>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Goal Name</th>
                  <th style={thStyle}>Target Amount</th>
                  <th style={thStyle}>Target Date</th>
                  <th style={thStyle}>Term</th>
                  <th style={thStyle}>Progress</th>
                </tr>
              </thead>
              <tbody>
                {plannerData.financialGoals.map((goal, i) => {
                  const breakdown = investmentBreakdownBasedOnTermType
                    .flatMap((t) => t.investmentBreakdown)
                    .find((b) => b.goalName === goal.getGoalName());
                  const targetAmount = goal.getInflationAdjustedTargetAmount();
                  const progress =
                    breakdown && targetAmount > 0
                      ? Math.round((breakdown.currentValue / targetAmount) * 100)
                      : 0;
                  return (
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={tdStyle}>{goal.getGoalName()}</td>
                      <td style={tdStyle}>
                        {formatAmount(goal.getInflationAdjustedTargetAmount())}
                      </td>
                      <td style={tdStyle}>
                        {dayjs(goal.getTargetDate()).format('MMM YYYY')}
                      </td>
                      <td style={tdStyle}>{goal.getTermType()}</td>
                      <td style={tdStyle}>{progress}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Section 2: Investment Allocation Plan ── */}
          <div style={sectionStyle}>
            <h2 style={headingStyle}>Investment Allocation Plan</h2>
            {investmentBreakdownBasedOnTermType.length === 0 ? (
              <p style={emptyStyle}>No investment suggestions available.</p>
            ) : (
              investmentBreakdownBasedOnTermType.map((term, ti) => {
                const allSuggestions = term.investmentBreakdown.flatMap(
                  (b) => b.investmentSuggestions,
                );
                const aggregated: Record<string, { amount: number; returnPct: number }> = {};
                for (const s of allSuggestions) {
                  if (!aggregated[s.investmentName]) {
                    aggregated[s.investmentName] = { amount: 0, returnPct: s.expectedReturnPercentage };
                  }
                  aggregated[s.investmentName].amount += s.amount;
                }
                return (
                  <div key={ti} style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '14px', margin: '0 0 8px 0', color: '#333' }}>
                      {term.termType}
                    </h3>
                    {Object.keys(aggregated).length === 0 ? (
                      <p style={emptyStyle}>No investment suggestions for this term.</p>
                    ) : (
                      <table style={tableStyle}>
                        <thead>
                          <tr>
                            <th style={thStyle}>Investment</th>
                            <th style={thStyle}>Monthly Amount</th>
                            <th style={thStyle}>Expected Return</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(aggregated).map(([name, data], ri) => (
                            <tr
                              key={ri}
                              style={{ backgroundColor: ri % 2 === 0 ? '#fff' : '#fafafa' }}
                            >
                              <td style={tdStyle}>{name}</td>
                              <td style={tdStyle}>{formatAmount(Math.round(data.amount))}</td>
                              <td style={tdStyle}>{data.returnPct}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* ── Section 3: Investment History ── */}
          <div style={sectionStyle}>
            <h2 style={headingStyle}>Investment History</h2>
            {plannerData.investmentLogs.length === 0 ? (
              <p style={emptyStyle}>No investment entries logged yet.</p>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Investment Name</th>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Monthly Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {plannerData.investmentLogs.map((entry, i) => (
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={tdStyle}>{entry.name}</td>
                      <td style={tdStyle}>{entry.type}</td>
                      <td style={tdStyle}>{formatAmount(entry.monthlyAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ── Section 4: Term-wise Progress Summary ── */}
          <div style={sectionStyle}>
            <h2 style={headingStyle}>Term-wise Progress Summary</h2>
            {termTypeWiseProgressData.length === 0 ? (
              <p style={emptyStyle}>No progress data available.</p>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Term</th>
                    <th style={thStyle}>Goals</th>
                    <th style={thStyle}>Target Amount</th>
                    <th style={thStyle}>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {termTypeWiseProgressData.map((item, i) => (
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={tdStyle}>{item.termType}</td>
                      <td style={tdStyle}>
                        {item.termTypeWiseData.goalNames.join(', ')}
                      </td>
                      <td style={tdStyle}>
                        {formatAmount(item.termTypeWiseData.termTypeSum)}
                      </td>
                      <td style={tdStyle}>{item.termTypeWiseData.progressPercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ── Disclaimer Footer ── */}
      <div
        style={{
          marginTop: '32px',
          borderTop: '1px solid #ccc',
          paddingTop: '12px',
          fontSize: '11px',
          color: '#666',
          lineHeight: '1.6',
        }}
      >
        <strong style={{ display: 'block', marginBottom: '4px', color: '#444' }}>
          Disclaimer
        </strong>
        This report is generated for <strong>informational purposes only</strong> and does{' '}
        <strong>not</strong> constitute financial, legal, or investment advice. The investment
        suggestions are based on assumed investment options and user-provided goals and do{' '}
        <strong>not</strong> guarantee any specific financial outcomes or returns.
        Users should consult a <strong>qualified financial advisor</strong> before making any
        investment decisions. The creators of this tool accept no liability for financial losses
        or incorrect decisions arising from its use. This tool is provided &quot;as-is&quot; without
        warranties of any kind.
      </div>
    </div>
  );
};

export default PrintableReport;
