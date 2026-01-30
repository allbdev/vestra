# TRANSACTION TEMPLATES 2

On the recurrency server action, when we create a new recurrency I want to create the related transactions 

There are some rules to be followed:

- Monthly recurrency
    - Should create one transaction for each month left in the year
    - Date handling
        - If the recurrency date is 31/01/2026 the transaction should be created for every last day in each month of the year
            - Eg.: recurrency on 31/01/2026, transactions: [31/01/2026, 28/02/2026, 31/03/2026 ...]
- Weekly recurrency
    - Should create one transaction for week month left in the month (in the same week day)
- Daily recurrency
    - Should create one transaction for each day left in the current week

- Do NOT create past transaction
    - Eg.: If I create a monthly recurrency for 31/03/2026, do not create transactions for Jan/Feb