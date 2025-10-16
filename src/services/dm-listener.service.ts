import { messageEvents } from '@/events/message.events';
import { messageService } from '@/services/message.service';

/**
 * Background service that listens to all DM conversations
 * and auto-responds when users send messages
 */
class DMListenerService {
  private listeners: Map<string, () => void> = new Map();
  private isRunning: boolean = false;

  /**
   * Start listening to a specific DM conversation
   */
  private startListeningToDM(dmId: string, personaId: string, personaName: string) {
    // Check if already listening
    if (this.listeners.has(dmId)) {
      console.log(`Already listening to DM ${dmId}`);
      return;
    }

    console.log(`[DMListener] Starting listener for DM ${dmId} (${personaName})`);

    // Set up listener for this specific DM
    const unsubscribe = messageEvents.onSpecificDMMessageCreated(dmId, async (event) => {
      console.log('\n' + '='.repeat(80));
      console.log('🔔 DM LISTENER EVENT TRIGGERED');
      console.log('='.repeat(80));
      console.log(`📍 DM ID: ${dmId}`);
      console.log(`👤 Persona: ${personaName}`);
      console.log(`📝 Message ID: ${event.message.id}`);
      console.log(`💬 Content: "${event.message.content}"`);
      console.log(`👥 From User ID: ${event.message.userId || 'NONE'}`);
      console.log(`🤖 From Persona ID: ${event.message.personaId || 'NONE'}`);
      console.log(`ℹ️  Event has dm?: ${!!event.dm}`);
      console.log(`ℹ️  Event has directMessageId?: ${!!event.directMessageId}`);

      // Only respond to user messages (not persona messages)
      if (!event.message.userId) {
        console.log('⏭️  SKIPPING: Message is from persona, not user');
        console.log('='.repeat(80) + '\n');
        return;
      }

      console.log('✅ MESSAGE IS FROM USER - WILL RESPOND');

      try {
        // Auto-respond with persona greeting
        const response = `Hi I'm ${personaName}`;

        console.log(`\n🤖 Preparing response: "${response}"`);
        console.log(`📤 Sending as persona: ${personaId}`);
        console.log(`📬 To DM: ${dmId}`);
        
        // Verify parameters before calling service
        console.log(`\n📋 Validating parameters:`);
        console.log(`  - content: "${response}" (type: ${typeof response})`);
        console.log(`  - personaId: "${personaId}" (type: ${typeof personaId})`);
        console.log(`  - directMessageId: "${dmId}" (type: ${typeof dmId})`);

        const createParams = {
          content: response,
          personaId: personaId,
          directMessageId: dmId,
        };
        
        console.log(`\n🔧 Final params object:`, JSON.stringify(createParams, null, 2));

        const createdMessage = await messageService.createMessage(createParams);
        
        console.log('✅ Message created with ID:', createdMessage.id);
        console.log('📊 Created message object:', {
          id: createdMessage.id,
          content: createdMessage.content,
          personaId: createdMessage.personaId,
          userId: createdMessage.userId,
          directMessageId: createdMessage.directMessageId,
          createdAt: createdMessage.createdAt,
        });
        console.log('✅ ✅ ✅ RESPONSE SENT SUCCESSFULLY ✅ ✅ ✅');
        console.log('='.repeat(80) + '\n');

      } catch (error) {
        console.log('❌ ❌ ❌ FAILED TO SEND RESPONSE ❌ ❌ ❌');
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
    this.listeners.set(dmId, unsubscribe);
  }

  /**
   * Stop listening to a specific DM conversation
   */
  stopListeningToDM(dmId: string) {
    const unsubscribe = this.listeners.get(dmId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(dmId);
      console.log(`[DMListener] Stopped listening to DM ${dmId}`);
    }
  }

  /**
   * Initialize the service by fetching all DMs and setting up listeners
   */
  async initialize() {
    if (this.isRunning) {
      console.log('[DMListener] Service already running');
      return;
    }

    console.log('\n' + '█'.repeat(80));
    console.log('🚀 INITIALIZING DM LISTENER SERVICE');
    console.log('█'.repeat(80));

    try {
      // Import database directly (server-side)
      const { db } = await import('@/lib/database');

      // Fetch all existing DMs from database
      const dms = await db.getAllDirectMessages();
      console.log(`📊 Found ${dms.length} DM conversations`);
      console.log('─'.repeat(80));

      // Set up listener for each DM
      for (const dm of dms) {
        console.log(`  ✓ Setting up listener: ${dm.persona.username} (${dm.id})`);
        this.startListeningToDM(dm.id, dm.persona.id, dm.persona.username);
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
   * Add a listener for a newly created DM
   */
  addDMListener(dmId: string, personaId: string, personaName: string) {
    console.log(`[DMListener] Adding listener for new DM ${dmId}`);
    this.startListeningToDM(dmId, personaId, personaName);
  }

  /**
   * Stop all listeners and shut down the service
   */
  shutdown() {
    console.log('[DMListener] Shutting down service...');

    for (const [dmId, unsubscribe] of this.listeners.entries()) {
      unsubscribe();
      console.log(`[DMListener] Stopped listener for DM ${dmId}`);
    }

    this.listeners.clear();
    this.isRunning = false;
    console.log('[DMListener] Service shut down');
  }

  /**
   * Get status of the service
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeListeners: this.listeners.size,
      dmIds: Array.from(this.listeners.keys()),
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
export const dmListenerService = new DMListenerService();
