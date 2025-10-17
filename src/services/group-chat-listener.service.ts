import { messageEvents } from '@/events/message.events';
import { messageService } from '@/services/message.service';
import { contextConstructor } from '@/services/context-constructor';
import { promptConstructor } from '@/services/prompt-constructor';
import { aiUtils } from '@/lib/utils';
import { prisma } from '@/lib/database';

/**
 * Background service that listens to all group chat conversations
 * and auto-responds when users send messages
 */
class GroupChatListenerService {
  private listeners: Map<string, () => void> = new Map();
  private isRunning: boolean = false;

  /**
   * Start listening to a specific group conversation
   */
  private startListeningToGroup(groupId: string) {
    // Check if already listening
    if (this.listeners.has(groupId)) {
      console.log(`ℹ️ [GROUP] Already listening to group ${groupId}`);
      return;
    }

    console.log(`📍 [GROUP] Starting listener for group ${groupId}`);

    // Set up listener for this specific group
    const unsubscribe = messageEvents.onGroupMessageCreated(async (event) => {
      // Filter by group ID to ensure we only process messages for this specific group
      if (event.groupId !== groupId) {
        return;
      }

      console.log(`🔔 [GROUP] Listener triggered: "${event.message.content}"`);
      const sender = event.message.userId ? `User ${event.message.userId}` : `Persona ${event.message.personaId}`;
      console.log(`👤 [GROUP] From: ${sender}`);

      // Only respond to user messages (not persona messages)
      if (!event.message.userId) {
        console.log('⏭️ [GROUP] Skipping - message is from persona');
        return;
      }

      console.log('✅ [GROUP] Generating AI responses for all participants');

      try {
        // Fetch group details to get participant IDs
        const group = await prisma.group.findUnique({
          where: { id: groupId },
        });

        if (!group) {
          console.error(`❌ [GROUP] Group ${groupId} not found`);
          return;
        }

        // Have each persona respond in parallel
        const responsePromises = group.participantIds
          .filter(personaId => event.message.personaId !== personaId) // Skip the sender
          .map(async (personaId) => {
            console.log(`🤖 [GROUP] Generating AI response from persona: ${personaId}`);
            
            try {
              // Build conversation context
              const context = await contextConstructor.constructContext({
                personaId,
                conversationId: groupId,
                conversationType: 'group',
                messageLimit: 50,
              });

              // Construct prompt from context
              const { system, prompt } = promptConstructor.constructGroupChatPrompt(context);

              console.log(`📝 [GROUP] Prompt constructed for ${context.characterCard.name}`);

              // Generate AI response
              const response = await aiUtils.generateText({
                system,
                prompt,
                temperature: 0.7,
                prefill: 'thats based because',
              });

              console.log(`📤 [GROUP] Generated response from ${context.characterCard.name}: "${response.substring(0, 100)}..."`);
              
              // Create message with the response
              await messageService.createMessage({
                content: response,
                personaId: personaId,
                groupId: groupId,
              });
            } catch (personaError) {
              console.error(`❌ [GROUP] Failed to generate/send response for persona ${personaId}:`, personaError);
            }
          });

        // Wait for all personas to respond in parallel
        await Promise.all(responsePromises);
        
        console.log('✅ [GROUP] All AI responses generated and sent successfully');

      } catch (error) {
        console.error('❌ [GROUP] Failed to generate responses:', error);
      }
    });

    // Store the unsubscribe function
    this.listeners.set(groupId, unsubscribe);
  }

  /**
   * Stop listening to a specific group conversation
   */
  stopListeningToGroup(groupId: string) {
    const unsubscribe = this.listeners.get(groupId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(groupId);
      console.log(`✅ [GROUP] Stopped listening to group ${groupId}`);
    }
  }

  /**
   * Initialize the service by fetching all groups and setting up listeners
   */
  async initialize() {
    if (this.isRunning) {
      console.log('ℹ️ [GROUP] Service already running');
      return;
    }

    console.log('🚀 [GROUP] Initializing group chat listener service');

    try {
      // Import database directly (server-side)
      const { db } = await import('@/lib/database');

      // Fetch all existing groups from database
      const groups = await db.getAllGroups();
      console.log(`📊 [GROUP] Found ${groups.length} group conversations`);

      // Set up listener for each group
      for (const group of groups) {
        console.log(`✅ [GROUP] Setting up listener: ${group.name}`);
        this.startListeningToGroup(group.id);
      }

      this.isRunning = true;
      console.log(`✅ [GROUP] Service running - ${this.listeners.size} active listeners`);
    } catch (error) {
      console.error('❌ [GROUP] Failed to initialize service:', error);
      throw error;
    }
  }

  /**
   * Add a listener for a newly created group
   */
  async addGroupListener(groupId: string) {
    console.log(`ℹ️ [GROUP] Adding listener for new group ${groupId}`);
    
    try {
      const { db } = await import('@/lib/database');
      const group = await db.getGroupById(groupId);
      
      if (!group) {
        console.error(`❌ [GROUP] Group ${groupId} not found`);
        return;
      }

      this.startListeningToGroup(groupId);
    } catch (error) {
      console.error(`❌ [GROUP] Failed to add listener for group ${groupId}:`, error);
    }
  }

  /**
   * Stop all listeners and shut down the service
   */
  shutdown() {
    console.log('🛑 [GROUP] Shutting down service...');

    for (const [groupId, unsubscribe] of this.listeners.entries()) {
      unsubscribe();
      console.log(`✅ [GROUP] Stopped listener for group ${groupId}`);
    }

    this.listeners.clear();
    this.isRunning = false;
    console.log('✅ [GROUP] Service shut down');
  }

  /**
   * Get status of the service
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeListeners: this.listeners.size,
      groupIds: Array.from(this.listeners.keys()),
    };
  }

  /**
   * Check if service is running
   */
  isServiceRunning() {
    return this.isRunning;
  }
}

// Singleton instance
export const groupChatListenerService = new GroupChatListenerService();
