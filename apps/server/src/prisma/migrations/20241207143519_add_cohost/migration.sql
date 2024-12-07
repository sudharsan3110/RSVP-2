/*
  Warnings:

  - You are about to drop the column `isAdmin` on the `attendees` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `attendees` DROP COLUMN `isAdmin`,
    ADD COLUMN `status` ENUM('1', '2', '3', '4', '5') NOT NULL DEFAULT '3';

-- CreateTable
CREATE TABLE `cohosts` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `event_id` VARCHAR(36) NOT NULL,
    `role` ENUM('1', '2', '3') NOT NULL DEFAULT '2',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cohosts` ADD CONSTRAINT `cohosts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cohosts` ADD CONSTRAINT `cohosts_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
