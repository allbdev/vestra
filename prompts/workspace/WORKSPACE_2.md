# WORKSPACES part 2

Now I want to start adding frontend code into workspaces:

1. Instead of being redirected straight to dashboard after logging in, the user should be taken to workspaces screen to select a workspace before seeing the dashboard
2. the dashboard now should live inside workspaces
3. New URL: /workspace
    a. Here the user should see theirs available workspaces
    b. A button at top right to add a new workspace
        1. When clicking on this button a modal should open for the user to insert the workspace name
        2. In this modal we need a name input, a save and a cancel button on bottom right
        3. A close X icon on top right
    c. when clicking on a workspace in the list the user should be taken to /workspace/{workspaceId}/dashboard
4. Dashboard route should now live inside workspace routes
5. When the user select a workspace in the workspaces list, this info should be saved in the localStorage.
6. If the workspace id is saved on the local storage the user should be redirected to the saved workspace after logging in or when clicking in 'Dashboard' at home page 