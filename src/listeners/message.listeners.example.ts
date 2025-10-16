/**
 * Example Message Event Listeners
 *
 * This file demonstrates how to set up listeners for message events.
 * You can copy and modify these examples to create your own event handlers.
 */

import { messageEvents } from '@/events/message.events';
import type { MessageCreatedEvent, MessageUpdatedEvent, MessageDeletedEvent } from '@/events/message.events';

/**
 * Example: Listen for DM message created events
 * This fires whenever a new message is created in a direct message
 */
export function setupDMMessageCreatedListener() {
  const unsubscribe = messageEvents.onDMMessageCreated((event: MessageCreatedEvent) => {
    console.log('New DM message created!');
    console.log('Message:', event.message);
    console.log('Direct Message ID:', event.directMessageId);
    console.log('Sender:', event.message.userId ? 'User' : 'Persona');
    console.log('Content:', event.message.content);

    // NEW: Access full DM context with persona info!
    if (event.dm) {
      console.log('DM Persona:', event.dm.persona.username);
      console.log('Persona Image:', event.dm.persona.imageUrl);
      console.log('Persona Color:', event.dm.persona.headerColor);
    }

    // Example: Send notification with persona name
    // if (event.dm) {
    //   notificationService.send({
    //     title: `New message from ${event.dm.persona.username}`,
    //     body: event.message.content,
    //   });
    // }

    // Example: Trigger AI response
    // if (event.message.userId && event.dm) {
    //   aiService.generateResponse(event.message, event.dm.persona);
    // }
  });

  // Return unsubscribe function to stop listening
  return unsubscribe;
}

/**
 * Example: Listen for DM message updated events
 */
export function setupDMMessageUpdatedListener() {
  const unsubscribe = messageEvents.onDMMessageUpdated((event: MessageUpdatedEvent) => {
    console.log('DM message updated!');
    console.log('Message ID:', event.message.id);
    console.log('Previous content:', event.previousContent);
    console.log('New content:', event.message.content);

    // Example: Log message edit history
    // auditService.logMessageEdit({
    //   messageId: event.message.id,
    //   previousContent: event.previousContent,
    //   newContent: event.message.content,
    // });
  });

  return unsubscribe;
}

/**
 * Example: Listen for DM message deleted events
 */
export function setupDMMessageDeletedListener() {
  const unsubscribe = messageEvents.onDMMessageDeleted((event: MessageDeletedEvent) => {
    console.log('DM message deleted!');
    console.log('Message ID:', event.messageId);
    console.log('Direct Message ID:', event.directMessageId);

    // Example: Clean up related data
    // attachmentService.deleteMessageAttachments(event.messageId);
  });

  return unsubscribe;
}

/**
 * Example: Listen for ALL message events (DM + Group)
 */
export function setupAllMessageListeners() {
  const unsubscribe1 = messageEvents.onMessageCreated((event: MessageCreatedEvent) => {
    console.log('Message created (any type):', event.message.id);
  });

  const unsubscribe2 = messageEvents.onMessageUpdated((event: MessageUpdatedEvent) => {
    console.log('Message updated (any type):', event.message.id);
  });

  const unsubscribe3 = messageEvents.onMessageDeleted((event: MessageDeletedEvent) => {
    console.log('Message deleted (any type):', event.messageId);
  });

  // Return function that unsubscribes from all
  return () => {
    unsubscribe1();
    unsubscribe2();
    unsubscribe3();
  };
}

/**
 * Example: Listen for Group message events
 */
export function setupGroupMessageListeners() {
  const unsubscribe1 = messageEvents.onGroupMessageCreated((event: MessageCreatedEvent) => {
    console.log('New group message:', event.message.content);
    console.log('Group ID:', event.groupId);
  });

  const unsubscribe2 = messageEvents.onGroupMessageUpdated((event: MessageUpdatedEvent) => {
    console.log('Group message updated:', event.message.id);
  });

  const unsubscribe3 = messageEvents.onGroupMessageDeleted((event: MessageDeletedEvent) => {
    console.log('Group message deleted:', event.messageId);
  });

  return () => {
    unsubscribe1();
    unsubscribe2();
    unsubscribe3();
  };
}

/**
 * Example: Listen to a specific DM conversation (RECOMMENDED METHOD)
 */
export function setupDMSpecificListener(targetDirectMessageId: string) {
  // Use the built-in specific DM listener - much cleaner!
  const unsubscribe = messageEvents.onSpecificDMMessageCreated(
    targetDirectMessageId,
    (event: MessageCreatedEvent) => {
      console.log('Message in specific DM:', event.message.content);
    }
  );

  return unsubscribe;
}

/**
 * Example: Listen to ALL events in a specific DM (onCreate, onUpdate, onDelete)
 */
export function setupCompleteSpecificDMListener(targetDirectMessageId: string) {
  const unsubscribe = messageEvents.onSpecificDM(targetDirectMessageId, {
    onCreate: (event) => {
      console.log('Message created in specific DM:', event.message.content);
    },
    onUpdate: (event) => {
      console.log('Message updated in specific DM:', event.message.id);
    },
    onDelete: (event) => {
      console.log('Message deleted in specific DM:', event.messageId);
    },
  });

  // This single unsubscribe removes all three listeners
  return unsubscribe;
}

/**
 * Example: Initialize all listeners on app startup
 */
export function initializeMessageListeners() {
  console.log('Initializing message event listeners...');

  // Set up DM listeners
  const dmCreatedUnsub = setupDMMessageCreatedListener();
  const dmUpdatedUnsub = setupDMMessageUpdatedListener();
  const dmDeletedUnsub = setupDMMessageDeletedListener();

  // Set up Group listeners
  const groupUnsub = setupGroupMessageListeners();

  // Return cleanup function
  return () => {
    console.log('Cleaning up message event listeners...');
    dmCreatedUnsub();
    dmUpdatedUnsub();
    dmDeletedUnsub();
    groupUnsub();
  };
}

// Example usage in your application:
//
// In your app initialization (e.g., src/app/layout.tsx or a startup script):
// import { initializeMessageListeners } from '@/listeners/message.listeners.example';
//
// const cleanup = initializeMessageListeners();
//
// // When shutting down your app:
// cleanup();
