/*
  Warnings:

  - You are about to drop the column `authorId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `channelId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `personas` table. All the data in the column will be lost.
  - You are about to drop the column `displayName` on the `personas` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `personas` table. All the data in the column will be lost.
  - You are about to drop the column `personality` on the `personas` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `personas` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `channels` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `persona_server_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `server_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `servers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."channels" DROP CONSTRAINT "channels_serverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_channelId_fkey";

-- DropForeignKey
ALTER TABLE "public"."persona_server_members" DROP CONSTRAINT "persona_server_members_personaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."persona_server_members" DROP CONSTRAINT "persona_server_members_serverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."server_members" DROP CONSTRAINT "server_members_serverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."server_members" DROP CONSTRAINT "server_members_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."servers" DROP CONSTRAINT "servers_ownerId_fkey";

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "authorId",
DROP COLUMN "channelId",
ADD COLUMN     "directMessageId" TEXT,
ADD COLUMN     "groupId" TEXT,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "personas" DROP COLUMN "avatar",
DROP COLUMN "displayName",
DROP COLUMN "isActive",
DROP COLUMN "personality",
DROP COLUMN "status",
ADD COLUMN     "friendsIds" TEXT[],
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "status";

-- DropTable
DROP TABLE "public"."channels";

-- DropTable
DROP TABLE "public"."persona_server_members";

-- DropTable
DROP TABLE "public"."server_members";

-- DropTable
DROP TABLE "public"."servers";

-- DropEnum
DROP TYPE "public"."ChannelType";

-- DropEnum
DROP TYPE "public"."MemberRole";

-- DropEnum
DROP TYPE "public"."UserStatus";

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direct_messages" (
    "id" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "direct_messages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_directMessageId_fkey" FOREIGN KEY ("directMessageId") REFERENCES "direct_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
