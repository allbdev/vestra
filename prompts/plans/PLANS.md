# PLANS

new table: user_plans

user_id (foreign key)
plan_id (foreign key)
start_date
end_date
is_active boolean default true

new table: plans

id
name
price number
is_default boolean

New table should start with a free plan and a paid plan.

1. Free plan
    a. Name: free
    b. Price: 0
    c. Is default: true
2. Pro plan
    a. Name: pro
    b. Price: 10
    c. Is default: false

Changes on user creation:

1. User should start with free plan
    a. when creating the user add a record in user_plans table with the free plan
    b. Should get the the default plan id from plans table


Changes on existing flows:

1. Create workspace button/server action should check if the user have a pro plan
    a. If the user have a pro plan, proceed with regular flow
    b. If the user don't have a pro plan:
        i. Check user's workspaces amount, if user already have a created workspace show a modal with the price of the pro plan and a button to subscribe else proceed with regular flow
2. Invite user to workspace button/server action should check if the user have a pro plan
    a. If the user have a pro plan, proceed with regular flow
    b. If the user don't have a pro plan:
        i. Check the amount of users in the workspace, if the workspace already have 2 users show a modal with the price of the pro plan and a button to subscribe else proceed with regular flow