# Flui

A personal finance app to track spending, organize transactions by category and work towards savings goals.

Built as a personal project to practice React Native, TypeScript and a Supabase backend.

## Features

- Welcome screen, sign up and sign in with email and password (Supabase Auth)
- Home screen with the total balance, the month's income and expenses, a last-7-days spending chart and recent transactions
- Expenses and income: add, edit and delete, with a decimal amount field, a calendar date picker and filters by month, type and category
- Four entry types from one form: expense, income, recurring and savings-goal deposit
- Spending breakdown by category with a donut chart
- Recurring transactions (weekly, monthly or yearly), created automatically when the app opens
- Savings goals with progress rings, quick deposits and withdrawals, deposit history, a monthly saving suggestion for goals with a deadline, and optional automatic recurring deposits
- Profile with a profile photo (stored in Supabase Storage)
- Settings: change name and password, light or dark theme, and the currency symbol (BRL, USD or EUR)

## Tech stack

- Frontend: React Native with Expo, TypeScript
- Backend: Supabase (authentication, Postgres database with row level security, storage for profile photos)
- Tooling: npm, Expo Go for testing on a phone

## Project structure

```
App.tsx          App entry point, session handling and tab navigation
index.ts         Registers the root component
components/      Reusable UI pieces (charts, inputs, modals, tab bar)
lib/             Helpers and logic (Supabase client, formatting, recurrence, theme, settings)
screens/         App screens (Welcome, Auth, Home, Expenses, Goals, Profile, Settings)
assets/          Images used by the welcome screen
supabase/        SQL for the database tables and storage
```

## Getting started

1. Install the dependencies:

   ```
   npm install
   ```

2. Create a `.env` file in the project root with your own Supabase credentials. The variable names are listed in `.env.example`:

   ```
   EXPO_PUBLIC_SUPABASE_URL=your-project-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Create the database by running these two files, in this order, in the Supabase SQL editor:

   1. `supabase/schema.sql` (tables and security policies)
   2. `supabase/novas-tabelas.sql` (recurrence columns and the profile photo storage bucket)

4. Start the app:

   ```
   npm start
   ```

   Then scan the QR code with the Expo Go app on your phone. If the phone cannot reach your computer, use `npx expo start --tunnel`.

Never commit your real `.env` file. Make sure `.env` is listed in `.gitignore`.

## What I practiced

- Structuring a TypeScript app into screens, components and helper modules
- Working with a hosted backend (auth, database and storage) through Supabase
- Keeping secrets out of version control with environment variables and `.gitignore`
- Using Git and GitHub to version and publish a project

## Next steps

- Link a WhatsApp number so expenses can be added by sending a message
- Add tests
- Add a CI pipeline with GitHub Actions
- Add screenshots to this README
