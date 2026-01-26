# Categories

Categories should be managed by the user, and should be able to be created, updated and deleted. Only the category owner /workspace  owner should be able to manage categories.

Categories can have two types: income and expense.

This types should be constants and should be used in the code.

In the database, those types should be stored as int 1 = income and 2 = expense.

## Changes

1. Updates on the database:
    a. Remove icon field
    b. Change type field to int (1 = income, 2 = expense)

## Steps

1. Update the database
2. Create type ENUM which will be used for both categories and transactions. Create this in lib/consts.ts, add a comment to explain the purpose of this enum and making it clear that it should NEVER be edited.
3. Create server actions for categories
    a. Create
    b. Update
    c. Delete
    d. List
    e. Get
4. Create the categories FE
    a. We need a new page called categories, it should live inside the workspace
    b The menu on /home/vinicius/finance/app/workspace/[workspaceId]/dashboard should be updated to include the categories page
    c. The categories page should have a table with all the categories, and should be able to create, update and delete categories
    d. We need a page to create/update categories, it should live inside the workspace