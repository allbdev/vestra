/**
 * DASHBOARD LINE CHART IMPLEMENTATION PLAN
 *
 * Goal:
 * Add a preview chart at the top of the dashboard home page, displaying dynamics for the selected range.
 *
 * Requirements:
 * - Title: "Preview for the Selected Range"
 * - Chart Technology: Use 'recharts' library.
 * - Chart Type: Line chart.
 * - Data Lines:
 *    - Income (Entradas)
 *    - Outcome (Saídas)
 *    - Total (Income - Outcome)
 * - X Axis:
 *    - Each tick represents a period corresponding to the selected grouping (e.g., month, week, etc.)
 *    - Periods displayed should reflect any filter applied on the home page (date range and grouping).
 * - Data Grouping:
 *    - Group values by the currently selected period type (e.g., group by month if "month" is selected).
 * - Filtering:
 *    - The chart must respond to and apply the current dashboard filters (date range and period type) just like KPIs and the transactions table.
 * - Placement:
 *    - The chart should be rendered ABOVE <PeriodTransactionsView /> in the dashboard, so it appears between the KPI summary and the transactions-per-period grid/table.
 * - Mobile-first:
 *    - Design and render responsively, prioritizing clarity on mobile.
 *
 * Implementation Steps:
 * 1. Extract period-grouped, filtered data for income, outcome, and total from the same source as PeriodTransactionsView.
 * 2. Create a new reusable chart component (e.g. 'DashboardLineChart') in app/components/dashboard/, using 'recharts'.
 * 3. Render 3 line series (income, outcome, total), with distinct colors and legend.
 * 4. Make X axis ticks match the period labels as shown elsewhere for consistency.
 * 5. Place the chart component directly above the PeriodTransactionsView in DashboardPageClient.tsx.
 * 6. Ensure chart updates when filters (date range/grouping) change.
 */