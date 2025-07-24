-- AlterTable
ALTER TABLE `achievement` ADD COLUMN `achieved` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `icon` VARCHAR(191) NULL;
