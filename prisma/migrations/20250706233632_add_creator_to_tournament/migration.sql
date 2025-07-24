-- AlterTable
ALTER TABLE `tournament` ADD COLUMN `creatorId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Tournament` ADD CONSTRAINT `Tournament_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
