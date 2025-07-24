/*
  Warnings:

  - You are about to drop the `_usergames` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_usergames` DROP FOREIGN KEY `_usergames_A_fkey`;

-- DropForeignKey
ALTER TABLE `_usergames` DROP FOREIGN KEY `_usergames_B_fkey`;

-- DropTable
DROP TABLE `_usergames`;

-- CreateTable
CREATE TABLE `GameParticipant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gameId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `GameParticipant_gameId_userId_key`(`gameId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GameParticipant` ADD CONSTRAINT `GameParticipant_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameParticipant` ADD CONSTRAINT `GameParticipant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
