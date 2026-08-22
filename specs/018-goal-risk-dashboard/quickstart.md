# Quickstart: Verifying the Goal Risk Dashboard

Manual verification steps once the feature is implemented (`npm start`, then in the browser).

1. **Set up a mixed plan**: Create a plan with:
   - One one-time goal funded well ahead of its target date (log enough SIPs against it that it's
     clearly on track).
   - One one-time goal with little/no SIP funding relative to its target amount (clearly at risk).
   - One recurring goal.
2. **Stat strip, no clicks**: On the Planner page (no tab navigation, no drawer opened), verify the
   "Monthly Investing" stat tile's caption/color reflects the *at-risk* case (not the old
   `totalInvesting >= totalRequired` heuristic) whenever the shared corpus is projected short at any
   goal's target date — including cases where the naive total-vs-total comparison would have looked
   fine. Verify a summary figure is visible reading something like "1 of 2 goals at risk" (only the
   two one-time goals counted; the recurring goal is not part of the denominator).
3. **Open the Goals drawer**: Click through to the per-goal list. Verify:
   - The on-track one-time goal shows an "on-track" chip.
   - The at-risk one-time goal shows an "at-risk" chip, visually distinct (color + icon/label, not
     color alone).
   - The recurring goal shows a "not evaluated" treatment, visually distinct from both of the above
     (never reads as either on-track or at-risk).
   - No chip is clickable / navigates anywhere (static display only, per FR-007).
4. **Live update — funding an at-risk goal**: With the drawer still open (or after reopening it),
   log an additional SIP against the at-risk goal large enough to close its projected shortfall.
   Verify its chip flips to "on-track" without a page reload, and the stat-strip summary count
   decreases accordingly.
5. **Live update — degrading an on-track goal**: Lower the expected return rate on an investment
   type funding the on-track goal until its projection can no longer cover its target. Verify its
   chip flips to "at-risk" without a page reload.
6. **No goals**: Start a fresh plan with zero goals. Verify neither the stat-strip summary/caption
   nor any per-goal indicator is shown (nothing to evaluate).
7. **All-recurring plan**: Create a plan with only recurring goals (no one-time goals). Verify every
   goal shows "not evaluated" and the stat-strip summary does not display a misleading "0 of 0 at
   risk" — it should read as "nothing evaluated" or be suppressed, matching the no-goals case.
8. **Consistency with What If**: With the same plan (no sliders touched), open the What If tab.
   Verify its baseline reading (shortfall amount / on-track status) agrees with what the dashboard
   showed in steps 2–3 — the two must never disagree for the unmodified plan (SC-002).
9. **Two goals sharing a shortfall**: Set up two one-time goals due in the same month whose combined
   withdrawal exceeds the shared corpus at that point (but either alone would be covered). Verify
   *both* goals show "at-risk" — matching the existing What If tab's reporting for the same
   situation.
