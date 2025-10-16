'use client';

import { useEffect, useState } from 'react';
import { initializeDMListenerService, getDMListenerStatus } from '@/lib/dm-listener-init';

/**
 * Component to initialize the DM Listener Service on mount
 * Add this to your root layout or main page
 */
export function DMListenerInitializer() {
  const [status, setStatus] = useState<'idle' | 'initializing' | 'running' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initService = async () => {
      try {
        setStatus('initializing');
        console.log('[DMListenerInitializer] Starting DM listener service...');

        await initializeDMListenerService();

        // Get status to confirm
        const statusData = await getDMListenerStatus();
        console.log('[DMListenerInitializer] Service status:', statusData);

        setStatus('running');
      } catch (err) {
        console.error('[DMListenerInitializer] Failed to start service:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('error');
      }
    };

    initService();
  }, []);

  // This component doesn't render anything visible
  // It just initializes the service in the background
  return null;

  // Optional: Uncomment to show status indicator
  /*
  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      padding: '8px 12px',
      background: status === 'running' ? '#10b981' : status === 'error' ? '#ef4444' : '#6b7280',
      color: 'white',
      borderRadius: 6,
      fontSize: 12,
      zIndex: 9999,
    }}>
      DM Listener: {status}
      {error && <div>{error}</div>}
    </div>
  );
  */
}
