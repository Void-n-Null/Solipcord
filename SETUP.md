# Neural Social Network Setup Guide

This project uses Prisma with PostgreSQL for a Discord-like neural social network where users can control AI-generated personas.

## Quick Start

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd neural-social-network
npm install
```

### 2. Database Setup

#### Option A: PostgreSQL (Recommended)
```bash
# Install PostgreSQL locally or use Docker
docker run --name neural-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=neural_social_network -p 5432:5432 -d postgres:15

# Or install PostgreSQL locally
# Ubuntu/Debian: sudo apt install postgresql postgresql-contrib
# macOS: brew install postgresql
# Windows: Download from postgresql.org
```

#### Option B: SQLite (For Testing)
```bash
# No additional setup needed - SQLite is file-based
```

### 3. Environment Configuration
Create a `.env` file in the project root:

```env
# For PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/neural_social_network"

# For SQLite (change schema.prisma datasource to "sqlite")
# DATABASE_URL="file:./dev.db"
```

### 4. Database Initialization
```bash
# Run migrations to create database schema
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### 5. Start Development Server
```bash
npm run dev
```

## What's Included

- **Database Schema**: Prisma migrations define the structure
- **API Routes**: Server-side database operations
- **UI Components**: Discord-like interface with persona management
- **Image Support**: External image domains configured

## What's NOT Included

- **Database Data**: Each instance starts with empty database
- **Environment Variables**: You must configure your own `.env`
- **Database Files**: SQLite files are gitignored
- **Generated Code**: Prisma client is generated locally

## Features

- Create AI personas with custom usernames and avatars
- Group chats and direct messages
- Real-time friend list updates
- External image support for avatars

## Troubleshooting

### Database Connection Issues
- Check your `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running (if using PostgreSQL)
- Verify database credentials

### Image Loading Issues
- Check `next.config.ts` for allowed domains
- Verify image URLs are accessible
- Check browser console for CORS errors

### Prisma Issues
- Run `npx prisma generate` after schema changes
- Run `npx prisma migrate dev` for schema updates
- Check `prisma/schema.prisma` for syntax errors

## Development

### Adding New Features
1. Update `prisma/schema.prisma` if needed
2. Run `npx prisma migrate dev --name feature-name`
3. Update API routes in `/src/app/api/`
4. Update UI components as needed

### Database Reset
```bash
# Reset database (⚠️ Destructive!)
npx prisma migrate reset
```

## Production Deployment

1. Set up production database (PostgreSQL recommended)
2. Configure production `DATABASE_URL`
3. Run `npx prisma migrate deploy`
4. Deploy to your hosting platform

Each instance gets its own isolated database with no shared data.
