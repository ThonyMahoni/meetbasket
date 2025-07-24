-- DropForeignKey
ALTER TABLE `teamrating` DROP FOREIGN KEY `TeamRating_teamId_fkey`;

-- DropIndex
DROP INDEX `TeamRating_teamId_fkey` ON `teamrating`;

-- AddForeignKey
ALTER TABLE `TeamRating` ADD CONSTRAINT `TeamRating_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
