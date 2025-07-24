/*
  Warnings:

  - You are about to drop the column `team` on the `gameparticipant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `gameparticipant` DROP COLUMN `team`,
    ADD COLUMN `teamId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `GameParticipant` ADD CONSTRAINT `GameParticipant_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
