import { EventEmitter } from 'events';
import type { Message, Persona, User, DirectMessage } from '@/generated/prisma';

/**
 * Message with populated relations
 */
export type MessageWithRelations = Message & {
  user?: Pick<User, 'id' | 'username' | 'email' | 'avatar'> | null;
  persona?: Pick<Persona, 'id' | 'username' | 'imageUrl' | 'headerColor' | 'createdAt' | 'updatedAt'> | null;
  directMessage?: {
    id: string;
    personaId: string;
    persona: Persona;
  } | null;
  group?: Record<string, unknown> | null;
};

/**
 * DirectMessage with populated persona
 */
export type DirectMessageWithPersona = DirectMessage & {
  persona: Persona;
};

/**
 * Event payload types
 */
export interface MessageCreatedEvent {
  message: MessageWithRelations;
  directMessageId?: string;
  groupId?: string;
  /** Full DirectMessage object with persona - only present for DM messages */
  dm?: DirectMessageWithPersona;
  /** Full Group object - only present for group messages */
  group?: Record<string, unknown>;
}

export interface MessageUpdatedEvent {
  message: MessageWithRelations;
  previousContent: string;
  directMessageId?: string;
  groupId?: string;
  /** Full DirectMessage object with persona - only present for DM messages */
  dm?: DirectMessageWithPersona;
  /** Full Group object - only present for group messages */
  group?: Record<string, unknown>;
}

export interface MessageDeletedEvent {
  messageId: string;
  directMessageId?: string;
  groupId?: string;
  /** Full DirectMessage object with persona - only present for DM messages */
  dm?: DirectMessageWithPersona;
  /** Full Group object - only present for group messages */
  group?: Record<string, unknown>;
}

/**
 * Event names enum for type safety
 */
export enum MessageEventType {
  MESSAGE_CREATED = 'message:created',
  MESSAGE_UPDATED = 'message:updated',
  MESSAGE_DELETED = 'message:deleted',
  DM_MESSAGE_CREATED = 'dm:message:created',
  DM_MESSAGE_UPDATED = 'dm:message:updated',
  DM_MESSAGE_DELETED = 'dm:message:deleted',
  GROUP_MESSAGE_CREATED = 'group:message:created',
  GROUP_MESSAGE_UPDATED = 'group:message:updated',
  GROUP_MESSAGE_DELETED = 'group:message:deleted',
}

/**
 * Message Event Emitter
 * Handles all message-related events including DM and Group messages
 */
class MessageEventEmitter extends EventEmitter {
  constructor() {
    super();
    // Increase max listeners if needed
    this.setMaxListeners(50);
  }

  /**
   * Emit a message created event
   */
  emitMessageCreated(payload: MessageCreatedEvent) {
    this.emit(MessageEventType.MESSAGE_CREATED, payload);

    // Also emit specific DM or Group event
    if (payload.directMessageId) {
      this.emit(MessageEventType.DM_MESSAGE_CREATED, payload);
    } else if (payload.groupId) {
      this.emit(MessageEventType.GROUP_MESSAGE_CREATED, payload);
    }
  }

  /**
   * Emit a message updated event
   */
  emitMessageUpdated(payload: MessageUpdatedEvent) {
    this.emit(MessageEventType.MESSAGE_UPDATED, payload);

    // Also emit specific DM or Group event
    if (payload.directMessageId) {
      this.emit(MessageEventType.DM_MESSAGE_UPDATED, payload);
    } else if (payload.groupId) {
      this.emit(MessageEventType.GROUP_MESSAGE_UPDATED, payload);
    }
  }

  /**
   * Emit a message deleted event
   */
  emitMessageDeleted(payload: MessageDeletedEvent) {
    this.emit(MessageEventType.MESSAGE_DELETED, payload);

    // Also emit specific DM or Group event
    if (payload.directMessageId) {
      this.emit(MessageEventType.DM_MESSAGE_DELETED, payload);
    } else if (payload.groupId) {
      this.emit(MessageEventType.GROUP_MESSAGE_DELETED, payload);
    }
  }

  /**
   * Listen for DM message created events
   */
  onDMMessageCreated(listener: (event: MessageCreatedEvent) => void) {
    this.on(MessageEventType.DM_MESSAGE_CREATED, listener);
    return () => this.off(MessageEventType.DM_MESSAGE_CREATED, listener);
  }

  /**
   * Listen for DM message updated events
   */
  onDMMessageUpdated(listener: (event: MessageUpdatedEvent) => void) {
    this.on(MessageEventType.DM_MESSAGE_UPDATED, listener);
    return () => this.off(MessageEventType.DM_MESSAGE_UPDATED, listener);
  }

  /**
   * Listen for DM message deleted events
   */
  onDMMessageDeleted(listener: (event: MessageDeletedEvent) => void) {
    this.on(MessageEventType.DM_MESSAGE_DELETED, listener);
    return () => this.off(MessageEventType.DM_MESSAGE_DELETED, listener);
  }

  /**
   * Listen for Group message created events
   */
  onGroupMessageCreated(listener: (event: MessageCreatedEvent) => void) {
    this.on(MessageEventType.GROUP_MESSAGE_CREATED, listener);
    return () => this.off(MessageEventType.GROUP_MESSAGE_CREATED, listener);
  }

  /**
   * Listen for Group message updated events
   */
  onGroupMessageUpdated(listener: (event: MessageUpdatedEvent) => void) {
    this.on(MessageEventType.GROUP_MESSAGE_UPDATED, listener);
    return () => this.off(MessageEventType.GROUP_MESSAGE_UPDATED, listener);
  }

  /**
   * Listen for Group message deleted events
   */
  onGroupMessageDeleted(listener: (event: MessageDeletedEvent) => void) {
    this.on(MessageEventType.GROUP_MESSAGE_DELETED, listener);
    return () => this.off(MessageEventType.GROUP_MESSAGE_DELETED, listener);
  }

  /**
   * Listen for all message events
   */
  onMessageCreated(listener: (event: MessageCreatedEvent) => void) {
    this.on(MessageEventType.MESSAGE_CREATED, listener);
    return () => this.off(MessageEventType.MESSAGE_CREATED, listener);
  }

  onMessageUpdated(listener: (event: MessageUpdatedEvent) => void) {
    this.on(MessageEventType.MESSAGE_UPDATED, listener);
    return () => this.off(MessageEventType.MESSAGE_UPDATED, listener);
  }

  onMessageDeleted(listener: (event: MessageDeletedEvent) => void) {
    this.on(MessageEventType.MESSAGE_DELETED, listener);
    return () => this.off(MessageEventType.MESSAGE_DELETED, listener);
  }

  /**
   * Listen for messages in a specific DM conversation
   * Returns unsubscribe function
   */
  onSpecificDMMessageCreated(directMessageId: string, listener: (event: MessageCreatedEvent) => void) {
    const wrappedListener = (event: MessageCreatedEvent) => {
      if (event.directMessageId === directMessageId) {
        // Handle async listener properly - ensure promise rejections are caught
        const result = listener(event) as unknown;
        if (result instanceof Promise) {
          result.catch((err: unknown) => {
            console.error(`[MessageEvents] Unhandled error in DM listener for ${directMessageId}:`, err);
          });
        }
      }
    };
    this.on(MessageEventType.DM_MESSAGE_CREATED, wrappedListener);
    return () => this.off(MessageEventType.DM_MESSAGE_CREATED, wrappedListener);
  }

  onSpecificDMMessageUpdated(directMessageId: string, listener: (event: MessageUpdatedEvent) => void) {
    const wrappedListener = (event: MessageUpdatedEvent) => {
      if (event.directMessageId === directMessageId) {
        // Handle async listener properly - ensure promise rejections are caught
        const result = listener(event) as unknown;
        if (result instanceof Promise) {
          result.catch((err: unknown) => {
            console.error(`[MessageEvents] Unhandled error in DM listener for ${directMessageId}:`, err);
          });
        }
      }
    };
    this.on(MessageEventType.DM_MESSAGE_UPDATED, wrappedListener);
    return () => this.off(MessageEventType.DM_MESSAGE_UPDATED, wrappedListener);
  }

  onSpecificDMMessageDeleted(directMessageId: string, listener: (event: MessageDeletedEvent) => void) {
    const wrappedListener = (event: MessageDeletedEvent) => {
      if (event.directMessageId === directMessageId) {
        // Handle async listener properly - ensure promise rejections are caught
        const result = listener(event) as unknown;
        if (result instanceof Promise) {
          result.catch((err: unknown) => {
            console.error(`[MessageEvents] Unhandled error in DM listener for ${directMessageId}:`, err);
          });
        }
      }
    };
    this.on(MessageEventType.DM_MESSAGE_DELETED, wrappedListener);
    return () => this.off(MessageEventType.DM_MESSAGE_DELETED, wrappedListener);
  }

  /**
   * Listen for all events in a specific DM conversation
   * Returns a single unsubscribe function that removes all listeners
   */
  onSpecificDM(directMessageId: string, listeners: {
    onCreate?: (event: MessageCreatedEvent) => void;
    onUpdate?: (event: MessageUpdatedEvent) => void;
    onDelete?: (event: MessageDeletedEvent) => void;
  }) {
    const unsubscribers: Array<() => void> = [];

    if (listeners.onCreate) {
      unsubscribers.push(this.onSpecificDMMessageCreated(directMessageId, listeners.onCreate));
    }
    if (listeners.onUpdate) {
      unsubscribers.push(this.onSpecificDMMessageUpdated(directMessageId, listeners.onUpdate));
    }
    if (listeners.onDelete) {
      unsubscribers.push(this.onSpecificDMMessageDeleted(directMessageId, listeners.onDelete));
    }

    // Return a function that unsubscribes from all
    return () => unsubscribers.forEach(unsub => unsub());
  }
}

// Ensure true singleton across all imports
declare global {
  var __messageEvents: MessageEventEmitter | undefined;
}

// Singleton instance - use global to persist across hot reloads
export const messageEvents = globalThis.__messageEvents || new MessageEventEmitter();

if (process.env.NODE_ENV === 'development') {
  globalThis.__messageEvents = messageEvents;
}
