/**
 * Next.js Instrumentation
 * This file runs automatically when the Next.js server starts
 * Perfect for initializing background services!
 */

export async function register() {
  // Only run on server-side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('\n' + '🟢'.repeat(40));
    console.log('⚡ SERVER STARTING - LOADING INSTRUMENTATION');
    console.log('🟢'.repeat(40) + '\n');

    // Import the services (dynamic import to avoid issues)
    const { dmListenerService } = await import('@/services/dm-listener.service');
    const { groupChatListenerService } = await import('@/services/group-chat-listener.service');

    try {
      // Initialize the DM listener service
      await dmListenerService.initialize();
      
      // Initialize the group chat listener service
      await groupChatListenerService.initialize();
      
      console.log('🎉'.repeat(40));
      console.log('✅ ALL SERVICES INITIALIZED SUCCESSFULLY');
      console.log('🎉'.repeat(40) + '\n');
    } catch (error) {
      console.log('🔴'.repeat(40));
      console.error('❌ FAILED TO INITIALIZE SERVICES:', error);
      console.log('🔴'.repeat(40) + '\n');
    }
  }
}
