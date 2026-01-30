# Productionize

I want to productionize this app on Vercel. 

For this I need to do some small fixes on the app before uploading:

1. Home page:
    a. Remove 'Termos de serviço' and 'Política de Privacidade' links from the footer.
    b. Update 'funcionalidades' section to match with the app features.
        i. Read all the prompts in 'prompts' folder to understand the features. (workspace, users, transactions, recurrencies, dashboard visualizations, etc)
        ii. Add a credit card feature on this area with a 'coming soon' indication
        iii. Lets componentize the cards to be easier to update in the future.
    c. Add a 'plans' section between 'funcionalidades' and 'sobre' sections.
        i. I want two plans: 'free' and 'pro'.
        ii. Free plan: can create only 1 workspace, can invite only 1 user to the workspace, no credit card feature.
        iii. Pro plan: can create unlimited workspaces, can invite unlimited users to the workspace, can use credit card feature, dashboard with more features, export data, import data, AI features, etc.
        iv. Only free plan should be available at first. Pro should have a 'coming soon' indication.
        v. Lets componentize the plans to be easier to update in the future.
    d. Add a 'Get in touch' section at the end of the page with a form to send messages to me.
        i. The form should have fields: name *, email *, phone (optional), message *.
        ii. This should be saved in a new table in the database called 'messages'.
        iii. The form should send a email to me [process.env.EMAIL_TO] when a new message is submitted.
        iv. The form should have a 'loading' state.
        v. The form should have a 'success' state.
        vi. The form should have a 'error' state.
        vii. The form should be componentized to be easier to update in the future.
    e. Header:
        i. If logged in the header should have a button to logout.
        ii. Mobile:
            1. The header should have only the Vestra logo/title at the left and a icon to open the menu on the right.
            2. The menu should open covering the entire screen and when closed it should be hidden.
            3. On mobile the menu should contatin the user icon at the top, and the navigation links below.
            4. The menu should have a button to close it.
            5. The menu should have a button to logout.
2. Dashboard page:
    a. Both the aside and the header need to be fixed, the scroll should only affect the main content area.
    b. Mobile header/aside:
        i. The aside should be fully hidden
        ii. The header should have only the Vestra logo/title at the left and a icon to open the aside on the right.
        iii. The aside should open covering the entire screen and when closed it should be hidden.
        iv. On mobile the aside should contatin the user and workspace info at the top, and the navigation links below.
        v. The aside should have a button to close it.
        vi. The aside should have a button to change workspace.
        vii. The aside should have a button to logout.

        