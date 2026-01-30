# Vercel Postgres Deployment Guide

This guide will help you set up your Vercel project with **Vercel Postgres** (powered by Neon) and connect it to your application.

## Prerequisites

1.  A [Vercel Account](https://vercel.com).
2.  The Vercel CLI installed (optional, but useful) or access to the Dashboard.
3.  Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket).

## Step 1: Create/Import Project on Vercel

1.  Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your Git repository containing this project.
4.  Don't deploy just yet (or if you do, it might fail initially due to missing DB env vars).

## Step 2: Create a Postgres Database

1.  Navigate to your Project in the Vercel Dashboard.
2.  Click on the **"Storage"** tab.
3.  Click **"Connect Store"**.
4.  Select **"Postgres"** (Vercel Postgres).
5.  Click **"Continue"**.
6.  Accept the terms (if prompted) and give your database a name (e.g., `vestra-db`).
7.  Select the **Region** closest to your app's Function Region (e.g., `Washington, D.C., USA (iad1)`).
8.  Click **"Create"**.

## Step 3: Configure Environment Variables

Once created, Vercel will automatically generate environment variables for your project. However, we need to ensure our application (Prisma) knows which one to use.

1.  Go to **Settings** -> **Environment Variables** in your Vercel Project.
2.  You should see variables like `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, etc.
3.  **Crucial Step**: Since our app expects `DATABASE_URL` (in `prisma/schema.prisma` config and `db.ts`):
    *   Vercel often links `POSTGRES_PRISMA_URL` or `POSTGRES_URL` to `DATABASE_URL` automatically in newer setups.
    *   **Verify**: Check if `DATABASE_URL` exists in the list.
    *   **If missing**: Create a new Environment Variable:
        *   **Key**: `DATABASE_URL`
        *   **Value**: Copy the value of `POSTGRES_PRISMA_URL` (recommended for Vercel/Neon as it handles pooling seamlessly for Serverless).
        *   *Note*: Since we are using the `@prisma/adapter-pg` with `pg` pool in `db.ts`, using the standard `POSTGRES_URL` is also fine. Vercel Postgres handles connection pooling at the infrastructure level usually, but since the app uses a driver adapter:
            *   Use `POSTGRES_URL` (or `POSTGRES_PRISMA_URL`) as the value for `DATABASE_URL`.

## Step 4: Run Migrations on Production

You need to apply your schema to the new production database.

### Option A: During Build (Recommended)
Update your **Build Command** in Vercel.
1.  Go to **Settings** -> **General** -> **Build & Development Settings**.
2.  Change **Build Command** to:
    ```bash
    npx prisma generate && npx prisma migrate deploy && next build
    ```
    *   `prisma generate`: Generates the client.
    *   `prisma migrate deploy`: Applies pending migrations to the prod DB.
    *   `next build`: Builds the Next.js app.

### Option B: Manually (From Local)
You can run migrations from your local machine against the production database if you have the credentials.

1.  Get the `.env` values for production:
    *   One way is using Vercel CLI: `vercel env pull .env.production.local`
2.  Run the migrate command using that env file (or manually setting the string):
    ```bash
    DATABASE_URL="your_production_connection_string" npx prisma migrate deploy
    ```

## Step 5: Redeploy

1.  If you updated the Build Command, go to **Deployments**.
2.  Click the three dots on the latest deployment (or make a new push) -> **"Redeploy"**.
3.  Watch the logs. You should see Prisma applying migrations successfully.

## Verification

After deployment:
1.  Visit your Vercel URL.
2.  Try signing up/logging in.
3.  Check the **Storage** tab > **Data** in Vercel to see your tables (`User`, `Workspace`, etc.) populated.

## Troubleshooting

*   **Connection Limit Errors**: Vercel Postgres (Neon) is serverless and scales well, but if you hit limits, ensure you are using the correct connection string. `POSTGRES_PRISMA_URL` is typically optimized for Prisma.
*   **"Missing Environment Variable"**: Ensure `DATABASE_URL` is set in the Environment Variables section.
