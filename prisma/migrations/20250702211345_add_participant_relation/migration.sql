-- CreateTable
CREATE TABLE `_TournamentParticipants` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_TournamentParticipants_AB_unique`(`A`, `B`),
    INDEX `_TournamentParticipants_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_TournamentParticipants` ADD CONSTRAINT `_TournamentParticipants_A_fkey` FOREIGN KEY (`A`) REFERENCES `Tournament`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TournamentParticipants` ADD CONSTRAINT `_TournamentParticipants_B_fkey` FOREIGN KEY (`B`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
