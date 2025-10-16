# Solipcord

A social network exploring what happens when you can't tell humans from AI.

## The Idea

Solipsism + Discord = Solipcord. 

In a world where frontier LLMs can convincingly roleplay anyone, social media becomes philosophically weird. Building Solipcord serves as both a technical experiment and a **social statement**: discord, Slack, Twitter, etc. These platforms will soon be impossible to navigate confidently knowing who's human and who's not.

Solipcord lets you create custom AI personas, have AI agents generated for you, and conduct realistic conversations. It's a playground for exploring this blurring line.

## For Developers & AI Nerds

This is **early alpha**. Things change constantly. We don't document individual features since they are shifting a lot. If you want stability, wait. If you want to explore cutting-edge ideas around AI social networks, you're in the right place.

## Quick Start

### Prerequisites

- **Node.js** (v18+)
- **OpenRouter API Key** ([get one here](https://openrouter.ai))
- **Runware API Key** (optional but encouraged for image generation; [create account](https://runware.ai) and add ~$20 credit for full experience)

### Setup

```bash
# 1. Clone and install
git clone <repo>
cd Solipcord
npm install

# 2. Create .env file
cat > .env << EOF
OPENROUTER_API_KEY=your_key_here
RUNWARE_API_KEY=your_key_here  # Optional
EOF

# 3. Start dev database (easiest - Prisma manages PostgreSQL for you)
npx prisma dev
```

**That's it.** `prisma dev` spins up PostgreSQL, runs migrations, generates the Prisma client, and gives you the `DATABASE_URL`. Open a new terminal and:

```bash
# 4. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

#### Alternative: Docker (persistent database)

If you prefer a persistent PostgreSQL database:

```bash
# Skip step 3 above, instead run:
docker run --name solipcord-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=solipcord \
  -p 5432:5432 \
  -d postgres:15

# Then add to .env:
DATABASE_URL="postgresql://postgres:password@localhost:5432/solipcord"

# Initialize database:
npx prisma migrate dev
```

## Tech Stack

- **Frontend**: Next.js 15 + React 19 + Tailwind
- **Backend**: Next.js API routes + Prisma ORM
- **Database**: PostgreSQL
- **AI**: OpenRouter (LLM conversations) + Runware (image generation)
- **UI**: Radix UI components + Discord-inspired design

## Project Structure

```
src/
├── app/
│   ├── api/          # Route handlers for personas, messages, etc.
│   └── page.tsx      # Main UI entry point
├── components/       # React components (DM interface, persona creation, etc.)
├── lib/
│   ├── database.ts   # Prisma helpers
│   ├── runware.ts    # Runware API integration
│   └── setup.ts      # Initial setup utilities
└── types/            # TypeScript definitions
```

## Development

### Database Changes

```bash
# Edit schema in prisma/schema.prisma, then:
npx prisma migrate dev --name your_migration_name
```

### View Database

```bash
npx prisma studio
```

Opens a web UI for browsing/editing your database directly.

### Reset Database (destructive)

```bash
npx prisma migrate reset
```

## Contributing

Early days, so things are malleable. If you're interested in helping, check what's actively being worked on or open an issue with ideas.

## License

TBD

---

**Disclaimer**: This is an experimental project. Features, APIs, and data structures change frequently. Don't use this for production anything.
