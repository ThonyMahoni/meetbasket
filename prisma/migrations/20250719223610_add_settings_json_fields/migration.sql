/*
  Warnings:

  - You are about to drop the column `isPrivate` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `notificationsEnabled` on the `settings` table. All the data in the column will be lost.
  - You are about to alter the column `appearance` on the `settings` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `settings` DROP COLUMN `isPrivate`,
    DROP COLUMN `notificationsEnabled`,
    ADD COLUMN `notifications` JSON NOT NULL,
    ADD COLUMN `privacy` JSON NOT NULL,
    MODIFY `appearance` JSON NOT NULL DEFAULT {};
