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
      console.log(`ℹ️ [DM] Already listening to DM ${dmId}`);
      return;
    }

    console.log(`📍 [DM] Starting listener for DM ${dmId} (${personaName})`);

    // Set up listener for this specific DM
    const unsubscribe = messageEvents.onSpecificDMMessageCreated(dmId, async (event) => {
      console.log(`🔔 [DM] Listener triggered - ${personaName}: "${event.message.content}"`);
      const sender = event.message.userId ? `User ${event.message.userId}` : `Persona ${event.message.personaId}`;
      console.log(`👤 [DM] From: ${sender}`);

      // Only respond to user messages (not persona messages)
      if (!event.message.userId) {
        console.log('⏭️ [DM] Skipping - message is from persona');
        return;
      }

      console.log('✅ [DM] Responding to user message');

      try {
        // Auto-respond with persona greeting
        const response = `Hi I'm ${personaName}`;

        console.log(`📤 [DM] Sending response: "${response}"`);

        const createParams = {
          content: response,
          personaId: personaId,
          directMessageId: dmId,
        };

        const createdMessage = await messageService.createMessage(createParams);
        console.log('✅ [DM] Response sent successfully');

      } catch (error) {
        console.error('❌ [DM] Failed to send response:', error);
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
      console.log(`✅ [DM] Stopped listening to DM ${dmId}`);
    }
  }

  /**
   * Initialize the service by fetching all DMs and setting up listeners
   */
  async initialize() {
    if (this.isRunning) {
      console.log('ℹ️ [DM] Service already running');
      return;
    }

    console.log('🚀 [DM] Initializing DM listener service');

    try {
      // Import database directly (server-side)
      const { db } = await import('@/lib/database');

      // Fetch all existing DMs from database
      const dms = await db.getAllDirectMessages();
      console.log(`📊 [DM] Found ${dms.length} DM conversations`);

      // Set up listener for each DM
      for (const dm of dms) {
        console.log(`✅ [DM] Setting up listener: ${dm.persona.username}`);
        this.startListeningToDM(dm.id, dm.persona.id, dm.persona.username);
      }

      this.isRunning = true;
      console.log(`✅ [DM] Service running - ${this.listeners.size} active listeners`);
    } catch (error) {
      console.error('❌ [DM] Failed to initialize service:', error);
      throw error;
    }
  }

  /**
   * Add a listener for a newly created DM
   */
  addDMListener(dmId: string, personaId: string, personaName: string) {
    console.log(`ℹ️ [DM] Adding listener for new DM ${dmId}`);
    this.startListeningToDM(dmId, personaId, personaName);
  }

  /**
   * Stop all listeners and shut down the service
   */
  shutdown() {
    console.log('🛑 [DM] Shutting down service...');

    for (const [dmId, unsubscribe] of this.listeners.entries()) {
      unsubscribe();
      console.log(`✅ [DM] Stopped listener for DM ${dmId}`);
    }

    this.listeners.clear();
    this.isRunning = false;
    console.log('✅ [DM] Service shut down');
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
