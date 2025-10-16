import { messageEvents } from '@/events/message.events';
import { messageService } from '@/services/message.service';

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
  private startListeningToGroup(groupId: string, participantIds: string[], participantNames: Map<string, string>) {
    // Check if already listening
    if (this.listeners.has(groupId)) {
      console.log(`Already listening to group ${groupId}`);
      return;
    }

    console.log(`[GroupListener] Starting listener for group ${groupId}`);
    console.log(`[GroupListener] Participants: ${Array.from(participantNames.values()).join(', ')}`);

    // Set up listener for this specific group
    const unsubscribe = messageEvents.onGroupMessageCreated(async (event) => {
      // Filter by group ID to ensure we only process messages for this specific group
      if (event.groupId !== groupId) {
        return;
      }

      console.log('\n' + '='.repeat(80));
      console.log('🔔 GROUP LISTENER EVENT TRIGGERED');
      console.log('='.repeat(80));
      console.log(`📍 Group ID: ${groupId}`);
      console.log(`📝 Message ID: ${event.message.id}`);
      console.log(`💬 Content: "${event.message.content}"`);
      console.log(`👥 From User ID: ${event.message.userId || 'NONE'}`);
      console.log(`🤖 From Persona ID: ${event.message.personaId || 'NONE'}`);

      // Only respond to user messages (not persona messages)
      if (!event.message.userId) {
        console.log('⏭️  SKIPPING: Message is from persona, not user');
        console.log('='.repeat(80) + '\n');
        return;
      }

      console.log('✅ MESSAGE IS FROM USER - WILL RESPOND WITH ALL PARTICIPANTS');

      try {
        // Have each persona respond
        for (const personaId of participantIds) {
          const personaName = participantNames.get(personaId) || 'Unknown';
          
          // Skip if this persona was the one who sent the message (shouldn't happen, but safety check)
          if (event.message.personaId === personaId) {
            continue;
          }

          const response = `oh wow, nice group, im ${personaName}`;

          console.log(`\n🤖 Preparing response from: ${personaName}`);
          console.log(`📤 Persona ID: ${personaId}`);
          console.log(`💬 Response: "${response}"`);
          console.log(`📬 To Group: ${groupId}`);
          
          try {
            // Verify parameters before calling service
            console.log(`\n📋 Validating parameters:`);
            console.log(`  - content: "${response}" (type: ${typeof response})`);
            console.log(`  - personaId: "${personaId}" (type: ${typeof personaId})`);
            console.log(`  - groupId: "${groupId}" (type: ${typeof groupId})`);

            const createParams = {
              content: response,
              personaId: personaId,
              groupId: groupId,
            };
            
            console.log(`\n🔧 Final params object:`, JSON.stringify(createParams, null, 2));

            const createdMessage = await messageService.createMessage(createParams);
            
            console.log('✅ Message created with ID:', createdMessage.id);
            console.log('📊 Created message object:', {
              id: createdMessage.id,
              content: createdMessage.content,
              personaId: createdMessage.personaId,
              userId: createdMessage.userId,
              groupId: createdMessage.groupId,
              createdAt: createdMessage.createdAt,
            });
          } catch (personaError) {
            console.log(`❌ FAILED TO SEND RESPONSE FROM ${personaName}`);
            console.error(`Error type:`, personaError instanceof Error ? personaError.constructor.name : typeof personaError);
            console.error(`Error message:`, personaError instanceof Error ? personaError.message : String(personaError));
          }
        }
        
        console.log('\n✅ ✅ ✅ ALL RESPONSES SENT SUCCESSFULLY ✅ ✅ ✅');
        console.log('='.repeat(80) + '\n');

      } catch (error) {
        console.log('❌ ❌ ❌ FAILED TO SEND RESPONSES ❌ ❌ ❌');
        console.error(`Error type:`, error instanceof Error ? error.constructor.name : typeof error);
        console.error(`Error message:`, error instanceof Error ? error.message : String(error));
        console.error(`Full error:`, error);
        if (error instanceof Error && error.stack) {
          console.error(`Stack trace:\n`, error.stack);
        }
        console.log('='.repeat(80) + '\n');
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
      console.log(`[GroupListener] Stopped listening to group ${groupId}`);
    }
  }

  /**
   * Initialize the service by fetching all groups and setting up listeners
   */
  async initialize() {
    if (this.isRunning) {
      console.log('[GroupListener] Service already running');
      return;
    }

    console.log('\n' + '█'.repeat(80));
    console.log('🚀 INITIALIZING GROUP CHAT LISTENER SERVICE');
    console.log('█'.repeat(80));

    try {
      // Import database directly (server-side)
      const { db } = await import('@/lib/database');

      // Fetch all existing groups from database
      const groups = await db.getAllGroups();
      console.log(`📊 Found ${groups.length} group conversations`);
      console.log('─'.repeat(80));

      // Set up listener for each group
      for (const group of groups) {
        // Fetch persona details for mapping IDs to names
        const personas = await db.client.persona.findMany({
          where: { id: { in: group.participantIds } },
        });

        const participantNames = new Map(
          personas.map(p => [p.id, p.username])
        );

        console.log(`  ✓ Setting up listener: ${group.name} (${group.id})`);
        this.startListeningToGroup(group.id, group.participantIds, participantNames);
      }

      this.isRunning = true;
      console.log('─'.repeat(80));
      console.log(`✅ SERVICE RUNNING - ${this.listeners.size} ACTIVE LISTENERS`);
      console.log('█'.repeat(80) + '\n');
    } catch (error) {
      console.log('❌'.repeat(40));
      console.error('FAILED TO INITIALIZE SERVICE:', error);
      console.log('❌'.repeat(40) + '\n');
      throw error;
    }
  }

  /**
   * Add a listener for a newly created group
   */
  async addGroupListener(groupId: string) {
    console.log(`[GroupListener] Adding listener for new group ${groupId}`);
    
    try {
      const { db } = await import('@/lib/database');
      const group = await db.getGroupById(groupId);
      
      if (!group) {
        console.error(`[GroupListener] Group ${groupId} not found`);
        return;
      }

      // Fetch persona details for mapping IDs to names
      const personas = await db.client.persona.findMany({
        where: { id: { in: group.participantIds } },
      });

      const participantNames = new Map(
        personas.map(p => [p.id, p.username])
      );

      this.startListeningToGroup(group.id, group.participantIds, participantNames);
    } catch (error) {
      console.error(`[GroupListener] Failed to add listener for group ${groupId}:`, error);
    }
  }

  /**
   * Stop all listeners and shut down the service
   */
  shutdown() {
    console.log('[GroupListener] Shutting down service...');

    for (const [groupId, unsubscribe] of this.listeners.entries()) {
      unsubscribe();
      console.log(`[GroupListener] Stopped listener for group ${groupId}`);
    }

    this.listeners.clear();
    this.isRunning = false;
    console.log('[GroupListener] Service shut down');
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
