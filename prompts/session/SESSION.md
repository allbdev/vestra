# SESSION

I want to migrate from saving user session in local storage to save it on cookies on the server, then all the requests can be made trough the server instead of client side

## Details

We should migrate the way we save the user auth token, to save it in the server: https://nextjs.org/docs/app/guides/authentication
All the current api calls that happens with fetch on client side should be now handled in server side

We can get rid of auth context and workspace context, we need to check if the user is authenticated in the server instead of client, we can also fetch workspace needed info in the server since we now will have the user token session saved in the server cookies instead of local storage

Lets make sure to use 'useActionState' in requests that we need to make on the frontend

Lets use 'use client' only when realy needed, most of the api calls can be made on server side after we migrate the token to server cookie.

So we should beaultifully handle the requests on the server side and have a separated UI component being rendered at the end.