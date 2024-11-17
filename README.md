# DayFlow - Personal Journaling App

A modern journaling application built with Next.js, Prisma, and TypeScript.

## Features

- Create custom journal templates
- Secure authentication
- Responsive design
- Modern UI with Tailwind CSS
- Real-time updates

## Tech Stack

- **Framework**: Next.js 15
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Deployment

### Prerequisites

1. Create a [Vercel account](https://vercel.com/signup)
2. Install [Vercel CLI](https://vercel.com/download)
3. Set up a PostgreSQL database (recommended: [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres))

### Environment Variables

Set the following environment variables in your Vercel project:

```bash
DATABASE_URL="your-postgres-connection-string"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://your-domain.vercel.app"
```

### Deploy

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables
4. Deploy!

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## License

MIT
