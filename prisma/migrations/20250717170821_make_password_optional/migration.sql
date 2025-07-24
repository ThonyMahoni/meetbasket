/*
  Warnings:

  - You are about to drop the column `createdAt` on the `gameparticipant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `gameparticipant` DROP COLUMN `createdAt`;

-- AlterTable
ALTER TABLE `users` MODIFY `password` VARCHAR(191) NULL;
