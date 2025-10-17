/**
 * Next.js Instrumentation
 * This file runs automatically when the Next.js server starts
 * Perfect for initializing background services!
 */

export async function register() {
  // Only run on server-side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🚀 [SERVER] Starting - loading instrumentation');

    // Import the unified AI orchestration service (dynamic import to avoid issues)
    const { aiOrchestrationService } = await import('@/services/ai-orchestration.service');

    try {
      // Initialize the unified AI orchestration service
      await aiOrchestrationService.initialize();
      
      console.log('✅ [SERVER] AI Orchestration Service initialized successfully');
    } catch (error) {
      console.error('❌ [SERVER] Failed to initialize AI Orchestration Service:', error);
    }
  }
}
