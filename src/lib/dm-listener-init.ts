/**
 * Client-side initialization for DM listener service
 * Call this from your app to start the background service
 */

export async function initializeDMListenerService() {
  try {
    console.log('[Client] Initializing DM listener service...');

    const response = await fetch('/api/dm-listener?action=initialize', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to initialize: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[Client] DM listener service initialized:', data);

    return data;
  } catch (error) {
    console.error('[Client] Failed to initialize DM listener service:', error);
    throw error;
  }
}

export async function shutdownDMListenerService() {
  try {
    console.log('[Client] Shutting down DM listener service...');

    const response = await fetch('/api/dm-listener?action=shutdown', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to shutdown: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[Client] DM listener service shut down:', data);

    return data;
  } catch (error) {
    console.error('[Client] Failed to shutdown DM listener service:', error);
    throw error;
  }
}

export async function getDMListenerStatus() {
  try {
    const response = await fetch('/api/dm-listener');

    if (!response.ok) {
      throw new Error(`Failed to get status: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Client] Failed to get DM listener status:', error);
    throw error;
  }
}
