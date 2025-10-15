import { db, prisma } from './database';

/**
 * Database setup utilities for initializing a new instance
 */

export async function setupNewInstance(userData: {
  username: string;
  email?: string;
  avatar?: string;
}) {
  try {
    // Create the main user
    const user = await db.createUser(userData);
    
    // Initialize default data (server, channels, personas)
    const defaultData = await db.initializeDefaultData(user.id);
    
    console.log('✅ Instance setup complete!');
    console.log(`👤 User: ${user.username}`);
    console.log(`🏠 Group: ${defaultData.group.name}`);
    console.log(`🤖 Personas: ${defaultData.personas.length} AI personas created`);
    console.log(`💬 Direct Messages: ${defaultData.directMessages.length} DM channels created`);
    
    return {
      user,
      ...defaultData,
    };
  } catch (error) {
    console.error('❌ Failed to setup instance:', error);
    throw error;
  }
}

export async function resetInstance(userId: string) {
  try {
    // This would delete all data for the user
    // Use with caution!
    console.log('⚠️  Resetting instance...');
    
    // Delete in correct order to respect foreign key constraints
    await prisma.message.deleteMany({
      where: {
        OR: [
          { userId: userId },
          { personaId: { not: null } },
        ],
      },
    });
    
    await prisma.directMessage.deleteMany();
    
    await prisma.group.deleteMany();
    
    await prisma.persona.deleteMany();
    
    await prisma.user.delete({
      where: { id: userId },
    });
    
    console.log('✅ Instance reset complete!');
  } catch (error) {
    console.error('❌ Failed to reset instance:', error);
    throw error;
  }
}

// Utility function to check if instance is properly set up
export async function checkInstanceHealth(userId: string) {
  try {
    const user = await db.getUserById(userId);
    
    if (!user) {
      return { healthy: false, message: 'User not found' };
    }
    
    const groups = await prisma.group.findMany();
    const directMessages = await prisma.directMessage.findMany();
    const personas = await db.getAllPersonas();
    
    return {
      healthy: true,
      user: {
        id: user.id,
        username: user.username,
        groups: groups.length,
        directMessages: directMessages.length,
        personas: personas.length,
      },
    };
  } catch (error) {
    return {
      healthy: false,
      message: `Health check failed: ${error}`,
    };
  }
}
