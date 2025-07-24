-- DropForeignKey
ALTER TABLE `team` DROP FOREIGN KEY `Team_creatorId_fkey`;

-- AddForeignKey
ALTER TABLE `Team` ADD CONSTRAINT `fk_created_team_user` FOREIGN KEY (`creatorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
