import {
  MessageRepository,
  messageRepository,
  CreateMessageDTO,
  UpdateMessageDTO,
  MessageQueryOptions,
} from '@/repositories/message.repository';
import { DirectMessageRepository, directMessageRepository } from '@/repositories/direct-message.repository';
import { messageEvents } from '@/events/message.events';
import { broadcastMessageToDM, broadcastMessageToGroup } from '@/lib/websocket';
import { db } from '@/lib/database';

/**
 * Service layer for Message business logic
 * Handles CRUD operations and emits events
 */
export class MessageService {
  constructor(
    private repository: MessageRepository,
    private dmRepository: DirectMessageRepository = directMessageRepository
  ) {}

  /**
   * Create a new message and emit event
   */
  async createMessage(data: CreateMessageDTO) {
    // Validate content
    if (!data.content || data.content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }

    // Ensure message belongs to either a DM or a Group
    if (!data.directMessageId && !data.groupId) {
      throw new Error('Message must belong to either a DirectMessage or a Group');
    }

    // Note: userId and personaId are optional to maintain backward compatibility
    // The database will handle the relationship properly

    // Create the message
    const message = await this.repository.create({
      ...data,
      content: data.content.trim(),
    });


    const sender = message.userId ? `User ${message.userId}` : `Persona ${message.personaId}`;
    console.log(`📝 [MSG] Message created - ${message.content.substring(0, 50)}`);

    // Update lastInteraction for DM or Group
    if (message.directMessageId) {
      await db.updateDirectMessageLastInteraction(message.directMessageId);
    } else if (message.groupId) {
      await db.updateGroupLastInteraction(message.groupId);
    }

    // Fetch DM data if this is a DM message
    let dm;
    if (message.directMessageId) {
      dm = await this.dmRepository.findById(message.directMessageId);
    }

    // Verify we have either a DM or Group ID
    if (!message.directMessageId && !message.groupId) {
      console.error('❌ [MSG] CRITICAL - Message has no DM or Group ID');
    }

    // Emit event with full context
    messageEvents.emitMessageCreated({
      message,
      directMessageId: message.directMessageId || undefined,
      groupId: message.groupId || undefined,
      dm: dm || undefined,
    });

    // Broadcast to WebSocket clients
    if (message.directMessageId) {
      broadcastMessageToDM(message.directMessageId, message);
    } else if (message.groupId) {
      broadcastMessageToGroup(message.groupId, message);
    }

    return message;
  }

  /**
   * Get a message by ID
   */
  async getMessageById(id: string) {
    const message = await this.repository.findById(id);

    if (!message) {
      throw new Error(`Message with ID ${id} not found`);
    }

    return message;
  }

  /**
   * Get all messages with optional pagination
   */
  async getAllMessages(options?: MessageQueryOptions) { return this.repository.findAll(options);}

  /**
   * Get messages by group ID
   */
  async getMessagesByGroupId(groupId: string, options?: MessageQueryOptions) {
    return this.repository.findByGroupId(groupId, options);
  }

  /**
   * Get messages by direct message ID
   */
  async getMessagesByDirectMessageId(directMessageId: string, options?: MessageQueryOptions) {
    return this.repository.findByDirectMessageId(directMessageId, options);
  }

  /**
   * Update a message and emit event
   */
  async updateMessage(id: string, data: UpdateMessageDTO) {
    // Validate content if provided
    if (data.content !== undefined && data.content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }

    // Get the current message first
    const currentMessage = await this.repository.findById(id);

    if (!currentMessage) {
      throw new Error(`Message with ID ${id} not found`);
    }

    const previousContent = currentMessage.content;

    // Update the message
    const updatedMessage = await this.repository.update(id, {
      ...data,
      content: data.content?.trim(),
    });

    // Fetch DM data if this is a DM message
    let dm;
    if (updatedMessage.directMessageId) {
      dm = await this.dmRepository.findById(updatedMessage.directMessageId);
    }

    // Emit event with full context
    messageEvents.emitMessageUpdated({
      message: updatedMessage,
      previousContent,
      directMessageId: updatedMessage.directMessageId || undefined,
      groupId: updatedMessage.groupId || undefined,
      dm: dm || undefined,
    });

    return updatedMessage;
  }

  /**
   * Delete a message and emit event
   */
  async deleteMessage(id: string) {
    // Get the message first to have its data for the event
    const message = await this.repository.findById(id);

    if (!message) {
      throw new Error(`Message with ID ${id} not found`);
    }

    // Fetch DM data if this is a DM message (before deletion)
    let dm;
    if (message.directMessageId) {
      dm = await this.dmRepository.findById(message.directMessageId);
    }

    // Delete the message
    await this.repository.delete(id);

    // Emit event with full context
    messageEvents.emitMessageDeleted({
      messageId: id,
      directMessageId: message.directMessageId || undefined,
      groupId: message.groupId || undefined,
      dm: dm || undefined,
    });

    // Broadcast deletion to WebSocket clients
    if (message.directMessageId) {
      broadcastMessageToDM(message.directMessageId, {
        type: 'message_deleted',
        messageId: id,
        timestamp: new Date().toISOString(),
      });
    } else if (message.groupId) {
      broadcastMessageToGroup(message.groupId, {
        type: 'message_deleted',
        messageId: id,
        timestamp: new Date().toISOString(),
      });
    }

    return message;
  }

  /**
   * Count messages (optionally filtered)
   */
  async countMessages(filters?: { groupId?: string; directMessageId?: string }) {
    return this.repository.count(filters);
  }

  /**
   * Delete all messages in a group
   */
  async deleteGroupMessages(groupId: string) {
    const result = await this.repository.deleteByGroupId(groupId);
    return result;
  }

  /**
   * Delete all messages in a direct message
   */
  async deleteDirectMessages(directMessageId: string) {
    const result = await this.repository.deleteByDirectMessageId(directMessageId);
    return result;
  }
}

// Singleton instance
export const messageService = new MessageService(messageRepository);
