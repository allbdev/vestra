# TRANSACTION TEMPLATES

Transaction templates are going to be used for recurring transactions

Once registered it should fulfill the current year with transactions for the workspace

We need a full CRUD for both FE and server actions

We need an API to inject a transaction_template into the transaction table, this api will be called by a CRON job in the future

Deleting/deactivating a transaction_template should NOT delete existing transactions based on it, it should only stop creating new transaction

Transaction templates should be called 'Recorrência' on the UI

The recurrency type (income/expense) should be defined by the recurrency's category

## Changes

1. Lets remove end_date from the DB, we dont need a end date. The transation_template should work while it is not deleted or is active.
2. Lets remove day_of_period from the DB we dont need this
3. I want frequency to be an int, we might create a ENUM for it on app/lib/consts.ts similar to what we have for CATEGORY

## New

1. Management should be done in http://localhost:3000/workspace/a7f9dc3d-4579-442d-a4f3-5c76e68b61a0/dashboard/recurrencies
    a. Let's follow the app pattern and have modals to create/update/delete recurrency
    b. Follow categories pattern