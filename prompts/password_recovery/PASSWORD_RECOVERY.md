# Password Recovery

## Context

The user has forgotten their password and is trying to recover it.

## Objective

To recover the user's password.

## Steps

1. User enters their email address.
2. System checks if the email exists in the database.
3. If the email exists, a password reset token is generated and sent to the user's email address.
4. User clicks on the password reset link in the email.
5. User enters a new password.
6. System updates the user's password in the database.
7. User is redirected to the login page.

## Changes

1. On the fe we need to create two new screens:
    - Password recovery screen, where the user will enter his email address
    - New password screen, where the user will enter his new password
        - We need a token on the url params to validade against the token on the db
        - If the token is valid, the user can change his password
        - If the token is invalid, the user will be redirected to the login page
2. Server actions:
    - Password recovery action
        - Which will be responsible to generate the token and send the email with the link to the new password screen carrying the token in the url params
    - New password action
        - Which will be responsible to update the user's password in the database, and redirect the user to the login page after the update

