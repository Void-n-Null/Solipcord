import { PrismaClient } from '@/generated/prisma';
import { prisma } from '@/lib/database';

/**
 * Repository layer for DirectMessage data access
 * Handles all direct database operations for direct messages
 */
export class DirectMessageRepository {
  constructor(private client: PrismaClient = prisma) {}

  /**
   * Find a direct message by ID with persona populated
   */
  async findById(id: string) {
    return this.client.directMessage.findUnique({
      where: { id },
      include: {
        persona: true,
      },
    });
  }

  /**
   * Find all direct messages with persona populated
   */
  async findAll() {
    return this.client.directMessage.findMany({
      include: {
        persona: true,
      },
    });
  }

  /**
   * Create a new direct message
   */
  async create(personaId: string) {
    return this.client.directMessage.create({
      data: { personaId },
      include: {
        persona: true,
      },
    });
  }
}

// Singleton instance
export const directMessageRepository = new DirectMessageRepository();
