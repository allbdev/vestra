# DASHBOARD

# DASHBOARD Functional Specification

## Filters

### 1. Date Range Filter
- Allow the user to select a start and end date.
- All dashboard data (KPIs and table) should respond to this filter.
- Default should be this year Jan 1 - Dec 31

### 2. Period Group Selector
- Options: day, week, month, year — should match the period selection used when registering a transaction template.
- Determines how the transactions are grouped and how the KPI "best period" is calculated.
- Changing this updates the periods shown in the UI.
- Default should be month

---

## Dashboard Top KPIs

Show 3 key indicators at the top (responsive/mobile-first):

1. **Best Period in the Year (by Selected Period Type)**
   - Dynamically label this based on selected period type (e.g., "Best Month," "Best Week").
   - Calculated as the period with the highest net incoming (incoming minus outcome) in the year.

2. **Incoming**
   - Total incoming for the filtered date range.

3. **Outcome**
   - Total outcome for the filtered date range.

---

## Transactions Table View

- **Grouped by period** (e.g., Jan, Feb if grouping by month, or appropriate for other groupings).
- For each period (column):
  - Split the view *vertically* (stacked, not wide columns for mobile) between **Incoming** and **Outcome**:
    - On the left: All categories/transactions that contributed to *Incoming* (plus values), with their amount per category.
    - On the right: All categories/transactions that contributed to *Outcome* (minus values), with their amount per category.
  - Each side should show a list:
    - Category Name | Amount (currency)
  - At the bottom of the cell, display a **Total** (Incoming - Outcome), visually separated or with summary styling.
- If there's no transaction for a type, display zero, a dash or omit the row (as per UI decision).
- Design should be **horizontally scrollable** for periods, **stacked and easy to read** on mobile (mobile-first).

#### Example (monthly, one period shown):

|----------------- Jan ----------------|
|  Income           |   Outcome        |
|  Salary   | 20000 |  Aluguel | 3000  |
|                   |  Mercado | 1000  |
|  Freela   | 1000  |                  |
|--------------------------------------|
|                         Total: 17000 |

- Each subsequent period (column for Feb, Mar, etc.) repeats the same structure.
- If a period has no transactions, show an empty or placeholder block.

---

## Notes

- All data must respect filter selections.
- The period group selector must remain in sync with transaction templates elsewhere in the application.
- Prioritize clean, summarized views for mobile, with responsive enhancements for larger screens.
- Use existing design system components as required (see AGENTS.md).
- No inline table components; use or create reusable table/category-display components in `app/components` if needed.

