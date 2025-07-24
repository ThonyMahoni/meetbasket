-- CreateTable
CREATE TABLE `PlayerStat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gameId` INTEGER NOT NULL,
    `playerId` INTEGER NOT NULL,
    `points` INTEGER NULL,
    `rebounds` INTEGER NULL,

    UNIQUE INDEX `PlayerStat_gameId_playerId_key`(`gameId`, `playerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PlayerStat` ADD CONSTRAINT `PlayerStat_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerStat` ADD CONSTRAINT `PlayerStat_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
