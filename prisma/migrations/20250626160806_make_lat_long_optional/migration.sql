-- AlterTable
ALTER TABLE `court` ADD COLUMN `amenities` VARCHAR(191) NULL,
    ADD COLUMN `averageRating` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `checkinCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `latitude` DOUBLE NULL,
    ADD COLUMN `longitude` DOUBLE NULL;
