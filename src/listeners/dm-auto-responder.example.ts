/**
 * Example: Auto-responder for a specific DM conversation
 *
 * This shows how to listen to messages in a specific DM and automatically
 * respond when the user sends a message.
 */

import { messageEvents } from '@/events/message.events';
import { messageService } from '@/services/message.service';

/**
 * Sets up an auto-responder for a specific DM conversation
 *
 * @param directMessageId - The ID of the DM conversation to listen to
 * @param personaId - The ID of the persona that will respond
 * @param responseGenerator - Function to generate response based on user's message
 * @returns Cleanup function to stop listening
 */
export function setupDMAutoResponder(
  directMessageId: string,
  personaId: string,
  responseGenerator: (userMessage: string, dmContext: any) => Promise<string> | string
) {
  console.log(`Setting up auto-responder for DM ${directMessageId}`);

  // Listen only to messages created in this specific DM
  const unsubscribe = messageEvents.onSpecificDMMessageCreated(
    directMessageId,
    async (event) => {
      // Only respond to user messages (not persona messages)
      if (!event.message.userId) {
        console.log('Message is from persona, ignoring...');
        return;
      }

      console.log('User sent message:', event.message.content);

      // NEW: Access full DM context!
      if (event.dm) {
        console.log('Responding as:', event.dm.persona.username);
      }

      try {
        // Generate response with DM context
        const responseContent = await responseGenerator(event.message.content, event.dm);

        console.log('Sending response:', responseContent);

        // Send persona's response
        await messageService.createMessage({
          content: responseContent,
          personaId: personaId,
          directMessageId: directMessageId,
        });

        console.log('Response sent successfully');
      } catch (error) {
        console.error('Failed to send auto-response:', error);
      }
    }
  );

  return unsubscribe;
}

/**
 * Example usage:
 */

// Simple echo bot with persona name
export function setupEchoBot(directMessageId: string, personaId: string) {
  return setupDMAutoResponder(
    directMessageId,
    personaId,
    (userMessage, dm) => {
      const personaName = dm?.persona?.username || 'Bot';
      return `${personaName}: You said "${userMessage}"`;
    }
  );
}

// Friendly bot with context awareness
export function setupFriendlyBot(directMessageId: string, personaId: string) {
  return setupDMAutoResponder(
    directMessageId,
    personaId,
    async (userMessage, dm) => {
      // Simulate thinking time
      await new Promise(resolve => setTimeout(resolve, 500));

      const personaName = dm?.persona?.username || 'I';

      const responses = [
        `That's interesting! Tell me more about "${userMessage}"`,
        `${personaName} hears you! "${userMessage}" is definitely worth discussing.`,
        `Thanks for sharing that. What made you think about "${userMessage}"?`,
      ];

      return responses[Math.floor(Math.random() * responses.length)];
    }
  );
}

// AI integration bot (example structure)
export function setupAIBot(directMessageId: string, personaId: string) {
  return setupDMAutoResponder(
    directMessageId,
    personaId,
    async (userMessage) => {
      // Here you would integrate with your AI service
      // const response = await aiService.generateResponse(userMessage);
      // return response;

      // Placeholder response
      return `I understand you said: "${userMessage}". [AI response would go here]`;
    }
  );
}

/**
 * Initialize bots for all DMs
 */
export async function initializeAllDMBots() {
  // Example: Fetch all DMs and set up auto-responders
  /*
  const response = await fetch('/api/direct-messages');
  const dms = await response.json();

  const cleanupFunctions = dms.map((dm: any) => {
    return setupFriendlyBot(dm.id, dm.persona.id);
  });

  // Return cleanup function
  return () => {
    cleanupFunctions.forEach(cleanup => cleanup());
  };
  */
}

// Usage in your app:
//
// import { setupFriendlyBot } from '@/listeners/dm-auto-responder.example';
//
// // When a DM is opened:
// const cleanup = setupFriendlyBot(directMessageId, personaId);
//
// // When the DM is closed or you want to stop listening:
// cleanup();
