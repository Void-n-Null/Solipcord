# Message API Documentation

This document describes the Message CRUD API with service, repository layers, and event system.

## Architecture Overview

The message system follows a layered architecture:

```
API Routes (route.ts)
    ↓
Service Layer (message.service.ts)
    ↓
Repository Layer (message.repository.ts)
    ↓
Database (Prisma)
```

Additionally, the service layer emits events that can be listened to throughout the application.

## Layers

### 1. Repository Layer (`src/repositories/message.repository.ts`)

Pure data access layer. Handles all direct database operations.

**Key Methods:**
- `create(data)` - Create a new message
- `findById(id)` - Find message by ID
- `findAll(options)` - Find all messages with pagination
- `findByGroupId(groupId, options)` - Find messages in a group
- `findByDirectMessageId(dmId, options)` - Find messages in a DM
- `update(id, data)` - Update message content
- `delete(id)` - Delete a message
- `count(filters)` - Count messages

### 2. Service Layer (`src/services/message.service.ts`)

Business logic layer. Handles validation, orchestration, and event emission.

**Key Methods:**
- `createMessage(data)` - Create message with validation + emit event
- `getMessageById(id)` - Get single message
- `getAllMessages(options)` - Get all messages
- `getMessagesByGroupId(groupId, options)` - Get group messages
- `getMessagesByDirectMessageId(dmId, options)` - Get DM messages
- `updateMessage(id, data)` - Update message + emit event
- `deleteMessage(id)` - Delete message + emit event

**Business Rules:**
- Content cannot be empty
- Message must belong to either a DM or a Group (not both)
- Message must have a sender (userId or personaId)

### 3. Event System (`src/events/message.events.ts`)

Event emitter for listening to message lifecycle events.

## API Endpoints

### Create Message

**POST** `/api/messages`

Creates a new message and emits a `message:created` event.

**Request Body:**
```json
{
  "content": "Hello world!",
  "userId": "user_123",           // Optional (either userId or personaId required)
  "personaId": "persona_456",     // Optional (either userId or personaId required)
  "directMessageId": "dm_789",    // Optional (either directMessageId or groupId required)
  "groupId": "group_101"          // Optional (either directMessageId or groupId required)
}
```

**Response:** `201 Created`
```json
{
  "id": "msg_abc123",
  "content": "Hello world!",
  "userId": "user_123",
  "personaId": null,
  "directMessageId": "dm_789",
  "groupId": null,
  "createdAt": "2025-10-16T10:30:00Z",
  "updatedAt": "2025-10-16T10:30:00Z",
  "user": {
    "id": "user_123",
    "username": "john_doe",
    "email": "john@example.com",
    "avatar": "https://..."
  },
  "persona": null,
  "directMessage": {
    "id": "dm_789",
    "personaId": "persona_456",
    "persona": { ... }
  }
}
```

### Get Messages

**GET** `/api/messages?directMessageId={dmId}&limit={limit}&offset={offset}`

**GET** `/api/messages?groupId={groupId}&limit={limit}&offset={offset}`

Fetches messages from a DM or Group.

**Query Parameters:**
- `directMessageId` - Filter by DM (required if no groupId)
- `groupId` - Filter by group (required if no directMessageId)
- `limit` - Number of messages to return (default: 50)
- `offset` - Pagination offset (default: 0)

**Response:** `200 OK`
```json
[
  {
    "id": "msg_abc123",
    "content": "Hello!",
    "userId": "user_123",
    "createdAt": "2025-10-16T10:30:00Z",
    "user": { ... },
    "persona": null
  },
  ...
]
```

### Get Single Message

**GET** `/api/messages/{messageId}`

Fetches a single message by ID.

**Response:** `200 OK`
```json
{
  "id": "msg_abc123",
  "content": "Hello world!",
  "userId": "user_123",
  "createdAt": "2025-10-16T10:30:00Z",
  "user": { ... }
}
```

**Error:** `404 Not Found`
```json
{
  "error": "Message with ID msg_abc123 not found"
}
```

### Update Message

**PATCH** `/api/messages/{messageId}`

Updates a message's content and emits a `message:updated` event.

**Request Body:**
```json
{
  "content": "Updated message content"
}
```

**Response:** `200 OK`
```json
{
  "id": "msg_abc123",
  "content": "Updated message content",
  "updatedAt": "2025-10-16T10:35:00Z",
  ...
}
```

### Delete Message

**DELETE** `/api/messages/{messageId}`

Deletes a message and emits a `message:deleted` event.

**Response:** `200 OK`
```json
{
  "id": "msg_abc123",
  "content": "Hello world!",
  ...
}
```

## Event System

### Available Events

#### Generic Events (fired for all messages)
- `message:created` - Any message created
- `message:updated` - Any message updated
- `message:deleted` - Any message deleted

#### DM-Specific Events
- `dm:message:created` - DM message created
- `dm:message:updated` - DM message updated
- `dm:message:deleted` - DM message deleted

#### Group-Specific Events
- `group:message:created` - Group message created
- `group:message:updated` - Group message updated
- `group:message:deleted` - Group message deleted

### Listening to Events

#### Listen to ALL DM messages (anywhere)

```typescript
import { messageEvents } from '@/events/message.events';

// Listen for ANY DM message created (all conversations)
const unsubscribe = messageEvents.onDMMessageCreated((event) => {
  console.log('New DM message:', event.message);
  console.log('Direct Message ID:', event.directMessageId);
  console.log('Content:', event.message.content);
});

// Stop listening
unsubscribe();
```

#### Listen to a SPECIFIC DM conversation (RECOMMENDED)

```typescript
import { messageEvents } from '@/events/message.events';

const myDMId = 'dm_123';

// Listen only to messages in this specific DM
const unsubscribe = messageEvents.onSpecificDMMessageCreated(
  myDMId,
  (event) => {
    console.log('Message in MY DM:', event.message.content);
    // This only fires for messages in dm_123
  }
);

// Stop listening
unsubscribe();
```

#### Listen to ALL events in a specific DM

```typescript
import { messageEvents } from '@/events/message.events';

const myDMId = 'dm_123';

// Listen to create, update, and delete in one call
const unsubscribe = messageEvents.onSpecificDM(myDMId, {
  onCreate: (event) => console.log('Message created:', event.message.content),
  onUpdate: (event) => console.log('Message updated:', event.message.id),
  onDelete: (event) => console.log('Message deleted:', event.messageId),
});

// One unsubscribe for all three listeners
unsubscribe();
```

### Event Payloads

#### MessageCreatedEvent
```typescript
{
  message: MessageWithRelations;    // Full message object with relations
  directMessageId?: string;         // Present if DM message
  groupId?: string;                 // Present if group message
  dm?: DirectMessageWithPersona;    // Full DM object with persona (NEW!)
  group?: any;                      // Full Group object
}
```

The `dm` object includes:
```typescript
{
  id: string;
  personaId: string;
  createdAt: Date;
  updatedAt: Date;
  persona: {
    id: string;
    username: string;
    imageUrl: string;
    headerColor: string;
    // ... all persona fields
  }
}
```

#### MessageUpdatedEvent
```typescript
{
  message: MessageWithRelations;    // Updated message
  previousContent: string;          // Content before update
  directMessageId?: string;
  groupId?: string;
  dm?: DirectMessageWithPersona;    // Full DM object with persona (NEW!)
  group?: any;                      // Full Group object
}
```

#### MessageDeletedEvent
```typescript
{
  messageId: string;               // ID of deleted message
  directMessageId?: string;
  groupId?: string;
  dm?: DirectMessageWithPersona;   // Full DM object with persona (NEW!)
  group?: any;                     // Full Group object
}
```

## Usage Examples

### Example 1: Creating a DM Message

```typescript
import { messageService } from '@/services/message.service';

const message = await messageService.createMessage({
  content: 'Hello from the user!',
  userId: 'user_123',
  directMessageId: 'dm_789',
});
```

### Example 2: Listening for DM Messages

```typescript
import { messageEvents } from '@/events/message.events';

// Set up listener
messageEvents.onDMMessageCreated((event) => {
  console.log('New message in DM:', event.directMessageId);

  // If user sent a message, trigger AI response
  if (event.message.userId) {
    // Trigger your AI persona to respond
    aiService.generateResponse(event.message);
  }
});
```

### Example 3: Listen to Specific DM (NEW - RECOMMENDED)

```typescript
const targetDmId = 'dm_789';

// No need to manually filter - use the specific listener!
messageEvents.onSpecificDMMessageCreated(targetDmId, (event) => {
  console.log('Message in our DM:', event.message.content);
  // This ONLY fires for messages in dm_789
});
```

### Example 4: Complete CRUD Operations

```typescript
import { messageService } from '@/services/message.service';

// Create
const newMessage = await messageService.createMessage({
  content: 'Test message',
  userId: 'user_123',
  directMessageId: 'dm_789',
});

// Read
const message = await messageService.getMessageById(newMessage.id);

// Update
const updated = await messageService.updateMessage(newMessage.id, {
  content: 'Updated content',
});

// Delete
await messageService.deleteMessage(newMessage.id);
```

### Example 5: Pagination

```typescript
// Get first 20 messages
const page1 = await messageService.getMessagesByDirectMessageId('dm_789', {
  limit: 20,
  offset: 0,
});

// Get next 20 messages
const page2 = await messageService.getMessagesByDirectMessageId('dm_789', {
  limit: 20,
  offset: 20,
});
```

## Setup Event Listeners

See `src/listeners/message.listeners.example.ts` for complete examples.

To initialize listeners in your app:

```typescript
// In your app initialization (e.g., layout.tsx or startup script)
import { initializeMessageListeners } from '@/listeners/message.listeners.example';

const cleanup = initializeMessageListeners();

// When shutting down
cleanup();
```

## Error Handling

The service layer throws descriptive errors that are caught by the API routes:

- Empty content → `400 Bad Request: "Message content cannot be empty"`
- No DM/Group → `400 Bad Request: "Message must belong to either a DirectMessage or a Group"`
- No sender → `400 Bad Request: "Message must have a sender"`
- Not found → `404 Not Found: "Message with ID xxx not found"`

All errors are returned as JSON:
```json
{
  "error": "Error message here"
}
```

## Testing

Example test using the API:

```typescript
// Test creating a message
const response = await fetch('/api/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'Test message',
    userId: 'user_123',
    directMessageId: 'dm_789',
  }),
});

const message = await response.json();
console.log('Created message:', message);

// Test event listener
const unsubscribe = messageEvents.onDMMessageCreated((event) => {
  console.log('Event received:', event.message.content);
});
```
