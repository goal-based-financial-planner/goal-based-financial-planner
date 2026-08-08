# Quickstart: Verifying What If

Manual verification steps once the feature is implemented (`npm start`, then in the browser):

1. **Baseline required**: Ensure the plan has at least one one-time goal.
2. **Open the What If tab**: Click "What If" on the Planner page. Verify:
   - One inflation slider per goal, each starting at that goal's baseline inflation rate.
   - One return slider per investment type used anywhere in the plan, each starting at that
     type's baseline expected return.
   - One chart with "Current Plan" and "What If" lines exactly overlapping (no adjustment yet).
   - Both status chips read "On track" (or match whatever the baseline actually is).
   - The "Reset" button is disabled.
3. **Drag an inflation slider**: Move one goal's inflation slider up. While dragging, verify the
   chart's "What If" line and the "What If" status chip update continuously — the "Current Plan"
   line/chip must not move. "Reset" becomes enabled.
4. **Drag a return slider**: Move an investment type's return slider down. Verify the "What If" line
   drops (lower projected value) while the target (visible via the shortfall figure) is unchanged.
5. **Combine adjustments**: Move both an inflation slider and a return slider. Verify the "What If"
   figure reflects both effects together (worse than either alone).
6. **Reset**: Click "Reset." Verify every slider returns to its baseline position and the "What If"
   line/chip matches "Current Plan" again; "Reset" becomes disabled.
7. **Reload check**: Refresh the page, reopen the What If tab. Verify every slider is back at
   baseline — nothing from step 3–5 persisted.
8. **Isolation check**: After adjusting sliders, check "Investment Plan" and "Portfolio" tabs —
   verify the baseline goals, allocations, and required monthly investment are completely
   unaffected.
9. **No goals case**: With a plan that has zero one-time goals, verify the What If tab shows an
   empty-state message and no sliders.
