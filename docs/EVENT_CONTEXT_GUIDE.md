# DM Event Context Guide

## Overview

When listening to DM message events, you now get **full context** about the DirectMessage and Persona, not just the message ID.

## What's Available

Every DM message event now includes a `dm` object with:

```typescript
event.dm = {
  id: string;              // DM ID
  personaId: string;       // Persona ID
  createdAt: Date;         // When DM was created
  updatedAt: Date;         // Last update time
  persona: {               // Full persona details!
    id: string;
    username: string;
    imageUrl: string;
    headerColor: string;
    friendsIds: string[];
    isFriendOfUser: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
}
```

## Quick Example

```typescript
import { messageEvents } from '@/events/message.events';

// Listen to a specific DM
messageEvents.onSpecificDMMessageCreated('dm_123', (event) => {
  console.log('Message:', event.message.content);

  // Access full DM context!
  if (event.dm) {
    console.log('From:', event.dm.persona.username);
    console.log('Avatar:', event.dm.persona.imageUrl);
    console.log('Color:', event.dm.persona.headerColor);
    console.log('Is Friend:', event.dm.persona.isFriendOfUser);
  }
});
```

## Use Cases

### 1. Send Notifications with Persona Info

```typescript
messageEvents.onSpecificDMMessageCreated(dmId, (event) => {
  if (event.message.userId && event.dm) {
    notificationService.send({
      title: `Message from ${event.dm.persona.username}`,
      body: event.message.content,
      icon: event.dm.persona.imageUrl,
      color: event.dm.persona.headerColor,
    });
  }
});
```

### 2. Auto-respond with Persona Identity

```typescript
messageEvents.onSpecificDMMessageCreated(dmId, async (event) => {
  if (event.message.userId && event.dm) {
    await messageService.createMessage({
      content: `Hi! I'm ${event.dm.persona.username}. Thanks for the message!`,
      personaId: event.dm.persona.id,
      directMessageId: dmId,
    });
  }
});
```

### 3. Filter by Persona Status

```typescript
messageEvents.onSpecificDMMessageCreated(dmId, (event) => {
  if (event.dm && event.dm.persona.isFriendOfUser) {
    // Only process messages from friends
    processMessage(event.message);
  }
});
```

### 4. Analytics with Full Context

```typescript
messageEvents.onSpecificDMMessageCreated(dmId, (event) => {
  if (event.dm) {
    analytics.track('dm_message_received', {
      dmId: event.dm.id,
      personaId: event.dm.persona.id,
      personaName: event.dm.persona.username,
      isFriend: event.dm.persona.isFriendOfUser,
      messageLength: event.message.content.length,
    });
  }
});
```

## Event Types with Context

All three event types include the `dm` object:

- **`onDMMessageCreated`** / **`onSpecificDMMessageCreated`** - Includes `event.dm`
- **`onDMMessageUpdated`** / **`onSpecificDMMessageUpdated`** - Includes `event.dm`
- **`onDMMessageDeleted`** / **`onSpecificDMMessageDeleted`** - Includes `event.dm`

## Example Files

Check these files for complete examples:

- `src/listeners/message.listeners.example.ts` - Basic event listener examples
- `src/listeners/dm-auto-responder.example.ts` - Auto-responder with context
- `src/listeners/dm-context-example.ts` - Advanced context usage examples

## Why This Is Useful

Before: You only got `directMessageId` and had to manually fetch the DM/Persona data:

```typescript
// OLD WAY ❌
messageEvents.onDMMessageCreated(async (event) => {
  const dm = await fetch(`/api/direct-messages/${event.directMessageId}`);
  const data = await dm.json();
  console.log(data.persona.username); // Extra network call!
});
```

Now: You get everything in the event:

```typescript
// NEW WAY ✅
messageEvents.onDMMessageCreated((event) => {
  console.log(event.dm?.persona.username); // No extra calls!
});
```

## Performance Note

The DM/Persona data is fetched once when the message is created/updated/deleted, so all listeners receive the same cached data. This is more efficient than each listener fetching it separately.
