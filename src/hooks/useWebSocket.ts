'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { MessageWithPersona } from '@/types/dm';

interface UseWebSocketOptions {
  dmId?: string;
  groupId?: string;
  onMessageReceived?: (message: MessageWithPersona) => void;
  onMessageDeleted?: (messageId: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

/**
 * Hook to manage real-time message delivery using Server-Sent Events (SSE)
 * This provides instant message delivery without polling
 */
export function useWebSocket({
  dmId,
  groupId,
  onMessageReceived,
  onMessageDeleted,
  onConnected,
  onDisconnected,
}: UseWebSocketOptions) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageIdRef = useRef<string | undefined>(undefined);
  
  // Store callbacks in refs to avoid dependency issues
  const callbacksRef = useRef({
    onMessageReceived,
    onMessageDeleted,
    onConnected,
    onDisconnected,
  });

  // Update callback refs without triggering reconnects
  useEffect(() => {
    callbacksRef.current = {
      onMessageReceived,
      onMessageDeleted,
      onConnected,
      onDisconnected,
    };
  }, [onMessageReceived, onMessageDeleted, onConnected, onDisconnected]);

  // Connect to SSE endpoint
  const connectSSE = useCallback(() => {
    // Only connect if we're in a browser environment
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;

    // Don't reconnect if already connected
    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      console.log('[useWebSocket] Already connected');
      return;
    }

    if (!dmId && !groupId) return;

    const channel = dmId ? `dm:${dmId}` : `group:${groupId}`;
    const url = `/api/sse?channel=${encodeURIComponent(channel)}${messageIdRef.current ? `&lastId=${messageIdRef.current}` : ''}`;

    console.log('[useWebSocket] Connecting to SSE:', url);

    try {
      const eventSource = new EventSource(url);

      eventSource.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          messageIdRef.current = event.lastEventId;
          
          // Handle deletion events
          if (data.type === 'message_deleted') {
            console.log('[useWebSocket] Message deletion received:', data.messageId);
            callbacksRef.current.onMessageDeleted?.(data.messageId);
          } else {
            // Handle regular message events
            const message: MessageWithPersona = data;
            console.log('[useWebSocket] Message received:', message.id);
            callbacksRef.current.onMessageReceived?.(message);
          }
        } catch (error) {
          console.error('[useWebSocket] Failed to parse message:', error);
        }
      });

      eventSource.addEventListener('connected', () => {
        console.log('[useWebSocket] SSE connected');
        callbacksRef.current.onConnected?.();
      });

      eventSource.addEventListener('error', () => {
        console.log('[useWebSocket] SSE error, attempting reconnect...');
        eventSource.close();
        eventSourceRef.current = null;
        callbacksRef.current.onDisconnected?.();

        // Reconnect after 3 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(connectSSE, 3000);
      });

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('[useWebSocket] Failed to connect SSE:', error);
      callbacksRef.current.onDisconnected?.();

      // Retry connection
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(connectSSE, 3000);
    }
  }, [dmId, groupId]); // Only depend on dmId and groupId, not callbacks

  // Connect on mount
  useEffect(() => {
    console.log('[useWebSocket] Setting up connection for:', dmId || groupId);
    connectSSE();

    return () => {
      console.log('[useWebSocket] Cleaning up connection');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectSSE]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reconnect when DM/Group changes
  useEffect(() => {
    console.log('[useWebSocket] Channel changed:', dmId || groupId);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    messageIdRef.current = undefined;
    connectSSE();
  }, [dmId, groupId, connectSSE]);

  // Return utility functions
  return {
    isConnected: typeof EventSource !== 'undefined' && eventSourceRef.current?.readyState === EventSource.OPEN,
  };
}
