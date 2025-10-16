# WebSocket/SSE Message Flow Debugging Guide

## Quick Start: Disable Prisma Logs

Add this to your `.env.local` to clean up the console:

```env
ENABLE_PRISMA_LOGS=false
```

This will disable the noisy Prisma query logs while keeping error logs visible.

---

## Message Flow Overview

When you send a message, here's what SHOULD happen:

```
1. User sends message via UI
   ↓
2. Message created in database
   ↓
3. messageEvents.emitMessageCreated() fires
   ↓
4. DM Listener picks it up and auto-responds
   ↓
5. Auto-response message created in database
   ↓
6. messageEvents.emitMessageCreated() fires again
   ↓
7. broadcastMessageToDM() broadcasts to all SSE subscribers
   ↓
8. SSE callback invokes, sending message to frontend
   ↓
9. Frontend receives via EventSource and displays
```

---

## Log Markers to Track

### Phase 1: User Message Sent

Look for these logs in order:

```
📨 MESSAGE SERVICE: Message created in DB
Content: [your message]
DM ID: cmgsae4420006ryb90isr56oe  ← NOTE THIS DM ID

🔊 EVENT EMITTER: emitMessageCreated called
🔊 Emitting DM_MESSAGE_CREATED event...

🔔 DM LISTENER EVENT TRIGGERED
✅ MESSAGE IS FROM USER - WILL RESPOND

📡 ABOUT TO BROADCAST TO DM CLIENTS
From user: YES

[WEBSOCKET BROADCAST] ✅ BROADCASTING TO 1 SUBSCRIBER(S)
[SSE MESSAGE] ✅ Successfully sent to client
```

### Phase 2: Auto-Response Sent (The Critical Part)

```
📨 MESSAGE SERVICE: Message created in DB
Content: Hi I'm [Persona]
DM ID: cmgsae4420006ryb90isr56oe  ← MUST BE SAME ID

🔊 EVENT EMITTER: emitMessageCreated called
🔊 Emitting DM_MESSAGE_CREATED event...

🔔 DM LISTENER EVENT TRIGGERED
⏭️  SKIPPING: Message is from persona, not user  ← Expected skip

📡 ABOUT TO BROADCAST TO DM CLIENTS
From persona: YES

[WEBSOCKET BROADCAST] Subscription State BEFORE Broadcast:
Active callbacks: ???  ← THIS IS THE KEY NUMBER
```

---

## The Bug: Where Subscribers Disappear

**In Phase 1**, you should see:
```
[WEBSOCKET BROADCAST] Active callbacks: 1
```

**In Phase 2**, if the bug happens, you'll see:
```
[WEBSOCKET BROADCAST] Active callbacks: 0
```

### What to Look for Between Phase 1 and Phase 2

Between these two broadcasts, check for:

1. **[WEBSOCKET UNSUBSCRIBE]** - If you see this, the subscription was removed
2. **[SSE DISCONNECT]** - If you see this, the client connection closed
3. **[SSE MESSAGE] ❌ Error** - If errors occurred while sending Phase 1 message
4. **No logs at all** - The timing might be off, or messages are being queued

---

## Log Format Key

| Prefix | Meaning | Example |
|--------|---------|---------|
| `[WEBSOCKET SUBSCRIBE]` | A new SSE client subscribed | Adding callback for DM |
| `[WEBSOCKET BROADCAST]` | Broadcasting a message to DM | Message being sent to subscribers |
| `[WEBSOCKET UNSUBSCRIBE]` | An SSE client unsubscribed | Client disconnected |
| `[SSE CONNECTION]` | SSE connection lifecycle | Client connected/ready |
| `[SSE MESSAGE]` | Message delivery to client | Enqueuing message to controller |
| `[SSE DISCONNECT]` | Client cleanup | Connection closed |

---

## How to Debug

### Step 1: Enable Detailed Logging
Make sure `ENABLE_PRISMA_LOGS=false` is set so Prisma logs don't clutter the output.

### Step 2: Send a Test Message
1. Open the browser DevTools (F12)
2. Go to Console tab
3. Look for: `[useWebSocket] Message received: [ID]`
4. Should show TWICE (once for user message, once for auto-response)

### Step 3: Check Backend Console
Look for all the phases above. Pay special attention to:

- **Phase 1, Phase 2 DM IDs match?** If they don't, the broadcast goes to wrong DM
- **Active callbacks count?** Should be 1 in Phase 1 and Phase 2
- **Any disconnect logs between phases?**

### Step 4: Trace the Subscription

If Phase 2 shows `Active callbacks: 0`, look backward in logs for:

```
[WEBSOCKET UNSUBSCRIBE] ✅ Subscription removed
```

This tells you WHEN the subscription was removed. Check what happened before it.

---

## Common Issues

### Issue: "Active callbacks: 0" in Phase 2

**Possible Causes:**
1. SSE connection closed between Phase 1 and Phase 2
2. Client disconnected while listener was running
3. The subscription was explicitly removed
4. Browser tab became inactive/backgrounded

**What to check:**
- Look for `[SSE DISCONNECT]` logs
- Check browser DevTools - is the SSE connection open?
- Check if browser tab is still focused

### Issue: Message queued but not delivered

From logs:
```
[WEBSOCKET BROADCAST] Message will be available in queue for new subscribers
```

This means:
- Message WAS created and emitted
- Message WAS added to queue
- But NO subscribers to send it to
- New subscribers MIGHT get it later

---

## Environment Variables

Add to `.env.local`:

```env
# Enable/disable Prisma query logging (very verbose)
ENABLE_PRISMA_LOGS=false
```

To enable Prisma logs:
```env
ENABLE_PRISMA_LOGS=true
```

---

## Next Steps

Once you identify WHERE the subscribers disappear, we can:
1. Add more targeted logging
2. Identify if it's a timing issue
3. Fix the root cause
4. Ensure both messages arrive consistently

