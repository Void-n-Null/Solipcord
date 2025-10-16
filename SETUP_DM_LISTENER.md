# Setup Guide: DM Listener Service

This guide will help you set up the DM Listener background service that automatically responds to user messages.

## What It Does

When a user sends a message in any DM conversation, the service automatically responds with:
```
Hi I'm [Persona Name]
```

## Quick Setup (Recommended) ✨

### It's Already Set Up!

The service is configured to start automatically when your Next.js server starts. **No frontend code required!**

The setup uses Next.js instrumentation:
- **File: `instrumentation.ts`** - Runs when server starts
- **File: `next.config.ts`** - Has `instrumentationHook` enabled

That's literally it! Just run your server and it works.

### How to Test It

1. Start your Next.js server:
   ```bash
   npm run dev
   ```

2. Check the **server console** (terminal, not browser) - you should see:
   ```
   [Instrumentation] Server starting, initializing services...
   [DMListener] Initializing DM listener service...
   [DMListener] Found X DMs
   [DMListener] Starting listener for DM dm_xxx (PersonaName)
   [DMListener] Service initialized with X active listeners
   [Instrumentation] DM listener service initialized successfully
   ```

3. Send a message in any DM conversation (via your web app)

4. The persona automatically responds: `Hi I'm PersonaName`

5. Check the server console again - you'll see:
   ```
   [DMListener] User sent message in DM dm_xxx: "your message"
   [DMListener] Sending response: "Hi I'm PersonaName"
   [DMListener] Response sent successfully
   ```

## How It Works

### Automatic Startup

When you run `npm run dev` or `npm start`:

1. **Next.js starts** → Runs `instrumentation.ts`
2. **`register()` function** → Calls `dmListenerService.initialize()`
3. **Service fetches DMs** → Queries database directly (no HTTP calls)
4. **Creates listeners** → One for each existing DM conversation
5. **Listens forever** → Responds to user messages automatically

### Alternative Control Methods

You can also control the service via API:

**Check Status:**
```bash
curl http://localhost:3000/api/dm-listener
```

**Restart Service:**
```bash
curl -X POST http://localhost:3000/api/dm-listener?action=shutdown
curl -X POST http://localhost:3000/api/dm-listener?action=initialize
```

## Checking Service Status

### Via Console

The service logs everything to the console with `[DMListener]` prefix.

### Via API

```bash
curl http://localhost:3000/api/dm-listener
```

Response:
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

### Via Client Code

```typescript
import { getDMListenerStatus } from '@/lib/dm-listener-init';

const status = await getDMListenerStatus();
console.log('Service running:', status.status.isRunning);
console.log('Active listeners:', status.status.activeListeners);
```

## Customizing the Response

To change what the persona responds with:

**File: `src/services/dm-listener.service.ts` (line ~38)**

Change:
```typescript
const response = `Hi I'm ${personaName}`;
```

To:
```typescript
const response = `Hello! I'm ${personaName}. How can I help you today?`;
```

Or make it smarter:
```typescript
const userMessage = event.message.content.toLowerCase();

let response;
if (userMessage.includes('hello') || userMessage.includes('hi')) {
  response = `Hi! I'm ${personaName}, nice to meet you!`;
} else if (userMessage.includes('help')) {
  response = `${personaName} here! What do you need help with?`;
} else {
  response = `Hi I'm ${personaName}`;
}
```

## Troubleshooting

### Service doesn't start

**Check console for errors:**
- Look for `[DMListener]` or `[DMListenerInitializer]` messages
- Common issue: `/api/direct-messages` endpoint not working

**Solution:**
```bash
# Test the direct messages endpoint
curl http://localhost:3000/api/direct-messages
```

### No responses to messages

**Verify service is running:**
```bash
curl http://localhost:3000/api/dm-listener
```

**Check that you're sending messages as a user:**
- The service ignores messages sent by personas
- Only user messages trigger responses

**Look for these console logs when you send a message:**
```
[DMListener] User sent message in DM dm_xxx: "your message"
[DMListener] Sending response: "Hi I'm PersonaName"
[DMListener] Response sent successfully
```

### Multiple responses being sent

**Issue:** Service might be initialized multiple times

**Solution:**
1. Check that you only have ONE `<DMListenerInitializer />` in your app
2. Shutdown and restart:
   ```typescript
   import { shutdownDMListenerService, initializeDMListenerService } from '@/lib/dm-listener-init';

   await shutdownDMListenerService();
   await initializeDMListenerService();
   ```

## Advanced Usage

### Stop the Service

```typescript
import { shutdownDMListenerService } from '@/lib/dm-listener-init';

await shutdownDMListenerService();
```

### Add Listener for New DM

When you create a new DM conversation:

```typescript
import { dmListenerService } from '@/services/dm-listener.service';

// After creating DM
const newDM = await fetch('/api/direct-messages', {
  method: 'POST',
  body: JSON.stringify({ personaId: 'persona_123' }),
});

const dm = await newDM.json();

// Add listener
dmListenerService.addDMListener(dm.id, dm.persona.id, dm.persona.username);
```

## What's Happening Behind the Scenes

1. **Service starts** → Fetches all DMs from database
2. **For each DM** → Creates an event listener using `messageEvents.onSpecificDMMessageCreated()`
3. **User sends message** → Event fires
4. **Service checks** → Is it from a user? (not a persona)
5. **Service responds** → Creates a message with "Hi I'm [Persona Name]"

## Files Created

**Core Files (Required):**
- `instrumentation.ts` - Automatic server startup
- `next.config.ts` - Has `instrumentationHook` enabled
- `src/services/dm-listener.service.ts` - Main service logic

**Optional Files (For manual control):**
- `src/app/api/dm-listener/route.ts` - API endpoints for status/control
- `src/lib/dm-listener-init.ts` - Client-side helpers (optional)
- `src/components/DMListenerInitializer.tsx` - Client component (not needed!)
- `docs/DM_LISTENER_SERVICE.md` - Full documentation

## Next Steps

1. Start the service using the Quick Setup above
2. Test by sending a message in a DM
3. Customize the response message to fit your needs
4. Consider adding more complex logic (AI integration, etc.)

For more detailed documentation, see `docs/DM_LISTENER_SERVICE.md`.
