/*
  Warnings:

  - You are about to drop the column `indoor` on the `court` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `court` DROP COLUMN `indoor`,
    ADD COLUMN `isIndoor` BOOLEAN NOT NULL DEFAULT false;
