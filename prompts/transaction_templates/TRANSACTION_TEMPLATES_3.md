# TRANSACTION TEMPLATES 3

I want to have an endpoint to update the transactions based on the recurrency

This will be called by a cron job
This will affect all the workspaces
Should not validate token, but this should be protected by a secret key

One a day the cron job will hit this endpoint

This endpoint should do the following:
- Get all recurrencies that are active, not deleted (deleted_at is null), and active = 1
- For each recurrency, check if there is a transaction for the current recurrency period
- If there is no transaction for the current recurrency related period, create the necessary transactions
- Rules:
    - Monthly: create for the current year
    - Weekly: create for the current month
    - Daily: create for the current week
        - Eg.:
            - Monthly recurrency created, not deleted (deleted_at is null), and active = 1 
                - Check if for the current year, for each month if exists a transaction related to this recurrency
                - If not, create one
                - If yes, do nothing
            - Weekly recurrency created, not deleted (deleted_at is null), and active = 1 
                - Check if for the current month, for each week if exists a transaction related to this recurrency
                - If not, create one
                - If yes, do nothing
            - Daily recurrency created, not deleted (deleted_at is null), and active = 1 
                - Check if for the current week, for each day if exists a transaction related to this recurrency
                - If not, create one
                - If yes, do nothing
