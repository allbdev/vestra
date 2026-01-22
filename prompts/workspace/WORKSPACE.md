# WORKSPACE

Workspaces can be shared withim users, so a workspace need to have a owner user, but it can have infinite users
Only the owner can edit/delete the workspace.
All the operations are going to be storaged at workspace level (category, transactions, transaction_template)

## Details

workspace table: id, name, owner_id, created_at, updated_at, deleted_at
workspace_user table: id, workspace_id, user_id, created_at, updated_at, deleted_at

## Goal

We need to migrate update current tables (category, transaction, transaction_template) to have a workpace reference.
The operations should be handled at workpace level, so every user in a workspace should be able to see everything in the workspace. But only the user who created the operation can update/delete it.

So we need two keys on each operation:
    - Workspace: which defines who can see the operations
    - Owner id: which defines who owns that operation and can make changes

Workspace id need to be an UUID

We DON'T need to migrate any data, the app is not being used yet. We just need to update the transaction tables/apis 