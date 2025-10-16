import { PrismaClient } from '@/generated/prisma';
import { prisma } from '@/lib/database';

export interface CreateMessageDTO {
  content: string;
  userId?: string;
  personaId?: string;
  groupId?: string;
  directMessageId?: string;
}

export interface UpdateMessageDTO {
  content?: string;
}

export interface MessageQueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: 'asc' | 'desc';
}

/**
 * Repository layer for Message data access
 * Handles all direct database operations for messages
 */
export class MessageRepository {
  constructor(private client: PrismaClient = prisma) {}

  /**
   * Create a new message
   */
  async create(data: CreateMessageDTO) {
    return this.client.message.create({
      data: {
        content: data.content,
        userId: data.userId,
        personaId: data.personaId,
        groupId: data.groupId,
        directMessageId: data.directMessageId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
        persona: {
          select: {
            id: true,
            username: true,
            imageUrl: true,
            headerColor: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        group: true,
        directMessage: {
          include: {
            persona: true,
          },
        },
      },
    });
  }

  /**
   * Find a message by ID
   */
  async findById(id: string) {
    return this.client.message.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
        persona: {
          select: {
            id: true,
            username: true,
            imageUrl: true,
            headerColor: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        group: true,
        directMessage: {
          include: {
            persona: true,
          },
        },
      },
    });
  }

  /**
   * Find all messages (with optional pagination)
   */
  async findAll(options: MessageQueryOptions = {}) {
    const { limit = 50, offset = 0, orderBy = 'asc' } = options;

    return this.client.message.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: orderBy },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
        persona: {
          select: {
            id: true,
            username: true,
            imageUrl: true,
            headerColor: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        group: true,
        directMessage: {
          include: {
            persona: true,
          },
        },
      },
    });
  }

  /**
   * Find messages by group ID
   */
  async findByGroupId(groupId: string, options: MessageQueryOptions = {}) {
    const { limit = 50, offset = 0, orderBy = 'asc' } = options;

    return this.client.message.findMany({
      where: { groupId },
      skip: offset,
      take: limit,
      orderBy: { createdAt: orderBy },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
        persona: {
          select: {
            id: true,
            username: true,
            imageUrl: true,
            headerColor: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  /**
   * Find messages by direct message ID
   */
  async findByDirectMessageId(directMessageId: string, options: MessageQueryOptions = {}) {
    const { limit = 50, offset = 0, orderBy = 'asc' } = options;

    return this.client.message.findMany({
      where: { directMessageId },
      skip: offset,
      take: limit,
      orderBy: { createdAt: orderBy },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
        persona: {
          select: {
            id: true,
            username: true,
            imageUrl: true,
            headerColor: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  /**
   * Update a message by ID
   */
  async update(id: string, data: UpdateMessageDTO) {
    return this.client.message.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
        persona: {
          select: {
            id: true,
            username: true,
            imageUrl: true,
            headerColor: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        group: true,
        directMessage: {
          include: {
            persona: true,
          },
        },
      },
    });
  }

  /**
   * Delete a message by ID
   */
  async delete(id: string) {
    return this.client.message.delete({
      where: { id },
    });
  }

  /**
   * Count messages (optionally filtered)
   */
  async count(filters?: { groupId?: string; directMessageId?: string }) {
    return this.client.message.count({
      where: filters,
    });
  }

  /**
   * Delete all messages in a group
   */
  async deleteByGroupId(groupId: string) {
    return this.client.message.deleteMany({
      where: { groupId },
    });
  }

  /**
   * Delete all messages in a direct message
   */
  async deleteByDirectMessageId(directMessageId: string) {
    return this.client.message.deleteMany({
      where: { directMessageId },
    });
  }
}

// Singleton instance
export const messageRepository = new MessageRepository();
