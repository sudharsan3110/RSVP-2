/*
  Warnings:

  - A unique constraint covering the columns `[qrToken]` on the table `attendees` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `qrToken` to the `attendees` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `attendees` ADD COLUMN `isAdmin` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `qrToken` VARCHAR(512) NOT NULL,
    MODIFY `registration_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `has_attended` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX `attendees_qrToken_key` ON `attendees`(`qrToken`);
