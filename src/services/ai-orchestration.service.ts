import { messageEvents } from '@/events/message.events';
import { messageService } from '@/services/message.service';
import { contextConstructor } from '@/services/context-constructor';
import { promptConstructor } from '@/services/prompt-constructor';
import { messageCleanser } from '@/services/message-cleanser.service';
import { aiUtils } from '@/lib/utils';
import { prisma } from '@/lib/database';


/**
 * Unified AI Orchestration Service that handles both DM and Group chat conversations
 * Provides centralized AI response generation and message handling
 */
class AIOrchestrationService {
  private dmListeners: Map<string, () => void> = new Map();
  private groupListeners: Map<string, () => void> = new Map();
  private isRunning: boolean = false;

  /**
   * Start listening to a specific DM conversation
   */
  private startListeningToDM(dmId: string, personaId: string, personaName: string) {
    // Check if already listening
    if (this.dmListeners.has(dmId)) {
      console.log(`ℹ️ [AI] Already listening to DM ${dmId}`);
      return;
    }

    console.log(`📍 [AI] Starting DM listener for ${dmId} (${personaName})`);

    // Set up listener for this specific DM
    const unsubscribe = messageEvents.onSpecificDMMessageCreated(dmId, async (event) => {
      console.log(`🔔 [AI] DM listener triggered - ${personaName}: "${event.message.content}"`);
      const sender = event.message.userId ? `User ${event.message.userId}` : `Persona ${event.message.personaId}`;
      console.log(`👤 [AI] From: ${sender}`);

      // Only respond to user messages (not persona messages)
      if (!event.message.userId) {
        console.log('⏭️ [AI] Skipping - message is from persona');
        return;
      }

      console.log('✅ [AI] Generating AI response for DM');

      try {
        await this.generateAIResponse({
          personaId,
          conversationId: dmId,
          conversationType: 'dm',
          personaName,
        });

        console.log('✅ [AI] DM AI response sent successfully');
      } catch (error) {
        console.error('❌ [AI] Failed to generate/send DM response:', error);
      }
    });

    // Store the unsubscribe function
    this.dmListeners.set(dmId, unsubscribe);
  }

  /**
   * Start listening to a specific group conversation
   */
  private startListeningToGroup(groupId: string) {
    // Check if already listening
    if (this.groupListeners.has(groupId)) {
      console.log(`ℹ️ [AI] Already listening to group ${groupId}`);
      return;
    }

    console.log(`📍 [AI] Starting group listener for ${groupId}`);

    // Set up listener for this specific group
    const unsubscribe = messageEvents.onGroupMessageCreated(async (event) => {
      // Filter by group ID to ensure we only process messages for this specific group
      if (event.groupId !== groupId) {
        return;
      }

      console.log(`🔔 [AI] Group listener triggered: "${event.message.content}"`);
      const sender = event.message.userId ? `User ${event.message.userId}` : `Persona ${event.message.personaId}`;
      console.log(`👤 [AI] From: ${sender}`);

      // Only respond to user messages (not persona messages)
      if (!event.message.userId) {
        console.log('⏭️ [AI] Skipping - message is from persona');
        return;
      }

      console.log('✅ [AI] Generating AI responses for all group participants');

      try {
        // Fetch group details to get participant IDs
        const group = await prisma.group.findUnique({
          where: { id: groupId },
        });

        if (!group) {
          console.error(`❌ [AI] Group ${groupId} not found`);
          return;
        }

        // Have each persona respond in parallel
        const responsePromises = group.participantIds
          .filter(personaId => event.message.personaId !== personaId) // Skip the sender
          .map(async (personaId) => {
            console.log(`🤖 [AI] Generating AI response from persona: ${personaId}`);
            
            try {
              await this.generateAIResponse({
                personaId,
                conversationId: groupId,
                conversationType: 'group',
              });
            } catch (personaError) {
              console.error(`❌ [AI] Failed to generate/send response for persona ${personaId}:`, personaError);
            }
          });

        // Wait for all personas to respond in parallel
        await Promise.all(responsePromises);
        
        console.log('✅ [AI] All group AI responses generated and sent successfully');
      } catch (error) {
        console.error('❌ [AI] Failed to generate group responses:', error);
      }
    });

    // Store the unsubscribe function
    this.groupListeners.set(groupId, unsubscribe);
  }

  /**
   * Generate AI response for a specific persona and conversation
   */
  private async generateAIResponse({
    personaId,
    conversationId,
    conversationType,
    personaName,
  }: {
    personaId: string;
    conversationId: string;
    conversationType: 'dm' | 'group';
    personaName?: string;
  }) {
    // Build conversation context
    const context = await contextConstructor.constructContext({
      personaId,
      conversationId,
      conversationType,
      messageLimit: 50,
    });

    // Construct prompt from context
    const messages = conversationType === 'dm' 
      ? promptConstructor.constructDMPrompt(context)
      : promptConstructor.constructGroupChatPrompt(context);

    const displayName = personaName || context.characterCard.name;
    console.log(`📝 [AI] Prompt constructed for ${displayName}`);

    // Generate AI response
    const response = await aiUtils.generateText({
      messages,
      temperature: 0.7,
    });

    console.log(`📤 [AI] Generated response from ${displayName}: "${response.substring(0, 100)}..."`);

    // Clean the response to remove XML tags before sending
    const cleanedResponse = messageCleanser.cleanMessageWithOptions(response, {
      tagsToHideContent: ['initial_understanding', 'thinking', 'post_response'],
    });

    // Create message with the cleaned response
    const messageData: {
      content: string;
      personaId: string;
      directMessageId?: string;
      groupId?: string;
    } = {
      content: cleanedResponse,
      personaId: personaId,
    };

    if (conversationType === 'dm') {
      messageData.directMessageId = conversationId;
    } else {
      messageData.groupId = conversationId;
    }

    await messageService.createMessage(messageData);
  }

  /**
   * Stop listening to a specific conversation
   */
  private stopListening(conversationId: string, type: 'dm' | 'group') {
    const listeners = type === 'dm' ? this.dmListeners : this.groupListeners;
    const unsubscribe = listeners.get(conversationId);
    
    if (unsubscribe) {
      unsubscribe();
      listeners.delete(conversationId);
      console.log(`✅ [AI] Stopped listening to ${type.toUpperCase()} ${conversationId}`);
    }
  }

  /**
   * Stop listening to a specific DM conversation
   */
  stopListeningToDM(dmId: string) {
    this.stopListening(dmId, 'dm');
  }

  /**
   * Stop listening to a specific group conversation
   */
  stopListeningToGroup(groupId: string) {
    this.stopListening(groupId, 'group');
  }

  /**
   * Initialize the service by fetching all conversations and setting up listeners
   */
  async initialize() {
    if (this.isRunning) {
      console.log('ℹ️ [AI] Service already running');
      return;
    }

    console.log('🚀 [AI] Initializing AI Orchestration Service');

    try {
      // Import database directly (server-side)
      const { db } = await import('@/lib/database');

      // Fetch all existing DMs from database
      const dms = await db.getAllDirectMessages();
      console.log(`📊 [AI] Found ${dms.length} DM conversations`);

      // Set up listener for each DM
      for (const dm of dms) {
        console.log(`✅ [AI] Setting up DM listener: ${dm.persona.username}`);
        this.startListeningToDM(dm.id, dm.persona.id, dm.persona.username);
      }

      // Fetch all existing groups from database
      const groups = await db.getAllGroups();
      console.log(`📊 [AI] Found ${groups.length} group conversations`);

      // Set up listener for each group
      for (const group of groups) {
        console.log(`✅ [AI] Setting up group listener: ${group.name}`);
        this.startListeningToGroup(group.id);
      }

      this.isRunning = true;
      const totalListeners = this.dmListeners.size + this.groupListeners.size;
      console.log(`✅ [AI] Service running - ${totalListeners} active listeners (${this.dmListeners.size} DMs, ${this.groupListeners.size} groups)`);
    } catch (error) {
      console.error('❌ [AI] Failed to initialize service:', error);
      throw error;
    }
  }

  /**
   * Add a listener for a newly created DM
   */
  addDMListener(dmId: string, personaId: string, personaName: string) {
    console.log(`ℹ️ [AI] Adding listener for new DM ${dmId}`);
    this.startListeningToDM(dmId, personaId, personaName);
  }

  /**
   * Add a listener for a newly created group
   */
  async addGroupListener(groupId: string) {
    console.log(`ℹ️ [AI] Adding listener for new group ${groupId}`);
    
    try {
      const { db } = await import('@/lib/database');
      const group = await db.getGroupById(groupId);
      
      if (!group) {
        console.error(`❌ [AI] Group ${groupId} not found`);
        return;
      }

      this.startListeningToGroup(groupId);
    } catch (error) {
      console.error(`❌ [AI] Failed to add listener for group ${groupId}:`, error);
    }
  }

  /**
   * Stop all listeners and shut down the service
   */
  shutdown() {
    console.log('🛑 [AI] Shutting down service...');

    // Stop all DM listeners
    for (const dmId of this.dmListeners.keys()) {
      this.stopListening(dmId, 'dm');
    }

    // Stop all group listeners
    for (const groupId of this.groupListeners.keys()) {
      this.stopListening(groupId, 'group');
    }

    this.isRunning = false;
    console.log('✅ [AI] Service shut down');
  }

  /**
   * Get status of the service
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeDMListeners: this.dmListeners.size,
      activeGroupListeners: this.groupListeners.size,
      totalListeners: this.dmListeners.size + this.groupListeners.size,
      dmIds: Array.from(this.dmListeners.keys()),
      groupIds: Array.from(this.groupListeners.keys()),
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
export const aiOrchestrationService = new AIOrchestrationService();
