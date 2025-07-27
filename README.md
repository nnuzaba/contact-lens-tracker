# Contact Lens Tracker

A beautiful, modern web application to track your daily contact lens usage. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 📊 **Daily Usage Tracking**: Log your contact lens usage each day
- 🔢 **Usage Counter**: Keep track of total uses across all days
- 📅 **Daily & Weekly Stats**: View today's usage and weekly totals
- 📝 **Usage History**: See your recent usage patterns
- 🔄 **Smart Reset**: Reset counter for new lenses while preserving history
- 🗑️ **Clear All**: Option to completely clear all data
- 💾 **Database Storage**: Your data persists in a Turso SQLite database
- 📱 **Mobile Responsive**: Works perfectly on all devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Turso CLI (for database setup)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd contact-lens-tracker
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up the database (see [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions):
```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create database and get credentials
turso auth login
turso db create contact-lens-tracker
turso db show contact-lens-tracker --url
turso db tokens create contact-lens-tracker

# Create .env.local with your credentials
echo "TURSO_DATABASE_URL=libsql://your-database-url.turso.io" > .env.local
echo "TURSO_AUTH_TOKEN=your-auth-token" >> .env.local

# Generate and run migrations
npm run db:generate
npm run db:migrate
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Log Daily Usage**: Click the "Log Today" button whenever you use your contact lenses
2. **View Statistics**: See current lens usage, today's count, weekly usage, and all-time total
3. **Track History**: View your recent usage patterns and calendar view
4. **Reset Counter**: Click "Reset Counter" when you get new lenses (preserves history)
5. **Clear All**: Click "Clear All" to remove all data if needed

## Deployment

This app is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with one click

The app will automatically build and deploy to a production URL.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Database**: Turso (SQLite-based)
- **ORM**: Drizzle ORM

## Project Structure

```
contact-lens-tracker/
├── app/
│   ├── api/             # API routes
│   │   ├── usage-logs/  # Usage logs API
│   │   ├── app-state/   # App state API
│   │   └── clear-data/  # Clear data API
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main application page
├── lib/
│   ├── db/              # Database configuration
│   │   ├── schema.ts    # Database schema
│   │   └── index.ts     # Database connection
│   └── api.ts           # API utilities
├── package.json         # Dependencies and scripts
├── drizzle.config.ts    # Drizzle configuration
├── tailwind.config.js   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for your own contact lens tracking needs! 