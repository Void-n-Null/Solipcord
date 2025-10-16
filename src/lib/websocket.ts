/**
 * Simplified WebSocket broadcast system
 * Since Next.js serverless doesn't support traditional WebSocket servers,
 * we'll use server-sent events (SSE) combined with a message queue for reliability
 */

type MessageCallback = (message: Record<string, unknown>) => void;

interface Subscription {
  callbacks: Set<MessageCallback>;
}

interface SubscriptionManagerState {
  subscriptions: Map<string, Subscription>;
  messageQueues: Map<string, Record<string, unknown>[]>;
}

// Persist in globalThis to survive hot-reloads (Next.js dev mode)
declare global {
  var __subscriptionState: {
    dm: SubscriptionManagerState;
    group: SubscriptionManagerState;
  } | undefined;
}

const MAX_QUEUE_SIZE = 10;
const LOG_PREFIX = '[PubSub]';

/**
 * Initialize or retrieve persisted subscription state
 */
function initializeState() {
  if (!globalThis.__subscriptionState) {
    globalThis.__subscriptionState = {
      dm: {
        subscriptions: new Map(),
        messageQueues: new Map(),
      },
      group: {
        subscriptions: new Map(),
        messageQueues: new Map(),
      },
    };
  }
  return globalThis.__subscriptionState;
}

/**
 * Generic subscription manager - handles both DM and Group subscriptions
 */
class SubscriptionManager {
  private state: SubscriptionManagerState;
  private channel: 'dm' | 'group';

  constructor(channel: 'dm' | 'group') {
    this.channel = channel;
    const allState = initializeState();
    this.state = allState[channel];
  }

  /**
   * Subscribe to messages in a specific channel
   * @returns unsubscribe function
   */
  subscribe(channelId: string, callback: MessageCallback): () => void {
    if (!this.state.subscriptions.has(channelId)) {
      this.state.subscriptions.set(channelId, { callbacks: new Set() });
    }

    const subscription = this.state.subscriptions.get(channelId)!;
    subscription.callbacks.add(callback);

    // Send any queued messages to the new subscriber
    const queue = this.state.messageQueues.get(channelId) || [];
    if (queue.length > 0) {
      this.deliverMessages(channelId, queue, [callback]);
    }

    // Return unsubscribe function
    return () => {
      subscription.callbacks.delete(callback);
      if (subscription.callbacks.size === 0) {
        this.state.subscriptions.delete(channelId);
      }
    };
  }

  /**
   * Broadcast a message to all subscribed clients in a channel
   */
  broadcast(channelId: string, message: Record<string, unknown>): void {
    // Add to queue even if no subscribers (for new subscribers joining later)
    this.enqueueMessage(channelId, message);

    const subscription = this.state.subscriptions.get(channelId);
    if (!subscription || subscription.callbacks.size === 0) {
      return;
    }

    this.deliverMessages(channelId, [message], Array.from(subscription.callbacks));
  }

  /**
   * Get subscription stats (for debugging)
   */
  getStats(): Record<string, number> {
    return Object.fromEntries(
      Array.from(this.state.subscriptions.entries()).map(([id, sub]) => [id, sub.callbacks.size])
    );
  }

  private enqueueMessage(channelId: string, message: Record<string, unknown>): void {
    if (!this.state.messageQueues.has(channelId)) {
      this.state.messageQueues.set(channelId, []);
    }
    const queue = this.state.messageQueues.get(channelId)!;
    queue.push(message);
    if (queue.length > MAX_QUEUE_SIZE) {
      queue.shift(); // Remove oldest message
    }
  }

  private deliverMessages(
    channelId: string,
    messages: Record<string, unknown>[],
    callbacks: MessageCallback[]
  ): void {
    callbacks.forEach((callback) => {
      messages.forEach((message) => {
        try {
          callback(message);
        } catch (error) {
          console.error(
            `${LOG_PREFIX} [${this.channel}:${channelId}] Error in callback:`,
            error instanceof Error ? error.message : error
          );
        }
      });
    });
  }
}

// Initialize managers for both channels
const dmManager = new SubscriptionManager('dm');
const groupManager = new SubscriptionManager('group');

/**
 * Subscribe to messages in a specific DM
 */
export function subscribeToDMMessages(dmId: string, callback: MessageCallback): () => void {
  return dmManager.subscribe(dmId, callback);
}

/**
 * Subscribe to messages in a specific Group
 */
export function subscribeToGroupMessages(groupId: string, callback: MessageCallback): () => void {
  return groupManager.subscribe(groupId, callback);
}

/**
 * Broadcast a message to all subscribed clients in a DM
 */
export function broadcastMessageToDM(dmId: string, message: Record<string, unknown>): void {
  dmManager.broadcast(dmId, message);
}

/**
 * Broadcast a message to all subscribed clients in a Group
 */
export function broadcastMessageToGroup(groupId: string, message: Record<string, unknown>): void {
  groupManager.broadcast(groupId, message);
}

/**
 * Get subscription stats (for debugging)
 */
export function getSubscriptionStats() {
  return {
    dmSubscriptions: dmManager.getStats(),
    groupSubscriptions: groupManager.getStats(),
  };
}
