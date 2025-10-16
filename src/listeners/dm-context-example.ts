/**
 * Example: Using full DM context from events
 *
 * This shows how to access the complete DirectMessage object
 * with persona information from message events.
 */

import { messageEvents } from '@/events/message.events';
import { messageService } from '@/services/message.service';

/**
 * Example 1: Access persona details when a message is created
 */
export function exampleAccessPersonaDetails(dmId: string) {
  const unsubscribe = messageEvents.onSpecificDMMessageCreated(dmId, (event) => {
    console.log('=== New Message Event ===');
    console.log('Message content:', event.message.content);

    // Access full DM context
    if (event.dm) {
      console.log('DM ID:', event.dm.id);
      console.log('DM created at:', event.dm.createdAt);

      // Access persona details
      console.log('Persona ID:', event.dm.persona.id);
      console.log('Persona username:', event.dm.persona.username);
      console.log('Persona image:', event.dm.persona.imageUrl);
      console.log('Persona color:', event.dm.persona.headerColor);
      console.log('Is friend:', event.dm.persona.isFriendOfUser);
    }
  });

  return unsubscribe;
}

/**
 * Example 2: Send notification with persona context
 */
export function exampleSendNotificationWithContext(dmId: string) {
  const unsubscribe = messageEvents.onSpecificDMMessageCreated(dmId, (event) => {
    // Only notify for user messages (not persona messages)
    if (event.message.userId && event.dm) {
      const notification = {
        title: `New message from ${event.dm.persona.username}`,
        body: event.message.content,
        icon: event.dm.persona.imageUrl,
        color: event.dm.persona.headerColor,
      };

      console.log('Would send notification:', notification);
      // notificationService.send(notification);
    }
  });

  return unsubscribe;
}

/**
 * Example 3: Auto-respond with persona-aware message
 */
export function exampleAutoRespondWithPersonaContext(dmId: string) {
  const unsubscribe = messageEvents.onSpecificDMMessageCreated(dmId, async (event) => {
    // Only respond to user messages
    if (event.message.userId && event.dm) {
      const personaName = event.dm.persona.username;
      const personaId = event.dm.persona.id;

      await messageService.createMessage({
        content: `Hi! I'm ${personaName}. I saw you said: "${event.message.content}"`,
        personaId: personaId,
        directMessageId: dmId,
      });
    }
  });

  return unsubscribe;
}

/**
 * Example 4: Log analytics with full context
 */
export function exampleLogAnalytics(dmId: string) {
  const unsubscribe = messageEvents.onSpecificDM(dmId, {
    onCreate: (event) => {
      if (event.dm) {
        console.log('Analytics: Message created', {
          messageId: event.message.id,
          dmId: event.dm.id,
          personaId: event.dm.persona.id,
          personaName: event.dm.persona.username,
          isUserMessage: !!event.message.userId,
          contentLength: event.message.content.length,
          timestamp: event.message.createdAt,
        });
      }
    },
    onUpdate: (event) => {
      if (event.dm) {
        console.log('Analytics: Message updated', {
          messageId: event.message.id,
          dmId: event.dm.id,
          personaName: event.dm.persona.username,
          previousLength: event.previousContent.length,
          newLength: event.message.content.length,
        });
      }
    },
    onDelete: (event) => {
      if (event.dm) {
        console.log('Analytics: Message deleted', {
          messageId: event.messageId,
          dmId: event.dm.id,
          personaName: event.dm.persona.username,
        });
      }
    },
  });

  return unsubscribe;
}

/**
 * Example 5: Filter by persona attributes
 */
export function exampleFilterByPersonaFriend(dmId: string) {
  const unsubscribe = messageEvents.onSpecificDMMessageCreated(dmId, (event) => {
    if (event.dm) {
      // Only process messages if persona is a friend
      if (event.dm.persona.isFriendOfUser) {
        console.log(`Message from friend ${event.dm.persona.username}:`, event.message.content);
      } else {
        console.log(`Message from non-friend ${event.dm.persona.username} - ignoring`);
      }
    }
  });

  return unsubscribe;
}

/**
 * Example 6: Multiple DMs with different handlers
 */
export function exampleMultipleDMHandlers() {
  const cleanupFunctions: Array<() => void> = [];

  // Fetch all DMs and set up handlers
  fetch('/api/direct-messages')
    .then(res => res.json())
    .then((dms: any[]) => {
      dms.forEach(dm => {
        const unsubscribe = messageEvents.onSpecificDMMessageCreated(dm.id, (event) => {
          if (event.dm) {
            console.log(`Message in DM with ${event.dm.persona.username}:`, event.message.content);
          }
        });
        cleanupFunctions.push(unsubscribe);
      });
    });

  // Return cleanup for all handlers
  return () => {
    cleanupFunctions.forEach(cleanup => cleanup());
  };
}

// Usage example:
//
// import { exampleAccessPersonaDetails } from '@/listeners/dm-context-example';
//
// // When opening a DM:
// const cleanup = exampleAccessPersonaDetails('dm_123');
//
// // When closing the DM:
// cleanup();
