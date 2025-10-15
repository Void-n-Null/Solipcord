import { PrismaClient } from '@/generated/prisma';

// Global Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create Prisma client instance
export const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// In development, store the client globally to prevent multiple instances
if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Database utility functions for Discord-like operations

// Generate a random RGB color
function generateRandomRGB(): string {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r},${g},${b})`;
}

export class DiscordDatabase {
  constructor(private client: PrismaClient = prisma) {}

  // User operations
  async createUser(data: { username: string; email?: string; avatar?: string }) {
    return this.client.user.create({
      data,
    });
  }

  async getUserById(id: string) {
    return this.client.user.findUnique({
      where: { id },
      include: {
        messages: true,
      },
    });
  }

  async getUserByUsername(username: string) {
    return this.client.user.findUnique({
      where: { username },
    });
  }

  // Persona operations
  async createPersona(data: {
    username: string;
    imageUrl?: string;
    headerColor?: string;
    friendsIds?: string[];
    isFriendOfUser?: boolean;
  }) {
    return this.client.persona.create({
      data: {
        ...data,
        headerColor: data.headerColor || generateRandomRGB(),
        friendsIds: data.friendsIds || [],
        isFriendOfUser: data.isFriendOfUser || false,
      },
    });
  }

  async getPersonaById(id: string) {
    return this.client.persona.findUnique({
      where: { id },
      include: {
        messages: true,
        directMessages: true,
      },
    });
  }

  async getAllPersonas() {
    return this.client.persona.findMany({
      include: {
        messages: true,
        directMessages: true,
      },
    });
  }

  // Group operations
  async createGroup(data: { name: string }) {
    return this.client.group.create({
      data,
      include: {
        messages: {
          include: {
            user: true,
            persona: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  async getGroupById(id: string) {
    return this.client.group.findUnique({
      where: { id },
      include: {
        messages: {
          include: {
            user: true,
            persona: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  async getAllGroups() {
    return this.client.group.findMany({
      include: {
        messages: {
          include: {
            user: true,
            persona: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Get last message for preview
        },
      },
    });
  }

  // Direct Message operations
  async createDirectMessage(personaId: string) {
    return this.client.directMessage.create({
      data: { personaId },
      include: {
        persona: true,
        messages: {
          include: {
            user: true,
            persona: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  async getDirectMessageById(id: string) {
    return this.client.directMessage.findUnique({
      where: { id },
      include: {
        persona: true,
        messages: {
          include: {
            user: true,
            persona: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  async getDirectMessageByPersona(personaId: string) {
    return this.client.directMessage.findFirst({
      where: { personaId },
      include: {
        persona: true,
        messages: {
          include: {
            user: true,
            persona: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  async getAllDirectMessages() {
    return this.client.directMessage.findMany({
      include: {
        persona: true,
        messages: {
          include: {
            user: true,
            persona: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Get last message for preview
        },
      },
    });
  }

  // Message operations
  async createMessage(data: {
    content: string;
    userId?: string;
    personaId?: string;
    groupId?: string;
    directMessageId?: string;
  }) {
    return this.client.message.create({
      data,
      include: {
        user: true,
        persona: true,
        group: true,
        directMessage: {
          include: {
            persona: true,
          },
        },
      },
    });
  }

  async getMessagesByGroup(groupId: string, limit = 50) {
    return this.client.message.findMany({
      where: { groupId },
      include: {
        user: true,
        persona: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  async getMessagesByDirectMessage(directMessageId: string, limit = 50) {
    return this.client.message.findMany({
      where: { directMessageId },
      include: {
        user: true,
        persona: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }


  // Utility methods for simplified functionality
  async addPersonaAsFriend(personaId: string, friendId: string) {
    const persona = await this.getPersonaById(personaId);
    if (!persona) throw new Error('Persona not found');
    
    const updatedFriendsIds = [...persona.friendsIds, friendId];
    return this.client.persona.update({
      where: { id: personaId },
      data: { friendsIds: updatedFriendsIds },
    });
  }

  async removePersonaAsFriend(personaId: string, friendId: string) {
    const persona = await this.getPersonaById(personaId);
    if (!persona) throw new Error('Persona not found');
    
    const updatedFriendsIds = persona.friendsIds.filter(id => id !== friendId);
    return this.client.persona.update({
      where: { id: personaId },
      data: { friendsIds: updatedFriendsIds },
    });
  }

  // Set persona as friend of user
  async setPersonaAsFriend(personaId: string) {
    return this.client.persona.update({
      where: { id: personaId },
      data: { isFriendOfUser: true },
    });
  }

  // Remove persona as friend of user
  async removePersonaFromUserFriends(personaId: string) {
    return this.client.persona.update({
      where: { id: personaId },
      data: { isFriendOfUser: false },
    });
  }

  // Delete persona completely from database
  async deletePersona(personaId: string) {
    return this.client.persona.delete({
      where: { id: personaId },
    });
  }

  // Get only personas that are friends with the user
  async getFriendPersonas() {
    return this.client.persona.findMany({
      where: { isFriendOfUser: true },
      include: {
        messages: true,
        directMessages: true,
      },
    });
  }

  // Get only personas that are NOT friends with the user
  async getNonFriendPersonas() {
    return this.client.persona.findMany({
      where: { isFriendOfUser: false },
      include: {
        messages: true,
        directMessages: true,
      },
    });
  }

  // Ensure all personas have header colors
  async ensurePersonaHeaderColors() {
    const personasWithoutColors = await this.client.persona.findMany({
      where: { headerColor: null },
    });

    for (const persona of personasWithoutColors) {
      await this.client.persona.update({
        where: { id: persona.id },
        data: { headerColor: generateRandomRGB() },
      });
    }

    return personasWithoutColors.length;
  }

  // Initialize default data for a new instance
  async initializeDefaultData(userId: string) {
    // Create some default AI personas
    const personas = await Promise.all([
      this.createPersona({
        username: 'Alice',
        imageUrl: '/avatars/alice.png',
        headerColor: generateRandomRGB(),
        friendsIds: [],
        isFriendOfUser: true, // Alice starts as a friend
      }),
      this.createPersona({
        username: 'Bob',
        imageUrl: '/avatars/bob.png',
        headerColor: generateRandomRGB(),
        friendsIds: [],
        isFriendOfUser: true, // Bob starts as a friend
      }),
      this.createPersona({
        username: 'Charlie',
        imageUrl: '/avatars/charlie.png',
        headerColor: generateRandomRGB(),
        friendsIds: [],
        isFriendOfUser: false, // Charlie starts as a stranger
      }),
    ]);

    // Create a default group chat
    const group = await this.createGroup({
      name: 'General Chat',
    });

    // Create DMs with each persona
    const directMessages = await Promise.all(
      personas.map(persona => this.createDirectMessage(persona.id))
    );

    // Create welcome messages
    await this.createMessage({
      content: 'Welcome to your Neural Social Network! This is your personal chat environment with AI-generated personas.',
      groupId: group.id,
      userId: userId,
    });

    // Add a message from each persona
    await Promise.all(
      personas.map((persona) =>
        this.createMessage({
          content: `Hello! I'm ${persona.username}. Nice to meet you!`,
          groupId: group.id,
          personaId: persona.id,
        })
      )
    );

    return {
      group,
      personas,
      directMessages,
    };
  }

  async updatePersonaHeaderColor(personaId: string, headerColor: string) {
    return this.client.persona.update({
      where: { id: personaId },
      data: { headerColor },
    });
  }
}

// Export singleton instance
export const db = new DiscordDatabase();
