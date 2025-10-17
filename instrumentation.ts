/**
 * Next.js Instrumentation
 * This file runs automatically when the Next.js server starts
 * Perfect for initializing background services!
 */

export async function register() {
  // Only run on server-side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🚀 [SERVER] Starting - loading instrumentation');

    // Import the services (dynamic import to avoid issues)
    const { dmListenerService } = await import('@/services/dm-listener.service');
    const { groupChatListenerService } = await import('@/services/group-chat-listener.service');

    try {
      // Initialize the DM listener service
      await dmListenerService.initialize();
      
      // Initialize the group chat listener service
      await groupChatListenerService.initialize();
      
      console.log('✅ [SERVER] All services initialized successfully');
    } catch (error) {
      console.error('❌ [SERVER] Failed to initialize services:', error);
    }
  }
}
