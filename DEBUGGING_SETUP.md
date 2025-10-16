# Debugging Setup - Enhanced Logging

## What I've Added

Enhanced logging has been added to trace the complete WebSocket/SSE message flow. This will help identify exactly where the auto-response message disappears.

### Files Modified

1. **`src/lib/database.ts`** - Prisma logging now toggleable
2. **`src/lib/websocket.ts`** - Comprehensive subscription lifecycle logging  
3. **`src/app/api/sse/route.ts`** - Connection lifecycle logging
4. **`src/services/message.service.ts`** - Broadcast state logging

## Quick Setup

### 1. Create `.env.local` (if you don't have one)

```env
# Control Prisma query logging (VERY verbose, disable by default)
ENABLE_PRISMA_LOGS=false
```

### 2. Restart Your Dev Server

```bash
npm run dev
```

## What to Do Next

### Send a Test Message

1. Open browser console (F12)
2. Filter for `[useWebSocket]` or `[WEBSOCKET]` or `[SSE]`
3. Send a message to a persona in a DM
4. Watch the logs flow

### Expected Output

You should see these phases:

**Phase 1: User Message**
```
📨 MESSAGE SERVICE: Message created in DB
🔊 Emitting DM_MESSAGE_CREATED event...
[WEBSOCKET BROADCAST] ✅ BROADCASTING TO 1 SUBSCRIBER(S)
[SSE MESSAGE] ✅ Successfully sent to client
```

**Phase 2: Auto-Response**
```
📨 MESSAGE SERVICE: Message created in DB
🔊 Emitting DM_MESSAGE_CREATED event...
[WEBSOCKET BROADCAST] Subscription State BEFORE Broadcast:
[WEBSOCKET BROADCAST] Active callbacks: ???  ← THE KEY NUMBER
```

### The Question

**What is the "Active callbacks" number in Phase 2?**

- If it's **1**: The message SHOULD be broadcast but isn't - different issue
- If it's **0**: The subscribers disappeared between Phase 1 and Phase 2

## Log Reference

| Log Prefix | What It Means |
|-----------|---------------|
| `[WEBSOCKET SUBSCRIBE]` | SSE client connected and subscribed |
| `[WEBSOCKET UNSUBSCRIBE]` | SSE client disconnected/unsubscribed |
| `[WEBSOCKET BROADCAST]` | Broadcasting a message to DM |
| `[SSE CONNECTION]` | SSE connection established |
| `[SSE DISCONNECT]` | SSE connection closed |
| `[SSE MESSAGE]` | Message sent to client |

## Common Things to Look For

1. **Between Phase 1 and Phase 2, did the subscription disappear?**
   - Look for `[WEBSOCKET UNSUBSCRIBE]` logs
   - Look for `[SSE DISCONNECT]` logs

2. **Are the DM IDs the same in both phases?**
   - Message 1: `DM ID: cmgsae4420006ryb90isr56oe`
   - Message 2: `DM ID: cmgsae4420006ryb90isr56oe` ← Must match!

3. **Is there any error between the two broadcasts?**
   - Look for `❌` or `Error` in the logs

## Next Action

Run the server with the new logging and send a test message. Share the full console output (Phase 1 through Phase 2) and we can pinpoint the exact issue.

See `DEBUG_WEBSOCKET_FLOW.md` for a detailed debugging guide.

