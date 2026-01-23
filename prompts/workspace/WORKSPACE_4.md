# WORKSPACES part 4

## Workpace config

On the workspace config page, I want to add 2 buttons: delete and edit

Delete should open a modal to confirm the deletion of the workspace
Edit should open a modal to edit the workspace name

We should use the modal component we created before

Those buttons should be placed at the right of 'Usuários do Workspace' text

## Workspace user

At /workspace I want to add a button for the user to leave the workspace

This button should only be visible if the user is NOT the owner of the workspace

This button should open a modal to confirm the leave of the workspace

We should use the modal component we created before

This button should be placed as a 'else' condition in the existing workspace.isOwner check
