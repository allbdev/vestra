# FILTERS

Right now we have only one filter on the app which is located in app/workspace/[workspaceId]/dashboard/DashboardPageClient.tsx.

The goal is to have a filter component to be used in any place.

The filter should actualy be a popover

The filter values should be stored in a form instead of using useState. The filter value should also be stored in the url as a query param.

The goal is to have a component were we can use with any interface so I want to have a component like this:

```tsx
export const FilterPopver = () => {
    return <section className="bg-card border border-border rounded-2xl p-4 sm:p-6">
        {children}
    </section>
}

FilterPopover.title = <h2 className="text-lg font-semibold mb-4">{children}</h2>

FilterPopover.startDate = <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
          />

FilterPopover.periodType = <PeriodGroupSelector
              value={periodType}
              onChange={handlePeriodTypeChange}
            />
```

And then the Dev would need to mount it like this:

```tsx
<FilterPopover>
    <FilterPopover.title>Filters</FilterPopover.title>
    <FilterPopover.startDate />
    <FilterPopover.periodType />
</FilterPopover>
```

The filter should need to handle all the data management, validation and submission.

The filter should be able to be used in any place.

We must display a badge with the current amount of applied filters.

Tech stack:
- React
- Next.js
- TailwindCSS
- Material UI: https://mui.com/material-ui/react-popover/, https://mui.com/material-ui/react-badge/
- React hook form: https://react-hook-form.com/

