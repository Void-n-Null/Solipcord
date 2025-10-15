/*
  Warnings:

  - You are about to drop the `neural_connections` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `neural_networks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `neural_nodes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `training_data` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."neural_connections" DROP CONSTRAINT "neural_connections_fromId_fkey";

-- DropForeignKey
ALTER TABLE "public"."neural_connections" DROP CONSTRAINT "neural_connections_networkId_fkey";

-- DropForeignKey
ALTER TABLE "public"."neural_connections" DROP CONSTRAINT "neural_connections_toId_fkey";

-- DropForeignKey
ALTER TABLE "public"."neural_networks" DROP CONSTRAINT "neural_networks_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."neural_nodes" DROP CONSTRAINT "neural_nodes_networkId_fkey";

-- DropForeignKey
ALTER TABLE "public"."neural_nodes" DROP CONSTRAINT "neural_nodes_personaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."training_data" DROP CONSTRAINT "training_data_networkId_fkey";

-- DropTable
DROP TABLE "public"."neural_connections";

-- DropTable
DROP TABLE "public"."neural_networks";

-- DropTable
DROP TABLE "public"."neural_nodes";

-- DropTable
DROP TABLE "public"."training_data";
