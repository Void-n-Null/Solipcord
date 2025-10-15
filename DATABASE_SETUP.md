# Database Setup Guide

This project uses Prisma with PostgreSQL for a Discord-like neural social network where users can control AI-generated personas.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database

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

### 3. Configure Environment
Create a `.env` file in the project root:

```env
# For PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/neural_social_network"

# For SQLite (change schema.prisma datasource to "sqlite")
# DATABASE_URL="file:./dev.db"
```

### 4. Run Migrations
```bash
npx prisma migrate dev
```

### 5. Generate Prisma Client
```bash
npx prisma generate
```

### 6. (Optional) Seed Database
```bash
npx prisma db seed
```

## Database Schema Overview

### Core Models

- **User**: The main user who controls the instance
- **Server**: Discord-like servers/communities
- **Channel**: Text/voice channels within servers
- **Persona**: AI-generated fake users
- **Message**: Messages in channels
- **NeuralNetwork**: Neural networks for AI behavior
- **NeuralNode**: Individual neurons
- **NeuralConnection**: Connections between neurons

### Key Features

1. **Single Instance Per User**: Each user gets their own complete Discord-like environment
2. **AI Personas**: Fake users controlled by neural networks
3. **Neural Integration**: Each persona can be linked to neural network nodes
4. **Message System**: Full Discord-like messaging with both real users and AI personas

## Usage Examples

### Initialize New Instance
```typescript
import { setupNewInstance } from '@/lib/setup';

const instance = await setupNewInstance({
  username: 'your-username',
  email: 'your-email@example.com',
});
```

### Create AI Persona
```typescript
import { db } from '@/lib/database';

const persona = await db.createPersona({
  username: 'Alice',
  displayName: 'Alice',
  personality: {
    traits: ['friendly', 'curious'],
    interests: ['technology', 'science'],
    communicationStyle: 'casual',
  },
});
```

### Send Message as Persona
```typescript
const message = await db.createMessage({
  content: 'Hello from Alice!',
  channelId: 'channel-id',
  personaId: 'alice-persona-id',
});
```

### Create Neural Network
```typescript
const network = await db.createNeuralNetwork({
  name: 'Alice Behavior Network',
  userId: 'your-user-id',
  layers: [10, 5, 3],
  learningRate: 0.01,
});
```

## Schema Evolution

When you need to change the database schema:

1. **Modify `prisma/schema.prisma`**
2. **Create migration**: `npx prisma migrate dev --name description`
3. **Apply to production**: `npx prisma migrate deploy`

## Multi-Instance Deployment

For deploying multiple instances:

### Option 1: Separate Databases
```typescript
// Each user gets their own database
const userDbUrl = `postgresql://user:pass@host:5432/user_${userId}_db`;
const userPrisma = new PrismaClient({ datasources: { db: { url: userDbUrl } } });
```

### Option 2: Single Database with Isolation
```typescript
// All users share one database (current setup)
// Data is isolated by userId foreign keys
```

## Development Tools

### Prisma Studio
```bash
npx prisma studio
```
Opens a web interface to browse and edit your database.

### Database Reset
```typescript
import { resetInstance } from '@/lib/setup';

await resetInstance('user-id'); // ⚠️ Destructive!
```

### Health Check
```typescript
import { checkInstanceHealth } from '@/lib/setup';

const health = await checkInstanceHealth('user-id');
console.log(health);
```

## Troubleshooting

### Common Issues

1. **Migration fails**: Check database connection and permissions
2. **Prisma client not found**: Run `npx prisma generate`
3. **Foreign key errors**: Ensure data is deleted in correct order
4. **Connection timeout**: Check database server status

### Reset Everything
```bash
# Delete all migrations and start fresh
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

## Production Considerations

1. **Backup Strategy**: Regular database backups
2. **Connection Pooling**: Configure Prisma connection limits
3. **Monitoring**: Set up database performance monitoring
4. **Security**: Use environment variables for sensitive data
5. **Scaling**: Consider read replicas for high-traffic instances

## Next Steps

1. Set up your database using the steps above
2. Initialize your first instance with default data
3. Create AI personas and neural networks
4. Start building your Discord-like interface!
