# TOUR

The goal is to help the user to know how to use each feature. This is tied to an user level, never mind the workspace, the user only need to complete this once.

## Component

Should be a modal positioned near the defined components.
It should receive title, subtitle, button action and button label.
The component should only be rendered if the onboarding step is not completed.
The component should have a dismiss button which just close the modal (next time user visit the screen the modal MUST be rendered)

## Onboarding steps

1. Workspaces
    a. In /workspace we should display the workspace onboarding modal near the create workspace button
        i. Title: 'Crie seu workspace para começar a organizar suas finanças'
        ii. subtitle: 'As suas transações são relaticas ao seu workspace. Você pode criar workspaces para diferentes propósitos, como finanças pessoais, finanças da empresa, etc.'
    b. Actions:
        i. Open create workspace modal
        ii. Fill user onboarding step 1 as completed
2. Dashboard
    a. In /workspace/:workspaceId/dashboard we should display the dashboard onboarding modal near first KPICard
        i. Title: 'Confira seus principais indicadores financeiros'
        ii. subtitle: 'No seu dashboard você pode acompanhar seus principais indicadores financeiros, como entradas, saidas, saldo e melhor periodo'
    b. Actions:
        i. Close the modal
        ii. Fill user onboarding step 2 as completed        
3. Categories
    a. In any page that render the menu DashboardNavItem label 'Categorias'
        i. Title: 'Crie sua primeira categoria'
        ii. subtitle: 'As suas categorias são utilizadas para identificar e organizar suas transações.'
    b. Actions:
        i. Close the modal
        ii. Fill user onboarding step 3 as completed
        iii. Redirect user to /workspace/:workspaceId/categories
4. Recurrences
    a. In any page that render the menu DashboardNavItem label 'Recurrences'
        i. Title: 'Crie sua primeira recorrencia'
        ii. subtitle: 'As suas recorrencias são utilizadas para cadastrar transações que se repetem periodicamente.'
    b. Actions:
        i. Close the modal
        ii. Fill user onboarding step 4 as completed
        iii. Redirect user to /workspace/:workspaceId/recurrences
5. Transactions
    a. In any page that render the menu DashboardNavItem label 'Transactions'
        i. Title: 'Confira suas transações'
        ii. subtitle: 'As suas transações são relaticas ao seu workspace. Você pode criar workspaces para diferentes propósitos, como finanças pessoais, finanças da empresa, etc.'
    b. Actions:
        i. Close the modal
        ii. Fill user onboarding step 5 as completed
        iii. Redirect user to /workspace/:workspaceId/transactions

## Data

1. We need to store the onboarding steps in the database.
    a. onboarding table: id (uuid), step (number), completed (boolean), user_id (uuid)
    b. When user is created, create a new row in the onboarding table with step 1 and completed false
    c. When the user completes a step, update the row in the onboarding table with completed true, and create a new row with step + 1 and completed false
    