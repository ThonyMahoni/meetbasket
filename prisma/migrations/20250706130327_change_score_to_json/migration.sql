/*
  Warnings:

  - You are about to alter the column `score` on the `game` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `game` MODIFY `score` JSON NULL;
