# DM Listener Debugging Guide

## Problem Summary
The DM Listener detects incoming messages but doesn't create response messages without throwing errors.

## Root Cause Analysis
The issue was in the **event listener wrapper** (`onSpecificDMMessageCreated` in `message.events.ts`):

```typescript
// BEFORE (broken):
const wrappedListener = (event: MessageCreatedEvent) => {
  if (event.directMessageId === directMessageId) {
    listener(event);  // ❌ Async operation not tracked or handled
  }
};
```

When an async listener function was called without awaiting or tracking it, any promise rejections were silently swallowed by the Node.js EventEmitter.

## The Fix
```typescript
// AFTER (fixed):
const wrappedListener = (event: MessageCreatedEvent) => {
  if (event.directMessageId === directMessageId) {
    const result = listener(event) as unknown;
    if (result instanceof Promise) {
      result.catch((err: unknown) => {
        console.error(`[MessageEvents] Unhandled error in DM listener for ${directMessageId}:`, err);
      });
    }
  }
};
```

This ensures:
1. We check if the listener returns a Promise
2. We explicitly catch any rejections
3. Errors are logged instead of silently failing

## Enhanced Logging in dm-listener.service.ts
The DM listener now includes:
- Parameter validation before calling `messageService.createMessage()`
- Detailed error logging with stack traces
- Message creation confirmation with the new message ID

## Testing the Fix

### Step 1: Verify Service is Running
```bash
curl http://localhost:3000/api/dm-listener
```

Should show: `{"success":true,"status":{"isRunning":true,"activeListeners":...}}`

### Step 2: Create a Test DM
Post a message to see if the listener responds.

### Step 3: Check Server Logs
You should now see:
```
🔔 DM LISTENER EVENT TRIGGERED
...
📋 Validating parameters:
  - content: "Hi I'm [PersonaName]" (type: string)
  - personaId: "..." (type: string)
  - directMessageId: "..." (type: string)

🔧 Final params object: {...}
✅ Message created with ID: xyz123
✅ ✅ ✅ RESPONSE SENT SUCCESSFULLY ✅ ✅ ✅
```

## If Still Not Working

### Check These Things:
1. **DM Listener Service Initialization**: Is it initialized on server startup?
   - Check `instrumentation.ts` log output
   - Verify it says "INITIALIZING DM LISTENER SERVICE"

2. **Active Listeners**: How many listeners are registered?
   - Check the logs for "ACTIVE LISTENERS"
   - Should show at least 1 for each DM

3. **Event Emission**: Is the event being emitted?
   - Look for "🔊 Emitting DM_MESSAGE_CREATED event..."
   - Check that the DM ID matches your test DM

4. **Error Messages**: Look for the enhanced error messages:
   - "[MessageEvents] Unhandled error in DM listener..."
   - This now shows the actual error instead of silently failing

## Files Modified
- `src/events/message.events.ts`: Added async error handling in wrapped listeners
- `src/services/dm-listener.service.ts`: Enhanced parameter validation and error logging
