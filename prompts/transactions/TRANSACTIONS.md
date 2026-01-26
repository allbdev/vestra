# Transactions

Transactions should be managed by the user, and should be able to be created, updated and deleted. Only the transcation/workspace owner should be able to manage transactions.

Transction type should be inherited by the selected categoty. 

Categoty is mandatory

## Steps

1. Create server actions for transactions
    a. Create
    b. Update
    c. Delete
    d. List
    e. Get
2. Create the transactions FE
    a. We need a new page called transactions, it should live inside the workspace
    b The menu on /home/vinicius/finance/app/workspace/[workspaceId]/dashboard should be updated to include the transactions page
    c. The transactions page should have a table with all the transactions, and should be able to create, update and delete transactions
    d. We need a modal to create/update transactions
    

Follow the app pattern, use app/workspace/[workspaceId]/dashboard/recurrencies as example 