# TRANSACTIONS 2

I want to do some upgrades in the transaction feature

1. filter
    a. I want to be able to filter by category and type
        i. Category need to be a multiselect (this component needs to be created in app/components/ui/multiselect.tsx)
        ii. Both filters should be null by default
    b. I want to be able to clone a transaction
        i. The button should be on the left of the edit button
        ii. When clicked, it should open the same modal as the create button, but with the transaction data pre-filled
    c. I want a badge indicating either the transaction is paid or not (this need to be aplied in both transactions page and PeriodTransactionsView)
        i. If paid, it should be green
        ii. If not paid, it should be yellow
        iii. If it is not paid and the due date is passed, it should be red
    d. Amount input
        i. We need a mask on the amount input
        ii. We need it for both transaction and recurrency creation
        iii. The mask should be "R$ 0,00", it should be only for visualization, the value sended to the server should stay the same
