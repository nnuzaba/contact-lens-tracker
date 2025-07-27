# Database Setup Guide

This app now uses Turso (SQLite-based database) for data persistence instead of localStorage.

## Setup Instructions

### 1. Install Turso CLI (if not already installed)
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

### 2. Create a Turso Database
```bash
# Login to Turso
turso auth login

# Create a new database
turso db create contact-lens-tracker

# Get your database URL and auth token
turso db show contact-lens-tracker --url
turso db tokens create contact-lens-tracker
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory with:
```
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

### 4. Generate and Run Database Migrations
```bash
# Generate migration files
npm run db:generate

# Apply migrations to your database
npm run db:migrate
```

### 5. Start the Development Server
```bash
npm run dev
```

## Local Development
For local development, you can use a local SQLite file by setting:
```
TURSO_DATABASE_URL=file:./local.db
TURSO_AUTH_TOKEN=
```

## Database Schema
- `usage_logs`: Stores daily usage records
- `app_state`: Stores application state (counter, last used date)

## Available Scripts
- `npm run db:generate`: Generate migration files
- `npm run db:migrate`: Apply migrations to database
- `npm run db:studio`: Open Drizzle Studio for database management 