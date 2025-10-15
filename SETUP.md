# Neural Social Network Setup Guide

This project uses Prisma with PostgreSQL for a Discord-like neural social network where users can control AI-generated personas.

## Quick Start

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd neural-social-network
npm install

# Install Prisma CLI globally (optional but recommended)
npm install -g prisma
```

### 2. Database Setup

#### Option A: Prisma Dev Server (Easiest - Recommended)
```bash
# Start Prisma's managed PostgreSQL server
npx prisma dev
# OR if you installed Prisma globally:
prisma dev

# This will:
# - Start a local PostgreSQL server on ports 51213-51215
# - Run migrations automatically
# - Generate Prisma client
# - Provide database URL for .env
```

#### Option B: Manual PostgreSQL
```bash
# Install PostgreSQL locally or use Docker
docker run --name neural-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=neural_social_network -p 5432:5432 -d postgres:15

# Or install PostgreSQL locally
# Ubuntu/Debian: sudo apt install postgresql postgresql-contrib
# macOS: brew install postgresql
# Windows: Download from postgresql.org
```

#### Option C: SQLite (For Testing)
```bash
# No additional setup needed - SQLite is file-based
# Change schema.prisma provider to "sqlite" first
```

### 3. Environment Configuration
Create a `.env` file in the project root:

```env
# For Prisma Dev Server (Option A)
DATABASE_URL="postgresql://prisma:prisma@localhost:51213/neural_social_network"

# For Manual PostgreSQL (Option B)
# DATABASE_URL="postgresql://postgres:password@localhost:5432/neural_social_network"

# For SQLite (Option C - change schema.prisma provider to "sqlite")
# DATABASE_URL="file:./dev.db"

# Runware API Configuration (Required for AI image generation)
# Get your API key from: https://runware.ai/
RUNWARE_API_KEY=your_runware_api_key_here
```

**Note:** If using Prisma Dev Server, press `h` in the terminal to get the exact database URL.

### 4. Database Initialization

#### If using Prisma Dev Server (Option A):
```bash
# Prisma Dev Server handles migrations automatically
# Just generate the client
npx prisma generate
```

#### If using Manual PostgreSQL or SQLite (Options B & C):
```bash
# Run migrations to create database schema
npx prisma migrate dev --name init
# OR if you installed Prisma globally:
prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
# OR if you installed Prisma globally:
prisma generate
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
- **Environment Variables**: You must configure your own `.env` including Runware API key
- **Database Files**: SQLite files are gitignored
- **Generated Code**: Prisma client is generated locally
- **API Keys**: Runware API key must be obtained separately

## Features

- Create AI personas with custom usernames and avatars
- Group chats and direct messages
- Real-time friend list updates
- External image support for avatars

## Troubleshooting

### Database Connection Issues
- Check your `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running (if using manual PostgreSQL)
- Verify database credentials
- If using Prisma Dev Server, ensure `npx prisma dev` is running

### Image Loading Issues
- Check `next.config.ts` for allowed domains
- Verify image URLs are accessible
- Check browser console for CORS errors

### Prisma Issues
- Run `npx prisma generate` after schema changes
- Run `npx prisma migrate dev` for schema updates
- Check `prisma/schema.prisma` for syntax errors
- If Prisma commands fail, try installing Prisma globally: `npm install -g prisma`

### Runware API Issues
- Ensure `RUNWARE_API_KEY` is set in your `.env` file
- Get your API key from [https://runware.ai/](https://runware.ai/)
- Check browser console for API key errors
- Verify your Runware account has sufficient credits
- If image generation fails, check the network tab for API response details

## Development

### Adding New Features
1. Update `prisma/schema.prisma` if needed
2. Run `npx prisma migrate dev --name feature-name` (or `prisma migrate dev --name feature-name` if installed globally)
3. Update API routes in `/src/app/api/`
4. Update UI components as needed

### Database Reset
```bash
# Reset database (⚠️ Destructive!)
npx prisma migrate reset
# OR if you installed Prisma globally:
prisma migrate reset
```

## Production Deployment

1. Set up production database (PostgreSQL recommended)
2. Configure production `DATABASE_URL`
3. Run `npx prisma migrate deploy` (or `prisma migrate deploy` if installed globally)
4. Deploy to your hosting platform

Each instance gets its own isolated database with no shared data.
