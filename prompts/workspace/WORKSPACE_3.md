# WORKSPACES part 3

## Goal

To be able to invite users into the workspace

## Changes

1. New screen workspace config: /workspace/{workspaceId}/config
    a. Should be accessible by click in a gear icon at workspaces list in /workspace
    b. Only the workspace owner should be able to navigate to this screen
    c. This screen should have the list of users in the workspace, with a button to remove the user from the workspace
        1. Owner cannot be removed
    d. At the top right we should have a button to invite a user to the workpace
        1. When clicking on this button a modal should open for the user to insert the new user email
        2. In this modal we need a email input, a send invite and a cancel button on bottom right
        3. A close X icon on top right
            a. After clicking on invite we should call a new endpoint which will:
                1. Check if the email exists in the db and is NOT part of this workspace yet
                2. Register the invitation in a new table, workspace_invites: id (uuid), workspace_id, user_id, created_at, status (waiting, accepted, rejected)
                3. The invites should be unique, so if there's already a invite from a workspace to the user and status !== rejected, the endpoint should return a error: 'this user have already being invited to this workspace'
                4. Send a email to the user containg the following text: 'You have been invited to the workspace X click on the button bellow to accept or deny'
            b. When clicking on the button the user should be redirect to the app in a new url /workspace/{workspaceId}/invite/{user_id}
                1.  This screen should check if the invite is valid (on the server side)
                    a. If invite is invalid, redirect to 404
                    b. If invite is valid show a screen with a text 'User X (owner) invited you to Workspace X (workspace name) at date X (created_at)', a button to accept and a button to reject
                2. We need to login this user, so in this case we need to create a new session for the user while on the server side still, and pass it to the client side to update the sesstion token on the storage
                3. The url should be defined in the env, we are only local for now but on the future we need to have multiple enviroments