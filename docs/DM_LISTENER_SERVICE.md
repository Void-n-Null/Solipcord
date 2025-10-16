# DM Listener Background Service

A background service that automatically listens to all DM conversations and responds when users send messages.

## Overview

The DM Listener Service:
- Automatically sets up event listeners for all existing DMs
- Responds to user messages with "Hi I'm [Persona Name]"
- Runs in the background without manual intervention
- Can be started, stopped, and monitored via API

## Quick Start

### 1. Initialize the Service

**From Client-side Code:**
```typescript
import { initializeDMListenerService } from '@/lib/dm-listener-init';

// Start the service
await initializeDMListenerService();
```

**Via API:**
```bash
curl -X POST http://localhost:3000/api/dm-listener?action=initialize
```

**Response:**
```json
{
  "success": true,
  "message": "DM listener service initialized",
  "status": {
    "isRunning": true,
    "activeListeners": 3,
    "dmIds": ["dm_123", "dm_456", "dm_789"]
  }
}
```

### 2. Check Service Status

**From Client-side Code:**
```typescript
import { getDMListenerStatus } from '@/lib/dm-listener-init';

const status = await getDMListenerStatus();
console.log(status);
```

**Via API:**
```bash
curl http://localhost:3000/api/dm-listener
```

**Response:**
```json
{
  "success": true,
  "status": {
    "isRunning": true,
    "activeListeners": 3,
    "dmIds": ["dm_123", "dm_456", "dm_789"]
  }
}
```

### 3. Shutdown the Service

**From Client-side Code:**
```typescript
import { shutdownDMListenerService } from '@/lib/dm-listener-init';

await shutdownDMListenerService();
```

**Via API:**
```bash
curl -X POST http://localhost:3000/api/dm-listener?action=shutdown
```

## How It Works

### Initialization

1. Service fetches all existing DMs from `/api/direct-messages`
2. Creates a listener for each DM conversation
3. Listens specifically for user messages (ignores persona messages)
4. Auto-responds with "Hi I'm [Persona Name]" when user sends a message

### Example Flow

```
User sends: "Hello there!"
  ↓
DM Listener detects message
  ↓
Service responds: "Hi I'm Alice"
```

### Console Output

When running, you'll see logs like:

```
[DMListener] Initializing DM listener service...
[DMListener] Found 3 DMs
[DMListener] Starting listener for DM dm_123 (Alice)
[DMListener] Starting listener for DM dm_456 (Bob)
[DMListener] Starting listener for DM dm_789 (Charlie)
[DMListener] Service initialized with 3 active listeners

[DMListener] User sent message in DM dm_123: "Hello there!"
[DMListener] Sending response: "Hi I'm Alice"
[DMListener] Response sent successfully
```

## Integration Examples

### Example 1: Start on App Load

**In your root layout or main page:**

```typescript
// app/layout.tsx or app/page.tsx
'use client';

import { useEffect } from 'react';
import { initializeDMListenerService } from '@/lib/dm-listener-init';

export default function Layout({ children }) {
  useEffect(() => {
    // Initialize DM listener service on app load
    initializeDMListenerService().catch(console.error);
  }, []);

  return <>{children}</>;
}
```

### Example 2: Manual Control with UI

```typescript
'use client';

import { useState } from 'react';
import {
  initializeDMListenerService,
  shutdownDMListenerService,
  getDMListenerStatus
} from '@/lib/dm-listener-init';

export function DMListenerControl() {
  const [status, setStatus] = useState(null);

  const handleStart = async () => {
    await initializeDMListenerService();
    const newStatus = await getDMListenerStatus();
    setStatus(newStatus);
  };

  const handleStop = async () => {
    await shutdownDMListenerService();
    const newStatus = await getDMListenerStatus();
    setStatus(newStatus);
  };

  const handleRefreshStatus = async () => {
    const newStatus = await getDMListenerStatus();
    setStatus(newStatus);
  };

  return (
    <div>
      <h2>DM Listener Service</h2>
      <button onClick={handleStart}>Start Service</button>
      <button onClick={handleStop}>Stop Service</button>
      <button onClick={handleRefreshStatus}>Refresh Status</button>

      {status && (
        <div>
          <p>Running: {status.status.isRunning ? 'Yes' : 'No'}</p>
          <p>Active Listeners: {status.status.activeListeners}</p>
          <p>DMs: {status.status.dmIds.join(', ')}</p>
        </div>
      )}
    </div>
  );
}
```

### Example 3: Server-side Initialization

**Create an initialization script:**

```typescript
// scripts/start-dm-listener.ts
import { dmListenerService } from '@/services/dm-listener.service';

async function main() {
  console.log('Starting DM listener service...');
  await dmListenerService.initialize();
  console.log('Service started successfully');
}

main().catch(console.error);
```

Run with:
```bash
npx ts-node scripts/start-dm-listener.ts
```

## Customizing the Response

To customize what the service responds with, edit `src/services/dm-listener.service.ts`:

```typescript
// Current (line ~38)
const response = `Hi I'm ${personaName}`;

// Change to:
const response = `Hello! I'm ${personaName}. How can I help you today?`;

// Or make it dynamic based on user message:
const userMessage = event.message.content.toLowerCase();
const response = userMessage.includes('hello')
  ? `Hi! I'm ${personaName}, nice to meet you!`
  : `${personaName} here! Thanks for reaching out.`;
```

## Adding Listeners for New DMs

When a new DM is created, you can add a listener dynamically:

```typescript
import { dmListenerService } from '@/services/dm-listener.service';

// After creating a new DM
const newDM = await createDirectMessage(personaId);
dmListenerService.addDMListener(newDM.id, newDM.persona.id, newDM.persona.username);
```

## API Reference

### POST `/api/dm-listener?action=initialize`
Initializes the service and sets up listeners for all DMs.

### POST `/api/dm-listener?action=shutdown`
Shuts down the service and removes all listeners.

### GET `/api/dm-listener`
Gets the current status of the service.

## Service Methods

```typescript
import { dmListenerService } from '@/services/dm-listener.service';

// Initialize service
await dmListenerService.initialize();

// Add listener for specific DM
dmListenerService.addDMListener(dmId, personaId, personaName);

// Stop listener for specific DM
dmListenerService.stopListeningToDM(dmId);

// Get status
const status = dmListenerService.getStatus();

// Shutdown service
dmListenerService.shutdown();
```

## Troubleshooting

### Service won't start
- Check that `/api/direct-messages` endpoint is working
- Verify database connection
- Check console for error logs

### Service isn't responding to messages
- Verify service is running: `GET /api/dm-listener`
- Check that messages are being created correctly
- Look for `[DMListener]` logs in console
- Ensure messages are from users (not personas)

### Multiple responses being sent
- Service might be initialized multiple times
- Call shutdown before reinitializing
- Check that you're not manually setting up duplicate listeners

## Notes

- The service only responds to USER messages, not persona messages
- Each DM conversation gets its own independent listener
- Listeners are automatically cleaned up on shutdown
- The service survives page refreshes in server-side contexts
- In development, the service may restart with hot reload
